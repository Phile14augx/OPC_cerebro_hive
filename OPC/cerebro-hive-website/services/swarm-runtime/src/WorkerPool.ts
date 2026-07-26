
import { ExecutionProfile } from '@cerebro/swarm-sdk';

export class WorkerPool {
  private availableCpu = 1000; // Mock units
  private availableMemory = 4096; // MB

  hasCapacity(profile: ExecutionProfile): boolean {
    return this.availableCpu >= profile.cpu && this.availableMemory >= profile.memory;
  }

  allocate(profile: ExecutionProfile) {
    if (!this.hasCapacity(profile)) throw new Error('Insufficient Capacity');
    this.availableCpu -= profile.cpu;
    this.availableMemory -= profile.memory;
  }

  release(profile: ExecutionProfile) {
    this.availableCpu += profile.cpu;
    this.availableMemory += profile.memory;
  }
}
