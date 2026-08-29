# W3.05 Control Plane Architecture Specification

Status: `PROPOSAL_ONLY`  
Control-plane version: `W3.05`  
Bootstrap baseline: live Epoch 40  
Live publication authorized: **No**

## 1. Purpose

W3.05 is a Git-versioned governance layer that generates and validates proposed immutable epoch transitions for Cerebro Nexarch. It formalizes ownership, worktree isolation, product and recovery contracts, external mutation handling, shared-infrastructure ownership, exact-SHA CI attestation, and autonomous agent scheduling.

W3.05 does not replace the live epoch ledger. `D:\CEREBRO_PRODUCT_WORKTREES\CONTROL\ACTIVE_BRANCH_OWNERS.yaml` remains authoritative until a valid later epoch is atomically published by an explicitly authorized Portfolio Governor.

The bootstrap operates only in `PROPOSAL_ONLY` mode. It may inspect live state and produce deterministic findings or proposals. It may not publish Epoch 41, activate builders, clean dirty worktrees, delete Git locks, mutate product or recovery code, or change historical authority.

## 2. Design principles

1. Fail closed on missing, stale, ambiguous, conflicting, or unverifiable authority.
2. Keep the live epoch snapshot small; keep schemas, policies, validators, contracts, and tests in Git.
3. Separate builders from independent verifiers by identity and access mode.
4. Permit exactly one write owner for each writable worktree and shared resource.
5. Treat dirty files, locks, remote attestations, and handoffs as structured evidence, not booleans.
6. Separate recovery, product, shared-infrastructure, verification, and integration planes.
7. Produce deterministic portable artifacts from identical stable inputs.
8. Separate portable deterministic records from volatile machine diagnostics.
9. Never manufacture cleanliness or machine-green status by deleting evidence or reusing evidence from another SHA.
10. Require compare-and-swap publication and atomic replacement of live authority.

## 3. Authority model

### 3.1 Authority classes

- **Live authority:** the exact bytes of the resolved live `ACTIVE_BRANCH_OWNERS.yaml` path.
- **Proposed authority:** a validated but unpublished epoch proposal. It grants no execution rights.
- **Historical authority:** immutable captured epochs and their digests.
- **Git-versioned control source:** W3.05 schemas, policies, code, fixtures, and specifications.
- **Publication authority:** an explicitly leased Portfolio Governor permitted to execute CAS publication.
- **Validator authority:** read-only authority to inspect inputs and issue findings; never authority to publish or mutate lanes.
- **Builder authority:** a time-bounded execution lease scoped to one lane, worktree, branch, base/head identity, and filesystem contract.
- **Verifier authority:** read-only authority to independently evaluate a candidate; never authority to repair it.

### 3.2 Precedence

1. A valid live epoch snapshot controls current execution.
2. Historical epochs explain prior authorization but cannot authorize current execution.
3. W3.05 policies constrain proposal validity but do not grant lane access without a live epoch binding.
4. Proposal records, scratch files, chat instructions, local certificates, and worktree contents are evidence only.
5. On conflict or ambiguity, execution stops with a stable blocking reason.

### 3.3 Live snapshot identity

Every validation run records:

- canonical resolved path and file identity;
- byte length and SHA-256;
- capture time in UTC;
- parser and schema version;
- epoch number;
- referenced dependency digests;
- path normalization and symlink/junction resolution result;
- file permissions and readable/writable status without exposing secrets.

The YAML parser must reject duplicate keys, unsafe tags, unresolved interpolation, ambiguous undocumented includes, and schema-invalid scalar types. Secrets are represented by redacted presence metadata or protected digests, never exposed or stored as unsalted low-entropy hashes.

## 4. Control-plane versioning

`control_plane_version: W3.05` identifies the schema and policy family independently from the epoch number. Ordinary ownership changes increment the epoch. Breaking schema or policy changes create a new control-plane version with a migration definition and compatibility window.

Every artifact declares:

- `control_plane_version`;
- schema name and semantic version;
- canonical serialization version;
- minimum compatible validator version;
- source Git commit and tree;
- migration provenance when applicable.

Unknown major versions are fatal. Unsupported minor features are blocking unless explicitly marked ignorable by the schema.

## 5. Repository layout

The planned implementation remains isolated from runtime product governance:

