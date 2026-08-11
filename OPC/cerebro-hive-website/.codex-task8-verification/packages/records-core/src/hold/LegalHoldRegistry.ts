export type LegalHoldStatus = 'Draft' | 'Active' | 'PartiallyApplied' | 'Released';

export interface HoldScope {
  datasets?: string[];
  principals?: string[];
  domains?: string[];
  classifications?: string[];
}

export interface LegalHold {
  holdId: string;
  name: string;
  reason: string;
  authority: string;
  
  scope: HoldScope;
  
  start: Date;
  expectedEnd?: Date;
  status: LegalHoldStatus;
  
  affectedAssets: string[]; // Expanded dataset/record IDs
}

export interface PropagationStatus {
  systemName: string;
  status: 'Pending' | 'Applied' | 'Failed';
  lastUpdated: Date;
}

export class LegalHoldRegistry {
  private holds = new Map<string, LegalHold>();
  private propagationState = new Map<string, PropagationStatus[]>(); // holdId -> targets

  registerHold(hold: LegalHold, targetSystems: string[]) {
    this.holds.set(hold.holdId, hold);
    
    const statuses = targetSystems.map(system => ({
      systemName: system,
      status: 'Pending' as const,
      lastUpdated: new Date()
    }));
    
    this.propagationState.set(hold.holdId, statuses);
    this.evaluateHoldStatus(hold.holdId);

    // In a real system, this emits 'HoldApplied' events to the EventBus here.
    console.log(`[LegalHoldRegistry] ⚖️ Registered Legal Hold: ${hold.holdId}. Broadcasting to ${targetSystems.length} systems...`);
  }

  acknowledgePropagation(holdId: string, systemName: string, success: boolean) {
    const statuses = this.propagationState.get(holdId);
    if (!statuses) return;

    const target = statuses.find(s => s.systemName === systemName);
    if (target) {
      target.status = success ? 'Applied' : 'Failed';
      target.lastUpdated = new Date();
      console.log(`[LegalHoldRegistry] 📡 System '${systemName}' responded to Hold ${holdId}: ${target.status}`);
    }

    this.evaluateHoldStatus(holdId);
  }

  private evaluateHoldStatus(holdId: string) {
    const hold = this.holds.get(holdId);
    const statuses = this.propagationState.get(holdId);
    if (!hold || !statuses) return;

    const allApplied = statuses.every(s => s.status === 'Applied');
    const anyFailed = statuses.some(s => s.status === 'Failed');
    const anyPending = statuses.some(s => s.status === 'Pending');

    if (allApplied) {
      hold.status = 'Active';
    } else if (anyFailed || (anyPending && statuses.some(s => s.status === 'Applied'))) {
      hold.status = 'PartiallyApplied';
    } else {
      hold.status = 'Draft'; // Or Pending
    }
  }

  getHold(holdId: string): LegalHold | undefined {
    return this.holds.get(holdId);
  }

  releaseHold(holdId: string) {
    const hold = this.holds.get(holdId);
    if (hold) {
      hold.status = 'Released';
      console.log(`[LegalHoldRegistry] ⚖️ Released Legal Hold: ${holdId}`);
    }
  }
}
