import { VersionProposalCommandSchema, type Scope } from "@cerebro/twin-contracts";
import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse, validationErrorResponse } from "../../lib/api-error-response";
import type { AuthenticatedScope, RequestAccess } from "../../lib/authenticated-request-context";

type VersionService = {
  createProposal(scope: Scope, twinId: string, model: unknown): Promise<unknown>;
  applyProposal(
    scope: Scope,
    twinId: string,
    proposalId: string,
    approved: boolean,
  ): Promise<unknown>;
  listVersions(scope: Scope, twinId: string): Promise<unknown>;
};

type Dependencies = {
  resolveScope(request: NextRequest, access: RequestAccess): Promise<AuthenticatedScope>;
  service: VersionService;
};

function domainScope(scope: AuthenticatedScope): Scope {
  return { tenantId: scope.tenantId, workspaceId: scope.workspaceId };
}

export function createVersionRouteController(dependencies: Dependencies) {
  return {
    async GET(request: NextRequest, twinId: string) {
      try {
        const scope = domainScope(await dependencies.resolveScope(request, "READ"));
        return NextResponse.json({ data: await dependencies.service.listVersions(scope, twinId) });
      } catch (error) {
        return apiErrorResponse(error);
      }
    },

    async POST(request: NextRequest, twinId: string) {
      let input: unknown;
      try {
        input = await request.json();
      } catch {
        return validationErrorResponse("Request body must be valid JSON.");
      }

      const parsed = VersionProposalCommandSchema.safeParse(input);
      if (!parsed.success) return validationErrorResponse();

      try {
        const body = parsed.data;
        const scope = domainScope(await dependencies.resolveScope(request, "WRITE"));
        if (body.action === "APPLY") {
          return NextResponse.json({
            data: await dependencies.service.applyProposal(
              scope,
              twinId,
              body.proposalId,
              body.approved,
            ),
          });
        }
        return NextResponse.json(
          { data: await dependencies.service.createProposal(scope, twinId, body.model) },
          { status: 201 },
        );
      } catch (error) {
        return apiErrorResponse(error);
      }
    },
  };
}