```text
governance/control-plane/w3.05/
  README.md
  SPEC.md
  schemas/
    epoch.schema.json
    agent.schema.json
    worktree.schema.json
    product-contract.schema.json
    recovery-contract.schema.json
    external-mutation.schema.json
    shared-infra.schema.json
    ci-attestation.schema.json
    handoff.schema.json
    finding.schema.json
    proposal.schema.json
    run-manifest.schema.json
    publication-receipt.schema.json
  state-machines/
    product.yaml
    recovery.yaml
    publication.yaml
  policies/
    invariants.yaml
    shared-infra.yaml
    publication.yaml
    reason-codes.yaml
  src/
    cli/
    capture/
    canonical/
    schemas/
    validator/
    proposal/
    attestation/
    publication/
  tests/
    fixtures/
    positive/
    negative/
    determinism/
    crash-consistency/
```

The implementation must not be embedded into `@cerebro/governance-core`, whose existing responsibility is application access governance rather than portfolio execution control.

## 6. Registry schemas

All registries are validated, deterministically serialized records. Registry entries carry `schema_version`, stable ID, lifecycle, captured/updated evidence time, source provenance, and content digest.

### 6.0 Data lifetime classes

W3.05 records belong to exactly one lifetime class:

- **Class 1 — Versioned control source:** schemas, state machines, invariant and reason-code policies, contract definitions, and validator/proposal/publisher source. Class 1 constrains what may be authorized but does not replace the live epoch.
- **Class 2 — Deterministic evidence:** run manifests, fingerprints, proposals, verifier verdicts, CI attestations, and publication receipts. Class 2 proves or rejects conditions under Class 1 and the live epoch; it grants no authority by itself.
- **Class 3 — Volatile runtime coordination:** leases, heartbeats, mutex state, fencing ownership, and process-liveness observations. Class 3 only narrows authority already granted by the live epoch and valid Class 1 policy. It can never create, broaden, or override authority.

Mutation therefore requires both live-epoch authorization and a valid Class 3 execution lease. Missing, corrupt, expired, ambiguous, or epoch-stale Class 3 state fails closed.

### 6.1 Agent Registry

Required fields:

- agent ID, role, provider/runtime, runtime version;
- access mode and capabilities;
- assigned lane, worktree, branch, and filesystem scope reference;
- current state and execution lease;
- verifier or builder counterpart relationship;
- ownership state, lease ID, expiry, renewal state, and fencing token;
- last validated epoch/hash and heartbeat evidence.

Minimum roles:

`PORTFOLIO_GOVERNOR`, `RECOVERY_BUILDER`, `RECOVERY_VERIFIER`, `PRODUCT_BUILDER`, `PRODUCT_VERIFIER`, `PRODUCT_ARCHITECT`, `CI_AUDITOR`, `INTEGRATION_AUDITOR`, and `SHARED_INFRA_BUILDER`.

### 6.2 Worktree Registry

Required fields:

- worktree ID, canonical absolute path, repository identity, and Git common directory;
- branch/ref, full HEAD object ID, tree ID, object format, and approved base SHA;
- owner, access mode, lane assignment, and lease/fencing data;
- upstream and ahead/behind evidence;
- structured staged, unstaged, untracked, ignored-relevant, submodule, LFS, sparse-checkout, merge/rebase/cherry-pick, sequencer, and lock state;
- deterministic dirty fingerprint and per-file evidence;
- external mutation state and last stable baseline;
- relevant Git configuration, hooks, filters, attributes, alternates, and repository-boundary risk findings.

### 6.3 Product Contract Registry

Required fields:

- product ID and canonical name;
- lifecycle; builder and verifier IDs;
- worktree, branch, approved base, and current HEAD;
- exact allow and deny filesystem scopes;
- required and optional dependencies with immutable version/SHA pins;
- functional, API, persistence, security, observability, and UX acceptance criteria;
- exact lint, typecheck, unit, integration, build, negative-control, and security commands;
- current and target maturity;
- integration target and promotion gate;
- complete dirty-state reconciliation entries;
- shared-infrastructure requests and dispositions;
- handoff status, evidence, expiry, and acknowledgements.

No product may become `WRITE_AUTHORIZED` unless every required field validates and all blocking findings are closed by evidence in the same validation run.

### 6.4 Recovery Contract Registry

Required fields:

- tranche ID, objective, baseline SHA, candidate SHA, tree/parent identity, branch, worktree, and canonical repository identity;
- implementation owner, independent verifier, and publication authority;
- exact filesystem scope and exclusions;
- acceptance criteria, verification commands, negative controls, and expected test counts;
- local evidence and exact-SHA remote evidence;
- GitHub repository ID, approved ref reachability, PR/check identities, check conclusions, timestamps, and freshness policy;
- human gate identity, verdict, timestamp, expiry, and candidate binding;
- lifecycle and rollback/compensation model.

Local machine-green evidence and remote GitHub-attested machine-green evidence are distinct fields and cannot substitute for one another.

