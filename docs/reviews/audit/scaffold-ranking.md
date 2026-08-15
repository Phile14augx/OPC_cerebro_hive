| Unit | Scaffold Hits | Examples |
|---|---|---|
| apps/studio | 421 | apps/studio/app/(auth)/login/page.tsx; apps/studio/app/(auth)/register/page.tsx; apps/studio/app/(platform)/app/components/ui/CommandPalette.tsx |
| apps/platform | 33 | apps/platform/scratch_m23_typing.js; apps/platform/scratch_scaffold_frontend.js; apps/platform/src/app/knowledge-graph/page.tsx |
| apps/platform-api | 22 | apps/platform-api/src/bootstrap.ts; apps/platform-api/src/modules/conversations/conversations.routes.ts; apps/platform-api/src/modules/runtime/providers/AIGatewayProviders.test.ts |
| packages/db | 12 | packages/db/src/generated/client/index-browser.js; packages/db/src/generated/client/runtime/edge-esm.js; packages/db/src/generated/client/runtime/edge.js |
| packages/change-core | 10 | packages/change-core/src/integrations/AssetProvider.ts; packages/change-core/src/integrations/PolicyProvider.ts; packages/change-core/src/integrations/ResilienceProvider.ts |
| packages/ai-governance-core | 9 | packages/ai-governance-core/src/integrations/Providers.ts; packages/ai-governance-core/src/test-ai-governance.ts |
| packages/federation-core | 8 | packages/federation-core/src/providers/FederationProvider.ts; packages/federation-core/src/test-federation.ts |
| apps/forge | 7 | apps/forge/app/components/page.tsx; apps/forge/app/layout.tsx; apps/forge/app/page.tsx |
| packages/aiops-core | 6 | packages/aiops-core/src/adapters/MockRunbookProvider.ts; packages/aiops-core/src/engine/AIOpsOrchestrator.ts; packages/aiops-core/src/index.ts |
| packages/privacy-core | 6 | packages/privacy-core/src/enforcement/PrivacyPolicyEngine.ts; packages/privacy-core/src/test-privacy.ts |
| packages/ai | 5 | packages/ai/src/factory.ts; packages/ai/src/forge/prompts.ts; packages/ai/src/providers/mock.provider.ts |
| packages/runtime-core | 4 | packages/runtime-core/src/analytics/GovernanceAnalytics.test.ts; packages/runtime-core/src/registry/RuntimeRegistry.test.ts |
| packages/kernel-core | 3 | packages/kernel-core/src/index.ts |
| packages/auth | 2 | packages/auth/src/index.ts; packages/auth/src/providers/MockAuthProvider.tsx |
| packages/data-core | 2 | packages/data-core/src/repositories/DashboardRepository.ts |
| packages/execution-providers | 2 | packages/execution-providers/src/ReasoningProvider.ts |
| packages/policy-core | 2 | packages/policy-core/src/test-distribution.ts |
| packages/sdk | 2 | packages/sdk/src/clients/GatewayClient.ts |
| packages/telemetry-core | 2 | packages/telemetry-core/src/Telemetry.ts |
| packages/capabilities/agent-builder | 2 | packages/capabilities/agent-builder/src/tools/ToolRuntime.ts |
| services/llm-gateway | 2 | services/llm-gateway/src/GatewayPipeline.ts |
| services/swarm-runtime | 2 | services/swarm-runtime/src/DecisionEngine.ts; services/swarm-runtime/src/Planner.ts |
| packages/architecture-core | 1 | packages/architecture-core/src/index.ts |
| packages/compliance-core | 1 | packages/compliance-core/src/test-compliance.ts |
| packages/core-bus | 1 | packages/core-bus/src/memory/MemoryEventBus.ts |
| packages/experience | 1 | packages/experience/src/copilot/CopilotPanel.tsx |
| packages/llmops | 1 | packages/llmops/src/prompts/registry.ts |
| packages/operational-intelligence-core | 1 | packages/operational-intelligence-core/src/engine/BatchLearningEngine.ts |
| packages/secrets-core | 1 | packages/secrets-core/src/kms/KeyProvider.ts |
| packages/tokens | 1 | packages/tokens/build.ts |
| packages/ui | 1 | packages/ui/src/components/forms/Input.tsx |
| services/aiops-api | 1 | services/aiops-api/src/OptimizationLoop.ts |
| services/app-builder-api | 1 | services/app-builder-api/src/CompilerPipeline.ts |
| services/forge-api | 1 | services/forge-api/src/codegen/codegen.service.ts |

Notes on reading this table: a "hit" is a regex match on patterns like `TODO`, `FIXME`, `Mock*`, `Stub`, `Dummy*`, `placeholder`, `NotImplemented` — it flags candidates, it does not itself prove something is fake. Two rows are worth a specific caveat: `packages/db`'s hits are almost certainly inside generated/vendored Prisma client files, not hand-written scaffolding. `apps/platform-api`'s hits include legitimate, intentional test-mock files (`MockProviders.ts`, `*.test.ts`) from this session's real M10/M25 work, not production scaffolding — see the main report, §5.
