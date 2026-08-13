import {
  IndustryModelProposalSchema,
  TwinDefinitionSchema,
  type IndustryModelProposal,
  type Scope,
  type TwinDefinition,
} from '@cerebro/twin-contracts';

export type StoredVersionProposal = {
  id: string;
  twinId: string;
  scope: Scope;
  model: IndustryModelProposal;
  status: 'PREVIEW' | 'APPLIED';
  createdAt: Date;
  appliedAt?: Date;
  appliedVersionId?: string;
};

export type AppliedTwinVersion = {
  id: string;
  twinId: string;
  versionNumber: number;
  status: 'PUBLISHED' | 'ARCHIVED';
  definition: TwinDefinition;
  sourceProposalId?: string;
  createdAt: Date;
};

export function mapStoredTwinVersion(record: {
  id: string;
  twinId: string;
  versionNumber: number;
  status: string;
  definition: unknown;
  sourceProposalId?: string | null;
  createdAt: Date | string;
}): AppliedTwinVersion {
  if (record.status !== 'PUBLISHED' && record.status !== 'ARCHIVED') {
    throw new Error(`INVALID_TWIN_VERSION_STATUS:${record.status}`);
  }
  return {
    id: record.id,
    twinId: record.twinId,
    versionNumber: record.versionNumber,
    status: record.status,
    definition: TwinDefinitionSchema.parse(record.definition),
    ...(record.sourceProposalId ? { sourceProposalId: record.sourceProposalId } : {}),
    createdAt: new Date(record.createdAt),
  };
}

export interface VersionProposalStore {
  createProposal(input: Omit<StoredVersionProposal, 'id' | 'status' | 'createdAt'>): Promise<StoredVersionProposal>;
  applyProposal(input: { scope: Scope; twinId: string; proposalId: string }): Promise<AppliedTwinVersion>;
  listVersions(input: { scope: Scope; twinId: string }): Promise<AppliedTwinVersion[]>;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

export class VersionProposalService {
  constructor(private readonly store: VersionProposalStore) {}

  async createProposal(scope: Scope, twinId: string, model: IndustryModelProposal) {
    const validated = IndustryModelProposalSchema.parse(model);
    const proposal = await this.store.createProposal({ scope: clone(scope), twinId, model: clone(validated) });
    return clone(proposal);
  }

  async applyProposal(scope: Scope, twinId: string, proposalId: string, approved: boolean) {
    if (!approved) throw new Error('APPROVAL_REQUIRED');
    return clone(await this.store.applyProposal({ scope: clone(scope), twinId, proposalId }));
  }

  async listVersions(scope: Scope, twinId: string) {
    return clone(await this.store.listVersions({ scope: clone(scope), twinId }));
  }
}
