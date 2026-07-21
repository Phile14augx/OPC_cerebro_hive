import { ClusterService } from "../../application/services/ClusterService";
import { CreateClusterCommand } from "../../application/commands/CreateClusterCommand";

export class ClusterController {
  private service: ClusterService;

  constructor() {
    this.service = new ClusterService();
  }

  async createCluster(req: Request) {
    try {
      const body = await req.json();
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
