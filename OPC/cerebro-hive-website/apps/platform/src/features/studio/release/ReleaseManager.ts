
import { PromotionService } from './services/PromotionService';
import { DeploymentService } from './services/DeploymentService';
import { RollbackService } from './services/RollbackService';

export class ReleaseManager {
  // Facade for the specialized bounded contexts
  public promotion = PromotionService;
  public deployment = DeploymentService;
  public rollback = RollbackService;
}
