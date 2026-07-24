/**
 * platform-api — Entry point
 * Starts the HTTP server after all async initializations succeed.
 */

import { getPlatformApiConfig } from "@cerebro/config";
import { prisma } from "@cerebro/db";
import { queue } from "@cerebro/queue";
import { createApp } from "./app.js";

const cfg = getPlatformApiConfig();

async function bootstrap(): Promise<void> {
  // Validate DB connectivity
  await prisma.$queryRaw`SELECT 1`;
  console.info("[server] Database connected");

  // Connect NATS
  await queue.connect(cfg.NATS_URL);
  console.info("[server] NATS connected");

  const app = createApp();

  await new Promise<void>((resolve, reject) => {
    const server = app.listen(cfg.PORT, () => {
      console.info(`[server] platform-api listening on :${cfg.PORT} (${cfg.NODE_ENV})`);
      resolve();
    });
    server.on("error", reject);

    // Graceful shutdown
    const shutdown = async (signal: string): Promise<void> => {
      console.info(`[server] ${signal} received — shutting down`);
      server.close(async () => {
        await queue.disconnect();
        await prisma.$disconnect();
        console.info("[server] Shutdown complete");
        process.exit(0);
      });
      setTimeout(() => { process.exit(1); }, 10_000);
    };

    process.on("SIGTERM", () => void shutdown("SIGTERM"));
    process.on("SIGINT",  () => void shutdown("SIGINT"));
  });
}

bootstrap().catch((err) => {
  console.error("[server] Fatal startup error:", err);
  process.exit(1);
});
