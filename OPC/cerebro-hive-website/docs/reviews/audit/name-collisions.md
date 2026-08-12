| Declaration name | Declared in |
|---|---|
| PolicyEngine | packages/domain; packages/policy; packages/policy-core; services/enterprise-control-plane; services/governance-api; apps/studio |
| EventBus | packages/core-bus; packages/domain; apps/platform; apps/studio |
| CapabilityRegistry | packages/capability-core; apps/platform; apps/studio |
| AgentRegistry | packages/agent-ops; services/swarm-runtime |
| ModelRegistry | packages/ai-gateway; services/llm-gateway |
| PromptRegistry | packages/ai-gateway; apps/studio |
| ExecutionEngine | packages/aiops-core; services/swarm-runtime |
| ApprovalEngine | packages/change-core; packages/governance-core |
| DomainEventBus | packages/core-bus; apps/studio |
| EngineConfig | packages/db; apps/studio |
| InMemoryEventBus | packages/domain; apps/studio |
| CapabilityRegistryImpl | packages/experience; packages/plugins |
| IdentityResolver | packages/federation-core; packages/identity-core |
| RiskEngine | packages/governance-core; services/enterprise-control-plane |
| ReasoningEngine | packages/knowledge-graph-core; services/reasoning-service |
| SecretsManager | packages/secrets-core; services/enterprise-control-plane |
| CredentialProvider | packages/identity-core (unused/unimplemented); packages/secrets-core (real, internally consumed) — see `audit/CREDENTIAL-PROVIDER-COLLISION-REVIEW.md` |
| SecretProvider | services/enterprise-control-plane (unwired, mock-backed) |
| ToolRegistry | packages/capabilities/agent-builder; apps/studio |
| CompilerPipeline | services/app-builder-api; apps/platform |
| PlannerService | services/forge-api; services/swarm-runtime |
| DecisionEngine | services/swarm-runtime; apps/studio |
| ExecutionPlanner | apps/platform; apps/studio |
| Scheduler | apps/platform; apps/studio |

Each row is a class or interface name declared, independently, in two or more unrelated packages/services/apps — real evidence of parallel implementations of the same concept, not a guess. `PolicyEngine` is the worst offender at 6 independent declarations.
