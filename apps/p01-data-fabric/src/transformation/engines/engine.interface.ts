export interface ITransformationEngine {
  executeJob(jobName: string, parameters: any): Promise<void>;
  getStatus(jobId: string): Promise<string>;
}