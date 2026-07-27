
import { WorkflowRelease } from '../models/WorkflowRelease';

export class DeploymentService {
  static async deploy(release: WorkflowRelease) {
    // We strictly delegate traffic and networking to the Gateway API (e.g. Spring Cloud Gateway)
    // by pushing the DeploymentDescriptor down to the infrastructure layer.
    
    console.log(`[DeploymentService] Instructing Gateway to route ${release.deploymentTarget.strategy.trafficPercentage || 100}% of traffic to ${release.releaseId} in ${release.environment}`);
    release.status = 'Active';
    release.deployedAt = new Date().toISOString();
  }
}
