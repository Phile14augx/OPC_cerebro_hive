/**
 * W3.05 Invariant Engine — Task 8 — AG-I8
 *
 * PURITY CONTRACT:
 *   No fs.*, path.* (import type only), Date.now(), Math.random(),
 *   crypto.randomBytes(), process.*, network calls, or mutable globals.
 *   Input: immutable ValidationContext. Output: deterministic Finding[].
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Invariant-level severity (distinct from general Severity in types.ts). */
export type InvariantSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM';

/** Stable reason codes used by invariant evaluators. */
export type InvariantReasonCode =
  | 'MULTIPLE_WRITERS'
  | 'BUILDER_VERIFIER_COLLISION'
  | 'PATH_SCOPE_ESCAPE'
  | 'SCOPE_OVERLAP'
  | 'SCOPE_MISSING'
  | 'SHARED_INFRA_UNOWNED'
  | 'DIRTY_UNRECONCILED'
  | 'HEAD_CHANGED'
  | 'EXTERNAL_MUTATION_DETECTED'
  | 'GIT_LOCK_ACTIVE'
  | 'GIT_LOCK_UNVERIFIABLE'
  | 'REMOTE_ATTESTATION_STALE'
  | 'HISTORICAL_EPOCH_MUTATION'
  | 'CONTROL_SCHEMA_INVALID'
  | 'CAS_CONFLICT'
  | 'CONTROL_PARSE_INVALID'
  | 'HANDOFF_PENDING'
  | 'HANDOFF_EXPIRED'
  | 'REMOTE_REPOSITORY_MISMATCH'
  | 'FENCING_TOKEN_STALE'
  | 'CONTROL_CHANGED'
  | 'NONDETERMINISTIC_OUTPUT'
  | 'SECRET_REDACTION_FAILED'
  | 'EPOCH_NOT_MONOTONIC'
  | 'EPOCH_SUPERSESSION_MISMATCH'
  | 'EPOCH_ROLLBACK_ATTEMPT'
  | 'LEASE_MISSING'
  | 'LEASE_EXPIRED';

/** A single invariant violation produced by an evaluator. */
export interface Finding {
  invariant_id: string;
  severity: InvariantSeverity;
  reason_code: InvariantReasonCode;
  message: string;
  evidence_refs: string[];
}

// ---------------------------------------------------------------------------
// Sub-types used inside ValidationContext
// ---------------------------------------------------------------------------

export interface AuthorityInfo {
  /** Current live epoch number. */
  epoch: number;
  /** The epoch this proposal claims to supersede. */
  supersedes_epoch: number;
  /** SHA-256 of the live control file this proposal depends on. */
  previous_control_sha256: string;
  /** All epoch numbers already published (immutable ledger). */
  published_epochs: number[];
}

export interface OwnershipInfo {
  /** Agent IDs with write access to this worktree. */
  worktree_owners: string[];
  /** The agent performing the build. */
  builder_id: string;
  /** The agent performing independent verification. */
  verifier_id: string;
}

export interface DirtyStateInfo {
  /** staged path -> reconciliation status ('RECONCILED' | 'UNRESOLVED' | ...) */
  staged: Record<string, string>;
  unstaged: Record<string, string>;
  untracked: Record<string, string>;
}

export interface LeaseInfo {
  /** Fencing token on the current lease. */
  fencing_token: number;
  owner: string;
  /** ISO-8601 expiry timestamp. */
  expiry: string;
  /** Current time (injected by caller, never Date.now()). */
  current_time: string;
  /** Fencing token presented by the requesting agent. */
  presented_fencing_token: number;
}

export interface GitLockInfo {
  path: string;
  /** false => GIT_LOCK_UNVERIFIABLE */
  verifiable: boolean;
}

export interface AttestationInfo {
  attested_commit_sha: string;
  attested_repository: string;
  all_required_checks_passed: boolean;
  approved_ref_reachable: boolean;
  /** ISO-8601 evidence capture time. */
  evidence_captured_at: string;
  /** ISO-8601 freshness deadline; evidence captured before this is stale. */
  freshness_deadline: string;
}

export interface SharedInfraResource {
  resource_id: string;
  owner: string | null;
  has_active_lease: boolean;
}

