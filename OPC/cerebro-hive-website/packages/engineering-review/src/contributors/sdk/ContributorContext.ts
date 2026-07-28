
export type ContributorState = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'TIMED_OUT' | 'CANCELLED' | 'SKIPPED';

export interface ContributorContext {
  readonly snapshotId: string;
  readonly semanticChangeset: any;
  readonly policyVersion: string;
  readonly reviewConfiguration: any;
  readonly cancellationToken: any;
  readonly logger: any;
}

export interface IReviewContributor {
  readonly id: string;
  readonly version: string;
  execute(context: ContributorContext): Promise<any>;
}
