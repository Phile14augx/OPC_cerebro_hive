# Runtime Validation Checklist (M25 Epic 1)

Run this once, locally, before trusting anything M25 adds on top of it. I (the
assistant) cannot execute this myself: there is no working `pnpm install` in
my sandbox (it hits an EPERM on this mounted drive, twice now), no live
database, and I shouldn't spend API credits autonomously. Everything below
needs a human, in a real environment, actually running it.

## Prerequisites

- [ ] `pnpm install` completes without error.
- [ ] `pnpm typecheck --filter @cerebro/agent-builder-capability --filter @cerebro/platform-api --filter @cerebro/runtime-core` passes.
- [ ] Postgres is running and migrated, so `Agent`/`AgentVersion`/`AgentConversation`/`AgentMessage` tables exist.
- [ ] `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` is set in the environment `apps/platform-api` runs with.

## Automated

- [ ] `pnpm --filter @cerebro/runtime-core test` passes — `RuntimeRegistry` resolution, priority, fallback, constraints, duplicate-registration guard.
- [ ] `pnpm --filter @cerebro/agent-builder-capability test` passes — `AgentRuntimeService` loop, system-prompt/history threading, cancellation, safety check.
- [ ] `pnpm --filter @cerebro/platform-api test` passes — `AIGatewayLLMProvider` request mapping, streaming, error propagation, `computeHealthFromGateway`'s CLOSED/OPEN/HALF_OPEN mapping, `ToolRuntimeToolProvider` delegation.

## Manual — start the server

- [ ] `pnpm --filter @cerebro/platform-api dev` starts without throwing. Note: `RuntimeRegistry` is a process-wide singleton with a duplicate-registration guard — if you rely on `tsx watch`'s hot-reload rather than a full restart and still hit an "already registered" error, restart the process instead of trusting the reload.
- [ ] `./apps/platform-api/scripts/smoke-test.sh` passes end to end.

## Manual — confirm it's real, not mocked

- [ ] The response text is **not** "This is a mock LLM response based on the capability architecture." (that's `MockLLMProvider` — seeing it means `AIGateway-LLM` isn't registering or resolving as intended; check priority and health in `RuntimeRegistry`).
- [ ] The response is coherent and actually relevant to the prompt sent — a human judgment call, not automatable.
- [ ] Revoke/invalidate the API key and re-run the smoke test. It should fail loudly with a real provider error, not silently succeed (silent success would mean it's still hitting the mock).

## Known limitations going in (not blockers — expected)

- No conversation persistence yet (M10.4) — the smoke test's message is stateless; a second message won't remember the first.
- Tool-calling is still hardcoded off (`needsTool` always false) — nothing here exercises an actual tool call end-to-end yet, even though `ToolRuntimeToolProvider` is now registered.
- `apps/studio`'s own tool system (`apps/studio/platform/src/domains/runtime/tools.ts`, e.g. `CalculatorTool`/`CatalogTool`) and its Python `agentos` service are untouched by any of this — this checklist is scoped to `apps/platform-api`'s conversation path only.

## Log the result

- [ ] Paste the smoke test's actual output somewhere durable (this file, a PR description) so "known issues" has a paper trail instead of living in someone's memory.

## Known issues found

_(fill in after running)_
