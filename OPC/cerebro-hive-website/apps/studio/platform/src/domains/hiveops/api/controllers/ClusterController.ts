import { ClusterService } from "../../application/services/ClusterService";
import { CreateClusterCommand } from "../../application/commands/CreateClusterCommand";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Internal server error";
}

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
    } catch (error: unknown) {
      return Response.json({ error: errorMessage(error) }, { status: 500 });
    }
  }
}
