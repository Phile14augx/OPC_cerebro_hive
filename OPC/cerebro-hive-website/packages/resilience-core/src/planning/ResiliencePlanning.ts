export type PlanType = 'BusinessContinuityPlan' | 'DisasterRecoveryPlan' | 'CrisisCommunicationPlan';

export interface ResiliencePlan {
  planId: string;
  serviceId: string;
  type: PlanType;
  
  recoveryStrategy: string;
  roles: string[];
  communicationProtocol: string;
  recoverySteps: string[];
  
  version: string;
  approvedBy: string;
}

export type ExerciseType = 'Tabletop' | 'FailoverDrill' | 'RecoveryValidation';

export interface ExerciseFinding {
  description: string;
  recommendation: string;
  generatedRiskId?: string; // Reference to Phase 10.5 Enterprise Risk
}

export interface ResilienceExercise {
  exerciseId: string;
  planId: string;
  type: ExerciseType;
  
  conductedAt: Date;
  success: boolean;
  
  findings: ExerciseFinding[];
}

export class ResiliencePlanner {
  private plans = new Map<string, ResiliencePlan>();
  private exercises = new Map<string, ResilienceExercise>();

  registerPlan(plan: ResiliencePlan) {
    this.plans.set(plan.planId, plan);
  }

  recordExercise(exercise: ResilienceExercise) {
    this.exercises.set(exercise.exerciseId, exercise);
    
    // Process findings
    for (const finding of exercise.findings) {
      if (!exercise.success) {
        console.log(`[ResiliencePlanner] 📉 Exercise ${exercise.exerciseId} failed. Finding: ${finding.description}`);
        if (finding.generatedRiskId) {
          console.log(`[EventBus] 📡 Emitting RiskEscalationEvent for new risk: ${finding.generatedRiskId}`);
        }
      }
    }
  }
}
