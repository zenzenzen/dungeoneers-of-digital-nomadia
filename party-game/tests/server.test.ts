import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { io, type Socket } from "socket.io-client";
import { createApp } from "../server/app";
import { Store } from "../server/store";
import type {
  Ack,
  Command,
  ContentBundle,
  Snapshot,
} from "../src/shared/types";

interface Client {
  socket: Socket;
  view: Snapshot;
  seat: { code: string; token: string; playerId: string };
}
async function until(test: () => boolean) {
  for (let n = 0; n < 200; n++) {
    if (test()) return;
    await new Promise((r) => setTimeout(r, 10));
  }
  throw new Error("Timed out waiting for state");
}
async function connect(url: string, seat: Client["seat"]): Promise<Client> {
  const socket = io(url, {
    autoConnect: false,
    auth: { code: seat.code, token: seat.token },
    transports: ["websocket"],
    reconnection: false,
  });
  const c = { socket, seat, view: null as unknown as Snapshot };
  socket.on("snapshot", (v: Snapshot) => (c.view = v));
  socket.connect();
  await until(() => !!c.view);
  return c;
}
async function seat(url: string, nickname: string, code?: string) {
  const r = await fetch(`${url}/api/rooms${code ? `/${code}/join` : ""}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ nickname }),
  });
  assert.equal(r.status, 201);
  return (await r.json()) as Client["seat"];
}
async function send(
  c: Client,
  command: Command,
  id = randomUUID(),
  revision = c.view.revision,
) {
  return (await c.socket.timeout(2000).emitWithAck("command", {
    commandId: id,
    expectedRevision: revision,
    command,
  })) as Ack;
}

test("real socket clients: private views, idempotence, conflicts, auth and malformed commands", async (t) => {
  const system = await createApp({ dbPath: ":memory:", timers: false });
  await system.app.listen({ port: 0, host: "127.0.0.1" });
  const address = system.app.server.address() as { port: number };
  const url = `http://127.0.0.1:${address.port}`;
  const clients: Client[] = [];
  t.after(async () => {
    clients.forEach((c) => c.socket.disconnect());
    await system.app.close();
  });
  for (let i = 0; i < 3; i++)
    clients.push(
      await connect(url, await seat(url, `Guest ${i}`, clients[0]?.seat.code)),
    );
  await until(
    () =>
      clients[0].view.players.every((p) => p.connected) &&
      clients[0].view.players.length === 3,
  );
  const host = clients[0],
    startId = randomUUID();
  assert.equal((await send(host, { type: "start" }, startId)).ok, true);
  await until(() => clients.every((c) => c.view.phase === "prepare"));
  assert.equal(host.view.players[1].hand, undefined);
  assert.equal(host.view.players[0].hand!.length, 3);
  assert.ok(!("rng" in host.view));
  assert.ok(!("decks" in host.view));
  const duplicate = await send(host, { type: "start" }, startId, 0);
  assert.equal(duplicate.duplicate, true);
  assert.equal(
    (await send(host, { type: "reveal" }, startId)).code,
    "COMMAND_ID_REUSED",
  );
  assert.equal(
    (await send(host, { type: "reveal" }, randomUUID(), 0)).code,
    "STALE_REVISION",
  );
  assert.equal(
    (await send(clients[1], { type: "reveal" })).code,
    "NOT_YOUR_TURN",
  );
  const spoof = await host.socket.timeout(2000).emitWithAck("command", {
    commandId: randomUUID(),
    expectedRevision: host.view.revision,
    command: { type: "set_wallet", cash_cp: 999999 },
  });
  assert.equal(spoof.code, "INVALID_COMMAND");
  const fake = io(url, {
    auth: { code: host.seat.code, token: "0".repeat(64) },
    transports: ["websocket"],
    reconnection: false,
  });
  t.after(() => fake.disconnect());
  await new Promise<void>((resolve) =>
    fake.once("connect_error", () => resolve()),
  );
  assert.equal(fake.connected, false);
  const late = await fetch(`${url}/api/rooms/${host.seat.code}/join`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ nickname: "Late arrival" }),
  });
  assert.equal(late.status, 409);
  const attack = await system.app.inject({
    method: "POST",
    url: "/api/rooms",
    headers: { origin: "https://evil.example" },
    payload: { nickname: "Evil" },
  });
  assert.equal(attack.statusCode, 403);
  const cmd = { type: "self_care" } as const;
  const revision = host.view.revision;
  const concurrent = await Promise.all([
    send(host, cmd, randomUUID(), revision),
    send(host, cmd, randomUUID(), revision),
  ]);
  assert.equal(concurrent.filter((a) => a.ok).length, 1);
  assert.equal(concurrent.filter((a) => a.code === "STALE_REVISION").length, 1);
});

