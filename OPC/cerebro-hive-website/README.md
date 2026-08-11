# CerebroHive Enterprise Intelligence Operating System (EIOS)

This repository contains the CerebroHive EIOS platform codebase, previously known as Cerebro Studio.

## Architecture & Governance

CerebroHive is built on a 10-Layer Enterprise Intelligence Operating System (EIOS) architecture. The vision drives the architecture, the architecture drives the implementation, and the implementation drives the products.

**Start Here:**
1. [EIOS Manifesto](file:///d:/%7BMY_PROJECTS%7D/%7BOPC_cerebro_hive%7D/OPC/cerebro-hive-website/architecture/manifesto/CEREBROHIVE_EIOS_MANIFESTO.md)
2. [Architecture Taxonomy Index](file:///d:/%7BMY_PROJECTS%7D/%7BOPC_cerebro_hive%7D/OPC/cerebro-hive-website/architecture/ARCHITECTURE_INDEX.md)
3. [EIOS Constitution](file:///d:/%7BMY_PROJECTS%7D/%7BOPC_cerebro_hive%7D/OPC/cerebro-hive-website/CEREBROHIVE_CONSTITUTION.md)

## Configuration

Studio requires the `NEXT_PUBLIC_API_URL` environment variable to be set to point to the live Engineering Review API endpoints.
Please copy `apps/studio/.env.example` to `apps/studio/.env.local` to configure your environment.

See ADRs in the architecture governance documents for more details.

## Agent Registry

The canonical `/app/agents` Studio surface and `/api/v1/agents` API now provide a workspace-scoped Agent Registry. `Agent` is the stable identity, `AgentDraft` is the only mutable definition, and publication creates immutable `AgentVersion` snapshots before advancing the active-version pointer.

Studio requires `NEXT_PUBLIC_API_URL` and a selected workspace ID in `localStorage['cerebro.workspaceId']` (or `NEXT_PUBLIC_WORKSPACE_ID`). The authenticated access token and workspace header are sent by the registry hooks.

Migration operators should follow [the Agent Registry migration runbook](docs/agent-registry/migration-runbook.md). Tool-permission and knowledge-source declarations are metadata only in this first slice; they are not runtime authorization or retrieval configuration.
