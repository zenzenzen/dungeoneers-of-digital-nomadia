import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createApp } from "../server/app";
const dir = mkdtempSync(join(tmpdir(), "nomadia-browser-"));
const { app } = await createApp({
  dbPath: join(dir, "room.sqlite"),
  maxRooms: 1000,
});
await app.listen({ port: 4137, host: "127.0.0.1" });
for (const sig of ["SIGINT", "SIGTERM"] as const)
  process.once(sig, async () => {
    await app.close();
    rmSync(dir, { recursive: true, force: true });
    process.exit(0);
  });