export interface HandoffInfo {
  status: 'HANDOFF_PENDING' | 'HANDOFF_EXPIRED' | 'HANDOFF_COMPLETE' | 'HANDOFF_ACKNOWLEDGED';
  to_agent: string;
  expiry: string;
  current_time: string;
}

export interface ScopeInfo {
  allowed_paths: string[];
  touched_paths: string[];
  recovery_paths: string[];
  product_paths: string[];
  scope_declared: boolean;
}

// ---------------------------------------------------------------------------
// ValidationContext — the single immutable input
// ---------------------------------------------------------------------------

export interface ValidationContext {
  authority: AuthorityInfo;
  ownership: OwnershipInfo;
  /** Role of the builder for cross-lane checks. */
  builder_role: 'PRODUCT_BUILDER' | 'RECOVERY_BUILDER' | 'OTHER';
  dirty_state: DirtyStateInfo;
  /** Active lease, or null when no lease exists. */
  lease: LeaseInfo | null;
  head_sha: string;
  expected_head_sha: string;
  filesystem_fingerprint: string;
  expected_fingerprint: string;
  git_locks: GitLockInfo[];
  attestation: AttestationInfo | null;
  /** True when the recovery contract mandates exact-SHA remote CI attestation. */
  attestation_required: boolean;
  proposal_epoch: number;
  shared_infra_resources: SharedInfraResource[];
  handoff: HandoffInfo | null;
  scope: ScopeInfo;
  /** Snapshot of historical epoch records (epoch_number, sha256). */
  historical_epochs: Array<{ epoch_number: number; sha256: string }>;
  /** SHA-256 of historical epochs at capture time, for mutation detection. */
  historical_epoch_sha256_at_capture: Record<number, string>;
  /** True when this is a proposal-generation (unpublished) context. */
  is_proposal_context: boolean;
  /** True when this is a CAS publication context. */
  is_publication_context: boolean;
  /** Expected live SHA-256 at CAS initiation. */
  expected_live_sha256: string;
  /** Actual current live SHA-256 at CAS validation time. */
  actual_live_sha256: string;
  /** True when live YAML was parsed without errors. */
  live_yaml_valid: boolean;
  /** True when run manifest authority snapshot matches live epoch/hash. */
  manifest_authority_coherent: boolean;
  /** True when same inputs yield byte-identical output. */
  output_is_deterministic: boolean;
  /** True when all secrets are redacted before evidence persistence. */
  secrets_redacted: boolean;
  /** True when this is a resume/retry context. */
  is_resume_or_retry: boolean;
  /** True when resume/retry re-validated all required state. */
  resume_revalidated: boolean;
  /** True when this is a post-abort state-check context. */
  is_post_abort: boolean;
  /** True when live/worktree state is proven unchanged after abort. */
  state_unchanged_after_abort: boolean;
  /** True when publication evidence is complete (not partial/expired/stale). */
  publication_evidence_complete: boolean;
}

// ---------------------------------------------------------------------------
// Helper: construct a Finding
// ---------------------------------------------------------------------------

function finding(
  invariant_id: string,
  severity: InvariantSeverity,
  reason_code: InvariantReasonCode,
  message: string,
  evidence_refs: string[],
): Finding {
  return { invariant_id, severity, reason_code, message, evidence_refs };
}

// ---------------------------------------------------------------------------
// INV-001: One writable worktree has exactly one active write owner.
// ---------------------------------------------------------------------------

