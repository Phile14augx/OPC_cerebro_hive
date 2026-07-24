import { LifecycleStatus } from './Lifecycle';
import { Ownership } from './Ownership';
import { CloudMetadata } from './CloudMetadata';
import { Tags } from './Tags';

export interface ConfigurationItem {
  ciId: string;
  externalId?: string;
  name: string;
  displayName?: string;
  type: string; // e.g., 'Application', 'Database', 'BusinessService'
  subType?: string;
  environment?: string;
  businessCriticality?: 'MissionCritical' | 'BusinessCritical' | 'Important' | 'Standard' | 'Low';
  lifecycleStatus: LifecycleStatus;
  
  ownership?: Ownership;
  
  tags?: Tags;
  labels?: string[];
  
  version?: string;
  
  createdAt: Date;
  updatedAt: Date;
  
  cloudMetadata?: CloudMetadata;
  customAttributes?: Record<string, any>; // For extensible attributes
}
