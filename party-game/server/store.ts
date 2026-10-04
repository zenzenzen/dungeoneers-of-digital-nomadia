import { DatabaseSync, backup } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { createHash } from "node:crypto";
import type { Ack, ContentBundle, GameState } from "../src/shared/types";
export const hash = (text: string) =>
  createHash("sha256").update(text).digest("hex");
export class Store {
  db: DatabaseSync;
  constructor(public path: string) {
    if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db
      .exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
   CREATE TABLE IF NOT EXISTS migrations(version INTEGER PRIMARY KEY, applied_at INTEGER NOT NULL);
   CREATE TABLE IF NOT EXISTS contents(version TEXT PRIMARY KEY, body TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS rooms(id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, version TEXT NOT NULL REFERENCES contents(version), state TEXT NOT NULL, updated_at INTEGER NOT NULL);
   CREATE TABLE IF NOT EXISTS seats(room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE, player_id TEXT NOT NULL, token_hash TEXT UNIQUE NOT NULL, PRIMARY KEY(room_id,player_id));
   CREATE TABLE IF NOT EXISTS receipts(room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE, player_id TEXT NOT NULL, command_id TEXT NOT NULL, fingerprint TEXT NOT NULL, ack TEXT NOT NULL, PRIMARY KEY(room_id,player_id,command_id));
   INSERT OR IGNORE INTO migrations VALUES(1, unixepoch());`);
  }
  transaction<T>(f: () => T): T {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const value = f();
      this.db.exec("COMMIT");
      return value;
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }
  content(bundle: ContentBundle) {
    this.db
      .prepare("INSERT OR IGNORE INTO contents VALUES(?,?)")
      .run(bundle.version, JSON.stringify(bundle));
  }
  getContent(version: string): ContentBundle {
    const row = this.db
      .prepare("SELECT body FROM contents WHERE version=?")
      .get(version) as { body: string } | undefined;
    if (!row) throw new Error("Missing pinned content");
    return JSON.parse(row.body);
  }
  room(code: string): GameState | null {
    const row = this.db
      .prepare("SELECT state FROM rooms WHERE code=?")
      .get(code) as { state: string } | undefined;
    return row ? JSON.parse(row.state) : null;
  }
  rooms(): GameState[] {
    return (
      this.db.prepare("SELECT state FROM rooms").all() as { state: string }[]
    ).map((x) => JSON.parse(x.state));
  }
  save(s: GameState) {
    this.db
      .prepare(
        "INSERT INTO rooms VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET state=excluded.state,version=excluded.version,updated_at=excluded.updated_at",
      )
      .run(s.id, s.code, s.contentVersion, JSON.stringify(s), s.updatedAt);
  }
  seat(roomId: string, playerId: string, token: string) {
    this.db
      .prepare("INSERT INTO seats VALUES(?,?,?)")
      .run(roomId, playerId, hash(token));
  }
  authenticate(
    code: string,
    token: string,
  ): { roomId: string; playerId: string } | null {
    const row = this.db
      .prepare(
        "SELECT seats.room_id AS roomId,player_id AS playerId FROM seats JOIN rooms ON rooms.id=seats.room_id WHERE code=? AND token_hash=?",
      )
      .get(code, hash(token));
    return (row as { roomId: string; playerId: string } | undefined) ?? null;
  }
  removeSeat(roomId: string, playerId: string) {
    this.db
      .prepare("DELETE FROM seats WHERE room_id=? AND player_id=?")
      .run(roomId, playerId);
  }
  receipt(
    roomId: string,
    playerId: string,
    id: string,
  ): { fingerprint: string; ack: Ack } | null {
    const r = this.db
      .prepare(
        "SELECT fingerprint,ack FROM receipts WHERE room_id=? AND player_id=? AND command_id=?",
      )
      .get(roomId, playerId, id) as
      { fingerprint: string; ack: string } | undefined;
    return r ? { fingerprint: r.fingerprint, ack: JSON.parse(r.ack) } : null;
  }
  remember(
    roomId: string,
    playerId: string,
    id: string,
    fingerprint: string,
    ack: Ack,
  ) {
    this.db
      .prepare("INSERT INTO receipts VALUES(?,?,?,?,?)")
      .run(roomId, playerId, id, fingerprint, JSON.stringify(ack));
  }
  prune(before: number) {
    this.db.prepare("DELETE FROM rooms WHERE updated_at < ?").run(before);
  }
  async backup(destination: string) {
    mkdirSync(dirname(destination), { recursive: true });
    await backup(this.db, destination);
  }
  close() {
    this.db.close();
  }
}
