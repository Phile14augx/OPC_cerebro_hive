import { ChangeRequest } from '../domain/ChangeRequest';
import { RiskAssessment } from '../integrations/RiskProvider';

export interface IAIRiskAdvisor {
  predictFailureProbability(change: ChangeRequest): Promise<number>;
  recommendMitigations(change: ChangeRequest): Promise<string[]>;
}

export interface IAIImpactSummarizer {
  generateImpactSummary(change: ChangeRequest, dependencies: any[]): Promise<string>;
}

export interface IAICabAssistant {
  summarizeForCAB(change: ChangeRequest, risk: RiskAssessment): Promise<string>;
  recommendDecision(change: ChangeRequest): Promise<'Approve' | 'Reject' | 'MoreInfo'>;
}

export interface IAIRollbackPlanner {
  generateRollbackPlan(implementationPlan: string, affectedCIs: string[]): Promise<string>;
}

export interface IAIImplementationReviewer {
  reviewImplementationPlan(plan: string): Promise<string[]>; // Returns list of potential issues
}

export interface IAIChangeCommunicator {
  generateCommunicationDraft(change: ChangeRequest): Promise<string>;
}
