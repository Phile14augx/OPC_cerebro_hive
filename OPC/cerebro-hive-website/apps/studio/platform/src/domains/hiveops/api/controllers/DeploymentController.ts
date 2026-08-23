import { DeploymentService } from "../../application/services/DeploymentService";
import { DeployModelCommand } from "../../application/commands/DeployModelCommand";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Internal server error";
}

export class DeploymentController {
  private service: DeploymentService;

  constructor() {
    this.service = new DeploymentService();
  }

  async deployModel(req: Request) {
    try {
      const body = await req.json() as { workspaceId: string; modelName: string; version: string; framework: string; clusterId: string };
      const command: DeployModelCommand = {
        workspaceId: body.workspaceId,
        modelName: body.modelName,
        version: body.version,
        framework: body.framework,
        clusterId: body.clusterId,
      };
      
      const result = await this.service.deployModel(command);
      return Response.json(result, { status: 201 });
    } catch (error: unknown) {
      return Response.json({ error: errorMessage(error) }, { status: 500 });
    }
  }
}
