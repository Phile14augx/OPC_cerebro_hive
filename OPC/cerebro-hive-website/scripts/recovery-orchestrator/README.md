# Cerebro Nexarch Recovery Orchestrator v0.1

A bounded, evidence-first control loop that removes manual copy/paste between the Qwen recovery governor and the repository executor.

## Why this is under `scripts/`

W0.2 is still active. Creating a new pnpm service would expand the workspace and lockfile surface during CI recovery. This v0.1 therefore lives in the existing workspace root as recovery tooling. After W0.2/W0.3 closure it can be promoted to `services/recovery-orchestrator` with durable PostgreSQL persistence and a web UI.

## Control plane

```text
Qwen Governor
   ↓ typed GovernorDecision
Protocol validation
   ↓
Recovery policy engine
   ↓ typed ExecutionOrder
Laguna HTTP bridge OR local mechanical executor
   ↓ typed ExecutionResult
Git before/after guard
   ↓
Immutable evidence + SHA-256 manifest
   ↓
Append-only recovery ledger
   ↓
Qwen Governor
```

Qwen owns decisions. The executor owns mechanics only. The orchestrator owns transport, validation, state, policy, evidence and safety.

## Safety properties

- Commands are structured `{ exe, args, cwd? }`; no free-form shell pipelines.
- `READ_ONLY` orders reject mutating Git subcommands.
- `git reset`, `git clean`, checkout/switch, rebase, worktree removal/prune and force-push are blocked.
- Push is disabled unless `RECOVERY_ALLOW_PUSH=true`.
- Before/after HEAD, branch and porcelain status are captured for every action.
- Any mutation during a `READ_ONLY` action freezes recovery as `UNAUTHORIZED_RECOVERY_MUTATION`.
- Write/verify actions are checked against `allowedPaths` / `forbiddenPaths` after execution.
- Evidence is written with `flag: wx` and never overwritten.
- The ledger is JSONL append-only.

## Qwen API

The governor adapter expects an OpenAI-compatible chat-completions endpoint. No vendor URL is hard-coded.

Required environment variables:

```powershell
$env:QWEN_BASE_URL = "<openai-compatible-qwen-base-url>"
$env:QWEN_API_KEY = "<key>"
$env:QWEN_MODEL = "<model-name>"
```

The model is instructed to return one JSON `GovernorDecision` only.

## Executor modes

### 1. Local mechanical executor

This is the default and requires no Laguna API. It runs structured commands directly with `shell:false`.

```powershell
$env:RECOVERY_EXECUTOR = "local"
```

This is the fastest way to remove manual switching while keeping Qwen as governor.

### 2. Laguna HTTP bridge

If Laguna exposes an execution endpoint, configure:

```powershell
$env:RECOVERY_EXECUTOR = "http"
$env:LAGUNA_EXECUTE_URL = "http://127.0.0.1:<port>/execute"
$env:LAGUNA_API_KEY = "<optional-token>"
```

The endpoint must accept an `ExecutionOrder` JSON body and return an `ExecutionResult` JSON body. The orchestrator does not assume a Laguna-specific API shape beyond that contract.

## Repository / state

```powershell
$env:RECOVERY_REPOSITORY = 'D:\{MY_PROJECTS}\{OPC_cerebro_hive}'
$env:RECOVERY_STATE_DIR = 'D:\CEREBRO_RECOVERY_ORCHESTRATOR'
$env:RECOVERY_WAVE = 'W0.2'
$env:RECOVERY_BASE_SHA = 'f5db3c622988edf91d69f5617fe603e93e5f2e1d'
```

State is deliberately outside the Git repository by default.

## Run one governor/executor cycle

From `OPC/cerebro-hive-website`:

```powershell
node scripts/recovery-orchestrator/cli.mjs --once
```

Run continuously until a blocker/closure/freeze condition:

```powershell
node scripts/recovery-orchestrator/cli.mjs
```

## Tests

No new package or dependency is required:

```powershell
node --test scripts/recovery-orchestrator/orchestrator.test.mjs
```

## Protocol summary

Governor decisions contain:

- `decisionId`
- `wave`
- `decision`
- `canonicalBaseSha`
- `verifiedFacts`
- `conflicts`
- `unknowns`
- `writeAuthorized`
- optional `nextAction`

Execution orders contain:

- `actionId`
- `mode`: `READ_ONLY | VERIFY | WRITE | PUSH`
- `repository`
- structured `commands`
- `allowedPaths`
- `forbiddenPaths`
- `acceptanceCriteria`
- `stopConditions`

## v0.1 boundary

Implemented now:

- Qwen governor adapter
- local executor
- generic Laguna HTTP executor adapter
- structured protocol validation
- policy engine
- Git integrity guard
- evidence store + SHA-256 manifest
- append-only recovery ledger
- automatic Qwen → executor → Qwen loop
- freeze-on-unauthorized-mutation
- tests for core safety rules

Deferred until after current recovery gates:

- PostgreSQL ledger
- WebSocket/SSE dashboard
- GitHub API adapter inside the orchestrator
- multi-governor critic quorum
- signed approvals
- production deployment controls
- full neural-brain UI integration

## Recommended rollout

Start in `--once` mode with `RECOVERY_EXECUTOR=local` and `RECOVERY_ALLOW_PUSH=false`. Let Qwen automate read-only evidence and verification first. Enable bounded writes only after the protocol output has been observed and the path guard is confirmed on the local checkout. Keep merge, destructive migration, branch/worktree deletion and production deployment behind human approval.
