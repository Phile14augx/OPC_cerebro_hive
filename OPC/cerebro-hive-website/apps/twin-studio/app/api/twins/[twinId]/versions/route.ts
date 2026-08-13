import { NextRequest } from "next/server";
import {
  authenticatedRequestContext,
  versionProposalService,
} from "../../../../../lib/twin-runtime";
import { createVersionRouteController } from "../../../../../modules/twin-definition/version-route-controller";

const controller = createVersionRouteController({
  resolveScope: (request, access) => authenticatedRequestContext.resolve(request, access),
  service: versionProposalService,
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ twinId: string }> },
) {
  return controller.GET(request, (await params).twinId);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ twinId: string }> },
) {
  return controller.POST(request, (await params).twinId);
}
