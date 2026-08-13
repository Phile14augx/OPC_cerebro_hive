import type {
  ApplyVersionProposalCommand,
  CreateScenarioCommand,
  CreateTwinCommand,
  CreateVersionProposalCommand,
  RejectVersionProposalCommand,
  Scope,
  UpdateEntityStateCommand,
} from '@cerebro/twin-contracts';

export interface TwinRepositoryPort {
  list(scope: Scope): Promise<unknown[]>;
  getById(scope: Scope, id: string): Promise<unknown | null>;
  create(command: CreateTwinCommand): Promise<unknown>;
  appendState(command: UpdateEntityStateCommand): Promise<unknown>;
  createProposal(command: CreateVersionProposalCommand): Promise<unknown>;
  applyProposal(command: ApplyVersionProposalCommand): Promise<unknown>;
  rejectProposal(command: RejectVersionProposalCommand): Promise<unknown>;
  createScenario(command: CreateScenarioCommand): Promise<unknown>;
}
