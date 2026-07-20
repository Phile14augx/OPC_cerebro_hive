import { buildPlatform } from "./app/container.js";
import { createServer } from "./kernel/gateway/server.js";

async function main(): Promise<void> {
  const platform = await buildPlatform({
    withDatabase: process.env.PLATFORM_NO_DB !== "1",
    startScheduler: true,
    config: { EVENT_BUS: (process.env.EVENT_BUS as never) ?? "nats" },
  });
  const app = await createServer(platform);
  await app.listen({ port: platform.config.PORT, host: platform.config.HOST });
  platform.logger.info({ port: platform.config.PORT, bus: platform.bus.kind, db: !!platform.db }, "CerebroHive Enterprise AI OS online");

  const stop = async () => {
    platform.logger.info("shutting down");
    await app.close();
    await platform.shutdown();
    process.exit(0);
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}

main().catch(err => { console.error(err); process.exit(1); });
