export interface Job<T = any> {
  id: string;
  name: string;
  data: T;
  opts?: {
    attempts?: number;
    delay?: number;
  };
  progress: number;
}

export interface IJobQueue {
  add(name: string, data: any, opts?: any): Promise<Job>;
  process(processor: (job: Job) => Promise<void>): void;
}

export class InMemoryQueue implements IJobQueue {
  private jobs: Job[] = [];
  private processor?: (job: Job) => Promise<void>;
  
  constructor(public readonly name: string) {}

  async add(name: string, data: any, opts?: any): Promise<Job> {
    const job: Job = {
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

  process(processor: (job: Job) => Promise<void>): void {
    this.processor = processor;
    // Process any jobs already in the queue
    for (const job of this.jobs) {
      setTimeout(() => this.executeJob(job), 0);
    }
  }

  private async executeJob(job: Job) {
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

export const provisioningQueue = new InMemoryQueue("provisioning-queue");
