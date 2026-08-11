/**
 * Temporal worker — registers workflows + activities
 */

import { Worker } from "@temporalio/worker";
import { getPlatformApiConfig } from "@cerebro/config";
import * as activities from "./activities/index.js";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const cfg = getPlatformApiConfig();
const __dirname = dirname(fileURLToPath(import.meta.url));

async function run(): Promise<void> {
  const worker = await Worker.create({
    workflowsPath: resolve(__dirname, "workflows"),
    activities,
    taskQueue:     cfg.TEMPORAL_TASK_QUEUE,
    connection:    { address: cfg.TEMPORAL_ADDRESS } as never,
    namespace:     cfg.TEMPORAL_NAMESPACE,
    maxConcurrentActivityTaskExecutions:     50,
    maxConcurrentWorkflowTaskExecutions:     100,
    maxCachedWorkflows:                       200,
    reuseV8Context:                          true,
    sinks: {
      // OTel sink — forward workflow logs to structured logger
    },
  });

  console.info(`[worker] Starting on task queue: ${cfg.TEMPORAL_TASK_QUEUE}`);

  await worker.run();
}

run().catch((err) => {
  console.error("[worker] Fatal error:", err);
  process.exit(1);
});
