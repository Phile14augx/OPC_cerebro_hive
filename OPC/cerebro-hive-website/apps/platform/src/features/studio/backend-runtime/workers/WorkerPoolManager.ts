
export interface WorkerNode {
  id: string;
  capabilities: string[];
  health: 'Healthy' | 'Degraded' | 'Dead';
  load: number;
  maxConcurrency: number;
  drainMode: boolean;
}

export class WorkerPoolManager {
  private workers: Map<string, WorkerNode> = new Map();

  register(worker: WorkerNode) {
    this.workers.set(worker.id, worker);
  }

  heartbeat(workerId: string, load: number) {
    const worker = this.workers.get(workerId);
    if (worker) {
        worker.load = load;
        worker.health = 'Healthy';
    }
  }

  getOptimalWorker(capability: string): WorkerNode | null {
    const candidates = Array.from(this.workers.values())
      .filter(w => !w.drainMode && w.health === 'Healthy' && w.capabilities.includes(capability) && w.load < w.maxConcurrency);
    
    if (candidates.length === 0) return null;
    
    // Return least loaded worker
    return candidates.sort((a, b) => (a.load / a.maxConcurrency) - (b.load / b.maxConcurrency))[0];
  }
}
