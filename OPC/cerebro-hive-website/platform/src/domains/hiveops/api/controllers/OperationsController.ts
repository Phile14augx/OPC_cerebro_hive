import { OperationsService } from "../../application/services/OperationsService.js";

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
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  }
}
