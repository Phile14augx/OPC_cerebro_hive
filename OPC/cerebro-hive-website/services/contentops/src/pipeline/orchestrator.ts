import fs from "node:fs/promises";
import path from "node:path";
import { parseArticle } from "../ingestion/parser.js";
import { transformAll } from "../transform/engine.js";
import { publishToLinkedIn } from "../publishers/linkedin.js";
import { publishToMedium } from "../publishers/medium.js";
import { resolvePublishTime, waitUntil } from "./scheduler.js";
import { logger } from "../utils/logger.js";
import type { TransformedContent } from "../transform/engine.js";
import type { Platform } from "../ingestion/schema.js";

const DRY_RUN = process.env.DRY_RUN === "true";

const WATCH_DIR = path.resolve(
  process.env.WATCH_DIR ?? "C:/Claude/Scheduled"
);
const INCOMING_DIR = path.join(WATCH_DIR, "incoming");
const ARCHIVE_DIR = path.join(WATCH_DIR, "archive");
const FAILED_DIR = path.join(WATCH_DIR, "failed");

/**
 * Dispatch a single TransformedContent object to the appropriate publisher.
 */
async function dispatch(
  content: TransformedContent,
  schedule: Record<string, string> | undefined
): Promise<void> {
  const publishAt = resolvePublishTime(content.platform, schedule);

  if (publishAt) {
    logger.info(
      `Scheduling ${content.platform} publish at ${publishAt.toLocaleTimeString()}`
    );
    await waitUntil(publishAt);
  }

  switch (content.platform as Platform) {
    case "linkedin":
      await publishToLinkedIn(content, DRY_RUN);
      break;
    case "medium":
      await publishToMedium(content, DRY_RUN);
      break;
    case "devto":
      logger.warn("Dev.to publisher not yet implemented — skipping");
      break;
    case "hashnode":
      logger.warn("Hashnode publisher not yet implemented — skipping");
      break;
  }
}

/**
 * Move a file to a destination folder, adding a timestamp to avoid collisions.
 */
async function moveFile(src: string, destDir: string): Promise<void> {
  const name = path.basename(src);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dest = path.join(destDir, `${timestamp}_${name}`);
  await fs.rename(src, dest).catch(async () => {
    // rename fails across drives — fall back to copy + delete
    await fs.copyFile(src, dest);
    await fs.unlink(src);
  });
  logger.info(`Moved ${name} → ${path.basename(destDir)}/`);
}

/**
 * Run the full pipeline for a single Markdown file.
 */
export async function processFile(filePath: string): Promise<void> {
  const fileName = path.basename(filePath);
  logger.info(`\n${"─".repeat(60)}`);
  logger.info(`Processing: ${fileName}`);
  logger.info(`${"─".repeat(60)}`);

  try {
    // 1. Parse
    const article = await parseArticle(filePath);

    // 2. Transform (all platforms in parallel)
    const transformedList = await transformAll(article);

    // 3. Publish each platform (respecting schedule)
    await Promise.allSettled(
      transformedList.map((content) =>
        dispatch(content, article.frontmatter.schedule)
          .then(() => {
            logger.info(`✔ ${content.platform} — done`);
          })
          .catch((err: Error) => {
            logger.error(`✘ ${content.platform} — ${err.message}`);
          })
      )
    );

    // 4. Archive on success
    await moveFile(filePath, ARCHIVE_DIR);
    logger.info(`✔ Article archived: ${fileName}`);
  } catch (err) {
    logger.error(`Pipeline failed for ${fileName}: ${(err as Error).message}`);
    await moveFile(filePath, FAILED_DIR).catch(() => {});
  }
}

/**
 * Ensure all required watch directories exist.
 */
export async function ensureWatchDirs(): Promise<void> {
  for (const dir of [INCOMING_DIR, ARCHIVE_DIR, FAILED_DIR]) {
    await fs.mkdir(dir, { recursive: true });
  }
  logger.info(`Watch dirs ready at: ${WATCH_DIR}`);
}

export { INCOMING_DIR };
