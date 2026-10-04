import { createApp } from "./app";
const { app } = await createApp({ logger: true });
await app.listen({ port: Number(process.env.PORT ?? 3000), host: "0.0.0.0" });
for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.once(signal, async () => {
    await app.close();
    process.exit(0);
  });
