import { OperationsService } from "../../application/services/OperationsService";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Internal server error";
}

export class OperationsController {
  private service: OperationsService;

  constructor() {
    this.service = new OperationsService();
  }

  async getDashboard(req: Request) {
    try {
      const url = new URL(req.url);
      const workspaceId = url.searchParams.get("workspaceId") || "default-workspace";
      const result = await this.service.getDashboard(workspaceId);
      return Response.json(result);
    } catch (error: unknown) {
      return Response.json({ error: errorMessage(error) }, { status: 500 });
    }
  }
}
