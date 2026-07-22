import { Queue } from 'bullmq';
import IORedis from 'ioredis';

// Create a robust Redis connection using ioredis
export const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://:redispassword123@localhost:6379', {
  maxRetriesPerRequest: null,
});

// Define queues
export const pmAgentQueue = new Queue('pm-agent-queue', { connection: redisConnection });
export const auditQueue = new Queue('audit-queue', { connection: redisConnection });

/**
 * Standardized job publisher
 */
export async function enqueueJob(queue: Queue, jobName: string, data: any, options = {}) {
  try {
    const job = await queue.add(jobName, data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      ...options,
    });
    return job.id;
  } catch (error) {
    console.error(`Failed to enqueue job ${jobName} on ${queue.name}:`, error);
    throw error;
  }
}
