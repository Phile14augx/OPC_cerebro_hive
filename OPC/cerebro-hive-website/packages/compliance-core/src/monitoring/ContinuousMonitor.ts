import { AuditLedger } from '../ledger/AuditLedger';
import { EvidenceCollector, AuditEvidence } from '../evidence/EvidenceCollector';
import { ControlObjective } from '../frameworks/Framework';
import { ControlDeficiency } from '../controls/ControlDeficiency';

export class ContinuousMonitor {
  private deficiencies: ControlDeficiency[] = [];

  constructor(
    private ledger: AuditLedger,
    private evidenceCollector: EvidenceCollector,
    private objectives: ControlObjective[]
  ) {}

  /**
   * Subscribes to the Event Bus (simulated).
   */
  async consumeEvent(eventType: string, payload: unknown): Promise<void> {
    // 1. Record event in the immutable ledger
    await this.ledger.append('system', eventType, payload);

    // 2. Evaluate against Controls
    for (const obj of this.objectives) {
      for (const req of obj.requirements) {
        for (const evReq of req.evidenceRequirements) {
          
          // Does this event type satisfy an evidence requirement?
          if (evReq.sourceEventTypes.includes(eventType)) {
            const evidence = await this.evidenceCollector.collectEvidence(obj.id, eventType, payload);
            this.evaluateControlStatus(obj, evidence);
          }
        }
      }
    }
  }

  private evaluateControlStatus(obj: ControlObjective, newEvidence: AuditEvidence) {
    // Example Evaluation Logic
    // If we receive an 'AccessProvisioned' event WITHOUT a preceding 'AccessApproved' event, flag a deficiency.
    
    if (newEvidence.sourceEvent === 'AccessProvisioned') {
      const priorApprovals = this.evidenceCollector.getEvidenceForControl(obj.id)
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ARCH-LINT: Deferred
        .filter(e => e.sourceEvent === 'AccessApproved' && (e.payload as any).requestId === (newEvidence.payload as any).requestId);

      if (priorApprovals.length === 0) {
        // Deficiency detected!
        obj.status = 'PartiallySatisfied';
        
        const deficiency: ControlDeficiency = {
          id: `def-${Date.now()}`,
          controlObjectiveId: obj.id,
          severity: 'High',
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ARCH-LINT: Deferred
          description: `Access provisioned for request ${(newEvidence.payload as any).requestId} without matching approval evidence.`,
          detectedAt: new Date(),
          relatedEvidenceIds: [newEvidence.evidenceId],
          recommendedRemediation: 'Review provisioning automation and ensure ApprovalEngine constraints are enforced.',
          status: 'Open'
        };

        this.deficiencies.push(deficiency);
        console.log(`[ContinuousMonitor] 🚨 Control Deficiency Detected on ${obj.id}: ${deficiency.description}`);
      } else {
        obj.status = 'Satisfied';
        console.log(`[ContinuousMonitor] ✅ Control ${obj.id} Satisfied.`);
      }
    }
  }

  getDeficiencies(): ControlDeficiency[] {
    return this.deficiencies;
  }
}
