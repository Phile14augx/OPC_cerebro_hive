// @ts-nocheck
import { EventEmitter } from 'events';
import { 
  IQueueProvider, 
  ISandboxProvider, 
  IStreamingProvider, 
  ExecutionJobPayload, 
  ExecutionResult, 
  ExecutionStreamEvent 
} from './interfaces';

const internalMockQueue = new EventEmitter();
const internalMockStream = new EventEmitter();

/**
 * Mock Queue Provider (Simulates BullMQ)
 * Delays execution slightly to mimic queue pickup latency.
 */
export class MockQueueProvider implements IQueueProvider {
  async enqueueExecution(jobId: string, payload: ExecutionJobPayload): Promise<void> {
    // Simulate network delay to queue
    setTimeout(() => {
      internalMockQueue.emit('job', payload);
    }, 100);
  }

  registerWorker(processor: (payload: ExecutionJobPayload) => Promise<void>): void {
    internalMockQueue.on('job', async (payload: ExecutionJobPayload) => {
      // Simulate worker picking up the job
      setTimeout(async () => {
        try {
          await processor(payload);
        } catch (e) {
          console.error("Worker failed processing job", e);
        }
      }, 500);
    });
  }
}

/**
 * Mock Sandbox Provider (Simulates Dockerode)
 * Executes the code using standard Node.js `eval` for the prototype slice,
 * wrapped in try/catch to mimic isolated execution behavior.
 * NOTE: NEVER do this in production. Production uses Docker Sandbox Manager.
 */
export class MockSandboxProvider implements ISandboxProvider {
  constructor(private streamingProvider: IStreamingProvider, private jobId: string) {}

  async execute(_language: string, _code: string): Promise<ExecutionResult> {
    throw new Error(
      "TALENT_SANDBOX_NOT_IMPLEMENTED: candidate code is not evaluated in-process. Docker isolation is not wired."
    );
  }
}

/**
 * Mock Streaming Provider (Simulates Redis Pub/Sub for SSE endpoints)
 */
export class MockStreamingProvider implements IStreamingProvider {
  broadcast(jobId: string, event: ExecutionStreamEvent): void {
    internalMockStream.emit(`stream:${jobId}`, event);
  }

  subscribe(jobId: string, onEvent: (event: ExecutionStreamEvent) => void): () => void {
    const channel = `stream:${jobId}`;
    internalMockStream.on(channel, onEvent);
    
    // Return cleanup function
    return () => {
      internalMockStream.off(channel, onEvent);
    };
  }
}
