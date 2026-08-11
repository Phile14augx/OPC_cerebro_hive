export type DsrType = 'Access' | 'Erasure' | 'Rectification' | 'Portability';
export type DsrState = 'Submitted' | 'IdentityVerification' | 'Accepted' | 'Processing' | 'WaitingOnSystems' | 'Completed' | 'Closed' | 'Rejected' | 'Cancelled' | 'Reopened';

export interface DataSubjectRequest {
  id: string;
  principalId: string;
  type: DsrType;
  state: DsrState;
  
  details: string;
  
  pendingSystems: string[]; // Systems that must acknowledge the request before it can complete
  completedSystems: string[];
  
  submittedAt: Date;
  updatedAt: Date;
  dueDate: Date; // SLA tracking (e.g. 30 days)
}

export class DsrManager {
  private requests = new Map<string, DataSubjectRequest>();

  submitRequest(principalId: string, type: DsrType, details: string, targetedSystems: string[]): DataSubjectRequest {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // Standard 30 day SLA

    const dsr: DataSubjectRequest = {
      id: `dsr-${Date.now()}`,
      principalId,
      type,
      state: 'Submitted',
      details,
      pendingSystems: [...targetedSystems],
      completedSystems: [],
      submittedAt: new Date(),
      updatedAt: new Date(),
      dueDate
    };

    this.requests.set(dsr.id, dsr);
    console.log(`[DsrManager] 📥 Received ${type} request for ${principalId} (Due: ${dueDate.toISOString().split('T')[0]})`);
    return dsr;
  }

  getRequest(id: string): DataSubjectRequest | undefined {
    return this.requests.get(id);
  }

  transitionState(id: string, newState: DsrState): void {
    const dsr = this.requests.get(id);
    if (!dsr) throw new Error('DSR not found');
    
    // In a real system, we'd enforce a valid state machine map here.
    dsr.state = newState;
    dsr.updatedAt = new Date();
    
    console.log(`[DsrManager] 🔄 DSR ${id} transitioned to ${newState}`);
    
    if (newState === 'Processing') {
      console.log(`[EventBus] 📡 Emitting DsrErasureRequested event to targeted systems: ${dsr.pendingSystems.join(', ')}`);
      this.transitionState(id, 'WaitingOnSystems');
    }
  }

  acknowledgeSystemCompletion(id: string, systemName: string): void {
    const dsr = this.requests.get(id);
    if (!dsr) throw new Error('DSR not found');

    if (dsr.pendingSystems.includes(systemName)) {
      dsr.pendingSystems = dsr.pendingSystems.filter(s => s !== systemName);
      dsr.completedSystems.push(systemName);
      console.log(`[DsrManager] ✅ System '${systemName}' acknowledged completion for DSR ${id}`);
    }

    // Check if all systems are done
    if (dsr.pendingSystems.length === 0 && dsr.state === 'WaitingOnSystems') {
      console.log(`[DsrManager] 🎉 All systems have fulfilled DSR ${id}. Automatically completing.`);
      this.transitionState(id, 'Completed');
    }
  }
}
