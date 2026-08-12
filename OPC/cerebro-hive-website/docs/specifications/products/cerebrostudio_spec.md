# Product Specification: CerebroStudio™

**Status:** Canonical Version 1.0  
**Governing Document:** `PRODUCT_REGISTRY.md`  
**Phase:** 2.5 — Enterprise Product Specifications

## 1. Product Overview

**CerebroStudio™** is the primary unified command center for enterprise intelligence. It provides a single pane of glass for human-AI collaboration, unifying chats, dashboards, enterprise search, and agent orchestration into one seamless user experience.

* **Product Family**: Cerebro Applications
* **Category**: AI Productivity
* **Personas**: Business Users, Executives, Operations

---

## 2. Core Workflows & User Journeys

### 2.1 Multimodal Conversational Interface
- **The Journey**: A business user asks complex questions about company performance.
- **Workflow**:
  1. User types or speaks a query into the main omni-bar (e.g., "Summarize last quarter's revenue and compare it against the forecast").
  2. The system dynamically summons the appropriate backend agents (e.g., the Financial Analyst agent).
  3. Results are returned not just as text, but as dynamic, interactive widgets (charts, tables) generated on the fly.

### 2.2 Unified Dashboarding
- **The Journey**: An executive configures a morning briefing dashboard.
- **Workflow**:
  1. Selects pre-built widgets from `CerebroInsight` and `CerebroPredict`.
  2. Pins specific live data streams (e.g., active pipeline deals, real-time cloud costs).
  3. The dashboard auto-refreshes daily, utilizing background agents to synthesize the data into a high-level summary paragraph at the top.

### 2.3 Global Enterprise Search
- **The Journey**: A user needs to find a specific policy document buried in SharePoint.
- **Workflow**:
  1. Executes a semantic search in Studio.
  2. Studio queries `CerebroSearch` and `HiveData`, traversing the enterprise knowledge graph.
  3. Returns the exact paragraph with cited sources, respecting the user's RBAC permissions.

---

## 3. High-Level Architecture

CerebroStudio is a presentation-layer application that aggregates data from the rest of the Intelligence Mesh.

* **Frontend**: Next.js, React, Tailwind CSS, providing a highly responsive, glassmorphic UI.
* **Backend**: Next.js Server Actions functioning as a BFF (Backend-For-Frontend) to aggregate data.
* **Real-time**: WebSockets / Server-Sent Events (SSE) for streaming LLM responses and live widget updates.

---

## 4. Key Entities (Prisma Schema Impact)

CerebroStudio requires the following foundational entities in the backend schema:

* `Workspace`: A logical grouping of dashboards and chats for a team.
  * `id`, `name`, `tenantId`, `ownerId`
* `Dashboard`: A user-configured view of widgets.
  * `id`, `workspaceId`, `layoutConfig`
* `WidgetConfig`: The state and definition of a specific UI component.
  * `id`, `dashboardId`, `type` (e.g., Chart, Text), `dataSourceQuery`
* `ChatSession`: An ongoing conversation thread with the AI mesh.
  * `id`, `userId`, `title`, `historyBlob`

---

## 5. Integrations & Dependencies

* **Upstream (Depends on)**:
  * `HiveIdentity`: For SSO and rendering UI elements based on user roles.
  * `HiveAPI`: All requests to underlying agents flow through here.
  * `CerebroSearch`, `CerebroAgent`, `CerebroInsight`: To populate the UI with intelligence.
* **Downstream (Outputs to)**:
  * None. Studio is the top of the stack (Presentation Layer).
* **External Integrations**:
  * Slack/Teams: Can push daily dashboard summaries to messaging channels.

---

## 6. Security & Governance Constraints

* **Permission Trimming**: Search results and agent responses MUST be filtered (trimmed) before hitting the frontend so a user never sees a reference to a document they lack permissions to access.
* **Session Management**: Strict JWT token lifecycle management via `HiveIdentity` with idle timeout enforcement.
