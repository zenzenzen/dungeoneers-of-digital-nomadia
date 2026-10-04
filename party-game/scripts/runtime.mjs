import { spawn, execFileSync } from "node:child_process";
import {
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  openSync,
  rmSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
const root = fileURLToPath(new URL("../", import.meta.url));
const handle = new URL("../.runtime.json", import.meta.url);
const mode = process.argv[2];
function running() {
  try {
    const state = JSON.parse(readFileSync(handle, "utf8"));
    const command = execFileSync(
      "ps",
      ["-p", String(state.pid), "-o", "command="],
      { encoding: "utf8" },
    );
    return command.includes(state.instance) &&
      command.includes("server/index.ts")
      ? state
      : null;
  } catch {
    return null;
  }
}
if (mode === "serve") {
  if (running()) {
    console.log("This app is already running.");
    process.exit(0);
  }
  if (!existsSync(new URL("../dist/index.html", import.meta.url)))
    throw new Error("Run npm run build first.");
  mkdirSync(new URL("../data/", import.meta.url), { recursive: true });
  const fd = openSync(new URL("../data/server.log", import.meta.url), "a");
  const instance = randomUUID();
  const child = spawn(
    process.execPath,
    [
      "--import",
      "tsx",
      `${root}server/index.ts`,
      `--runtime-instance=${instance}`,
    ],
    { cwd: root, env: process.env, detached: true, stdio: ["ignore", fd, fd] },
  );
  child.unref();
  writeFileSync(handle, JSON.stringify({ pid: child.pid, instance, root }));
  let healthy = false;
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(
        `http://localhost:${process.env.PORT ?? 3000}/health`,
      );
      healthy = r.ok;
      if (healthy) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  if (!healthy)
    throw new Error("Server did not become healthy. Read data/server.log.");
  console.log(
    `Running at http://localhost:${process.env.PORT ?? 3000}; stop with npm run stop.`,
  );
} else if (mode === "stop") {
  const state = running();
  if (state) {
    process.kill(-state.pid, "SIGTERM");
    for (let n = 0; n < 50 && running(); n++)
      await new Promise((r) => setTimeout(r, 100));
    if (running())
      throw new Error("Process did not exit; inspect it before retrying.");
  }
  rmSync(handle, { force: true });
  console.log("Stopped only this app’s recorded process.");
} else if (mode === "reset") {
  if (running())
    throw new Error("Stop this app before resetting disposable local data.");
  rmSync(new URL("../data/", import.meta.url), {
    recursive: true,
    force: true,
  });
  rmSync(handle, { force: true });
  console.log(
    "Removed party-game/data only. Source files and browser collections are unchanged.",
  );
} else throw new Error("Usage: runtime.mjs serve|stop|reset");