test("restart, old content pin, saved receipts, and SQLite online backup recovery", async (t) => {
  const directory = mkdtempSync(join(tmpdir(), "nomadia-persistence-"));
  const path = join(directory, "room.sqlite"),
    backupPath = join(directory, "backup.sqlite");
  let system = await createApp({ dbPath: path, timers: false });
  await system.app.listen({ port: 0, host: "127.0.0.1" });
  let url = `http://127.0.0.1:${(system.app.server.address() as { port: number }).port}`;
  let clients: Client[] = [];
  t.after(async () => {
    clients.forEach((c) => c.socket.disconnect());
    await system.app.close();
    rmSync(directory, { recursive: true, force: true });
  });
  for (let i = 0; i < 3; i++)
    clients.push(
      await connect(url, await seat(url, `Friend ${i}`, clients[0]?.seat.code)),
    );
  await until(
    () =>
      clients[0].view.players.length === 3 &&
      clients[0].view.players.every((p) => p.connected),
  );
  const commandId = randomUUID();
  const originalVersion = system.bundle.version;
  assert.equal((await send(clients[0], { type: "start" }, commandId)).ok, true);
  await until(() => clients[0].view.phase === "prepare");
  const originalHand = structuredClone(clients[0].view.players[0].hand);
  await system.store.backup(backupPath);
  const backup = new Store(backupPath);
  assert.deepEqual(
    backup.room(clients[0].seat.code)!.players[0].hand,
    originalHand,
  );
  backup.close();
  const seats = clients.map((c) => c.seat);
  clients.forEach((c) => c.socket.disconnect());
  await system.app.close();
  const replacement: ContentBundle = JSON.parse(
    readFileSync(new URL("../content/launch.json", import.meta.url), "utf8"),
  );
  replacement.version = "0123456789abcdef";
  replacement.cards[0].name = "Changed after deployment";
  system = await createApp({
    dbPath: path,
    bundle: replacement,
    timers: false,
  });
  await system.app.listen({ port: 0, host: "127.0.0.1" });
  url = `http://127.0.0.1:${(system.app.server.address() as { port: number }).port}`;
  clients = [];
  for (const saved of seats) clients.push(await connect(url, saved));
  await until(() => clients[0].view.players.every((p) => p.connected));
  assert.equal(clients[0].view.contentVersion, originalVersion);
  assert.deepEqual(clients[0].view.players[0].hand, originalHand);
  assert.equal(clients[0].view.phase, "prepare");
  assert.equal(clients[0].view.paused, false);
  assert.equal(
    (await send(clients[0], { type: "start" }, commandId, 0)).duplicate,
    true,
  );
  const pinned = await (
    await fetch(`${url}/api/content?version=${originalVersion}`)
  ).json();
  assert.notEqual(pinned.cards[0].name, "Changed after deployment");
  clients[0].socket.disconnect();
  await until(() => clients[1].view.hostId === clients[1].seat.playerId);
  clients[2].socket.disconnect();
  await until(() => clients[1].view.paused);
  const saved = clients[0].seat;
  clients[0] = await connect(url, saved);
  await until(() => !clients[1].view.paused);
});

