# Live AWS Endpoint Investigation

**Status:** Factual findings from static repo inspection. The one fact this can't resolve — who actually owns/deployed it — is asked of you directly below, not inferred.

## What exists

`infra/aws/` is a real, self-contained AWS CDK v2 app (`@cerebro/infra-aws`, `aws-cdk-lib ^2.170.0`), not a stray config file:

- `infra/aws/lib/cerebro-review-stack.ts` — defines `CerebroHiveReviewStack`: DynamoDB table (`cerebro-engineering-reviews`, on-demand, 3 GSIs matching `DynamoDBEngineeringReviewRepository` exactly), an S3 bucket (`cerebro-evidence-store-${account}`, versioned, encrypted), an SNS topic (`cerebro-review-events`) fanned out to an SQS queue with a DLQ, a single Lambda (`cerebro-review-api`, Node 20, 128MB) running `packages/engineering-review/src/infrastructure/api/handler.ts` directly, a Cognito user pool (`cerebro-users`, self-signup disabled, comment: "Internal enterprise app") + SPA client, and an API Gateway REST API with a Cognito authorizer on every route.
- `infra/aws/lib/app.ts` — instantiates the stack in `ap-south-1` ("lowest latency from India, Free Tier applies globally").
- `infra/aws/verify.ts` — an integration-verification script that hardcodes: region `ap-south-1`, table `cerebro-engineering-reviews`, bucket `cerebro-evidence-store-020811135146`, SNS ARN `arn:aws:sns:ap-south-1:020811135146:cerebro-review-events`. Account ID `020811135146` appears directly.
- `infra/aws/cdk.out/` is checked into the repository — `manifest.json`, `tree.json`, `CerebroHiveReviewStack.template.json`, `CerebroHiveReviewStack.assets.json`. This is synthesized CDK output, which is not something `cdk synth` produces unless someone actually ran it (and `cdk.out` being committed at all is itself unusual — it's normally gitignored, so either the gitignore doesn't cover it or it was added deliberately).
- `infra/aws/package.json` has real `synth`/`deploy`/`destroy` npm scripts wrapping `cdk synth`/`cdk deploy`/`cdk destroy` — a working, one-command deploy path exists.

**Stack comments describe every resource as deliberately sized for AWS Free Tier** (on-demand DynamoDB, 128MB Lambda, S3 Standard, SNS/SQS free-forever tiers) — language consistent with an individual/personal AWS account, not obviously a shared corporate account, though that's an inference from tone, not a fact I can confirm from the repo alone.

**No CI/CD automation deploys this.** Searched `.github/` for any workflow referencing `infra/aws`, `cdk deploy`, or the stack name — none found. Whatever exists was deployed by someone running `cdk deploy` from their own machine, not by a pipeline.

**No ownership record anywhere in `audit/`.** Confirmed again here: no PRD, ADR, or discovery note mentions `infra/aws`, the account ID, or this endpoint.

**The region match is a strong, specific corroborating signal.** Studio's hardcoded fallback (`vtbrbb44kd.execute-api.ap-south-1.amazonaws.com`) is in `ap-south-1` — the exact region this stack deploys to, and a specific enough choice (not `us-east-1` default) that it's very unlikely to be coincidental. This is almost certainly the same deployment `infra/aws` produces, not an unrelated endpoint.

**What I could not check:** who ran `cdk deploy`, or when. The sandbox's mounted copy of this repository has no Git history at all (`git log` fails with "not a git repository" here — consistent with what was established earlier this session: real Git history for this project only exists on your machine, not in this working copy). That question is yours to answer, not something static inspection resolves.

## What this doesn't answer (yours to decide)

1. Is AWS account `020811135146` yours / your team's, or unknown to you?
2. Is this deployment meant to keep running (dev/shared-integration/production), or was it a one-off you'd be fine tearing down?
3. Going forward, how should Studio obtain this URL — env var, Secrets Manager/Parameter Store, or something else — rather than the checked-in constant it uses today?

## Ownership — resolved, 2026-07-29

Confirmed directly by you: AWS account `020811135146` is yours. Lifecycle: **dev/shared integration** — a working non-production environment, expected to change frequently, while the real M26.2 design proceeds. Not a disposable PoC (don't `cdk destroy` it casually), not production (no production governance/SLA expectations apply to it as-is).

**Runtime verification, 2026-07-29:** You ran `infra/aws/verify.ts` directly against the real deployment (account `020811135146`, `ap-south-1`) and pasted raw output: S3 evidence blob store/retrieve succeeded, DynamoDB aggregate save/load/rehydrate and the `findByWorkflow` GSI query all succeeded, and the SNS `EngineeringReviewPublished` event published successfully. This is the first real, end-to-end confirmation that `DynamoDBEngineeringReviewRepository`, `S3EvidenceStore`, and `SNSReviewEventPublisher` actually work against live infrastructure, not just against `InMemoryEngineeringReviewRepository` in unit tests.

**Consequence for the M26.2 ADR (task #74):** the *configuration mechanism* is the architectural decision, not this URL. The ADR must specify how Studio obtains the API endpoint going forward (env var / Secrets Manager / Parameter Store — not a checked-in constant) and must not embed `vtbrbb44kd.execute-api.ap-south-1.amazonaws.com` itself as a canonical value in the ADR text. That constant in `apps/studio/lib/config/api.ts` is exactly the prototype shortcut task #78 (cleanup) will replace once the mechanism is decided.
