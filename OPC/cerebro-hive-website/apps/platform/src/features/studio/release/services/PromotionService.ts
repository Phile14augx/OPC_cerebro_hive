
import { WorkflowRelease, Environment, DeliveryStrategy } from '../models/WorkflowRelease';
import { WorkflowVersion } from '../../lifecycle/WorkflowVersion';
import { PolicyAdapter } from './PolicyAdapter';
import { ReleaseNotesService } from './ReleaseNotesService';

export class PromotionService {
  
  static async promote(version: WorkflowVersion, targetEnv: Environment, strategy: DeliveryStrategy, parentReleaseId?: string): Promise<WorkflowRelease> {
    
    // 1. Delegate Approval Enforcement to OPA Policy Engine
    const policyResult = await PolicyAdapter.evaluatePromotion(version, targetEnv);
    if (!policyResult.allowed) {
        throw new Error(`Promotion blocked by policy. Required approvals: ${policyResult.requiredRoles.join(', ')}`);
    }

    // 2. Generate Layered Release Notes
    const releaseNotes = ReleaseNotesService.generateLayeredNotes(version);

    // 3. Create the mutable Release envelope
    const release: WorkflowRelease = {
      releaseId: crypto.randomUUID(),
      environment: targetEnv,
      status: 'PendingApproval',
      version,
      deploymentTarget: {
        gatewayEndpoint: `/api/v1/deploy/${targetEnv.toLowerCase()}`,
        strategy
      },
      releaseNotes,
      promotedFromReleaseId: parentReleaseId
    };

    return release;
  }
}
