import { ClusterController } from "@/platform/src/domains/hiveops/api/controllers/ClusterController";

const controller = new ClusterController();

export async function POST(req: Request) {
  return controller.createCluster(req);
}
