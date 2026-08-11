import { DeploymentController } from "@/platform/src/domains/hiveops/api/controllers/DeploymentController";

const controller = new DeploymentController();

export async function POST(req: Request) {
  return controller.deployModel(req);
}
