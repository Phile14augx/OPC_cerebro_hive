import { RiskCategory } from '../taxonomy/RiskTaxonomy';
import { NumericScore, ScoringEngine, RiskRating } from '../scoring/ScoringEngine';

export type RiskTreatmentType = 'Mitigate' | 'Accept' | 'Transfer' | 'Avoid';

export interface RiskTreatmentPlan {
  treatmentType: RiskTreatmentType;
  targetResidualScore: NumericScore;
  targetCompletionDate: Date;
  treatmentOwner: string;
  progress: number; // 0-100%
}

export interface EnterpriseRisk {
  riskId: string;
  title: string;
  description: string;
  category: RiskCategory;
  owner: string;
  
  affectedAssets: string[];
  linkedControls: string[];
  linkedPolicies: string[];
  linkedVendors: string[];
  linkedExceptions: string[];
  
  // Relationships
  dependsOn: string[];
  causes: string[];

  inherentRisk: NumericScore;
  residualRisk: NumericScore;
  
  treatment?: RiskTreatmentPlan;
  status: 'Open' | 'Closed' | 'Monitoring';
}

export class RiskRegister {
  private risks = new Map<string, EnterpriseRisk>();

  constructor(private scoringEngine: ScoringEngine) {}

  registerRisk(risk: EnterpriseRisk) {
    this.risks.set(risk.riskId, risk);
    console.log(`[RiskRegister] ⚠️ Registered Risk: ${risk.title} (Inherent: ${this.scoringEngine.getRating(risk.inherentRisk)})`);
  }

  getRisk(riskId: string): EnterpriseRisk | undefined {
    return this.risks.get(riskId);
  }

  updateResidualRisk(riskId: string, newScore: NumericScore) {
    const risk = this.risks.get(riskId);
    if (risk) {
      const oldRating = this.scoringEngine.getRating(risk.residualRisk);
      risk.residualRisk = newScore;
      const newRating = this.scoringEngine.getRating(newScore);
      console.log(`[RiskRegister] 🔄 Updated Residual Risk for '${risk.title}': ${oldRating} -> ${newRating} (${newScore.score})`);
    }
  }

  getRisksDependingOn(riskId: string): EnterpriseRisk[] {
    return Array.from(this.risks.values()).filter(r => r.dependsOn.includes(riskId));
  }
}
