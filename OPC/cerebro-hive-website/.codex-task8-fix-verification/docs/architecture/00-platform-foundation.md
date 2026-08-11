# CerebroHive Platform Architecture Foundation

## 1. Domain-Driven Boundaries

As the CerebroHive platform grows into an Enterprise AI Operating System, it is critical to organize the backend into bounded domains. This ensures loose coupling, easier team scaling, and prevents a monolithic "Big Ball of Mud".

The core domains are:
- **Identity & Access**: Users, Authentication, Sessions, Roles, API Keys.
- **Organizations & Workspaces**: Multi-tenant hierarchies, billing.
- **Projects**: The core container for all product activity.
- **AI Agents**: Agent configurations, PM Agent logic, Conversation states.
- **Knowledge**: Vector embeddings, RAG documents, Knowledge Graphs.
- **Integrations**: OAuth connections (GitHub, Jira, etc.).
- **Audit & Compliance**: Immutable logging and platform observability.

## 2. The Layered Architecture

To prevent Prisma models from leaking business logic into the frontend, CerebroHive enforces a strict N-tier layered architecture:

### Tier 1: Server Actions (Transport)
- **Location**: `app/actions/*.ts`
- **Responsibility**: Validate HTTP inputs (FormData/Zod), handle session state via cookies, and safely proxy calls to Application/Domain services. Contains NO business logic.

### Tier 2: Application / Domain Services
- **Location**: `lib/services/*.service.ts`
- **Responsibility**: Orchestrate domain rules, interact with third-party APIs (like LLMs), trigger background jobs, and log audit events.
- **Example**: `pm.service.ts`, `auth.service.ts`

### Tier 3: Repositories (Data Access)
- **Location**: `lib/repositories/*.repository.ts`
- **Responsibility**: Abstract the ORM (Prisma). All complex database queries, transactions, and aggregations live here. Services call Repositories; they do not call Prisma directly for complex logic.

### Tier 4: Prisma ORM (Data Layer)
- **Location**: `prisma/schema.prisma`
- **Responsibility**: Define the physical database schema, relations, and indexes.

## 3. Background Processing

Many AI capabilities require high-latency API calls (e.g., generating documentation, analyzing repositories). CerebroHive utilizes **Redis + BullMQ** for asynchronous job processing.
- The web request triggers a Server Action -> Service -> Job Queue.
- The web request returns immediately.
- A dedicated background worker pulls the job from the queue and updates the database upon completion.

## 4. Observability & Auditing

Every state-mutating action in the platform MUST be logged via the `AuditService`. This acts as both a security compliance requirement (Enterprise Trust Center) and a unified observability platform for monitoring AI Agent executions and system health.
