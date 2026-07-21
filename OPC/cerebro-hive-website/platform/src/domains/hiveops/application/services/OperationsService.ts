import { GetDashboardQuery } from "../queries/GetDashboardQuery.js";
import { GetDashboardHandler } from "../handlers/GetDashboardHandler.js";

export class OperationsService {
  private getDashboardHandler: GetDashboardHandler;

  constructor() {
    this.getDashboardHandler = new GetDashboardHandler();
  }

  async getDashboard(workspaceId: string) {
    const query: GetDashboardQuery = { workspaceId };
    return this.getDashboardHandler.handle(query);
  }
}
