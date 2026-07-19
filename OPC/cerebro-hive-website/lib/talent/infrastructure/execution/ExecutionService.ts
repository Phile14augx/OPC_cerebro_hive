import { PrismaClient, ExecutionJob, ExecutionStatus } from '@prisma/client';
import { DomainEventBus } from '../events/eventBus';
import { withTransaction } from '../database/transaction';
import { 
  IQueueProvider, 
  ISandboxProvider, 
  IStreamingProvider,
  ExecutionJobPayload
} from './providers/interfaces';
import { MockQueueProvider, MockSandboxProvider, MockStreamingProvider } from './providers/MockProviders';

const prisma = new PrismaClient();

// Instantiate Mock Providers for Stage 3 Slice
// In production, these would be injected via a DI container or Factory based on ENV vars
const queueProvider: IQueueProvider = new MockQueueProvider();
const streamingProvider: IStreamingProvider = new MockStreamingProvider();

export class ExecutionService {
  constructor() {
    this.initializeWorker();
  }

  /**
   * Initializes the Worker Loop which listens to the Queue.
   */
  private initializeWorker() {
    queueProvider.registerWorker(async (payload: ExecutionJobPayload) => {
      const { jobId, sessionId, code, language } = payload;
      
      // 1. ALLOCATING
      await this.updateJobStatus(jobId, 'ALLOCATING');
      DomainEventBus.publish('WorkerAllocated', { jobId });

      // 2. STARTING / STREAMING
      await this.updateJobStatus(jobId, 'STARTING');
      
      // We pass the streaming provider to the sandbox so it can emit stdout/stderr
      const sandbox: ISandboxProvider = new MockSandboxProvider(streamingProvider, jobId);
      
      DomainEventBus.publish('SandboxCreated', { jobId });
      await this.updateJobStatus(jobId, 'RUNNING');
      await this.updateJobStatus(jobId, 'STREAMING');

      try {
        DomainEventBus.publish('ExecutionStarted', { jobId });
        streamingProvider.broadcast(jobId, { type: 'status', status: 'RUNNING', timestamp: new Date().toISOString() });
        
        // 3. EXECUTION
        const result = await sandbox.execute(language, code);
        
        // 4. COMPLETED
        await this.persistArtifacts(jobId, result);
        await this.updateJobStatus(jobId, 'COMPLETED');
        streamingProvider.broadcast(jobId, { type: 'result', exitCode: result.exitCode, timestamp: new Date().toISOString() });
        DomainEventBus.publish('ExecutionCompleted', { jobId, exitCode: result.exitCode });

      } catch (error: any) {
        // 4. FAILED
        await this.updateJobStatus(jobId, 'FAILED');
        streamingProvider.broadcast(jobId, { type: 'stderr', data: error.toString(), timestamp: new Date().toISOString() });
        streamingProvider.broadcast(jobId, { type: 'result', exitCode: 1, timestamp: new Date().toISOString() });
        DomainEventBus.publish('ExecutionFailed', { jobId, error: error.toString() });
      } finally {
        DomainEventBus.publish('SandboxDestroyed', { jobId });
        DomainEventBus.publish('WorkerReleased', { jobId });
      }
    });
  }

  private async updateJobStatus(jobId: string, status: ExecutionStatus) {
    await prisma.executionJob.update({
      where: { id: jobId },
      data: { status }
    });
  }

  private async persistArtifacts(jobId: string, result: any) {
    await prisma.executionArtifact.create({
      data: {
        jobId,
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
        executionTimeMs: result.timeMs,
        memoryUsedBytes: result.memoryUsedBytes
      }
    });
  }

  /**
   * Called by the Next.js API to submit code for execution
   */
  async submitExecution(sessionId: string, language: string, code: string, traceId?: string): Promise<ExecutionJob> {
    return withTransaction(async (tx: any) => {
      // 1. Create Job Record
      const job = await tx.executionJob.create({
        data: {
          sessionId,
          status: 'QUEUED',
          language,
          code
        }
      });

      // 2. Queue Job
      await queueProvider.enqueueExecution(job.id, {
        jobId: job.id,
        sessionId,
        code,
        language
      });

      // 3. Emit Domain Event
      DomainEventBus.publish('ExecutionQueued', { jobId: job.id, sessionId }, traceId);

      return job;
    });
  }

  /**
   * Exposes the Streaming Provider to the SSE Next.js route
   */
  getStreamingProvider(): IStreamingProvider {
    return streamingProvider;
  }
}
