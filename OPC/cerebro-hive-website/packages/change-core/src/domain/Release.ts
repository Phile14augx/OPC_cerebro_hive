export enum ReleaseState {
  Planned = 'Planned',
  Active = 'Active',
  Completed = 'Completed',
  Aborted = 'Aborted'
}

export interface Release {
  releaseId: string;
  name: string; // e.g., 'Release 24.08'
  description: string;
  state: ReleaseState;
  
  changeRequestIds: string[]; // 1 Release -> Many Changes
  
  scheduledStart: Date;
  scheduledEnd: Date;
  
  releaseManagerId: string;
}