test("crash recovery does not add downtime twice to an already paused turn", async (t) => {
  const dir = mkdtempSync(join(tmpdir(), "nomadia-paused-"));
  let clock = 1000;
  let system = await createApp({
    dbPath: join(dir, "live.sqlite"),
    timers: false,
    clock: () => clock,
  });
  let clients: Client[] = [];
  t.after(async () => {
    clients.forEach((c) => c.socket.disconnect());
    await system.app.close();
    rmSync(dir, { recursive: true, force: true });
  });
  await system.app.listen({ port: 0, host: "127.0.0.1" });
  let url = `http://127.0.0.1:${(system.app.server.address() as { port: number }).port}`;
  for (let i = 0; i < 3; i++)
    clients.push(
      await connect(url, await seat(url, `Guest ${i}`, clients[0]?.seat.code)),
    );
  await until(() => clients[0].view.players.every((p) => p.connected));
  assert.equal((await send(clients[0], { type: "start" })).ok, true);
  clock = 6000;
  clients[1].socket.disconnect();
  clients[2].socket.disconnect();
  await until(() => clients[0].view.paused);
  const remaining = clients[0].view.deadline! - clock;
  const seats = clients.map((c) => c.seat);
  // Capture committed state with one connected seat, as a process crash would.
  const crash = join(dir, "crash.sqlite");
  await system.store.backup(crash);
  clients.forEach((c) => c.socket.disconnect());
  await system.app.close();
  clock = 60_000;
  system = await createApp({
    dbPath: crash,
    timers: false,
    clock: () => clock,
  });
  await system.app.listen({ port: 0, host: "127.0.0.1" });
  url = `http://127.0.0.1:${(system.app.server.address() as { port: number }).port}`;
  clock = 61_000;
  clients = [];
  for (const saved of seats.slice(0, 2))
    clients.push(await connect(url, saved));
  await until(() => !clients[0].view.paused);
  assert.equal(clients[0].view.deadline! - clock, remaining);
});

test("undealt lobbies adopt current content and their existing seat can start solo", async (t) => {
  const dir = mkdtempSync(join(tmpdir(), "nomadia-lobby-"));
  const dbPath = join(dir, "rooms.sqlite");
  const legacy: ContentBundle = JSON.parse(
    readFileSync(new URL("../content/launch.json", import.meta.url), "utf8"),
  );
  legacy.version = "fedcba9876543210";
  legacy.campaign.rules.minPlayers = 3;
  legacy.campaign.rules.maxPlayers = 6;
  let system = await createApp({ dbPath, bundle: legacy, timers: false });
  await system.app.listen({ port: 0, host: "127.0.0.1" });
  let url = `http://127.0.0.1:${(system.app.server.address() as { port: number }).port}`;
  const saved = await seat(url, "Solo tester");
  await system.app.close();
  system = await createApp({ dbPath, timers: false });
  await system.app.listen({ port: 0, host: "127.0.0.1" });
  url = `http://127.0.0.1:${(system.app.server.address() as { port: number }).port}`;
  const client = await connect(url, saved);
  t.after(async () => {
    client.socket.disconnect();
    await system.app.close();
    rmSync(dir, { recursive: true, force: true });
  });
  assert.notEqual(client.view.contentVersion, legacy.version);
  assert.equal((await send(client, { type: "start" })).ok, true);
  await until(() => client.view.phase === "prepare");
  assert.equal(client.view.players.length, 1);
  assert.equal(client.view.paused, false);
  assert.equal(client.view.players[0].hand!.length, 3);
});

test("lobby seat removal revokes reconnect token and allows replacement", async (t) => {
  const system = await createApp({ dbPath: ":memory:", timers: false });
  await system.app.listen({ port: 0, host: "127.0.0.1" });
  const url = `http://127.0.0.1:${(system.app.server.address() as { port: number }).port}`;
  const host = await connect(url, await seat(url, "Host"));
  const guest = await connect(url, await seat(url, "Guest", host.seat.code));
  t.after(async () => {
    host.socket.disconnect();
    guest.socket.disconnect();
    await system.app.close();
  });
  await until(() => host.view.players.length === 2);
  assert.equal(
    (await send(host, { type: "kick", playerId: guest.seat.playerId })).ok,
    true,
  );
  await until(() => !guest.socket.connected);
  assert.equal(
    system.store.authenticate(host.seat.code, guest.seat.token),
    null,
  );
  assert.equal(
    (await seat(url, "Replacement", host.seat.code)).code,
    host.seat.code,
  );
});
