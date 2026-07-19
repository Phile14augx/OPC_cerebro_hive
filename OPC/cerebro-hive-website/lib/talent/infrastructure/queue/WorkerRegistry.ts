import { Job, QueueName } from "./ExecutionQueueService";
import { DockerExecutionProvider } from "../execution/DockerExecutionProvider";

type WorkerHandler = (job: Job) => Promise<void>;

/**
 * The WorkerRegistry runs in a dedicated Node.js process (NOT Next.js).
 * It listens to Redis BullMQ queues and routes jobs to the correct execution layer.
 */
export class WorkerRegistry {
  private handlers: Map<QueueName, WorkerHandler> = new Map();
  private dockerProvider = new DockerExecutionProvider();

  register(queue: QueueName, handler: WorkerHandler) {
    this.handlers.set(queue, handler);
    console.log(`[WorkerRegistry] Listening on queue: ${queue}`);
    // new BullMQ.Worker(queue, handler, { connection: redisConnection });
  }

  // --- Example Bootstrapping of Core Workers ---

  startCoreWorkers() {
    // 1. The Execution Worker (Compiles and runs untrusted code in Docker)
    this.register("execution", async (job: Job) => {
      console.log(`[Worker: execution] Processing job ${job.id}`);
      await job.updateProgress({ state: 'provisioning' });
      
      const envId = `sandbox_${job.id}`;
      await this.dockerProvider.provision(envId, {
        cpuQuota: 0.5, memoryLimitMb: 512, executionTimeoutMs: 30000,
        networkEnabled: false, readOnlyFilesystem: true
      });

      await job.updateProgress({ state: 'executing' });
      
      // We also stream logs to the Realtime Service (WebSocket/SSE) here
      this.dockerProvider.streamLogs(envId, (chunk) => {
        // e.g. redis.publish(`logs:${job.data.submissionId}`, chunk);
      });

      await this.dockerProvider.execute(envId, ["npm", "test"], {});
      const result = await this.dockerProvider.collectResult(envId);
      
      await this.dockerProvider.cleanup(envId);

      // Pass off to Evaluation Queue
      console.log(`[Worker: execution] Finished. Enqueueing evaluation.`);
    });

    // 2. The Evaluation Worker (Deterministic Scoring)
    this.register("evaluation", async (job: Job) => {
      console.log(`[Worker: evaluation] Grading artifacts for ${job.id}`);
      // Run deterministic tests, then enqueue AI Review
    });
  }
}
