/**
 * CerebroContent — Content Intelligence Pipeline
 * Entry point: starts the file watcher.
 */
import chokidar from "chokidar";
import { processFile, ensureWatchDirs, INCOMING_DIR } from "./pipeline/orchestrator.js";
import { logger } from "./utils/logger.js";

async function main() {
  logger.info("╔══════════════════════════════════════╗");
  logger.info("║  CerebroContent Pipeline — Starting  ║");
  logger.info("╚══════════════════════════════════════╝");

  if (process.env.DRY_RUN === "true") {
    logger.info("⚠  DRY RUN mode — no posts will be published");
  }

  await ensureWatchDirs();

  logger.info(`Watching: ${INCOMING_DIR}`);

  const watcher = chokidar.watch(INCOMING_DIR, {
    persistent: true,
    ignoreInitial: false,    // process files already in folder on startup
    awaitWriteFinish: {
      stabilityThreshold: 2000,  // wait 2s after last write before processing
      pollInterval: 100,
    },
    ignored: /(^|[/\\])\../,   // ignore dotfiles
  });

  // Track files being processed to prevent double-processing
  const inProgress = new Set<string>();

  watcher.on("add", async (filePath: string) => {
    if (!filePath.endsWith(".md")) return;
    if (inProgress.has(filePath)) return;

    inProgress.add(filePath);
    try {
      await processFile(filePath);
    } finally {
      inProgress.delete(filePath);
    }
  });

  watcher.on("error", (err: unknown) => {
    logger.error(`Watcher error: ${err}`);
  });

  // Graceful shutdown
  process.on("SIGINT", async () => {
    logger.info("Shutting down...");
    await watcher.close();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
