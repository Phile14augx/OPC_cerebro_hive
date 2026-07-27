
import { WorkflowVersion } from '../../lifecycle/WorkflowVersion';
import { Environment } from '../models/WorkflowRelease';

export class PolicyAdapter {
  // Delegates to Open Policy Agent (OPA)
  static async evaluatePromotion(version: WorkflowVersion, targetEnv: Environment): Promise<{ allowed: boolean; requiredRoles: string[] }> {
    // MOCK: Require Security + Architect for Production
    if (targetEnv === 'Production') {
      return { allowed: false, requiredRoles: ['Security', 'Architect'] };
    }
    return { allowed: true, requiredRoles: [] };
  }
}
