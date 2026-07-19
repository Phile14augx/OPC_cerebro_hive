import { Worker, Job } from 'bullmq';
import { redisConnection } from './client';
import { PmService } from '@/lib/services/pm.service';

export const pmAgentWorker = new Worker('pm-agent-queue', async (job: Job) => {
  console.log(`[Worker] Processing PM Agent Job: ${job.name} (ID: ${job.id})`);
  
  if (job.name === 'decomposeEpic') {
    const { projectId, title, body, promptTemplate, userId } = job.data;
    await PmService.processEpicDecomposition(projectId, title, body, promptTemplate, userId);
    return { status: 'completed', message: 'Epic decomposed' };
  }

  throw new Error(`Unknown job name: ${job.name}`);
}, { 
  connection: redisConnection,
  concurrency: 2
});

pmAgentWorker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed successfully`);
});

pmAgentWorker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed with error:`, err);
});