### 6.5 External Mutation Ledger

Each record contains:

- worktree, normalized path, lane, and first-observed epoch;
- staged/unstaged/untracked classification;
- first and current size, SHA-256, metadata, and dirty-set digest;
- provenance state and evidence;
- disposition, assigned owner, and adoption authorization;
- first-observed and last-validated times;
- collision, shared-infrastructure, control, recovery, and cross-product flags.

Allowed dispositions:

`ADOPT_PRODUCT`, `ADOPT_RECOVERY`, `PRESERVE_EXTERNAL`, `CROSS_PRODUCT_DEPENDENCY`, `SHARED_INFRA`, `INVALID_FOR_LANE`, and `UNRESOLVED`.

`UNRESOLVED`, invalid provenance, fingerprint drift, or missing owner blocks write authorization.

### 6.6 Shared Infrastructure Registry

Shared surfaces include root package metadata, workspace configuration, lockfiles, Turbo/build configuration, GitHub workflows, shared schemas, central migrations, generated artifacts, shared environments, ports, caches, queues, credentials, and publication targets.

Each resource has a canonical ID, exact scope, owner, lease, TTL, renewal policy, fencing token, allowed operations, collision policy, and required verification. Product and recovery builders cannot implicitly own shared infrastructure. They emit a `SHARED_INFRA_CHANGE_REQUEST` that a separately authorized tranche may accept.

### 6.7 CI Attestation Registry

Required fields:

- canonical host/owner/repository and immutable repository ID;
- normalized remote URL and remote identity verification;
- full commit object ID, object format, tree, parents, signature status, approved-ref reachability, and candidate existence;
- branch, PR number, workflow/check name and immutable run/check IDs;
- status, conclusion, evidence source, timestamps, freshness, and artifact digests;
- expected and observed required-check sets;
- authoritative expected-check policy source (`GITHUB_RULESET`, `BRANCH_PROTECTION`, `RECOVERY_CONTRACT`, or an approved combination), policy ID where available, canonical policy digest, capture time, and freshness;
- skipped, missing, neutral, cancelled, or stale check treatment;
- exact candidate binding and fork/wrong-repository rejection result.

Remote unavailability, insufficient authentication, absent commit, wrong repository, unapproved reachability, stale evidence, missing checks, or ambiguous conclusions fail closed.

### 6.8 Handoff Registry

A handoff includes from/to identities, exact repositories/worktrees/branches/resources, full revision and dirty-state digest, unfinished task, acceptance criteria, hazards, acknowledgement, timestamp, expiry, status, and supersession. `HANDOFF_PENDING` blocks both a new writer and any unacknowledged transfer.

### 6.9 Publication Receipt Registry

`publication-receipt.schema.json` records:

- control-plane version;
- previous epoch and previous live SHA-256;
- proposed epoch and proposal SHA-256;
- published epoch and resulting live SHA-256;
- publisher identity and publication fencing token;
- validation-manifest and independent-verifier verdict digests;
- publication result and post-publication verification result;
- previous receipt digest and current receipt digest.

Receipts use deterministic serialization and form an append-only hash chain. Validation rejects deletion, substitution, reordering, duplicated sequence numbers, a mismatched predecessor digest, or a receipt whose published hash does not match the captured live bytes.

## 6.10 Runtime lease and fencing model

