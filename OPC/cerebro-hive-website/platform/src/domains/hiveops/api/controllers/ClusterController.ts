import { ClusterService } from "../../application/services/ClusterService.js";
import { CreateClusterCommand } from "../../application/commands/CreateClusterCommand.js";

export class ClusterController {
  private service: ClusterService;

  constructor() {
    this.service = new ClusterService();
  }

  async createCluster(req: Request) {
    try {
      const body = await req.json() as { workspaceId: string; name: string; region: string };
      const command: CreateClusterCommand = {
        workspaceId: body.workspaceId,
        name: body.name,
        region: body.region,
      };
      
      const result = await this.service.createCluster(command);
      return Response.json(result, { status: 201 });
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  }
}
