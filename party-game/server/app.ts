import Fastify from "fastify";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import fastifyStatic from "@fastify/static";
import { Server } from "socket.io";
import { randomBytes, randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Store, hash } from "./store";
import { authSchema, envelopeSchema, nicknameSchema } from "./contracts";
import {
  addPlayer,
  emptyRoom,
  presence,
  project,
  reduce,
  RuleError,
  tick,
} from "../src/engine/game";
import type {
  Ack,
  Command,
  ContentBundle,
  GameState,
} from "../src/shared/types";

export interface AppOptions {
  dbPath?: string;
  bundle?: ContentBundle;
  clock?: () => number;
  timers?: boolean;
  logger?: boolean;
  origin?: string;
  maxRooms?: number;
}
export async function createApp(options: AppOptions = {}) {
  const now = options.clock ?? Date.now;
  const bundle =
    options.bundle ??
    (JSON.parse(
      readFileSync(new URL("../content/launch.json", import.meta.url), "utf8"),
    ) as ContentBundle);
  const store = new Store(
    options.dbPath ?? process.env.DB_PATH ?? "data/nomadia.sqlite",
  );
  store.content(bundle);
  store.prune(now() - 24 * 60 * 60 * 1000);
  // Restore logical time from the committed snapshot, paused until players reconnect.
  for (const s of store.rooms()) {
    // Undealt lobbies can adopt updated rules; active runs remain pinned.
    if (s.phase === "lobby" && s.contentVersion !== bundle.version) {
      s.contentVersion = bundle.version;
      s.revision++;
      store.save(s);
    }
    const elapsed = Math.max(0, now() - s.updatedAt);
    // A paused room already records when its clock stopped. Resuming presence
    // accounts for that entire pause, including downtime, exactly once.
    if (!s.paused) {
      if (s.deadline !== null) s.deadline += elapsed;
      if (s.turnDeadline !== null) s.turnDeadline += elapsed;
    }
    const restored = presence(s, new Set(), now());
    if (restored) store.save(restored);
  }
  const app = Fastify({
    logger: options.logger ?? false,
    bodyLimit: 16_384,
    trustProxy: false,
  });
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'"],
        imgSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: null,
      },
    },
  });
  await app.register(rateLimit, { max: 180, timeWindow: "1 minute" });
  const allowedOrigin = options.origin ?? process.env.PUBLIC_ORIGIN;
  const originOK = (origin: string | undefined, host: string | undefined) =>
    !origin ||
    origin === (allowedOrigin ?? `http://${host}`) ||
    (!allowedOrigin && origin === `https://${host}`);
  app.addHook("onRequest", async (req, reply) => {
    if (!originOK(req.headers.origin, req.headers.host))
      return reply.code(403).send({ error: "Origin is not allowed." });
  });
  const io = new Server(app.server, {
    maxHttpBufferSize: 16_384,
    serveClient: false,
    allowRequest: (req, cb) =>
      cb(null, originOK(req.headers.origin, req.headers.host)),
  });
  const online = (code: string) =>
    new Set(
      [...io.sockets.sockets.values()]
        .filter((socket) => socket.data.code === code)
        .map((socket) => socket.data.playerId as string),
    );
  const publish = (s: GameState) => {
    const content = store.getContent(s.contentVersion);
    for (const socket of io.sockets.sockets.values())
      if (socket.data.code === s.code) {
        if (!s.players.some((p) => p.id === socket.data.playerId)) {
          socket.emit("removed");
          socket.disconnect(true);
        } else
          socket.emit(
            "snapshot",
            project(s, content, socket.data.playerId, now()),
          );
      }
  };
  function syncPresence(code: string) {
    const s = store.room(code);
    if (!s) return;
    const updated = presence(s, online(code), now());
    if (updated) {
      store.save(updated);
      publish(updated);
    }
  }
  function command(code: string, playerId: string, input: unknown): Ack {
    const parsed = envelopeSchema.safeParse(input);
    if (!parsed.success)
      return {
        ok: false,
        code: "INVALID_COMMAND",
        message: "Malformed command.",
      };
    const envelope = parsed.data;
    const state = store.room(code);
    if (!state)
      return { ok: false, code: "ROOM_GONE", message: "Room expired." };
    const fingerprint = hash(JSON.stringify(envelope.command));
    const receipt = store.receipt(state.id, playerId, envelope.commandId);
    if (receipt)
      return receipt.fingerprint === fingerprint
        ? { ...receipt.ack, duplicate: true }
        : {
            ok: false,
            code: "COMMAND_ID_REUSED",
            message: "Use a new ID for a different command.",
          };
    if (state.revision !== envelope.expectedRevision) {
      publish(state);
      return {
        ok: false,
        code: "STALE_REVISION",
        message: "The table changed. Try that action again.",
      };
    }
    try {
      const next = reduce(
        state,
        store.getContent(state.contentVersion),
        playerId,
        envelope.command as Command,
        now(),
      );
      if (envelope.command.type === "rematch")
        next.contentVersion = bundle.version;
      const ack: Ack = { ok: true, revision: next.revision };
      store.transaction(() => {
        store.save(next);
        if (envelope.command.type === "kick")
          store.removeSeat(
            state.id,
            (envelope.command as { playerId: string }).playerId,
          );
        store.remember(
          state.id,
          playerId,
          envelope.commandId,
          fingerprint,
          ack,
        );
      });
      publish(next);
      return ack;
    } catch (error) {
      if (error instanceof RuleError)
        return { ok: false, code: error.code, message: error.message };
      app.log.error(error);
      return {
        ok: false,
        code: "SERVER_ERROR",
        message: "The action was not saved. Please retry.",
      };
    }
  }
  app.get("/health", async () => {
    store.db.prepare("SELECT 1").get();
    return { ok: true, contentVersion: bundle.version };
  });
  app.get("/api/content", async (req, reply) => {
    const version =
      (req.query as { version?: string }).version ?? bundle.version;
    if (!/^[a-f0-9]{16}$/.test(version))
      return reply.code(400).send({ error: "Invalid version" });
    try {
      return store.getContent(version);
    } catch {
      return reply.code(404).send({ error: "Unknown content version" });
    }
  });
  app.get("/api/catalogue", async () => {
    const data = JSON.parse(
      readFileSync(
        new URL("../content/catalogue.json", import.meta.url),
        "utf8",
      ),
    );
    return {
      schemaVersion: data.schemaVersion,
      coverage: data.coverage,
      assets: data.assets.map((a: any) => ({
        id: a.id,
        name: a.name,
        family: a.family,
        tags: a.tags,
        campaigns: a.campaigns,
        sourceRefs: a.sourceRefs,
        candidates: a.candidates,
        adaptationStatus: a.adaptationStatus,
        classificationStatus: a.classificationStatus,
      })),
    };
  });
  const joinResponse = (s: GameState, id: string, token: string) => ({
    code: s.code,
    token,
    playerId: id,
    contentVersion: s.contentVersion,
  });
  app.post(
    "/api/rooms",
    { config: { rateLimit: { max: 15, timeWindow: "1 hour" } } },
    async (req, reply) => {
      store.prune(now() - 24 * 60 * 60 * 1000);
      const input = nicknameSchema.safeParse(req.body);
      if (!input.success)
        return reply
          .code(400)
          .send({ error: "Enter a nickname (1–24 letters or numbers)." });
      if (
        store.rooms().length >=
        (options.maxRooms ?? Number(process.env.MAX_ROOMS ?? 100))
      )
        return reply
          .code(503)
          .send({ error: "All tables are occupied. Please try later." });
      const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let code = "";
      do {
        code = [...randomBytes(6)]
          .map((n) => alphabet[n % alphabet.length])
          .join("");
      } while (store.room(code));
      const id = randomUUID(),
        token = randomBytes(32).toString("hex");
      const state = addPlayer(
        emptyRoom(
          randomUUID(),
          code,
          id,
          bundle.version,
          now(),
          randomBytes(4).readUInt32BE(),
        ),
        bundle,
        id,
        input.data.nickname,
        now(),
      );
      store.transaction(() => {
        store.save(state);
        store.seat(state.id, id, token);
      });
      return reply.code(201).send(joinResponse(state, id, token));
    },
  );
  app.post(
    "/api/rooms/:code/join",
    { config: { rateLimit: { max: 30, timeWindow: "1 minute" } } },
    async (req, reply) => {
      const input = nicknameSchema.safeParse(req.body);
      const code = (req.params as { code: string }).code.toUpperCase();
      if (!input.success)
        return reply
          .code(400)
          .send({ error: "Enter a nickname (1–24 letters or numbers)." });
      const state = store.room(code);
      if (!state)
        return reply
          .code(404)
          .send({ error: "Room not found. Check the code." });
      try {
        const id = randomUUID(),
          token = randomBytes(32).toString("hex");
        const next = addPlayer(
          state,
          store.getContent(state.contentVersion),
          id,
          input.data.nickname,
          now(),
        );
        store.transaction(() => {
          store.save(next);
          store.seat(next.id, id, token);
        });
        publish(next);
        return reply.code(201).send(joinResponse(next, id, token));
      } catch (e) {
        if (e instanceof RuleError)
          return reply.code(409).send({ error: e.message });
        throw e;
      }
    },
  );
  io.use((socket, next) => {
    const input = authSchema.safeParse(socket.handshake.auth);
    if (!input.success) return next(new Error("Invalid room credentials."));
    const seat = store.authenticate(input.data.code, input.data.token);
    const room = store.room(input.data.code);
    if (!seat || !room?.players.some((p) => p.id === seat.playerId))
      return next(new Error("Your seat has expired. Join a new room."));
    if (
      [...io.sockets.sockets.values()].filter(
        (s) => s.data.playerId === seat.playerId,
      ).length >= 3
    )
      return next(new Error("This seat is already open in three tabs."));
    socket.data.code = input.data.code;
    socket.data.playerId = seat.playerId;
    next();
  });
  io.on("connection", (socket) => {
    syncPresence(socket.data.code);
    const s = store.room(socket.data.code)!;
    socket.emit(
      "snapshot",
      project(
        s,
        store.getContent(s.contentVersion),
        socket.data.playerId,
        now(),
      ),
    );
    let windowStart = now(),
      count = 0;
    socket.on("command", (input: unknown, respond?: (ack: Ack) => void) => {
      if (typeof respond !== "function") return;
      if (now() - windowStart >= 60_000) {
        windowStart = now();
        count = 0;
      }
      if (++count > 120)
        return respond({
          ok: false,
          code: "RATE_LIMIT",
          message: "Too many actions. Wait a moment.",
        });
      respond(command(socket.data.code, socket.data.playerId, input));
    });
    socket.on("sync", () => {
      const state = store.room(socket.data.code);
      if (state && state.players.some((p) => p.id === socket.data.playerId))
        socket.emit(
          "snapshot",
          project(
            state,
            store.getContent(state.contentVersion),
            socket.data.playerId,
            now(),
          ),
        );
    });
    socket.on("disconnect", () => syncPresence(socket.data.code));
  });
  const tickAll = () => {
    for (const s of store.rooms()) {
      try {
        const updated = tick(s, store.getContent(s.contentVersion), now());
        if (updated) {
          store.save(updated);
          publish(updated);
        }
      } catch (e) {
        app.log.error(e);
      }
    }
  };
  const timer = options.timers === false ? null : setInterval(tickAll, 500);
  timer?.unref();
  const dist = fileURLToPath(new URL("../dist", import.meta.url));
  if (existsSync(dist)) {
    await app.register(fastifyStatic, {
      root: dist,
      index: "index.html",
      list: false,
    });
    app.setNotFoundHandler((req, reply) =>
      req.url.startsWith("/api/")
        ? reply.code(404).send({ error: "Not found" })
        : reply.sendFile("index.html"),
    );
  }
  app.addHook("preClose", async () => {
    if (timer) clearInterval(timer);
    io.disconnectSockets(true);
    await new Promise<void>((resolve) => io.close(() => resolve()));
  });
  app.addHook("onClose", async () => {
    store.close();
  });
  return { app, io, store, bundle, tickAll, command };
}
