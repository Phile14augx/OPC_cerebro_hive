# Hermes CEO Agent Integration Notes

This document provides an integration readiness assessment for the Hermes CEO/EIOS Orchestrator agent, outlining the skills inventory, tool bindings, dependencies, and integration complexity.

## 1. Skills Inventory
The following skills are defined in `skills.py`. Currently, they act as strategy artefact generators, returning structured JSON schemas rather than calling external implementation endpoints.

- **Strategic Planning (`strategic_planning`)**: Decomposes high-level objectives into milestones, features, and tasks.
- **Enterprise Architecture (`enterprise_architecture`)**: Governs architectural standards and produces ADR outlines and component diagrams.
- **Roadmap Planning (`roadmap_planning`)**: Maintains product and engineering roadmaps based on priority and dependencies.
- **Decision Analysis (`decision_analysis`)**: Evaluates options using structured decision frameworks (e.g., RICE, SWOT) and returns recommendations.
- **Risk Assessment (`risk_assessment`)**: Identifies, scores, and mitigates enterprise risks across various dimensions.
- **Architecture Governance (`architecture_governance`)**: Enforces ADRs, review gates, and compliance standards, producing approval/rejection decisions.
- **Capability Mapping (`capability_mapping`)**: Maps business needs to specialist agent capabilities in the EIOS.
- **Executive Communication (`executive_communication`)**: Drafts evidence-based executive communications tailored to specific audiences.

*Note: All current skills are offline logic that format prompts and schemas. None currently make active external API calls.*

## 2. Required Tool Bindings & Platform-API Equivalents
According to `agent.yaml`, Hermes requires orchestration-level tools. Here is their mapping to `platform-api`:

- `delegation_tool` -> Maps to `/api/v1/runtime/orchestrator/delegate` (Needs to be verified in `platform-api`)
- `task_assignment` -> Maps to `/api/v1/runtime/tasks`
- `crew_management` -> Maps to Agent Registry / `/api/v1/runtime/agents`
- `knowledge_search` -> Requires RAG endpoints (e.g., `/api/v1/knowledge/search`)
- `documentation_search` -> Requires integration with Notion/Confluence (Gap: No unified doc search endpoint yet)
- `architecture_search` -> Requires indexing of ADRs (Gap: No specific ADR search endpoint)
- `project_tracker` -> Requires Jira/Linear integration via `/api/v1/projects` (Gap: Requires 3rd-party auth)

## 3. Dependencies & Integration Complexity
To fully wire the Hermes agent, the following dependencies must be met:

| Dependency / Integration | Type | Estimated Complexity | Notes |
| --- | --- | --- | --- |
| **CrewAI / Agent Framework** | Package | **M** | `crewai` package is imported in `skills.py` but wrapped in a try-except fallback. Requires ensuring the HiveSwarm runtime supports BaseTool structures. |
| **Anthropic API (Claude Opus 4.5)** | Env Var | **S** | Requires `ANTHROPIC_API_KEY`. (Model specified: `claude-opus-4-5`). |
| **GitHub MCP Server** | External Service | **M** | Requires `GITHUB_TOKEN` and MCP setup. |
| **Jira / Linear / ClickUp** | External Service | **L** | Requires OAuth/API keys and complex two-way sync for task tracking. |
| **Notion / Confluence** | External Service | **M** | Required for `knowledge_search` and `documentation_search`. |
| **PostgreSQL / OpenSearch** | External Service | **S** | Requires `DATABASE_URL` for read-only analytics. |

## 4. Flags & Gaps
- ⚠️ **Non-existent endpoints**: Tools like `knowledge_search` and `architecture_search` rely on enterprise search infrastructure that may not be fully implemented or wired in `platform-api`.
- ⚠️ **Package Dependency**: `crewai` is assumed for tool execution. The fallback `BaseTool` implementation is minimal and may not support complex CrewAI execution out-of-the-box if the runner expects native CrewAI classes.
- ⚠️ **Missing RAG Wiring**: Hermes depends on enterprise knowledge, but pgvector RAG capabilities are not yet fully wired to the core API (refer to pending P2-C1 task).
