export type DispositionReviewPolicy = 'Automatic' | 'SingleApproval' | 'DualApproval' | 'Blocked';

export interface RetentionSchedule {
  id: string;
  name: string;
  description: string;
  durationYears: number;
  triggerEvent: 'CreationDate' | 'LastModifiedDate' | 'EventDriven';
  dispositionPolicy: DispositionReviewPolicy;
}

export type RecordLifecycleState = 'Created' | 'Active' | 'Retention' | 'EligibleForDisposition' | 'DispositionReview' | 'Destroyed' | 'Archived';

export interface ManagedRecord {
  id: string;
  datasetId: string;
  scheduleId: string;
  
  state: RecordLifecycleState;
  
  // Temporal Tracking
  createdAt: Date;
  triggerDate?: Date;
  retentionEndDate?: Date;
  
  // Hold Context
  activeHolds: string[];
}

export class RecordLifecycleEngine {
  private records = new Map<string, ManagedRecord>();
  private schedules = new Map<string, RetentionSchedule>();

  registerSchedule(schedule: RetentionSchedule) {
    this.schedules.set(schedule.id, schedule);
  }

  getSchedule(id: string): RetentionSchedule | undefined {
    return this.schedules.get(id);
  }

  registerRecord(record: ManagedRecord) {
    this.records.set(record.id, record);
  }

  getRecord(id: string): ManagedRecord | undefined {
    return this.records.get(id);
  }

  evaluateLifecycle(recordId: string) {
    const record = this.records.get(recordId);
    if (!record) return;

    if (record.state === 'Destroyed' || record.state === 'Archived') return;

    // 1. Legal Hold pauses progression entirely
    if (record.activeHolds.length > 0) {
      console.log(`[LifecycleEngine] ⏸️ Record ${recordId} is on Legal Hold. Lifecycle evaluation paused.`);
      return;
    }

    // 2. Evaluate Retention Expiry
    if (record.retentionEndDate && record.retentionEndDate <= new Date()) {
      if (record.state === 'Retention' || record.state === 'Active') {
        record.state = 'EligibleForDisposition';
        console.log(`[LifecycleEngine] ⏳ Record ${recordId} reached end of retention. State -> EligibleForDisposition`);
      }
    }
  }

  applyHold(recordId: string, holdId: string) {
    const record = this.records.get(recordId);
    if (record && !record.activeHolds.includes(holdId)) {
      record.activeHolds.push(holdId);
      console.log(`[LifecycleEngine] 🔒 Applied Hold ${holdId} to Record ${recordId}`);
    }
  }

  releaseHold(recordId: string, holdId: string) {
    const record = this.records.get(recordId);
    if (record) {
      record.activeHolds = record.activeHolds.filter(h => h !== holdId);
      console.log(`[LifecycleEngine] 🔓 Released Hold ${holdId} from Record ${recordId}`);
      if (record.activeHolds.length === 0) {
        console.log(`[LifecycleEngine] ♻️ All holds released for Record ${recordId}. Resuming lifecycle evaluation.`);
        this.evaluateLifecycle(recordId);
      }
    }
  }
}
