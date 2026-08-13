import { verifyJWT } from "@cerebro/auth/server";
import { prisma, TwinRepository, type TwinPersistenceClient } from "@cerebro/db";
import { IndustryModelProposalSchema } from "@cerebro/twin-contracts";
import {
  mapStoredTwinVersion,
  VersionProposalService,
  type StoredVersionProposal,
  type VersionProposalStore,
} from "../modules/twin-definition/version-proposal-service";
import { AuthenticatedRequestContext } from "./authenticated-request-context";

const repository = new TwinRepository(prisma as unknown as TwinPersistenceClient);

const store: VersionProposalStore = {
  async createProposal(input) {
    const record = await repository.createVersionProposal(input.scope, input.twinId, input.model);
    return {
      id: record.id,
      twinId: record.twinId,
      scope: { tenantId: record.tenantId, workspaceId: record.workspaceId },
      model: IndustryModelProposalSchema.parse(record.model),
      status: record.status as StoredVersionProposal["status"],
      createdAt: new Date(record.createdAt),
      ...(record.appliedAt ? { appliedAt: new Date(record.appliedAt) } : {}),
      ...(record.appliedVersion ? { appliedVersionId: record.appliedVersion.id } : {}),
    };
  },
  async applyProposal(input) {
    const record = await repository.applyVersionProposal(
      input.scope,
      input.twinId,
      input.proposalId,
    );
    return mapStoredTwinVersion(record);
  },
  async listVersions(input) {
    const records = await repository.listTwinVersions(input.scope, input.twinId);
    return records.map(mapStoredTwinVersion);
  },
};

export const versionProposalService = new VersionProposalService(store);

export const authenticatedRequestContext = new AuthenticatedRequestContext({
  verifyToken: verifyJWT,
  async authorizeWorkspace(input) {
    const [membership, workspace] = await Promise.all([
      prisma.tenantMember.findFirst({
        where: { tenantId: input.tenantId, userId: input.userId },
        include: { role: true },
      }),
      prisma.workspace.findFirst({ where: { id: input.workspaceId, tenantId: input.tenantId } }),
    ]);
    return { authorized: Boolean(membership && workspace), role: membership?.role.name ?? null };
  },
});
