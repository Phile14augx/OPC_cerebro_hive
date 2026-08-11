import { HealthContract, HealthStatus } from './Health';

export type RuntimeState = 
  | 'Registered'
  | 'Initializing'
  | 'Running'
  | 'Degraded'
  | 'Paused'
  | 'Stopping'
  | 'Stopped'
  | 'Disposed';

export interface RuntimeLifecycle extends HealthContract {
  status(): RuntimeState;
  
  initialize(): Promise<void>;
  start(): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  stop(): Promise<void>;
  dispose(): Promise<void>;
}
