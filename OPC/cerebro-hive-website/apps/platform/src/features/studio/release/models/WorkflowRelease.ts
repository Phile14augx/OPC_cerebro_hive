
import { WorkflowVersion } from '../../lifecycle/WorkflowVersion';

export type Environment = 'Dev' | 'QA' | 'UAT' | 'Production';

export type DeliveryStrategyType = 'Standard' | 'Canary' | 'BlueGreen' | 'Shadow';

export interface DeliveryStrategy {
  type: DeliveryStrategyType;
  trafficPercentage?: number;
}

export interface DeploymentDescriptor {
  gatewayEndpoint: string;
  strategy: DeliveryStrategy;
}

export interface WorkflowRelease {
  releaseId: string;
  environment: Environment;
  status: 'PendingApproval' | 'Deploying' | 'Active' | 'Superseded' | 'Failed';
  
  version: WorkflowVersion; // The Immutable payload
  
  deploymentTarget: DeploymentDescriptor;
  releaseNotes: string; // Layered markdown
  promotedFromReleaseId?: string; 
  deployedAt?: string;
}
