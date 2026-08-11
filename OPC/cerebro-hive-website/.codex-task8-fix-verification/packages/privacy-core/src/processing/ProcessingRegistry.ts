import { LegalBasis } from '../consent/ConsentRegistry';

export interface ProcessingActivity {
  id: string;
  name: string;
  purpose: string;
  legalBasis: LegalBasis;
  
  datasetIds: string[]; // Datasets being processed
  
  controllerId: string;
  processorIds: string[]; // Third parties processing the data
  
  createdAt: Date;
  updatedAt: Date;
}

export class ProcessingRegistry {
  private activities = new Map<string, ProcessingActivity>();

  registerActivity(activity: ProcessingActivity) {
    this.activities.set(activity.id, activity);
  }

  getActivity(id: string): ProcessingActivity | undefined {
    return this.activities.get(id);
  }

  getActivitiesForPurpose(purpose: string): ProcessingActivity[] {
    return Array.from(this.activities.values()).filter(a => a.purpose === purpose);
  }
}
