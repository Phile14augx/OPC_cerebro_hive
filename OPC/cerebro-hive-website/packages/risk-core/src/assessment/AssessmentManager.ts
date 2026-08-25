import { RiskRegister } from '../register/RiskRegister';
import { ScoringEngine } from '../scoring/ScoringEngine';

export interface ControlAssessment {
  assessmentId: string;
  controlId: string;
  riskId: string;
  
  designEffectiveness: 'Effective' | 'Ineffective' | 'NeedsImprovement';
  operatingEffectiveness: 'Effective' | 'Ineffective' | 'NeedsImprovement';
  
  assessor: string;
  assessedAt: Date;
}

export class AssessmentManager {
  private assessments = new Map<string, ControlAssessment[]>();

  constructor(private riskRegister: RiskRegister, private scoringEngine: ScoringEngine) {}

  recordAssessment(assessment: ControlAssessment) {
    const existing = this.assessments.get(assessment.riskId) || [];
    existing.push(assessment);
    this.assessments.set(assessment.riskId, existing);
    
    console.log(`[AssessmentManager] 📋 Recorded assessment for Control ${assessment.controlId}`);
    
    this.recalculateResidualRisk(assessment.riskId);
  }

  private recalculateResidualRisk(riskId: string) {
    const risk = this.riskRegister.getRisk(riskId);
    if (!risk) return;

    const assessments = this.assessments.get(riskId) || [];
    
    // Simplistic MVP logic: 
    // If all controls are Effective, mitigation is fully applied.
    // If any control is Ineffective, mitigation degrades (residual approaches inherent).
    
    let mitigationFactor = 0.5; // Base mitigation if controls pass
    let failedControls = 0;

    for (const a of assessments) {
      if (a.designEffectiveness === 'Ineffective' || a.operatingEffectiveness === 'Ineffective') {
        failedControls++;
      }
    }

    if (failedControls > 0) {
      // Degrade mitigation proportionally
      mitigationFactor = Math.max(0, mitigationFactor - (failedControls * 0.25));
    }

    const newResidual = this.scoringEngine.applyMitigation(risk.inherentRisk, mitigationFactor);
    this.riskRegister.updateResidualRisk(riskId, newResidual);
  }
}
