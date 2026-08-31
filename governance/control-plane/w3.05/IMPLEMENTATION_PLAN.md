# W3.05 Control Plane Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a proposal-only, deterministic, read-only W3.05 validator and Epoch 41 proposal toolchain without changing live Epoch 40 or activating any recovery/product writer.

**Architecture:** A standalone Node.js 22/TypeScript package under `governance/control-plane/w3.05/` owns versioned schemas, strict capture adapters, invariant/state engines, CI attestation, deterministic proposal generation, independent verification, and a publication module that is compiled and runtime-disabled by default. Git-versioned Class 1 policy, deterministic Class 2 evidence, and external Class 3 runtime coordination remain separate; neither evidence nor leases can broaden live epoch authority.

**Tech Stack:** Node.js 22, TypeScript 5, npm with a package-local lockfile, Vitest, ESLint, Ajv JSON Schema, `yaml`, native `fetch`, native `fs`/`crypto`/`child_process` adapters, and Windows-safe atomic filesystem primitives.

**Spec:** `governance/control-plane/w3.05/SPEC.md`

## Global Constraints

- Live authority remains `D:\CEREBRO_PRODUCT_WORKTREES\CONTROL\ACTIVE_BRANCH_OWNERS.yaml`, Epoch 40, until separately authorized CAS publication.
- `LIVE EPOCH 41 PUBLICATION = NOT AUTHORIZED`.
- Product, recovery, quarantine, shared-infrastructure, and historical epoch mutation is prohibited.
- Implementation requires a new explicit control record assigning one W3.05 builder, a different verifier, an isolated branch/worktree, base SHA, and scope `governance/control-plane/w3.05/**`.
- Do not modify root `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `turbo.json`, `.github/workflows/**`, or runtime product packages.
- Use package-local npm metadata only; do not enroll W3.05 into the portfolio pnpm workspace during bootstrap.
- The validator has no write-capable Git/worktree/live-control adapter.
- Every test that expects a blocking result must also assert that live authority and fixture worktrees remain unchanged.
- Generated Epoch 41 material is labeled `NON_AUTHORITATIVE_TEST_FIXTURE` until independent verification and later governor authorization.
- Publication code remains behind both compile-time and runtime denial gates.

## Current Implementation Location Gate

```text
repository: D:\CEREBRO_PRODUCT_WORKTREES\INTEGRATION\enterprise-os
worktree: D:\CEREBRO_PRODUCT_WORKTREES\INTEGRATION\enterprise-os
branch: integration/enterprise-os-clean
observed_head: d1fbcb89fe6024e73d0087889738efcfa21f5ac4
current_write_authorized: false
proposed_scope: governance/control-plane/w3.05/**
```

Planning artifacts may remain untracked here under the current authorization. Implementation starts only after a later live epoch binds a dedicated W3.05 implementation branch/worktree and separate builder/verifier identities.

## Planned File Structure

```text
governance/control-plane/w3.05/
  README.md
  SPEC.md
  IMPLEMENTATION_PLAN.md
  package.json
  package-lock.json
  tsconfig.json
  eslint.config.mjs
  schemas/*.schema.json
  state-machines/{product,recovery,publication}.yaml
  policies/{invariants,shared-infra,publication,reason-codes}.yaml
  src/index.ts
  src/types.ts
  src/cli/{validate,propose,verify,publish}.ts
  src/canonical/{json,path}.ts
  src/schemas/registry.ts
  src/capture/{authority,filesystem,git,github,locks,handoffs,shared-resources}.ts
  src/runtime/{lease-store,lease-types}.ts
  src/validator/{engine,invariants,state-machines}.ts
  src/proposal/{generator,verifier}.ts
  src/publication/{publisher,receipt}.ts
  tests/{fixtures,positive,negative,determinism,concurrency,crash-consistency}/**
```

## Dependency DAG

```text
Task 0 authorization
  → Task 1 package/types/reason codes/schemas
    → Task 2 canonical JSON + Windows path identity
      → Task 3 run manifest
        → Task 4 authority parser
          → Task 5 safe Git/filesystem capture
            → Task 6 dirty/lock/handoff/shared-resource capture
              ├→ Task 7 runtime lease/fencing store
              └→ Task 8 invariant engine
                   → Task 9 lane-state engine
                     → Task 10 remote CI attestation
                       → Task 11 proposal generator
                          → Task 12 independent verifier
                            → Task 13 publication receipt model
                              → Task 14 disabled CAS publisher
                                → Task 15 integrated negative/determinism/concurrency/crash gates
                                  → Task 16 Epoch 40 migration fixture
                                    → Task 17 unpublished Epoch 41 proposal
```

---

### Task 0: Acquire an Explicit W3.05 Implementation Lease

**Files:**
- Read: `D:\CEREBRO_PRODUCT_WORKTREES\CONTROL\ACTIVE_BRANCH_OWNERS.yaml`
- Create only after authorization: isolated W3.05 worktree chosen by the Portfolio Governor
- No repository files change in this task

**Interfaces:**
- Consumes: live epoch number/hash, proposed W3.05 branch/worktree/base/scope, builder/verifier IDs
- Produces: an authority handshake record used by every later task

- [ ] **Step 1: Capture current authority and proposed implementation identity**

Record exact live epoch/hash, repository, base SHA, branch, worktree, builder ID, verifier ID, and allow/deny scopes. Require `governance/control-plane/w3.05/**` as the only write prefix.

- [ ] **Step 2: Verify the lane is explicitly authorized**

Run read-only checks with `GIT_OPTIONAL_LOCKS=0`:

```powershell
git -C <authorized-worktree> rev-parse HEAD
git -C <authorized-worktree> branch --show-current
git -C <authorized-worktree> status --porcelain=v1 --untracked-files=all
```

Expected: exact authorized base/branch, no unexplained entries, different builder/verifier identities, and an epoch record granting W3.05 write access.

- [ ] **Step 3: Stop on absent authority**

If any required field is absent, return `BLOCKED_CONTROL` and do not create a branch, worktree, package, lockfile, or commit.

### Task 1: Bootstrap Package, Core Types, Reason Codes, and 13 Schemas

**Files:**
- Create: `governance/control-plane/w3.05/package.json`
- Create: `governance/control-plane/w3.05/package-lock.json`
- Create: `governance/control-plane/w3.05/tsconfig.json`
- Create: `governance/control-plane/w3.05/eslint.config.mjs`
- Create: `governance/control-plane/w3.05/src/types.ts`
- Create: `governance/control-plane/w3.05/src/index.ts`
- Create: `governance/control-plane/w3.05/src/schemas/registry.ts`
- Create: `governance/control-plane/w3.05/policies/reason-codes.yaml`
- Create: 13 files under `governance/control-plane/w3.05/schemas/`
- Test: `governance/control-plane/w3.05/tests/positive/schemas.spec.ts`
- Test: `governance/control-plane/w3.05/tests/negative/schemas.spec.ts`

**Interfaces:**
- Produces: `ReasonCode`, `Finding`, `Severity`, `AuthoritySnapshot`, `RunManifest`, `EpochProposal`, `PublicationReceipt`, `SchemaRegistry.validate()`
- Consumes: none

- [ ] **Step 1: Write schema registry tests first**

```ts
it.each([
  'epoch', 'agent', 'worktree', 'product-contract', 'recovery-contract',
  'external-mutation', 'shared-infra', 'ci-attestation', 'handoff',
  'finding', 'proposal', 'run-manifest', 'publication-receipt',
])('loads and compiles %s schema', name => {
  expect(registry.has(name)).toBe(true);
  expect(registry.compile(name)).not.toThrow();
});

it('rejects a product contract without exact scope', () => {
  expect(registry.validate('product-contract', invalidProduct)).toMatchObject({
    valid: false,
    reasonCode: 'SCOPE_MISSING',
  });
});
```

- [ ] **Step 2: Create package-local tooling**

Use scripts:

```json
{
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "lint": "eslint src tests --max-warnings=0",
    "test": "vitest run",
    "test:negative": "vitest run tests/negative",
    "validate": "tsx src/cli/validate.ts",
    "propose": "tsx src/cli/propose.ts",
    "verify-proposal": "tsx src/cli/verify.ts"
  }
}
```

Pin exact dependency versions in `package-lock.json`. Do not add a `publish` script.

- [ ] **Step 3: Define stable core types**

```ts
export type Severity = 'INFO' | 'WARNING' | 'BLOCKING' | 'FATAL';
export type DataClass = 'VERSIONED_CONTROL_SOURCE' | 'DETERMINISTIC_EVIDENCE' | 'VOLATILE_COORDINATION';
export interface Finding { code: ReasonCode; severity: Severity; message: string; evidenceRefs: string[]; }
export interface ValidationResult<T> { valid: boolean; value?: T; findings: Finding[]; }
```

Define `ReasonCode` from the complete SPEC catalog, including anti-rollback, lease, path, CI policy, and false-green codes.

- [ ] **Step 4: Implement schemas and strict Ajv compilation**

Set `additionalProperties: false` for authority-bearing records, full SHA patterns, absolute/canonical path formats, non-empty exact scope arrays, builder/verifier inequality via invariant evaluation, and receipt predecessor fields.

- [ ] **Step 5: Run package gate**

```powershell
npm ci
npm run typecheck
npm run lint
npm test -- --run tests/positive/schemas.spec.ts tests/negative/schemas.spec.ts
npm run build
```

Expected: all exit `0`; `git status --short` contains only Task 1 scope.

- [ ] **Step 6: Commit atomically**

```powershell
git add governance/control-plane/w3.05
git commit -m "feat(w3.05): add control-plane schemas and core types"
```

### Task 2: Deterministic Canonicalization and Windows Path Identity

**Files:**
- Create: `src/canonical/json.ts`
- Create: `src/canonical/path.ts`
- Test: `tests/determinism/canonical-json.spec.ts`
- Test: `tests/negative/windows-path.spec.ts`

**Interfaces:**
- Consumes: schema-validated plain records
- Produces: `canonicalJson(value): string`, `sha256Canonical(value): string`, `resolvePathIdentity(input): PathIdentity`

- [ ] **Step 1: Write canonical JSON golden tests**

Assert byte identity across key insertion order, locale, timezone, and enumeration order. Reject `undefined`, non-finite numbers, functions, symbols, cycles, and unsupported prototypes.

- [ ] **Step 2: Write Windows path rejection tests**

```ts
it.each(['..\\escape', 'C:relative', '\\\\unexpected\\share', 'file.txt:secret', 'CON', 'aux.txt'])(
  'rejects unsafe identity %s', candidate => {
    expect(() => resolvePathIdentity(root, candidate)).toThrow(PathIdentityError);
  },
);
```

Add fixtures for junction escape, case-fold collision, Unicode NFC/NFD collision, trailing-dot/space aliases, and volume/file-identity change.

- [ ] **Step 3: Implement deterministic canonical JSON**

Use UTF-8, LF, Unicode NFC, sorted object keys, stable array order only where the schema declares a set, and locale-independent number encoding. Volatile diagnostics never enter portable hashes.

- [ ] **Step 4: Implement path identity**

Resolve from a validated repository root; return presentation, canonical absolute path, repository-relative identity, volume identity, reparse evidence, case key, and Unicode key. Fail closed on ambiguity or escape.

- [ ] **Step 5: Run focused gate and commit**

```powershell
npm test -- --run tests/determinism/canonical-json.spec.ts tests/negative/windows-path.spec.ts
npm run typecheck
npm run lint
git add governance/control-plane/w3.05
git commit -m "feat(w3.05): add deterministic canonicalization and path identity"
```

### Task 3: Deterministic Run Manifest

**Files:**
- Create: `src/canonical/run-manifest.ts`
- Test: `tests/positive/run-manifest.spec.ts`
- Test: `tests/determinism/run-manifest.spec.ts`

**Interfaces:**
- Consumes: validated evidence records
- Produces: `buildRunManifest()` and a portable manifest digest

- [ ] **Step 1: Write portable-manifest tests first**

Prove identical stable inputs produce byte-identical portable manifests while capture time, PID, temporary path, locale, enumeration order, and machine-specific absolute paths remain outside the portable digest.

- [ ] **Step 2: Implement portable/volatile separation**

```ts
export interface RunArtifacts {
  portable: PortableRunManifest;
  diagnostics: VolatileDiagnostics;
  portableSha256: string;
}
```

`portableSha256` must not depend on capture timestamp, PID, temporary path, locale, or machine-specific absolute paths.

- [ ] **Step 3: Implement manifest validation and hashing**

Require schema validation before hashing, canonical UTF-8/LF serialization, stable ordering, explicit data-class labels, and evidence references bound to the same authority snapshot.

- [ ] **Step 4: Run gate and commit**

```powershell
npm test -- --run tests/positive/run-manifest.spec.ts tests/determinism/run-manifest.spec.ts
npm run typecheck
npm run lint
git add governance/control-plane/w3.05
git commit -m "feat(w3.05): add deterministic run manifests"
```

### Task 4: Strict Live-Authority Parser and Snapshot Capture

**Files:**
- Create: `src/capture/authority.ts`
- Create: `src/cli/validate.ts`
- Test: `tests/positive/authority-snapshot.spec.ts`
- Test: `tests/negative/authority-yaml.spec.ts`

**Interfaces:**
- Produces: `captureAuthority(path): Promise<AuthoritySnapshot>`
- Consumes: `SchemaRegistry`, canonical JSON/hash utilities, path identity

- [ ] **Step 1: Write fail-closed YAML tests**

Cover duplicate keys, unsafe tags, ambiguous scalar types, unresolved interpolation, unknown fields, missing epoch, unreadable path, symlink escape, and a file changed during capture.

- [ ] **Step 2: Implement exact-byte capture before parse**

Read through a no-follow validated file handle, capture file identity/permissions/size/bytes/SHA-256, then parse with `yaml` configured for unique keys and no custom tags. Validate the parsed record against `epoch.schema.json`.

- [ ] **Step 3: Revalidate after parsing**

Re-read identity, bytes, epoch, and hash. Return `CONTROL_CHANGED` if any precondition moved. Never rewrite or normalize the live file.

- [ ] **Step 4: Add proposal-only CLI behavior**

`validate --control <absolute-path> --output <evidence-directory>` prints findings to stdout. Until Class 2 evidence output is separately authorized, `--output` is rejected and stdout-only validation is used.

- [ ] **Step 5: Run gate and commit**

```powershell
npm test -- --run tests/positive/authority-snapshot.spec.ts tests/negative/authority-yaml.spec.ts
npm run typecheck
npm run lint
git add governance/control-plane/w3.05
git commit -m "feat(w3.05): add strict authority snapshot parser"
```

### Task 5: Safe Read-Only Git and Filesystem Capture

**Files:**
- Create: `src/capture/git.ts`
- Create: `src/capture/filesystem.ts`
- Test: `tests/positive/git-capture.spec.ts`
- Test: `tests/negative/git-mutation-guard.spec.ts`

**Interfaces:**
- Produces: `SafeGitProbe`, `captureRepository()`, `captureWorktreeFiles()`
- Consumes: canonical path identity and hashing

- [ ] **Step 1: Write mutation-equivalence harness**

Create disposable fixture repositories and snapshot HEAD, index bytes, refs, worktree hashes, object inventory, and local config before/after every allowed probe.

- [ ] **Step 2: Define an allowlisted Git command builder**

```ts
const SAFE_ENV = {
  GIT_OPTIONAL_LOCKS: '0',
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_TERMINAL_PROMPT: '0',
  GIT_EXTERNAL_DIFF: '',
};
```

Use explicit `-c core.hooksPath=NUL`, `-c diff.external=`, `-c core.attributesFile=NUL`, `--no-ext-diff`, and plumbing/read-only commands. Reject fetch, pull, index refresh, checkout, reset, clean, stash, commit, merge, rebase, submodule update, LFS mutation, config writes, and any unknown command.

- [ ] **Step 3: Implement direct filesystem fingerprints**

Hash safe direct bytes for untracked/dirty evidence; record staged, unstaged, untracked, ignored-relevant, submodule, sparse-checkout, LFS pointer, and in-progress operation states without running filters.

- [ ] **Step 4: Prove zero mutation**

Run every safe probe against fixtures containing hooks, external diff, textconv, clean/smudge filters, credentials, submodules, and alternates. Assert the before/after repository snapshot is identical.

- [ ] **Step 5: Run gate and commit**

```powershell
npm test -- --run tests/positive/git-capture.spec.ts tests/negative/git-mutation-guard.spec.ts
npm run typecheck
npm run lint
git add governance/control-plane/w3.05
git commit -m "feat(w3.05): add non-mutating repository capture"
```

### Task 6: Dirty State, Lock, Handoff, and Shared-Resource Capture

**Files:**
- Create: `src/capture/locks.ts`
- Create: `src/capture/handoffs.ts`
- Create: `src/capture/shared-resources.ts`
- Test: `tests/negative/dirty-reconciliation.spec.ts`
- Test: `tests/negative/git-lock.spec.ts`
- Test: `tests/negative/handoff.spec.ts`

**Interfaces:**
- Produces: `DirtyStateRecord`, `GitLockEvidence`, `HandoffRecord`, `SharedResourceRecord`
- Consumes: safe filesystem/Git capture and schemas

- [ ] **Step 1: Write P10-P12 dirty fixture tests**

Model `ADOPT_PRODUCT`, `PRESERVE_EXTERNAL`, `INVALID_FOR_LANE`, and `SHARED_INFRA`; require an entry-level fingerprint/disposition/owner for every dirty path. Any omission returns `DIRTY_UNRECONCILED`.

- [ ] **Step 2: Write active/stale/unverifiable lock tests**

An active or unverifiable `index.lock` must produce `BLOCKED_GIT_LOCK`. The capture adapter records metadata and liveness evidence but exposes no delete operation.

- [ ] **Step 3: Write P05/P09 handoff tests**

Require exact from/to owner, asset set, revision, dirty digest, hazards, acknowledgement, expiry, and supersession. Pending/expired/conflicting records return `HANDOFF_PENDING` or `HANDOFF_EXPIRED`.

- [ ] **Step 4: Implement capture records**

Keep process liveness as evidence only. Shared-resource records use canonical IDs and never grant ownership without live epoch plus lease.

- [ ] **Step 5: Run gate and commit**

```powershell
npm test -- --run tests/negative/dirty-reconciliation.spec.ts tests/negative/git-lock.spec.ts tests/negative/handoff.spec.ts
npm run typecheck
npm run lint
git add governance/control-plane/w3.05
git commit -m "feat(w3.05): capture dirty state locks and handoffs"
```

### Task 7: Single-Host Runtime Lease and Fencing Store

**Files:**
- Create: `src/runtime/lease-types.ts`
- Create: `src/runtime/lease-store.ts`
- Test: `tests/concurrency/lease-store.spec.ts`
- Test: `tests/crash-consistency/lease-recovery.spec.ts`

**Interfaces:**
- Produces: `LeaseStore.acquire()`, `renew()`, `release()`, `assertFence()`
- Consumes: live authority binding and canonical resource IDs

- [ ] **Step 1: Write competing-writer tests**

Start two child processes against the same fixture resource. Exactly one acquires the lease. The other receives `MULTIPLE_WRITERS`; no two valid fencing tokens exist simultaneously.

- [ ] **Step 2: Write stale-token and corruption tests**

Cover expiry, reassignment, token regression, missing store, malformed state, partial atomic replace, clock rollback, epoch/hash change, and owner crash.

- [ ] **Step 3: Implement the Class 3 store**

Default root: `D:\CEREBRO_CONTROL_RUNTIME\w3.05\`, overridden only by an explicit test/runtime argument. Use canonical resource directories, exclusive OS handles, atomic same-directory replacement, durable token increment, TTL/renewal, and epoch/hash binding.

- [ ] **Step 4: Enforce narrowing-only semantics**

`acquire()` requires an already validated live authorization object. It rejects broader scope, new owner, or new resource not present in that authorization.

- [ ] **Step 5: Run gate and commit**

```powershell
npm test -- --run tests/concurrency/lease-store.spec.ts tests/crash-consistency/lease-recovery.spec.ts
npm run typecheck
npm run lint
git add governance/control-plane/w3.05
git commit -m "feat(w3.05): add fail-closed lease fencing"
```

### Task 8: Invariant Engine

**Files:**
- Create: `policies/invariants.yaml`
- Create: `src/validator/invariants.ts`
- Test: `tests/negative/invariants.spec.ts`

**Interfaces:**
- Produces: `evaluateInvariants(context): Finding[]`
- Consumes: authority, registries, captures, leases, attestations

- [ ] **Step 1: Parameterize all 28 invariant tests**

Each invariant receives one positive and one negative fixture. Negative fixtures assert stable reason code, severity, evidence refs, and zero prohibited mutation.

- [ ] **Step 2: Implement pure invariant evaluators**

Invariant functions accept immutable values and have no filesystem, process, network, clock, or random access.

- [ ] **Step 3: Add anti-rollback cases**

Reject lower, duplicate, skipped epochs; wrong `supersedes_epoch`; wrong previous hash; and a previously published epoch number.

- [ ] **Step 4: Run gate and commit**

```powershell
npm test -- --run tests/negative/invariants.spec.ts
npm run typecheck
npm run lint
git add governance/control-plane/w3.05
git commit -m "feat(w3.05): enforce control-plane invariants"
```

### Task 9: Product, Recovery, and Publication State Engines

**Files:**
- Create: `state-machines/product.yaml`
- Create: `state-machines/recovery.yaml`
- Create: `state-machines/publication.yaml`
- Create: `src/validator/state-machines.ts`
- Test: `tests/positive/state-machines.spec.ts`
- Test: `tests/negative/state-machines.spec.ts`

**Interfaces:**
- Produces: `transitionLane(machine, current, next, evidence): TransitionResult`
- Consumes: findings and schema-valid evidence

- [ ] **Step 1: Write table-driven transition tests**

Cover every allowed edge, every exceptional state, attempted skipped gates, self-cleared blockers, recovery remote-attestation bypass, and publication after CAS conflict.

- [ ] **Step 2: Implement declarative state loading**

Validate machine YAML and map each edge to required evidence predicates. `BLOCKED`, `FAILED`, and `CAS_CONFLICT` require a fresh run or explicit resume record.

- [ ] **Step 3: Run gate and commit**

```powershell
npm test -- --run tests/positive/state-machines.spec.ts tests/negative/state-machines.spec.ts
npm run typecheck
npm run lint
git add governance/control-plane/w3.05
git commit -m "feat(w3.05): add lane state engines"
```

### Task 10: Read-Only GitHub CI Attestation

**Files:**
- Create: `src/capture/github.ts`
- Test: `tests/positive/github-attestation.spec.ts`
- Test: `tests/negative/github-attestation.spec.ts`

**Interfaces:**
- Produces: `GithubAttestor.attest(request): Promise<CiAttestation>`
- Consumes: canonical repository identity, full SHA, approved refs, expected-check policy

- [ ] **Step 1: Write mocked API fixtures**

Cover exact commit in canonical repository, commit only in fork, absent commit, unapproved reachability, PR/check SHA mismatch, stale evidence, missing/skipped required checks, GitHub unavailable, and insufficient authentication.

- [ ] **Step 2: Bind expected-check policy provenance**

Require source type, policy/ruleset ID, canonical policy digest, capture timestamp/freshness, and required check identities. Green observed checks without authoritative expected policy return `REQUIRED_CHECK_POLICY_MISSING`.

- [ ] **Step 3: Implement read-only API adapter**

Use dependency-injected `fetch`; never fetch Git objects or mutate remote-tracking refs. Record immutable repository ID, normalized URL, full object/tree/parents, reachability, PR/check/run IDs, status, conclusion, artifacts, and freshness.

- [ ] **Step 4: Reproduce F16 false-green fixture**

Model PR #52 at `79f2a9d2...` and candidate `34245c65...` without candidate-bound checks. Assert `MACHINE_GREEN_FALSE` and `BLOCKED_REMOTE_ATTESTATION`.

- [ ] **Step 5: Run gate and commit**

```powershell
npm test -- --run tests/positive/github-attestation.spec.ts tests/negative/github-attestation.spec.ts
npm run typecheck
npm run lint
git add governance/control-plane/w3.05
git commit -m "feat(w3.05): attest exact-sha remote CI policy"
```

### Task 11: Deterministic Epoch Proposal Generator

**Files:**
- Create: `src/proposal/generator.ts`
- Create: `src/cli/propose.ts`
- Test: `tests/positive/proposal-generator.spec.ts`
- Test: `tests/negative/proposal-generator.spec.ts`
- Test: `tests/determinism/proposal-bytes.spec.ts`

**Interfaces:**
- Produces: `generateProposal(inputs): EpochProposalArtifact`
- Consumes: one authority snapshot, registries, validation manifest, explicit decisions

- [ ] **Step 1: Write anti-rollback generator tests**

Require `proposed_epoch = live_epoch + 1`, exact `supersedes_epoch`, and exact previous byte hash. Reject lower, duplicate, skipped, stale, or previously published epochs.

- [ ] **Step 2: Write incomplete-lane tests**

P05/P09 pending handoff, unresolved P10-P12 dirty entries, P12 lock, missing verifier, unowned shared infrastructure, and false-green F16 must remain blocking or frozen rather than becoming write-authorized.

- [ ] **Step 3: Implement pure deterministic generation**

The generator accepts only validated immutable inputs, emits `NON_AUTHORITATIVE_PROPOSAL`, sorts set-like records by stable IDs, and returns canonical bytes plus SHA-256. It has no publication import or live-file writer.

- [ ] **Step 4: Prove determinism**

Run fixtures with shuffled input order, locales, timezones, temporary roots, and different volatile diagnostics. Assert identical portable proposal bytes/hash.

- [ ] **Step 5: Run gate and commit**

```powershell
npm test -- --run tests/positive/proposal-generator.spec.ts tests/negative/proposal-generator.spec.ts tests/determinism/proposal-bytes.spec.ts
npm run typecheck
npm run lint
git add governance/control-plane/w3.05
git commit -m "feat(w3.05): generate deterministic epoch proposals"
```

### Task 12: Independent Proposal Verifier

**Files:**
- Create: `src/proposal/verifier.ts`
- Create: `src/cli/verify.ts`
- Test: `tests/positive/proposal-verifier.spec.ts`
- Test: `tests/negative/proposal-verifier.spec.ts`

**Interfaces:**
- Produces: `EPOCH_41_PROPOSAL_VALID` or `EPOCH_41_PROPOSAL_REJECTED`
- Consumes: proposal artifact, fresh independently captured state, verifier identity/lease

- [ ] **Step 1: Write identity-separation test**

Reject a verifier whose ID equals the proposal builder or whose lease does not authorize read-only verification.

- [ ] **Step 2: Write fresh-state mismatch tests**

Reject changed epoch/hash, branch, HEAD, dirty fingerprint, lock, handoff, scope, shared-infra owner, required-check policy, or remote attestation.

- [ ] **Step 3: Implement independent verification**

Do not reuse the builder's capture objects as facts. Re-capture through read-only adapters, compare canonical digests, evaluate invariants/state machines, and emit a deterministic verdict artifact.

- [ ] **Step 4: Run gate and commit**

```powershell
npm test -- --run tests/positive/proposal-verifier.spec.ts tests/negative/proposal-verifier.spec.ts
npm run typecheck
npm run lint
git add governance/control-plane/w3.05
git commit -m "feat(w3.05): independently verify epoch proposals"
```

### Task 13: Publication Receipt Model

**Files:**
- Create: `src/publication/receipt.ts`
- Test: `tests/positive/publication-receipt.spec.ts`
- Test: `tests/negative/publication-receipt.spec.ts`
- Test: `tests/determinism/publication-receipt.spec.ts`

**Interfaces:**
- Produces: `buildReceipt()`, `verifyReceipt()`, `verifyReceiptChain()`
- Consumes: exact live/proposed/published epoch identities, proposal digest, publisher/fencing identity, validation-manifest digest, independent-verifier verdict digest, publication result, predecessor receipt, and post-publication verification

- [ ] **Step 1: Write receipt-chain tests first**

Cover a valid genesis/continuation chain plus deletion, substitution, reordering, duplicate sequence, predecessor mismatch, previous/proposed/published hash mismatch, changed verifier digest, stale fencing token, and missing post-publication verification.

- [ ] **Step 2: Implement the 13th schema as a typed model**

Load `publication-receipt.schema.json` through the common strict registry. Reject additional properties, abbreviated hashes, non-monotonic epochs, missing predecessor identity, and receipt data that is not labeled Class 2 deterministic evidence.

- [ ] **Step 3: Implement canonical construction and chain verification**

Construct receipts only from validated typed inputs. Canonically serialize and hash each receipt; require every non-genesis receipt to bind the exact predecessor digest so deletion, substitution, and reordering are detectable.

- [ ] **Step 4: Run gate and commit**

```powershell
npm test -- --run tests/positive/publication-receipt.spec.ts tests/negative/publication-receipt.spec.ts tests/determinism/publication-receipt.spec.ts
npm run typecheck
npm run lint
git add governance/control-plane/w3.05
git commit -m "feat(w3.05): add publication receipt chain"
```

### Task 14: Disabled CAS Publisher

**Files:**
- Create: `policies/publication.yaml`
- Create: `src/publication/publisher.ts`
- Create: `src/cli/publish.ts`
- Test: `tests/negative/publication-disabled.spec.ts`
- Test: `tests/crash-consistency/publication.spec.ts`

**Interfaces:**
- Produces later: `Publisher.publish()` and receipt
- Consumes later: valid proposal/verdict, publication lease, live CAS snapshot

- [ ] **Step 1: Write denial tests before implementation**

Without both compile-time capability and runtime governor token, every publish invocation returns nonzero `PUBLICATION_NOT_AUTHORIZED` before opening the live file for write.

- [ ] **Step 2: Implement injectable publication adapter**

Default production construction has no write adapter. Tests inject a fixture-only same-directory atomic replace adapter. Windows behavior must never delete-then-rename.

- [ ] **Step 3: Implement CAS and receipt preconditions**

Revalidate path identity, live epoch/hash, monotonic/supersession rules, receipt-chain head, verifier digest, and publication fencing token immediately before fixture replacement.

- [ ] **Step 4: Test crash points**

Inject crashes before temporary write, after flush, before replace, after replace/before receipt, and after receipt/before verification. Assert no partial visible file, idempotent recovery, and no overwrite of new external state.

- [ ] **Step 5: Run gate and commit**

```powershell
npm test -- --run tests/negative/publication-disabled.spec.ts tests/crash-consistency/publication.spec.ts
npm run typecheck
npm run lint
git add governance/control-plane/w3.05
git commit -m "feat(w3.05): add disabled CAS publication engine"
```

### Task 15: Integrated Quality and Failure-Injection Gates

**Files:**
- Create/update: all files under `tests/positive/`, `tests/negative/`, `tests/determinism/`, `tests/concurrency/`, and `tests/crash-consistency/`
- Create: `tests/helpers/no-mutation-assertion.ts`
- Create: `tests/helpers/fixture-repository.ts`

**Interfaces:**
- Produces: complete W3.05 bootstrap verification evidence
- Consumes: Tasks 1-14

- [ ] **Step 1: Implement all 46 specification negative controls**

Use a table mapping each numbered control to fixture, expected reason code, expected severity, and no-mutation assertion. Missing cases fail the coverage test.

- [ ] **Step 2: Add positive mirrors**

Every rejection category gets a corresponding valid state: unique writer, separate verifier, exact scope, reconciled dirt, stable HEAD, no lock, authorized shared infra, complete attestation, monotonic epoch, valid lease, and valid receipt chain.

- [ ] **Step 3: Add concurrency and crash matrix**

Run lease contention and publication crash fixtures repeatedly with deterministic seeds. No flaky retry or time-based sleep is accepted; synchronize with explicit barriers.

- [ ] **Step 4: Add full package gate**

```powershell
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm ci
git diff --exit-code -- package.json package-lock.json
```

Expected: all exit `0`, exactly 46 numbered negative controls discovered once, package-local lockfile idempotent, and no root/shared file changes.

- [ ] **Step 5: Independent code review and commit**

The implementation verifier reviews source/diff and test mapping before:

```powershell
git add governance/control-plane/w3.05
git commit -m "test(w3.05): prove fail-closed control-plane behavior"
```

### Task 16: Epoch 40 Migration Fixture

**Files:**
- Create: `tests/fixtures/epoch40/live-control.yaml`
- Create: `tests/fixtures/epoch40/registries/*.json`
- Create: `tests/fixtures/epoch40/evidence/*.json`
- Create: `tests/fixtures/epoch40/README.md`
- Test: `tests/positive/epoch40-migration.spec.ts`

**Interfaces:**
- Produces: redacted, deterministic `NON_AUTHORITATIVE_TEST_FIXTURE` baseline
- Consumes: freshly captured Epoch 40 facts after authorization to record fixtures

- [ ] **Step 1: Capture only approved/redacted evidence**

Bind the exact Epoch 40 byte digest and model P05/P09 handoff pending, P10-P12 external dirt, P12 unresolved lock, P02/P48 release, P13-P15 gates, P16-P18 absence, and F16 remote-attestation gap. Do not include secrets or mutable live files.

- [ ] **Step 2: Mark fixture authority explicitly**

Every fixture includes `authority: NON_AUTHORITATIVE_TEST_FIXTURE`, source digest, redaction result, and freshness limitation.

- [ ] **Step 3: Assert migration produces no write lanes**

Until handoffs/contracts/lock/attestation are resolved, the migration result must preserve blocking/frozen states and cannot infer Codex takeover.

- [ ] **Step 4: Run gate and commit**

```powershell
npm test -- --run tests/positive/epoch40-migration.spec.ts
npm run typecheck
npm run lint
git add governance/control-plane/w3.05
git commit -m "test(w3.05): add redacted epoch 40 migration fixture"
```

### Task 17: Generate and Independently Validate an Unpublished Epoch 41 Proposal

**Files:**
- Generate: authorized Class 2 evidence location, `epoch-41.proposal.yaml`
- Generate: same location, `epoch-41.run-manifest.json`
- Generate: same location, `epoch-41.verdict.json`
- Do not write: `D:\CEREBRO_PRODUCT_WORKTREES\CONTROL\ACTIVE_BRANCH_OWNERS.yaml`

**Interfaces:**
- Produces: proposal, manifest, and independent verdict artifacts
- Consumes: implemented toolchain, fresh live capture, approved registries/decisions

- [ ] **Step 1: Re-handshake live authority and implementation lease**

Stop if epoch/hash, implementation branch/worktree, or any registry/evidence input changed.

- [ ] **Step 2: Run read-only validation**

```powershell
npm run validate -- --control D:\CEREBRO_PRODUCT_WORKTREES\CONTROL\ACTIVE_BRANCH_OWNERS.yaml
```

Expected: blockers accurately reported; no live/worktree/Git mutation.

- [ ] **Step 3: Generate the proposal into an authorized evidence directory**

```powershell
npm run propose -- --control D:\CEREBRO_PRODUCT_WORKTREES\CONTROL\ACTIVE_BRANCH_OWNERS.yaml --mode PROPOSAL_ONLY
```

Expected: `NON_AUTHORITATIVE_PROPOSAL`; lower/duplicate/skipped epochs impossible; live file unchanged.

- [ ] **Step 4: Dispatch a different verifier agent**

The verifier independently captures state and runs:

```powershell
npm run verify-proposal -- --proposal <epoch-41.proposal.yaml>
```

Expected: `EPOCH_41_PROPOSAL_VALID` only if every required contract/handoff/lock/CI condition is genuinely satisfied; otherwise deterministic rejection.

- [ ] **Step 5: Re-run determinism and no-mutation proofs**

Generate twice from identical stable inputs and compare hashes. Recheck live control bytes, product/recovery statuses, Git refs/index/config/object inventories, and quarantine state.

- [ ] **Step 6: Stop before publication**

Do not invoke `publish`. Report proposal/verdict digests and blockers to the human/Portfolio Governor. `Epoch 41 published` must remain false.

## Implementation Review Gates

- **Gate A — Tasks 1-3:** schemas, canonicalization, and deterministic manifest independently reviewed.
- **Gate B — Tasks 4-6:** authority/Git/filesystem capture proves zero mutation.
- **Gate C — Tasks 7-9:** leases, invariants, and state machines pass concurrency and transition tests.
- **Gate D — Tasks 10-12:** CI attestation, proposal generation, and independent verification pass exact-SHA and determinism tests.
- **Gate E — Tasks 13-15:** receipt chain is valid, publisher remains disabled, and all 46 negative controls plus crash/concurrency gates pass.
- **Gate F — Tasks 16-17:** redacted migration fixture and unpublished proposal independently verified; live Epoch 40 unchanged.

## Final Completion Evidence

Implementation is complete only when:

1. The authorized W3.05 branch contains only `governance/control-plane/w3.05/**` commits.
2. Package-local `npm ci`, typecheck, lint, test, and build pass from a clean checkout.
3. All 13 schemas compile and positive/negative fixtures validate correctly.
4. All 28 invariants and 46 numbered negative controls are covered.
5. Safe Git validation proves no HEAD/index/ref/worktree/object/config mutation.
6. Deterministic artifacts are byte-identical for identical stable inputs.
7. Independent proposal verification uses a different agent and fresh capture.
8. Publication remains disabled and live Epoch 40 bytes/hash are unchanged.
