# Task Tracker: Milestone 25.1 - Enterprise Release Management

## Phase 1: Immutable Versions & Canonical Hashing
- `[x]` Introduce `Workflow.lock` with comprehensive environment & runtime metadata
- `[x]` Implement `CanonicalHasher` to hash normalized ASTs (tamper-evident identity)
- `[x]` Define robust Supply-Chain `Provenance` models (Signatures, Roles, SBOM)

## Phase 2: Releases & Promotions
- `[x]` Scaffold `WorkflowRelease` model (mutable deployment envelope around immutable version)
- `[x]` Implement Environment Promotion (`Dev` -> `QA` -> `Prod`)
- `[x]` Implement Promotion-Based Rollback (Append-only history)
- `[x]` Implement Progressive Delivery strategies (Canary, Blue/Green, Shadow) delegating networking to the Gateway

## Phase 3: Release Manager Orchestration
- `[x]` Scaffold `ReleaseManager` and its decoupled services (`PromotionService`, `DeploymentService`, etc.)
- `[x]` Implement `ReleaseNotesService` with layered risk/security analysis
- `[x]` Delegate Approval Enforcements to the `PolicyAdapter` (OPA)
