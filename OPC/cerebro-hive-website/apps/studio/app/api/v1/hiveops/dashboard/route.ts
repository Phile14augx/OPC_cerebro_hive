import { OperationsController } from "@/platform/src/domains/hiveops/api/controllers/OperationsController";

const controller = new OperationsController();

export async function GET(req: Request) {
  return controller.getDashboard(req);
}
