
import { WorkflowRelease } from '../models/WorkflowRelease';
import { PromotionService } from './PromotionService';
import { DeploymentService } from './DeploymentService';

export class RollbackService {
  // Rollback is fundamentally an Append-Only Promotion of an older release!
  static async rollback(badRelease: WorkflowRelease, targetHistoricalRelease: WorkflowRelease): Promise<WorkflowRelease> {
    console.log(`[RollbackService] Initiating promotion-based rollback from ${badRelease.releaseId} to ${targetHistoricalRelease.releaseId}`);
    
    // Promote the historical version into the current environment as a brand new release
    const rollbackRelease = await PromotionService.promote(
      targetHistoricalRelease.version, 
      badRelease.environment, 
      { type: 'Standard' }, 
      badRelease.releaseId
    );

    // Deploy the rollback release immediately
    await DeploymentService.deploy(rollbackRelease);
    
    badRelease.status = 'Superseded';
    return rollbackRelease;
  }
}