Bootstrap coordination uses a single-host filesystem lease store rooted at `D:\CEREBRO_CONTROL_RUNTIME\w3.05\`. The runtime root is outside Git, outside product and recovery worktrees, and outside the live control directory. It is Class 3 volatile coordination state, never authority.

The store contains one canonical resource directory per lane, worktree, shared resource, or publication target. Acquisition uses an OS-level exclusive handle and an atomic state transition. Each lease records resource ID, live epoch/hash binding, owner agent ID, run ID, issued/renewed/expiry times, monotonically increasing fencing token, process-liveness evidence, and previous lease digest.

Rules:

1. A lease can only narrow an authorization already present in the live epoch and validated Class 1 policy.
2. Atomic acquisition must compare the current resource record, reject an active owner, increment the fencing token, and durably persist the new record before returning success.
3. Renewal requires the same owner, run ID, live epoch/hash, and fencing token. Renewal never changes scope or owner.
4. Expired owners are rejected by every write adapter using the fencing token; an old token can never resume.
5. Process liveness is supporting evidence only. Missing process evidence cannot prove that a lease is stale.
6. Epoch or live-control hash change invalidates every execution and publication lease.
7. Missing, corrupt, unreadable, ambiguously locked, or rollback-detected lease state blocks mutation.
8. Crash recovery revalidates live authority and the resource postcondition before acquiring a new monotonically higher token.
9. Lease-store reset, repair, or rollback is a separately authorized governor operation with preserved evidence.
10. Shared-resource mutexes and the publication lease use the same fencing model.

The bootstrap supports only one host. A later multi-host design requires a separately approved linearizable coordination service; network filesystems are not assumed to provide correct fencing.

## 7. Lane state machines

### 7.1 Product lane

Normal path:

```text
DISCOVERED
→ FORENSICS_COMPLETE
→ CONTRACT_PENDING
→ CONTRACT_BOUND
→ READY_FOR_IMPLEMENTATION
→ RUNNING
→ VERIFYING
→ INTEGRATION_READY
→ RELEASED
```

Exceptional states:

`BLOCKED_CONTROL`, `BLOCKED_SCOPE`, `BLOCKED_EXTERNAL_MUTATION`, `BLOCKED_DEPENDENCY`, `BLOCKED_SHARED_INFRA`, `BLOCKED_GIT_LOCK`, `BLOCKED_VERIFICATION`, and `BLOCKED_INTEGRATION`.

Blocked states require a new validated run or an explicitly defined resume transition; an agent cannot self-clear them.

### 7.2 Recovery lane

Normal path:

```text
DISCOVERED
→ FORENSICS_COMPLETE
→ CONTRACT_PENDING
→ READY_FOR_RECOVERY
→ RUNNING
→ MACHINE_VERIFIED_LOCAL
→ REMOTE_ATTESTATION_PENDING
→ MACHINE_VERIFIED_REMOTE
→ HUMAN_GATE
→ RELEASE_READY
```

Exceptional states:

`FROZEN`, `BLOCKED_SCOPE`, `BLOCKED_CONTROL`, `BLOCKED_EXTERNAL_MUTATION`, `BLOCKED_REMOTE_ATTESTATION`, and `BLOCKED_VERIFICATION`.

No recovery transition may skip exact-SHA remote attestation when the recovery contract requires it.

### 7.3 Publication lane

```text
DISCOVERED
→ SNAPSHOTTED
→ VALIDATED
→ INDEPENDENTLY_VERIFIED
→ CAS_READY
→ PUBLISHING
→ REVALIDATED
→ PUBLISHED
```

`CAS_CONFLICT`, `BLOCKED`, and `FAILED` are terminal for the run. A fresh run is required after authority drift.

## 8. Invariant catalog

- **INV-001:** One writable worktree has exactly one active write owner.
- **INV-002:** Builder and verifier identities differ.
- **INV-003:** A builder cannot mutate outside its exact filesystem contract.
- **INV-004:** A product builder cannot mutate recovery resources.
- **INV-005:** A recovery builder cannot implement product features.
- **INV-006:** Shared infrastructure requires an explicit owner and lease.
- **INV-007:** Dirty state is completely reconciled before write authorization.
- **INV-008:** Unexpected HEAD or tree movement invalidates the execution lease.
- **INV-009:** Unexpected filesystem fingerprint movement invalidates the execution lease.
- **INV-010:** Active or unverifiable Git locks block Git mutation.
- **INV-011:** Exact-SHA remote CI attestation is required when specified by the recovery contract.
- **INV-012:** Historical epoch bytes are immutable.
- **INV-013:** Proposed authority grants no live authority before validation and publication.
- **INV-014:** Epoch publication is atomic and never incrementally edits the live file.
- **INV-015:** Epoch publication uses compare-and-swap against exact epoch and byte hash.
- **INV-016:** Live YAML with duplicate keys, unsafe tags, unresolved interpolation, or invalid schema is fatal.
- **INV-017:** Pending or expired handoff grants no new write ownership.
- **INV-018:** Remote attestation must bind the full object ID to the canonical repository and approved reachability policy.
- **INV-019:** A stale lease holder cannot resume with an expired fencing token.
- **INV-020:** A validation/proposal run uses evidence from one coherent run manifest and authority snapshot.
- **INV-021:** Aborted validation or publication leaves original live/worktree state unchanged.
- **INV-022:** Deterministic proposal content excludes volatile diagnostics and produces a stable digest.
- **INV-023:** Secrets and classified content are redacted before evidence persistence or publication.
- **INV-024:** Resume and retry revalidate authority, SHA, locks, leases, handoffs, dirty state, and remote evidence.
- **INV-025:** No publication occurs from partial, mixed-version, expired, or stale evidence.
- **INV-026:** A proposal epoch equals the live epoch plus exactly one unless a future explicit migration protocol authorizes a different transition.
- **INV-027:** `supersedes_epoch` equals the exact live epoch and `previous_control_sha256` equals the exact live byte hash.
- **INV-028:** Duplicate, lower, skipped, or previously published epoch numbers are rejected as rollback or monotonicity violations.

## 9. Stable blocking reason codes

At minimum:

`CONTROL_PARSE_INVALID`, `CONTROL_SCHEMA_INVALID`, `CONTROL_CHANGED`, `CAS_CONFLICT`, `HISTORICAL_EPOCH_MUTATION`, `EPOCH_NOT_MONOTONIC`, `EPOCH_SUPERSESSION_MISMATCH`, `EPOCH_ROLLBACK_ATTEMPT`, `OWNER_MISSING`, `MULTIPLE_WRITERS`, `BUILDER_VERIFIER_COLLISION`, `SCOPE_MISSING`, `SCOPE_OVERLAP`, `DIRTY_UNRECONCILED`, `EXTERNAL_MUTATION_DETECTED`, `HEAD_CHANGED`, `GIT_LOCK_ACTIVE`, `GIT_LOCK_UNVERIFIABLE`, `HANDOFF_PENDING`, `HANDOFF_EXPIRED`, `DEPENDENCY_UNBOUND`, `SHARED_INFRA_UNOWNED`, `LEASE_MISSING`, `LEASE_CORRUPT`, `LEASE_EXPIRED`, `FENCING_TOKEN_STALE`, `REMOTE_COMMIT_ABSENT`, `REMOTE_REPOSITORY_MISMATCH`, `REMOTE_REF_UNAPPROVED`, `REMOTE_ATTESTATION_STALE`, `REQUIRED_CHECK_POLICY_MISSING`, `REQUIRED_CHECK_MISSING`, `MACHINE_GREEN_FALSE`, `PATH_IDENTITY_INVALID`, `PATH_SCOPE_ESCAPE`, `SECRET_REDACTION_FAILED`, and `NONDETERMINISTIC_OUTPUT`.

Every blocking result has a nonzero CLI exit code, structured finding, evidence reference, and proof that no prohibited mutation occurred.

## 10. Deterministic run manifest

The run manifest contains:

- schema/control-plane/validator versions and source Git commit;
- stable run ID derived from deterministic inputs plus a separate volatile execution ID;
- UTC capture time in diagnostics, excluded from portable artifact hashes;
- actor identity and access mode;
- live control path identity, byte digest, epoch, parser/schema version, and referenced dependency digests;
- canonical repository identity, full object IDs, tree IDs, refs, and remote attestation;
- structured dirty-state, lock, handoff, lease, and shared-resource evidence;
- registry digests, gate results, stable reason codes, planned mutations, and publication target;
- proposal digest, verifier verdict, and redaction result.

Canonical portable output uses UTF-8, LF endings, Unicode normalization, stable key ordering, stable collection ordering, locale-independent numbers, normalized paths, and frozen clocks in tests. Machine paths, timestamps, process IDs, and transient diagnostics are stored separately.

## 11. Read-only validator design

The validator has no write-capable interfaces. Its adapters expose read-only operations for:

- live control byte capture and strict YAML decoding;
- Git repository/worktree/ref/object/config/operation inspection;
- filesystem metadata and SHA-256 capture without following unsafe boundaries;
- process and lock evidence capture;
- registry and schema loading;
- remote GitHub repository/commit/ref/PR/check attestation;
- deterministic finding and manifest output.

Validation phases:

1. Capture and validate live authority.
2. Load and validate W3.05 registries.
3. Canonicalize repositories, paths, identities, and scopes.
4. Capture worktree, dirty, operation, lock, handoff, lease, and shared-resource state.
5. Evaluate schema completeness and invariants.
6. Verify exact-SHA remote evidence where required.
7. Emit deterministic findings and a portable run manifest.
8. Re-read live authority and mark the run stale if epoch/hash changed.

The validator must not run installs, builds, tests, generators, scanners, hooks, smudge/clean filters, or commands capable of mutating Git state.

### 11.1 Safe read-only Git probe policy

Every Git subprocess runs with `GIT_OPTIONAL_LOCKS=0`, an explicit repository/worktree path, sanitized configuration, disabled hooks, disabled external diff/textconv, disabled credential persistence, and no working-tree clean/smudge or LFS filter execution. Allowed operations are limited to reviewed read-only plumbing and inspection commands.

The validator prohibits fetch, pull, checkout, switch, reset, clean, stash, commit, merge, rebase, cherry-pick, index refresh, submodule update, Git LFS mutation, remote-tracking-ref mutation, object writes, config writes, and credential-writing operations. Remote GitHub evidence comes from a read-only API/attestation adapter and is never fetched into the inspected repository.

Direct safe filesystem reads produce worktree fingerprints when Git transformation machinery could execute external behavior. Before and after validation, the validator proves equivalence of HEAD, index identity/digest, refs, worktree fingerprint, relevant object-store inventory, and Git configuration. Any change is `FATAL` and `EXTERNAL_MUTATION_DETECTED` unless independently proven external.

### 11.2 Windows path and file-identity policy

Scope resolution starts from an already validated canonical repository root and emits canonical repository-relative identities. It rejects `..` escape, drive-relative paths, unexpected UNC roots, alternate data streams, DOS reserved device names, invalid trailing-dot/space aliases, Unicode-normalization collisions, case-fold collisions, symlink/junction/reparse escape, filesystem identity changes, and any resolved path outside the canonical repository root.

Canonicalization records the presentation path, absolute normalized path, repository-relative identity, volume/filesystem identity, reparse traversal evidence, case-normalized comparison key, and Unicode-normalized comparison key. Ambiguous identity, collision, inaccessible path components, or a changed file identity fails closed with `PATH_IDENTITY_INVALID` or `PATH_SCOPE_ESCAPE`.

Severity classes are `INFO`, `WARNING`, `BLOCKING`, and `FATAL`. `BLOCKING` or `FATAL` prevents write authorization. A validator internal error is `FATAL`, never a green result.

## 12. Epoch 41 proposal generator

Inputs:

- exact live Epoch 40 snapshot and digest;
- validated W3.05 registry set;
- one coherent validator run manifest;
- explicit takeover, handoff, disposition, lock, shared-infrastructure, and verifier decisions.

Output:

- canonical `Epoch 41 PROPOSAL` document;
- deterministic proposal SHA-256;
- source evidence manifest;
- machine-readable list of unresolved blockers.

The proposal contains control-plane version, superseded epoch, expected previous hash, product/recovery ownership, independent verifiers, worktrees, branches, full SHAs, scopes, dirty dispositions, locks, contracts, shared-infrastructure ownership, remote CI requirements, frozen/released states, and agent permissions.

Generation requires `proposed_epoch == live_epoch + 1`, `supersedes_epoch == live_epoch`, and `previous_control_sha256 == live_byte_sha256`. Lower, duplicate, skipped, previously published, or mismatched transitions fail with the anti-rollback reason codes. Generation also fails if any active write lane lacks a complete contract or if the same stable inputs do not yield byte-identical proposal output. The generator cannot access the live publication adapter.

## 13. Independent proposal verification

The proposal builder and verifier are distinct agent IDs and leases. The verifier independently re-captures live authority and state, then confirms:

- Epoch 40 and its byte digest still match;
- every active worktree/branch/HEAD/dirty fingerprint/lock matches;
- every external mutation has an authorized disposition;
- P12 lock is represented without inferred staleness or deletion;
- no writer or scope overlaps;
- builder/verifier separation and leases are valid;
- shared infrastructure has explicit ownership;
- recovery remains frozen unless a separate valid recovery contract authorizes change;
- remote CI gaps are represented accurately;
- P05/P09 handoffs are evidenced, not inferred;
- product and recovery contracts are complete;
- proposal serialization and digest are deterministic.

The only verdicts are `EPOCH_41_PROPOSAL_VALID` and `EPOCH_41_PROPOSAL_REJECTED`. Rejection includes stable reason codes and exact evidence references.

## 14. Compare-and-swap publication protocol

Publication is designed but disabled during bootstrap.

1. Capture live path, epoch, exact bytes, SHA-256, and file identity.
2. Generate and independently validate a proposal against that snapshot.
3. Acquire the exclusive Portfolio Governor publication lease with TTL and fencing token.
4. Immediately re-read the live file and verify path identity, epoch, and hash.
5. Revalidate monotonic epoch, exact supersession, exact previous hash, and the publication receipt-chain head. On mismatch, emit `CAS_CONFLICT`, `EPOCH_NOT_MONOTONIC`, `EPOCH_SUPERSESSION_MISMATCH`, or `EPOCH_ROLLBACK_ATTEMPT`, release the lease, and abort without writing.
6. Serialize the candidate deterministically to a same-directory temporary file.
7. Validate the serialized candidate and its historical-epoch references.
8. Flush file contents and directory metadata where supported.
9. Atomically replace the live file using a platform-specific replace operation that does not expose a partial file.
10. Re-read and validate the live file; verify expected epoch/hash and publication receipt.
11. Validate and persist a `publication-receipt.schema.json` receipt in the Class 2 evidence store, chained to the prior receipt digest.
12. If post-replace verification fails, stop and require governor adjudication; never overwrite newly created external state automatically.

Windows implementation must use an atomic replace primitive with explicit same-volume and antivirus/file-sharing error handling. It must not emulate atomicity with delete-then-rename. Publication retries use an idempotency key derived from previous hash plus proposal hash.

## 15. Crash consistency and rollback

Every future mutating operation declares preconditions, postconditions, journal state, idempotency key, rollback class, and resume rules. The journal is append-only or hash-chained.

Crash recovery distinguishes:

- before mutation: safe retry after full revalidation;
- after mutation but before journal completion: inspect postcondition and reconcile without duplicating mutation;
- during verification: do not publish; revalidate candidate and evidence;
- during publication: validate live bytes and publication receipt before any follow-up.

Rollback never overwrites new external/user state. Irreversible operations require compensation plans and explicit human/governor gates.

## 16. Current Epoch 40 migration model

### 16.1 P05 and P09

Both remain `HANDOFF_PENDING`. Capacity exhaustion is not ownership transfer. A valid handoff requires outgoing evidence, dirty manifest, exact revision, unfinished work, hazards, acknowledgement, expiry, and new live authority. Until then no Codex builder receives write access.

### 16.2 P10, P11, and P12

Existing dirty entries are protected external state. Product-local candidates may be proposed as `ADOPT_PRODUCT`; root workspace files, generators, package-manager conflicts, and shared surfaces require `PRESERVE_EXTERNAL`, `INVALID_FOR_LANE`, or `SHARED_INFRA` disposition.

No product becomes write-authorized until the full dirty fingerprint and every entry disposition match a complete product contract.

### 16.3 P12 lock

The zero-byte `index.lock` is `BLOCKED_GIT_LOCK` with provenance `UNRESOLVED`. The builder may not delete it. A controller may only classify it after recording path, metadata, repository/worktree identity, relevant process liveness, and Git state. Active or unverifiable locks remain blocking. Any later stale-lock removal requires separate authorization, evidence preservation, and pre/post repository consistency checks.

### 16.4 F16 recovery

Candidate `34245c65efb485b74b84128b876ec04c46659a81` is modeled as `REMOTE_ATTESTATION_PENDING` / `BLOCKED_REMOTE_ATTESTATION`, not remote machine-green. PR #52 evidence bound to `79f2a9d2...` cannot attest this candidate. Historical 11-file scope remains historical and is not retroactively rewritten.

A future `F16-CI-INTEGRITY-V2` contract must bind canonical GitHub repository identity, full base/candidate objects, exact six-path candidate delta or a separately approved scope, exact-SHA checks, negative controls, independent verification, and human gate.

### 16.5 Released and gated products

P02 and P48 remain immutable released candidates. P13-P15 remain gated. P16-P18 remain unprovisioned until authoritative identities and contracts exist.

## 17. Product autonomous-agent model

Each write-authorized product has one `PRODUCT_BUILDER` and a different `PRODUCT_VERIFIER`. Architects, CI auditors, integration auditors, and the Portfolio Governor are read-only unless separately leased. Builders cannot merge their own work or widen their scope.

The scheduler activates a lane only when the live epoch, execution lease, worktree fingerprint, contract, dependencies, lock state, shared-infrastructure requests, and verifier assignment all validate. Every critical transition re-reads the live epoch/hash. A blocked lane does not stop independent lanes.

## 18. Threat model

W3.05 explicitly defends against:

- stale chat/epoch authorization and TOCTOU authority drift;
- duplicate YAML keys, unsafe tags, parser ambiguity, and hidden includes;
- wrong repository/fork/reachable-ref CI attestation;
- short-SHA collision or misbinding;
- malicious or accidental Git config, hooks, attributes, filters, submodules, alternates, and path escape;
- symlink/junction, case-folding, Unicode, and repository-boundary attacks;
- external mutation adoption without provenance;
- concurrent writers, stale leases, clock skew, and fencing bypass;
- lock deletion while Git is active;
- false-green tests, missing/skipped checks, masked failures, and reused base-SHA evidence;
- secret or classified data leakage in evidence;
- partial publication, mixed-version artifacts, crash/retry duplication, and unsafe rollback.

## 19. Test and negative-control plan

Positive fixtures demonstrate valid product, recovery, shared-infrastructure, handoff, CI-attestation, proposal, verifier, CAS, and deterministic-output states.

Required rejection tests include:

1. two builders owning one worktree;
2. identical builder and verifier;
3. missing filesystem scope;
4. dirty worktree without reconciliation;
5. unexpected HEAD/tree movement;
6. active or unverifiable Git lock;
7. product scope containing unowned shared infrastructure;
8. recovery scope containing product files;
9. product scope containing recovery files;
10. stale epoch proposal;
11. stale live-control hash;
12. required exact-SHA CI evidence absent or stale;
13. historical epoch mutation;
14. unbound dependency;
15. unauthorized external-file adoption;
16. malformed product contract;
17. incomplete recovery contract;
18. overlapping mutation scopes;
19. publication against changed live authority;
20. false `MACHINE_GREEN` classification;
21. full SHA found only in a fork or wrong repository;
22. commit not reachable from an approved ref;
23. duplicate YAML key, unsafe tag, or unresolved interpolation;
24. pending, expired, conflicting, or unacknowledged handoff;
25. two shared-resource lease contenders, proving only one writer proceeds;
26. lease expiry mid-operation and rejection of the stale fencing token;
27. crash before mutation, after mutation/before journal, during verification, and during publication;
28. retry without duplicate proposal/publication;
29. partial publication not externally visible;
30. secret-bearing input rejected or safely redacted;
31. resume after changed precondition rejected;
32. byte-identical output across locale, timezone, path enumeration order, and repeated runs;
33. every blocking gate proves zero prohibited mutation to original worktrees and live authority.
34. lower, duplicate, and skipped proposed epochs rejected;
35. correct next epoch with wrong `supersedes_epoch` or previous control hash rejected;
36. missing, corrupt, expired, ambiguous, or epoch-stale lease rejected;
37. stale fencing token rejected after lease reassignment;
38. lease-store rollback or token regression detected;
39. validator Git probes leave HEAD, index, refs, worktree, object store, and Git config equivalent;
40. fetch, external diff/textconv, hooks, filters, credentials, or remote-ref mutation unavailable to the validator adapter;
41. Windows `..`, drive-relative, UNC/reparse escape, alternate stream, DOS device, case-fold, and Unicode-collision paths rejected;
42. all observed checks green but authoritative required-check policy missing rejected;
43. expected-check policy digest changed after attestation rejected;
44. Class 3 lease state attempting to broaden live authority rejected;
45. publication receipt deletion, substitution, reordering, or predecessor mismatch rejected;
46. same stable inputs produce identical proposal and receipt-preimage bytes while volatile diagnostics vary independently.

## 20. Bootstrap acceptance criteria

W3.05 bootstrap is ready for an Epoch 41 proposal only when:

- schemas and state machines validate all positive and negative fixtures;
- the read-only validator has no write-capable adapter;
- deterministic runs over the same stable Epoch 40 snapshot produce identical proposal and manifest hashes;
- an independent verifier accepts the proposal against a freshly captured snapshot;
- P05/P09 handoffs are represented without fabricated transfer;
- P10-P12 dirty state and P12 lock are represented exactly;
- F16 is not falsely remote-machine-green;
- shared infrastructure has explicit ownership or remains blocking;
- all live authority and worktrees remain unchanged by validation;
- publication remains disabled until a later explicit governor authorization.

## 21. Non-goals

- No distributed database, Kubernetes dependency, broker, or control-plane service.
- No Epoch 41 publication during bootstrap.
- No builder activation.
- No product, recovery, quarantine, or historical epoch mutation.
- No deletion or cleanup of dirty evidence.
- No automatic Git lock removal.
- No integration or merge authority.

## 22. Implementation sequencing

The later implementation plan must preserve this order:

1. canonical schemas and reason codes;
2. deterministic serialization and run manifest;
3. publication receipt model and hash-chain primitives;
4. strict live-control parser, Windows path canonicalizer, and safe read-only Git capture adapters;
5. worktree/dirty/lock/handoff/shared-resource capture;
6. single-host runtime lease/fencing store;
7. invariant engine and lane state machines;
8. CI attestation adapter with required-check policy provenance;
9. deterministic proposal generator;
10. independent verifier command;
11. CAS publisher implemented behind a compile-time/runtime-disabled publication gate;
12. positive, negative, determinism, concurrency, and crash-consistency suites;
13. Epoch 40 migration fixtures and an unpublished Epoch 41 proposal;
14. separate human/governor review before any publication authorization.

## 23. Decision record

W3.05 is hosted as a standalone repository-governance subsystem under `governance/control-plane/w3.05/`. It is not part of the released P41 product, not embedded in application `governance-core`, and not placed beside the mutable live control file. This boundary keeps portfolio execution governance versioned and auditable without granting it application runtime authority.
