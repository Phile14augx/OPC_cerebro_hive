export interface DeployModelCommand {
  workspaceId: string;
  modelName: string;
  version: string;
  framework: string;
  clusterId: string;
}
