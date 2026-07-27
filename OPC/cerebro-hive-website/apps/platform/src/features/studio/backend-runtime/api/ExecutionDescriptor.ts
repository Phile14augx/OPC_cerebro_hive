
export interface ExecutionDescriptor {
  workflowId: string;
  releaseId: string;
  deploymentStrategy: string;
  runtimeProfile: string;
  executionPolicy: string;
  artifactUri: string; // Points to the compiled RuntimeIR
}

export interface ReleaseResolver {
  resolve(tenantId: string, workflowId: string, environment: string): Promise<ExecutionDescriptor>;
}
