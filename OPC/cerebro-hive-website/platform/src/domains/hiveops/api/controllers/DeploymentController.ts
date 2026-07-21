import { DeploymentService } from "../../application/services/DeploymentService.js";
import { DeployModelCommand } from "../../application/commands/DeployModelCommand.js";

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
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  }
}