function evalINV001(ctx: ValidationContext): Finding | null {
  if (ctx.ownership.worktree_owners.length !== 1) {
    return finding(
      'INV-001',
      'CRITICAL',
      'MULTIPLE_WRITERS',
      `Expected exactly 1 active write owner; found ${ctx.ownership.worktree_owners.length}.`,
      [`worktree_owners:${ctx.ownership.worktree_owners.join(',')}`],
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// INV-002: Builder and verifier identities differ.
// ---------------------------------------------------------------------------

function evalINV002(ctx: ValidationContext): Finding | null {
  if (ctx.ownership.builder_id === ctx.ownership.verifier_id) {
    return finding(
      'INV-002',
      'CRITICAL',
      'BUILDER_VERIFIER_COLLISION',
      `Builder and verifier must have distinct identities; both are '${ctx.ownership.builder_id}'.`,
      [
        `builder_id:${ctx.ownership.builder_id}`,
        `verifier_id:${ctx.ownership.verifier_id}`,
      ],
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// INV-003: A builder cannot mutate outside its exact filesystem contract.
// ---------------------------------------------------------------------------

function evalINV003(ctx: ValidationContext): Finding | null {
  if (!ctx.scope.scope_declared) {
    return finding(
      'INV-003',
      'CRITICAL',
      'SCOPE_MISSING',
      'Builder filesystem scope is not declared.',
      ['scope.scope_declared:false'],
    );
  }
  const escaped = ctx.scope.touched_paths.filter(
    (p) =>
      !ctx.scope.allowed_paths.some(
        (a) => p === a || p.startsWith(a + '/'),
      ),
  );
  if (escaped.length > 0) {
    return finding(
      'INV-003',
      'CRITICAL',
      'PATH_SCOPE_ESCAPE',
      `Builder touched paths outside its filesystem contract: ${escaped.join(', ')}.`,
      escaped.map((p) => `touched_path:${p}`),
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// INV-004: A product builder cannot mutate recovery resources.
// ---------------------------------------------------------------------------

function evalINV004(ctx: ValidationContext): Finding | null {
  if (ctx.builder_role !== 'PRODUCT_BUILDER') return null;
  const violations = ctx.scope.touched_paths.filter((p) =>
    ctx.scope.recovery_paths.some((r) => p === r || p.startsWith(r + '/')),
  );
  if (violations.length > 0) {
    return finding(
      'INV-004',
      'CRITICAL',
      'SCOPE_OVERLAP',
      `Product builder touched recovery paths: ${violations.join(', ')}.`,
      violations.map((p) => `recovery_path_touched:${p}`),
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// INV-005: A recovery builder cannot implement product features.
// ---------------------------------------------------------------------------

function evalINV005(ctx: ValidationContext): Finding | null {
  if (ctx.builder_role !== 'RECOVERY_BUILDER') return null;
  const violations = ctx.scope.touched_paths.filter((p) =>
    ctx.scope.product_paths.some((r) => p === r || p.startsWith(r + '/')),
  );
  if (violations.length > 0) {
    return finding(
      'INV-005',
      'CRITICAL',
      'SCOPE_OVERLAP',
      `Recovery builder touched product paths: ${violations.join(', ')}.`,
      violations.map((p) => `product_path_touched:${p}`),
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// INV-006: Shared infrastructure requires an explicit owner and active lease.
// ---------------------------------------------------------------------------

function evalINV006(ctx: ValidationContext): Finding | null {
  const unowned = ctx.shared_infra_resources.filter(
    (r) => r.owner === null || !r.has_active_lease,
  );
  if (unowned.length > 0) {
    return finding(
      'INV-006',
      'HIGH',
      'SHARED_INFRA_UNOWNED',
      `Shared infrastructure resources lack explicit owner or active lease: ${unowned.map((r) => r.resource_id).join(', ')}.`,
      unowned.map((r) => `shared_infra:${r.resource_id}`),
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// INV-007: Dirty state is completely reconciled before write authorization.
// ---------------------------------------------------------------------------

function evalINV007(ctx: ValidationContext): Finding | null {
  const unresolved: string[] = [];
  for (const [p, status] of Object.entries(ctx.dirty_state.staged)) {
    if (status !== 'RECONCILED') unresolved.push(`staged:${p}`);
  }
  for (const [p, status] of Object.entries(ctx.dirty_state.unstaged)) {
    if (status !== 'RECONCILED') unresolved.push(`unstaged:${p}`);
  }
  for (const [p, status] of Object.entries(ctx.dirty_state.untracked)) {
    if (status !== 'RECONCILED') unresolved.push(`untracked:${p}`);
  }
  if (unresolved.length > 0) {
    return finding(
      'INV-007',
      'CRITICAL',
      'DIRTY_UNRECONCILED',
      `Unreconciled dirty files block write authorization: ${unresolved.length} file(s).`,
      unresolved,
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// INV-008: Unexpected HEAD or tree movement invalidates the execution lease.
// ---------------------------------------------------------------------------

function evalINV008(ctx: ValidationContext): Finding | null {
  if (ctx.head_sha !== ctx.expected_head_sha) {
    return finding(
      'INV-008',
      'CRITICAL',
      'HEAD_CHANGED',
      `HEAD moved from expected '${ctx.expected_head_sha}' to '${ctx.head_sha}'.`,
      [
        `head_sha:${ctx.head_sha}`,
        `expected_head_sha:${ctx.expected_head_sha}`,
      ],
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// INV-009: Unexpected filesystem fingerprint movement invalidates the lease.
// ---------------------------------------------------------------------------

function evalINV009(ctx: ValidationContext): Finding | null {
  if (ctx.filesystem_fingerprint !== ctx.expected_fingerprint) {
    return finding(
      'INV-009',
      'CRITICAL',
      'EXTERNAL_MUTATION_DETECTED',
      `Filesystem fingerprint drifted from '${ctx.expected_fingerprint}' to '${ctx.filesystem_fingerprint}'.`,
      [
        `filesystem_fingerprint:${ctx.filesystem_fingerprint}`,
        `expected_fingerprint:${ctx.expected_fingerprint}`,
      ],
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// INV-010: Active or unverifiable Git locks block Git mutation.
// ---------------------------------------------------------------------------

function evalINV010(ctx: ValidationContext): Finding | null {
  for (const lock of ctx.git_locks) {
    if (!lock.verifiable) {
      return finding(
        'INV-010',
        'CRITICAL',
        'GIT_LOCK_UNVERIFIABLE',
        `Git lock at '${lock.path}' cannot be verified; blocks mutation.`,
        [`git_lock:${lock.path}`],
      );
    }
    return finding(
      'INV-010',
      'CRITICAL',
      'GIT_LOCK_ACTIVE',
      `Active Git lock at '${lock.path}' blocks mutation.`,
      [`git_lock:${lock.path}`],
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// INV-011: Exact-SHA remote CI attestation required by recovery contract.
// ---------------------------------------------------------------------------

function evalINV011(ctx: ValidationContext): Finding | null {
  if (!ctx.attestation_required) return null;
  if (ctx.attestation === null) {
    return finding(
      'INV-011',
      'CRITICAL',
      'REMOTE_ATTESTATION_STALE',
      'Recovery contract requires exact-SHA remote CI attestation but none is present.',
      ['attestation:null'],
    );
  }
  if (!ctx.attestation.all_required_checks_passed) {
    return finding(
      'INV-011',
      'CRITICAL',
      'REMOTE_ATTESTATION_STALE',
      'Not all required CI checks have passed in the remote attestation.',
      [`attested_commit_sha:${ctx.attestation.attested_commit_sha}`],
    );
  }
  if (!ctx.attestation.approved_ref_reachable) {
    return finding(
      'INV-011',
      'CRITICAL',
      'REMOTE_ATTESTATION_STALE',
      'Attested commit is not reachable from an approved ref.',
      [`attested_commit_sha:${ctx.attestation.attested_commit_sha}`],
    );
  }
  // evidence_captured_at < freshness_deadline means the evidence is stale
  if (ctx.attestation.evidence_captured_at < ctx.attestation.freshness_deadline) {
    return finding(
      'INV-011',
      'CRITICAL',
      'REMOTE_ATTESTATION_STALE',
      `CI attestation evidence is stale (captured ${ctx.attestation.evidence_captured_at}, deadline ${ctx.attestation.freshness_deadline}).`,
      [`evidence_captured_at:${ctx.attestation.evidence_captured_at}`],
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// INV-012: Historical epoch bytes are immutable.
// ---------------------------------------------------------------------------

function evalINV012(ctx: ValidationContext): Finding | null {
  for (const epoch of ctx.historical_epochs) {
    const capturedSha =
      ctx.historical_epoch_sha256_at_capture[epoch.epoch_number];
    if (capturedSha !== undefined && capturedSha !== epoch.sha256) {
      return finding(
        'INV-012',
        'CRITICAL',
        'HISTORICAL_EPOCH_MUTATION',
        `Historical epoch ${epoch.epoch_number} SHA-256 changed from '${capturedSha}' to '${epoch.sha256}'.`,
        [
          `historical_epoch:${epoch.epoch_number}`,
          `expected_sha256:${capturedSha}`,
          `actual_sha256:${epoch.sha256}`,
        ],
      );
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// INV-013: Proposed authority grants no live authority before publication.
// ---------------------------------------------------------------------------

function evalINV013(ctx: ValidationContext): Finding | null {
  if (ctx.is_proposal_context && !ctx.manifest_authority_coherent) {
    return finding(
      'INV-013',
      'HIGH',
      'CONTROL_SCHEMA_INVALID',
      'Proposed authority has not been validated and published; it cannot grant live authority.',
      [
        'is_proposal_context:true',
        'manifest_authority_coherent:false',
      ],
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// INV-014: Epoch publication is atomic; never incremental edits.
// ---------------------------------------------------------------------------

function evalINV014(ctx: ValidationContext): Finding | null {
  if (!ctx.is_publication_context) return null;
  if (ctx.expected_live_sha256 !== ctx.actual_live_sha256) {
    return finding(
      'INV-014',
      'CRITICAL',
      'CAS_CONFLICT',
      'Live file has been partially edited since the CAS snapshot; atomic publication violated.',
      [
        `expected_live_sha256:${ctx.expected_live_sha256}`,
        `actual_live_sha256:${ctx.actual_live_sha256}`,
      ],
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// INV-015: Epoch publication uses CAS against exact epoch and byte hash.
// ---------------------------------------------------------------------------

function evalINV015(ctx: ValidationContext): Finding | null {
  if (!ctx.is_publication_context) return null;
  if (ctx.expected_live_sha256 !== ctx.actual_live_sha256) {
    return finding(
      'INV-015',
      'CRITICAL',
      'CAS_CONFLICT',
      `CAS publication rejected: live hash '${ctx.actual_live_sha256}' does not match expected '${ctx.expected_live_sha256}'.`,
      [
        `expected_live_sha256:${ctx.expected_live_sha256}`,
        `actual_live_sha256:${ctx.actual_live_sha256}`,
      ],
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// INV-016: Live YAML with duplicate keys / unsafe tags / bad schema is fatal.
// ---------------------------------------------------------------------------

function evalINV016(ctx: ValidationContext): Finding | null {
  if (!ctx.live_yaml_valid) {
    return finding(
      'INV-016',
      'CRITICAL',
      'CONTROL_PARSE_INVALID',
      'Live YAML contains duplicate keys, unsafe tags, unresolved interpolation, or fails schema validation.',
      ['live_yaml_valid:false'],
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// INV-017: Pending or expired handoff grants no new write ownership.
// ---------------------------------------------------------------------------

function evalINV017(ctx: ValidationContext): Finding | null {
  if (ctx.handoff === null) return null;
  if (ctx.handoff.status === 'HANDOFF_PENDING') {
    return finding(
      'INV-017',
      'HIGH',
      'HANDOFF_PENDING',
      `Pending handoff to '${ctx.handoff.to_agent}' blocks new write ownership.`,
      [
        `handoff_to:${ctx.handoff.to_agent}`,
        'handoff_status:HANDOFF_PENDING',
      ],
    );
  }
  if (ctx.handoff.status === 'HANDOFF_EXPIRED') {
    return finding(
      'INV-017',
      'HIGH',
      'HANDOFF_EXPIRED',
      `Expired handoff to '${ctx.handoff.to_agent}' blocks new write ownership.`,
      [
        `handoff_to:${ctx.handoff.to_agent}`,
        `handoff_expiry:${ctx.handoff.expiry}`,
      ],
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// INV-018: Remote attestation binds full OID to canonical repo and ref policy.
// ---------------------------------------------------------------------------

function evalINV018(ctx: ValidationContext): Finding | null {
  if (ctx.attestation === null) return null;
  if (
    !ctx.attestation.attested_repository ||
    ctx.attestation.attested_repository.trim() === ''
  ) {
    return finding(
      'INV-018',
      'HIGH',
      'REMOTE_REPOSITORY_MISMATCH',
      'Remote attestation does not bind to a canonical repository.',
      ['attested_repository:empty'],
    );
  }
  if (!ctx.attestation.approved_ref_reachable) {
    return finding(
      'INV-018',
      'HIGH',
      'REMOTE_REPOSITORY_MISMATCH',
      'Attested commit is not reachable from an approved ref per the canonical reachability policy.',
      [`attested_commit_sha:${ctx.attestation.attested_commit_sha}`],
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// INV-019: A stale lease holder cannot resume with an expired fencing token.
// ---------------------------------------------------------------------------

function evalINV019(ctx: ValidationContext): Finding | null {
  if (ctx.lease === null) return null;
  if (ctx.lease.presented_fencing_token < ctx.lease.fencing_token) {
    return finding(
      'INV-019',
      'CRITICAL',
      'FENCING_TOKEN_STALE',
      `Presented fencing token ${ctx.lease.presented_fencing_token} is less than current token ${ctx.lease.fencing_token}; stale holder rejected.`,
      [
        `presented_fencing_token:${ctx.lease.presented_fencing_token}`,
        `current_fencing_token:${ctx.lease.fencing_token}`,
      ],
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// INV-020: Validation/proposal uses one coherent run manifest & authority.
// ---------------------------------------------------------------------------

function evalINV020(ctx: ValidationContext): Finding | null {
  if (!ctx.manifest_authority_coherent) {
    return finding(
      'INV-020',
      'HIGH',
      'CONTROL_CHANGED',
      'Run manifest authority snapshot does not match the current live epoch/hash; evidence is incoherent.',
      ['manifest_authority_coherent:false'],
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// INV-021: Aborted run leaves original live/worktree state unchanged.
// ---------------------------------------------------------------------------

function evalINV021(ctx: ValidationContext): Finding | null {
  if (!ctx.is_post_abort) return null;
  if (!ctx.state_unchanged_after_abort) {
    return finding(
      'INV-021',
      'HIGH',
      'EXTERNAL_MUTATION_DETECTED',
      'Post-abort state check failed: live or worktree state was modified during the aborted run.',
      ['state_unchanged_after_abort:false'],
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// INV-022: Deterministic proposal excludes volatiles, stable digest.
// ---------------------------------------------------------------------------

function evalINV022(ctx: ValidationContext): Finding | null {
  if (!ctx.output_is_deterministic) {
    return finding(
      'INV-022',
      'HIGH',
      'NONDETERMINISTIC_OUTPUT',
      'Proposal content is non-deterministic: identical inputs did not produce byte-identical output.',
      ['output_is_deterministic:false'],
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// INV-023: Secrets redacted before evidence persistence or publication.
// ---------------------------------------------------------------------------

function evalINV023(ctx: ValidationContext): Finding | null {
  if (!ctx.secrets_redacted) {
    return finding(
      'INV-023',
      'CRITICAL',
      'SECRET_REDACTION_FAILED',
      'Secrets or classified content were not fully redacted before evidence persistence or publication.',
      ['secrets_redacted:false'],
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// INV-024: Resume/retry must revalidate all state.
// ---------------------------------------------------------------------------

function evalINV024(ctx: ValidationContext): Finding | null {
  if (!ctx.is_resume_or_retry) return null;
  if (!ctx.resume_revalidated) {
    return finding(
      'INV-024',
      'HIGH',
      'CONTROL_CHANGED',
      'Resume/retry did not revalidate authority, SHA, locks, leases, handoffs, dirty state, and remote evidence.',
      ['resume_revalidated:false'],
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// INV-025: No publication from partial, mixed-version, expired, or stale evidence.
// ---------------------------------------------------------------------------

function evalINV025(ctx: ValidationContext): Finding | null {
  if (!ctx.is_publication_context) return null;
  if (!ctx.publication_evidence_complete) {
    return finding(
      'INV-025',
      'CRITICAL',
      'REMOTE_ATTESTATION_STALE',
      'Publication blocked: evidence is partial, mixed-version, expired, or stale.',
      ['publication_evidence_complete:false'],
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// INV-026: proposal_epoch == live_epoch + 1.
// ---------------------------------------------------------------------------

function evalINV026(ctx: ValidationContext): Finding | null {
  const expected = ctx.authority.epoch + 1;
  if (ctx.proposal_epoch !== expected) {
    return finding(
      'INV-026',
      'CRITICAL',
      'EPOCH_NOT_MONOTONIC',
      `Proposal epoch ${ctx.proposal_epoch} must equal live epoch ${ctx.authority.epoch} + 1 (expected ${expected}).`,
      [
        `proposal_epoch:${ctx.proposal_epoch}`,
        `live_epoch:${ctx.authority.epoch}`,
        `expected_epoch:${expected}`,
      ],
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// INV-027: supersedes_epoch == live epoch AND previous_control_sha256 == live hash.
// ---------------------------------------------------------------------------

function evalINV027(ctx: ValidationContext): Finding | null {
  if (ctx.authority.supersedes_epoch !== ctx.authority.epoch) {
    return finding(
      'INV-027',
      'CRITICAL',
      'EPOCH_SUPERSESSION_MISMATCH',
      `supersedes_epoch ${ctx.authority.supersedes_epoch} must equal live epoch ${ctx.authority.epoch}.`,
      [
        `supersedes_epoch:${ctx.authority.supersedes_epoch}`,
        `live_epoch:${ctx.authority.epoch}`,
      ],
    );
  }
  if (ctx.authority.previous_control_sha256 !== ctx.actual_live_sha256) {
    return finding(
      'INV-027',
      'CRITICAL',
      'EPOCH_SUPERSESSION_MISMATCH',
      `previous_control_sha256 '${ctx.authority.previous_control_sha256}' does not match live SHA-256 '${ctx.actual_live_sha256}'.`,
      [
        `previous_control_sha256:${ctx.authority.previous_control_sha256}`,
        `actual_live_sha256:${ctx.actual_live_sha256}`,
      ],
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// INV-028: Duplicate, lower, skipped, or previously published epochs rejected.
// ---------------------------------------------------------------------------

function evalINV028(ctx: ValidationContext): Finding | null {
  const live = ctx.authority.epoch;
  const proposed = ctx.proposal_epoch;

  // Lower epoch — rollback attempt
  if (proposed <= live) {
    return finding(
      'INV-028',
      'CRITICAL',
      'EPOCH_ROLLBACK_ATTEMPT',
      `Proposed epoch ${proposed} is not greater than live epoch ${live}; rollback rejected.`,
      [`proposal_epoch:${proposed}`, `live_epoch:${live}`],
    );
  }

  // Skipped epoch — monotonicity violation
  if (proposed > live + 1) {
    return finding(
      'INV-028',
      'CRITICAL',
      'EPOCH_ROLLBACK_ATTEMPT',
      `Proposed epoch ${proposed} skips epoch(s) after ${live}; monotonicity violation.`,
      [`proposal_epoch:${proposed}`, `live_epoch:${live}`],
    );
  }

  // Previously published — duplicate epoch
  if (ctx.authority.published_epochs.includes(proposed)) {
    return finding(
      'INV-028',
      'CRITICAL',
      'EPOCH_ROLLBACK_ATTEMPT',
      `Proposed epoch ${proposed} has already been published; duplicate epoch rejected.`,
      [
        `proposal_epoch:${proposed}`,
        `published_epochs:${ctx.authority.published_epochs.join(',')}`,
      ],
    );
  }

  return null;
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

/**
 * Evaluate all 28 invariants against the provided ValidationContext.
 * Returns a deterministic array of Findings (empty if all pass).
 *
 * Pure function: no side-effects, no I/O, no mutable globals.
 */
export function evaluateInvariants(context: ValidationContext): Finding[] {
  const evaluators: Array<(ctx: ValidationContext) => Finding | null> = [
    evalINV001,
    evalINV002,
    evalINV003,
    evalINV004,
    evalINV005,
    evalINV006,
    evalINV007,
    evalINV008,
    evalINV009,
    evalINV010,
    evalINV011,
    evalINV012,
    evalINV013,
    evalINV014,
    evalINV015,
    evalINV016,
    evalINV017,
    evalINV018,
    evalINV019,
    evalINV020,
    evalINV021,
    evalINV022,
    evalINV023,
    evalINV024,
    evalINV025,
    evalINV026,
    evalINV027,
    evalINV028,
  ];

  const findings: Finding[] = [];
  for (const evaluator of evaluators) {
    const f = evaluator(context);
    if (f !== null) findings.push(f);
  }
  return findings;
}
