import { Queue } from 'bullmq';
import { env } from '../config/env.js';

let ingestionQueue: Queue | null = null;

export function getIngestionQueue(): Queue {
  if (!ingestionQueue) {
    if (!env.REDIS_URL) {
      throw new Error('REDIS_URL is required to initialize the queue.');
    }
    ingestionQueue = new Queue('archive-ingestion', {
      connection: {
        url: env.REDIS_URL,
      },
    });
  }
  return ingestionQueue;
}

export async function closeQueues() {
  if (ingestionQueue) {
    await ingestionQueue.close();
  }
}
