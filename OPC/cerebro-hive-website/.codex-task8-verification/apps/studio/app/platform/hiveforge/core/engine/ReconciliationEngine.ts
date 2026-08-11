/**
 * Reconciliation Engine
 */

import { DriftDetector } from "../contracts/drift";
import { eventBus } from "../events/EventBus";

export class ReconciliationEngine {
  private driftDetector: DriftDetector;
  private intervalId?: NodeJS.Timeout;

  constructor(driftDetector: DriftDetector) {
    this.driftDetector = driftDetector;
  }

  start(intervalMs: number = 60000) {
    this.intervalId = setInterval(() => this.reconcileAll(), intervalMs);
    console.log("[ReconciliationEngine] Continuous drift loop started.");
  }

  stop() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  async reconcileAll() {
    // In reality, this iterates over the ResourceGraph nodes
    const mockResourceIds = ["res-postgres-1"]; 
    
    for (const resId of mockResourceIds) {
      const report = await this.driftDetector.detectDrift(resId);
      if (report.state === "Drifted") {
        eventBus.publish({
          category: "ResourceLifecycle",
          type: "InfrastructureDriftDetected",
          source: "ReconciliationEngine",
          payload: { report }
        });
        
        // Emits corrective actions (mocked)
        this.emitCorrection(resId, report);
      }
    }
  }

  private emitCorrection(resourceId: string, report: any) {
    console.log(`[ReconciliationEngine] Emitting corrective action for ${resourceId} based on drift.`);
  }
}
