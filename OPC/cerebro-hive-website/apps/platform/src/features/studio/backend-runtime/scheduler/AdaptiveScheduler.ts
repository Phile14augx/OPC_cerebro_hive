
import { WorkerPoolManager } from '../workers/WorkerPoolManager';
import { RuntimeTask } from '../execution/RuntimeIR';

export class AdaptiveScheduler {
  constructor(private poolManager: WorkerPoolManager) {}

  schedule(task: RuntimeTask) {
    const worker = this.poolManager.getOptimalWorker(task.capabilityId);
    
    if (!worker) {
      console.warn(`[Scheduler] Backpressure applied! No available worker for ${task.capabilityId}`);
      // Trigger QueueBalancer / BackpressureController logic
      return null;
    }
    
    console.log(`[Scheduler] Dispatched task ${task.id} to Worker ${worker.id}`);
    return worker.id;
  }
}
