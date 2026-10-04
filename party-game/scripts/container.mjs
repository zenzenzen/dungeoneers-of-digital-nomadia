import { mkdirSync, chownSync, existsSync } from "node:fs";
import { dirname } from "node:path";
import { spawn } from "node:child_process";
const db = process.env.DB_PATH ?? "/data/nomadia.sqlite";
mkdirSync(dirname(db), { recursive: true });
const dropRoot = process.getuid?.() === 0;
if (dropRoot) {
  for (const path of [dirname(db), db, db + "-wal", db + "-shm"])
    if (existsSync(path)) chownSync(path, 1000, 1000);
}
const child = spawn(process.execPath, ["--import", "tsx", "server/index.ts"], {
  stdio: "inherit",
  env: process.env,
  ...(dropRoot ? { uid: 1000, gid: 1000 } : {}),
});
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () => child.kill(signal));
child.on("error", (e) => {
  console.error(e.message);
  process.exit(1);
});
child.on("exit", (code) => process.exit(code ?? 1));
