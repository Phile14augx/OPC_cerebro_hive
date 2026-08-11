import { RiskRegister } from '../register/RiskRegister';
import { ScoringEngine } from '../scoring/ScoringEngine';

export interface PolicyException {
  exceptionId: string;
  policyId: string;
  riskId: string; // The risk that increases by waiving this policy
  
  reason: string;
  approvedBy: string;
  
  grantedAt: Date;
  expiresAt: Date;
  
  status: 'Active' | 'Expired' | 'Revoked';
}

export class PolicyManager {
  private exceptions = new Map<string, PolicyException>();

  constructor(private riskRegister: RiskRegister, private scoringEngine: ScoringEngine) {}

  grantException(exception: PolicyException) {
    this.exceptions.set(exception.exceptionId, exception);
    console.log(`[PolicyManager] ⚠️ Exception ${exception.exceptionId} granted until ${exception.expiresAt.toISOString().split('T')[0]}`);
    
    // An active exception elevates the associated residual risk (a penalty)
    this.applyExceptionPenalty(exception.riskId);
  }

  evaluateExpirations() {
    const now = new Date();
    for (const exception of this.exceptions.values()) {
      if (exception.status === 'Active' && exception.expiresAt <= now) {
        exception.status = 'Expired';
        console.log(`[PolicyManager] ❌ Exception ${exception.exceptionId} has EXPIRED. Risk must be recalculated.`);
        
        // Remove the penalty
        this.recalculateRiskAfterExpiration(exception.riskId);
        
        // Emits 'PolicyExceptionExpired' and creates a reassessment task (simulated)
        console.log(`[EventBus] 📡 Emitted PolicyExceptionExpired for ${exception.exceptionId}`);
      }
    }
  }

  private applyExceptionPenalty(riskId: string) {
    const risk = this.riskRegister.getRisk(riskId);
    if (risk) {
      // Simplified: Exception increases likelihood
      const newScore = this.scoringEngine.applyPenalty(risk.residualRisk, 0.5);
      this.riskRegister.updateResidualRisk(riskId, newScore);
    }
  }

  private recalculateRiskAfterExpiration(riskId: string) {
    const risk = this.riskRegister.getRisk(riskId);
    if (risk) {
      // Return to baseline mitigated score (simplified)
      const newScore = this.scoringEngine.applyMitigation(risk.inherentRisk, 0.5);
      this.riskRegister.updateResidualRisk(riskId, newScore);
    }
  }

  getException(id: string): PolicyException | undefined {
    return this.exceptions.get(id);
  }
}
