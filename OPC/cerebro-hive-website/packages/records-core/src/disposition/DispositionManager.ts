import { ManagedRecord, RecordLifecycleEngine, RetentionSchedule } from '../retention/RetentionEngine';
import { CertificateOfDestruction } from '../certificates/CertificateOfDestruction';

export class DispositionManager {
  private certificates = new Map<string, CertificateOfDestruction>();
  private pendingApprovals = new Map<string, Set<string>>(); // recordId -> set of approverIds

  constructor(private lifecycleEngine: RecordLifecycleEngine) {}

  requestDisposition(recordId: string) {
    const record = this.lifecycleEngine.getRecord(recordId);
    if (!record || record.state !== 'EligibleForDisposition') return;
    if (record.activeHolds.length > 0) return;

    const schedule = this.lifecycleEngine.getSchedule(record.scheduleId);
    if (!schedule) return;

    if (schedule.dispositionPolicy === 'Automatic') {
      console.log(`[DispositionManager] 🗑️ Automatically approving disposition for Record ${recordId}`);
      this.executeDisposition(record, schedule, []);
    } else if (schedule.dispositionPolicy === 'Blocked') {
      console.log(`[DispositionManager] 🛑 Disposition blocked by policy for Record ${recordId}`);
    } else {
      record.state = 'DispositionReview';
      this.pendingApprovals.set(recordId, new Set());
      console.log(`[DispositionManager] 📝 Record ${recordId} entered DispositionReview. Approvals required.`);
    }
  }

  approveDisposition(recordId: string, approverId: string) {
    const record = this.lifecycleEngine.getRecord(recordId);
    if (!record || record.state !== 'DispositionReview') return;

    const schedule = this.lifecycleEngine.getSchedule(record.scheduleId);
    if (!schedule) return;

    const approvals = this.pendingApprovals.get(recordId)!;
    approvals.add(approverId);
    console.log(`[DispositionManager] ✅ Approver ${approverId} approved disposition for Record ${recordId}`);

    const requiredCount = schedule.dispositionPolicy === 'SingleApproval' ? 1 : 2;
    if (approvals.size >= requiredCount) {
      console.log(`[DispositionManager] 🎉 Required approvals met for Record ${recordId}. Executing disposition.`);
      this.executeDisposition(record, schedule, Array.from(approvals));
    }
  }

  private executeDisposition(record: ManagedRecord, schedule: RetentionSchedule, approvers: string[]) {
    record.state = 'Destroyed';
    
    // Generate Certificate
    const certificate: CertificateOfDestruction = {
      certificateId: `cert-${Date.now()}`,
      recordId: record.id,
      scheduleId: schedule.id,
      approvers,
      destroyedAt: new Date(),
      deletionAcknowledgements: ['system-db', 'system-s3'], // Simulated
      ledgerEntryRef: `ledg-ref-${Date.now()}` // Simulated audit ledger reference
    };

    this.certificates.set(certificate.certificateId, certificate);
    console.log(`[DispositionManager] 📜 Generated Certificate of Destruction: ${certificate.certificateId}`);
  }

  getCertificateForRecord(recordId: string): CertificateOfDestruction | undefined {
    return Array.from(this.certificates.values()).find(c => c.recordId === recordId);
  }
}
