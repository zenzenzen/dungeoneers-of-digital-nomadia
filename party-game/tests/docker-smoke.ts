import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { io, type Socket } from "socket.io-client";
import type { Snapshot, Ack } from "../src/shared/types";
const mode = process.argv[2] ?? "create",
  url = process.env.SMOKE_URL ?? "http://localhost:3037";
const fixture = "output/docker-smoke.json";
mkdirSync("output", { recursive: true });
const sockets: Socket[] = [];
const views: Snapshot[] = [];
async function until(f: () => boolean) {
  for (let i = 0; i < 150; i++) {
    if (f()) return;
    await new Promise((r) => setTimeout(r, 20));
  }
  throw new Error("State did not arrive");
}
try {
  const health = await (await fetch(`${url}/health`)).json();
  assert.equal(health.ok, true);
  let seats: { code: string; token: string; playerId: string }[] = [],
    previous: { seats: typeof seats; hand: unknown } | null = null;
  if (mode === "resume") {
    previous = JSON.parse(readFileSync(fixture, "utf8"));
    seats = previous!.seats;
  }
  for (let i = 0; i < 3; i++) {
    if (mode === "create") {
      const r = await fetch(
        `${url}/api/rooms${i ? `/${seats[0].code}/join` : ""}`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ nickname: `Smoke ${i + 1}` }),
        },
      );
      assert.equal(r.status, 201);
      seats.push(await r.json());
    }
    const socket = io(url, {
      autoConnect: false,
      transports: ["websocket"],
      auth: { code: seats[i].code, token: seats[i].token },
      reconnection: false,
    });
    sockets.push(socket);
    socket.on("snapshot", (s: Snapshot) => (views[i] = s));
    socket.connect();
    await until(() => !!views[i]);
  }
  await until(
    () =>
      views[0].players.length === 3 &&
      views[0].players.every((p) => p.connected),
  );
  if (mode === "create") {
    const ack: Ack = await sockets[0]
      .timeout(3000)
      .emitWithAck("command", {
        commandId: randomUUID(),
        expectedRevision: views[0].revision,
        command: { type: "start" },
      });
    assert.equal(ack.ok, true);
    await until(() => views.every((v) => v.phase === "prepare"));
    writeFileSync(
      fixture,
      JSON.stringify({ seats, hand: views[0].players[0].hand }),
      { mode: 0o600 },
    );
  } else {
    assert.equal(views[0].phase, "prepare");
    assert.deepEqual(views[0].players[0].hand, previous!.hand);
    assert.equal(views[0].paused, false);
  }
  assert.equal(views[0].players[1].hand, undefined);
  assert.ok(!("rng" in views[0]));
  console.log(
    JSON.stringify({
      stage: mode,
      ok: true,
      players: 3,
      contentVersion: views[0].contentVersion,
      privateHands: true,
      persistedHand: mode === "resume",
    }),
  );
} finally {
  sockets.forEach((s) => s.disconnect());
}
