export const REASON_CODES = [
  'CONTROL_PARSE_INVALID', 'CONTROL_SCHEMA_INVALID', 'CONTROL_CHANGED', 'CAS_CONFLICT',
  'HISTORICAL_EPOCH_MUTATION', 'EPOCH_NOT_MONOTONIC', 'EPOCH_SUPERSESSION_MISMATCH',
  'EPOCH_ROLLBACK_ATTEMPT', 'OWNER_MISSING', 'MULTIPLE_WRITERS', 'BUILDER_VERIFIER_COLLISION',
  'SCOPE_MISSING', 'SCOPE_OVERLAP', 'DIRTY_UNRECONCILED', 'EXTERNAL_MUTATION_DETECTED',
  'HEAD_CHANGED', 'GIT_LOCK_ACTIVE', 'GIT_LOCK_UNVERIFIABLE', 'HANDOFF_PENDING', 'HANDOFF_EXPIRED',
  'DEPENDENCY_UNBOUND', 'SHARED_INFRA_UNOWNED', 'LEASE_MISSING', 'LEASE_CORRUPT', 'LEASE_EXPIRED',
  'FENCING_TOKEN_STALE', 'REMOTE_COMMIT_ABSENT', 'REMOTE_REPOSITORY_MISMATCH',
  'REMOTE_REF_UNAPPROVED', 'REMOTE_ATTESTATION_STALE', 'REQUIRED_CHECK_POLICY_MISSING',
  'REQUIRED_CHECK_MISSING', 'MACHINE_GREEN_FALSE', 'PATH_IDENTITY_INVALID', 'PATH_SCOPE_ESCAPE',
  'SECRET_REDACTION_FAILED', 'NONDETERMINISTIC_OUTPUT', 'INVALID_TTL', 'CLOCK_ROLLBACK'
] as const;

export type ReasonCode = typeof REASON_CODES[number];
export type Severity = 'INFO' | 'WARNING' | 'BLOCKING' | 'FATAL';
export type DataClass = 'VERSIONED_CONTROL_SOURCE' | 'DETERMINISTIC_EVIDENCE' | 'VOLATILE_COORDINATION';

export interface Finding { code: ReasonCode; severity: Severity; message: string; evidenceRefs: string[]; }
export interface ValidationResult<T> { valid: boolean; value?: T; findings: Finding[]; }
export interface AuthoritySnapshot { epoch: number; controlSha256: string; controlPath: string; }
export interface RunManifest {
  schema_version: string;
  control_plane_version: string;
  validator_version: string;
  source_commit: string;
  run_id: string;
  execution_id: string;
  actor_id: string;
  access_mode: string;
  live_control_path: string;
  live_control_sha256: string;
  live_epoch: number;
  parser_version: string;
  repository_id: string;
  object_ids: string[];
  tree_ids: string[];
  refs: string[];
  registry_digests: string[];
  gate_results: string[];
  reason_codes: string[];
  planned_mutations: unknown[];
  publication_target: string;
  redaction_result: string;
}
export interface EpochProposal { proposed_epoch: number; supersedes_epoch: number; previous_control_sha256: string; }
export interface PublicationReceipt { previous_epoch: number; proposed_epoch: number; published_epoch: number; previous_receipt_digest: string; receipt_digest: string; }
