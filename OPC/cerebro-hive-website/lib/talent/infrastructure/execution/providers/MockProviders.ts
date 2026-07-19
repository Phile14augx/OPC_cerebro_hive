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

  async execute(language: string, code: string): Promise<ExecutionResult> {
    if (language !== 'javascript') {
      throw new Error(`Mock provider only supports javascript, got ${language}`);
    }

    const start = Date.now();
    let stdout = '';
    let stderr = '';
    let exitCode = 0;

    // Overwrite console.log to capture and stream stdout
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
      const line = args.join(' ') + '\n';
      stdout += line;
      this.streamingProvider.broadcast(this.jobId, { type: 'stdout', data: line, timestamp: new Date().toISOString() });
    };

    console.error = (...args) => {
      const line = args.join(' ') + '\n';
      stderr += line;
      this.streamingProvider.broadcast(this.jobId, { type: 'stderr', data: line, timestamp: new Date().toISOString() });
    };

    try {
      // Simulate execution time
      await new Promise(r => setTimeout(r, 800));
      
      // Execute the candidate's JS code in the current context
      // Note: In Stage 3 mock, we expect the code to console.log output.
      eval(code);
      
    } catch (e: any) {
      exitCode = 1;
      const errStr = e.toString() + '\n';
      stderr += errStr;
      this.streamingProvider.broadcast(this.jobId, { type: 'stderr', data: errStr, timestamp: new Date().toISOString() });
    } finally {
      console.log = originalLog;
      console.error = originalError;
    }

    const timeMs = Date.now() - start;

    return {
      stdout,
      stderr,
      exitCode,
      memoryUsedBytes: 1024 * 1024 * 12, // mock 12MB
      timeMs
    };
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
