import { createHash } from 'crypto';
import { RetentionClass } from '../ledger/AuditLedger';

export interface AuditEvidence {
  evidenceId: string;
  controlId: string;
  sourceEvent: string;
  collectedAt: Date;
  checksum: string;
  classification: 'Confidential' | 'Internal' | 'Public';
  retentionPolicy: RetentionClass;
  storageLocation: string; // e.g. 's3://cerebro-audit/evidence/...'
  payload: unknown;
}

export class EvidenceCollector {
  private evidenceStore = new Map<string, AuditEvidence>();

  /**
   * Seals a platform event into a formal AuditEvidence artifact mapped to a control.
   */
  async collectEvidence(controlId: string, sourceEvent: string, payload: unknown): Promise<AuditEvidence> {
    const payloadStr = JSON.stringify(payload);
    const checksum = createHash('sha256').update(payloadStr).digest('hex');

    const evidence: AuditEvidence = {
      evidenceId: `evd-${Date.now()}`,
      controlId,
      sourceEvent,
      collectedAt: new Date(),
      checksum,
      classification: 'Confidential',
      retentionPolicy: 'Audit_7Years',
      storageLocation: `memory://${controlId}/${Date.now()}`,
      payload
    };

    this.evidenceStore.set(evidence.evidenceId, evidence);
    console.log(`[EvidenceCollector] 📁 Collected Evidence ${evidence.evidenceId} for Control ${controlId}`);
    return evidence;
  }

  getEvidenceForControl(controlId: string): AuditEvidence[] {
    return Array.from(this.evidenceStore.values()).filter(e => e.controlId === controlId);
  }
}
