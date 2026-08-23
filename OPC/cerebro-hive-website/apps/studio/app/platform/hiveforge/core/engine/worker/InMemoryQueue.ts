import type { ExecutionTask } from "../planner/graph";

export interface JobOptions {
  attempts?: number;
  delay?: number;
}

export interface Job<T = unknown> {
  id: string;
  name: string;
  data: T;
  opts?: JobOptions;
  progress: number;
}

export interface IJobQueue<T = unknown> {
  add(name: string, data: T, opts?: JobOptions): Promise<Job<T>>;
  process(processor: (job: Job<T>) => Promise<void>): void;
}

export class InMemoryQueue<T = unknown> implements IJobQueue<T> {
  private jobs: Job<T>[] = [];
  private processor?: (job: Job<T>) => Promise<void>;
  
  constructor(public readonly name: string) {}

  async add(name: string, data: T, opts?: JobOptions): Promise<Job<T>> {
    const job: Job<T> = {
      id: crypto.randomUUID(),
      name,
      data,
      opts,
      progress: 0
    };
    this.jobs.push(job);
    
    // Simulate BullMQ asynchronous execution
    if (this.processor) {
      setTimeout(() => this.executeJob(job), opts?.delay || 0);
    }
    
    return job;
  }

  process(processor: (job: Job<T>) => Promise<void>): void {
    this.processor = processor;
    // Process any jobs already in the queue
    for (const job of this.jobs) {
      setTimeout(() => this.executeJob(job), 0);
    }
  }

  private async executeJob(job: Job<T>) {
    if (!this.processor) return;
    try {
      await this.processor(job);
    } catch (e) {
      console.error(`[InMemoryQueue ${this.name}] Job ${job.id} failed:`, e);
      // Basic retry logic
      if (job.opts?.attempts && job.opts.attempts > 1) {
        job.opts.attempts--;
        console.log(`[InMemoryQueue ${this.name}] Retrying job ${job.id}...`);
        setTimeout(() => this.executeJob(job), 1000);
      }
    }
  }
}

export const provisioningQueue = new InMemoryQueue<ExecutionTask>("provisioning-queue");
