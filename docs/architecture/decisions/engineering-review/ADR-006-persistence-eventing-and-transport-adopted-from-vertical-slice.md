# ADR-006: Persistence, eventing, and transport layer adopted from the discovered vertical slice

**Status:** Accepted

## Context

`audit/ARCHITECTURAL-REVIEW-UNPLANNED-VERTICAL-SLICE.md` documents that a real DynamoDB/S3/SNS persistence and eventing layer, a Lambda/API Gateway REST API, and a hand-rolled API client were built on top of the M26.1 baseline without a preceding PRD or ADR. `audit/M26.2-VERTICAL-SLICE-RECONCILIATION.md` classified each component against the existing ADRs and architecture docs. This ADR is the formal acceptance that classification recommended, per your decision to adopt (not archive) the slice, with named fixes rather than blanket acceptance.

`audit/M26.1-ARCHITECTURE-05-PERSISTENCE-MODEL.md` had already specified the shape this needed to take — an Operational Store plus an Immutable Evidence Store, aggregate persistence via `save`/`load`/`findLatest`/`findByWorkflow`/`findByManifest`/`findByVerdict` — without picking a technology. `audit/M26.2-M26.3-DISCOVERY-NOTES.md` had left the API/transport layer's audience, versioning, and sync-vs-async questions explicitly open. This ADR closes those gaps using what was actually built, since it was checked against the architecture and found sound.

The infrastructure is real and running: `infra/aws` is a working CDK app (`CerebroHiveReviewStack`) deployed to AWS account `020811135146` (confirmed as yours, `audit/LIVE-ENDPOINT-INVESTIGATION.md`), region `ap-south-1`, on a dev/shared-integration lifecycle — not a disposable PoC, not production.

## Decision

**Persistence.** `DynamoDBEngineeringReviewRepository` is adopted unchanged as the `IEngineeringReviewRepository` implementation — it already matches `ARCHITECTURE-05`'s specified method set and GSI-backed query shape exactly. `S3EvidenceStore` is adopted as the Immutable Evidence Store, keyed by `EvidenceReferenceId`, consistent with the aggregate owning evidence *identity* rather than evidence *storage*. Its docstring's reference to a nonexistent "M26.1 ADR-007" is corrected by this ADR's existence — this is that ADR.

**Eventing.** `SNSReviewEventPublisher` is adopted as the mechanism for `EngineeringReviewPublished`/`EngineeringReviewStale` integration events, fanned out via SNS→SQS (with a dead-letter queue) per `infra/aws/lib/cerebro-review-stack.ts`. Its docstring's claim that "the M27 Evidence Warehouse subscribes to this topic" is false as written — no M27 design, PRD, or implementation exists anywhere in this repository — and must be corrected (task #78) to describe the topic as a general-purpose integration event mechanism with no confirmed subscriber yet, not a bridge to a system that doesn't exist.

**Transport.** REST via API Gateway + a single Lambda handler (`packages/engineering-review/src/infrastructure/api/handler.ts`) is adopted as the canonical integration surface for Engineering Review data, authorized via the Cognito user pool already provisioned in the stack. This resolves the audience/sync-vs-async questions the discovery notes left open: synchronous request/response REST, audience is Studio first (per the discovery notes' own recommendation), with CLI/automation/IDE consumers a possible but undesigned future audience — the API shape is not to be contorted for them now.

**API client.** `@cerebro/api-client`'s hand-rolled, `fetch`-based `EngineeringReviewClient` is adopted as the transport client, rather than replaced with a generated-from-OpenAPI client. Rationale: the hand-rolled client already works and is wired into Studio; discarding working code to generate a client from a document that was produced *after* the client, by the same effort, isn't a clear improvement. Instead, the OpenAPI document (`packages/api-client`'s `zod-to-openapi` generator) is adopted as a **contract-verification artifact**: CI should validate the hand-rolled client's request/response shapes against the generated OpenAPI document so the two cannot silently drift apart. Revisiting a fully generated client is worth doing if/when this API grows a second consumer with different tooling needs (e.g., a CLI) — not now, for one consumer.

**Studio data layer.** React Query is adopted as Studio's data-fetching/cache layer for this feature, per the existing `useReviews.ts` hooks.

**Configuration.** The checked-in constant in `apps/studio/lib/config/api.ts` is **not** adopted as-is — that's the prototype shortcut, not the architecture. `NEXT_PUBLIC_API_URL` is the required configuration mechanism: `api.ts` now throws at module load if it isn't set, unconditionally — no checked-in fallback of any kind, for local dev or otherwise. Every environment that runs Studio, including local development, must set this variable explicitly. If/when this moves to a production-managed lifecycle, this ADR should be revisited to move the value into Secrets Manager/Parameter Store with runtime resolution rather than a build-time env var — that migration is not done now, because the current dev/shared-integration tier doesn't warrant it.

**Authentication.** Cognito (`cerebro-users` user pool, SPA client, self-signup disabled) is adopted as the auth provider for Studio → API calls, matching what's already provisioned and what `apps/studio/lib/config/api.ts`'s `cognitoProvider` already assumes.

## Consequences

- `S3EvidenceStore.ts` and `SNSReviewEventPublisher.ts` docstrings must be corrected (task #78) to cite this ADR and to stop asserting integrations (ADR-007, M27) that don't exist.
- `apps/studio/lib/config/api.ts` must be changed (task #78) to read the endpoint from environment configuration, with the current hardcoded URL demoted to a clearly-labeled local-dev fallback, not the production/shared-integration path.
- A CI check comparing the hand-rolled client against the generated OpenAPI document does not exist yet and is new scope this ADR creates, not something already built — tracked as follow-up, not blocking the rest of this ADR's adoption.
- This ADR does not cover the contributor/extension-framework side of the vertical slice (the two competing `IReviewContributor` interfaces, the four stub agents) — that is ADR-007 / M26.3, built on the reconciliation in `audit/M26.3-CONTRIBUTOR-INTERFACE-RECONCILIATION.md`.
- This ADR does not change this deployment's lifecycle classification (dev/shared-integration) — it accepts the architecture the deployment implements, not a promotion of the deployment itself to production status.
