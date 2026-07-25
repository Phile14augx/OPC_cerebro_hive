import { ExecutionContext } from '../context/ExecutionContext';

export interface GovernanceContextSnapshot {
  // Immutable timestamp at the start of evaluation
  evaluationTime: Date;
  
  // Basic temporal facts
  isWeekend: boolean;
  hourOfDay: number;

  // Tenant / Environment context
  tenantId: string;
  workspaceId: string;
  
  // (In a full enterprise system, this snapshot would include 
  // cached security posture, budget availability, resource inventory, etc.)
}

export class GovernanceContextBuilder {
  public static build(context: ExecutionContext): GovernanceContextSnapshot {
    const now = new Date();
    const day = now.getDay();
    
    return {
      evaluationTime: now,
      isWeekend: day === 0 || day === 6,
      hourOfDay: now.getHours(),
      tenantId: context.tenantId,
      workspaceId: context.workspaceId,
    };
  }
}
