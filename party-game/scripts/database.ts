import { DatabaseSync, backup } from "node:sqlite";
import {
  existsSync,
  mkdirSync,
  renameSync,
  rmSync,
  readFileSync,
} from "node:fs";
import { resolve, dirname } from "node:path";
const [mode, file, ...flags] = process.argv.slice(2);
const dbPath = resolve(process.env.DB_PATH ?? "data/nomadia.sqlite");
if (!file || !["backup", "restore"].includes(mode))
  throw new Error(
    "Usage: npm run backup -- <output.sqlite> OR npm run restore -- <backup.sqlite> --server-stopped",
  );
const target = resolve(file);
if (target === dbPath) throw new Error("Choose a different backup path.");
if (mode === "backup") {
  if (!existsSync(dbPath)) throw new Error("Database does not exist.");
  if (existsSync(target))
    throw new Error("Backup target already exists; choose a new name.");
  mkdirSync(dirname(target), { recursive: true });
  const db = new DatabaseSync(dbPath, { readOnly: true });
  await backup(db, target);
  db.close();
  console.log(`Consistent SQLite backup saved: ${target}`);
} else {
  if (!flags.includes("--server-stopped"))
    throw new Error(
      "Stop every app instance using this database, then pass --server-stopped.",
    );
  if (existsSync(".runtime.json")) {
    const state = JSON.parse(readFileSync(".runtime.json", "utf8"));
    let alive = false;
    try {
      process.kill(state.pid, 0);
      alive = true;
    } catch {}
    if (alive)
      throw new Error(
        "The recorded server is still running. Run npm run stop first.",
      );
  }
  if (!existsSync(target)) throw new Error("Backup does not exist.");
  const source = new DatabaseSync(target, { readOnly: true });
  const integrity = source.prepare("PRAGMA integrity_check").get() as Record<
    string,
    string
  >;
  if (Object.values(integrity)[0] !== "ok")
    throw new Error("Backup integrity check failed.");
  const version = source
    .prepare("SELECT MAX(version) AS v FROM migrations")
    .get() as { v: number };
  if (version.v !== 1) throw new Error("Unsupported database schema.");
  mkdirSync(dirname(dbPath), { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  if (existsSync(dbPath)) {
    const existing = new DatabaseSync(dbPath);
    await backup(existing, `${dbPath}.before-restore-${stamp}`);
    existing.close();
  }
  const temporary = `${dbPath}.restore-${stamp}`;
  await backup(source, temporary);
  source.close();
  rmSync(`${dbPath}-wal`, { force: true });
  rmSync(`${dbPath}-shm`, { force: true });
  renameSync(temporary, dbPath);
  console.log(
    "Restored backup. Any previous database was backed up before replacement. Start the app and reconnect with existing seat tokens.",
  );
}
