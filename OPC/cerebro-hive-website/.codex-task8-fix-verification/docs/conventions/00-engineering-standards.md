# CerebroHive Engineering Standards

This document outlines the strict engineering conventions that must be adhered to when building features for the CerebroHive platform.

## 1. Naming & Case Conventions
- **Folders**: `kebab-case` (e.g., `components/pm-agent`, `lib/queue`).
- **React Components**: `PascalCase` (e.g., `KanbanBoard.tsx`).
- **Server Actions**: `camelCase` (e.g., `createEpic.ts`).
- **Services & Repositories**: `PascalCase` class names, file named `domain.service.ts` or `domain.repository.ts`.
- **Database Models (Prisma)**: `PascalCase` (e.g., `model AuditEvent`).

## 2. File & Folder Structure
- `app/`: Next.js App Router (Pages, Layouts, API Routes).
- `app/actions/`: Next.js Server Actions (Transport Layer).
- `components/`: React Components (separated into `ui/primitives` and feature folders like `pm/`).
- `lib/services/`: Application/Domain Business Logic.
- `lib/repositories/`: Database Access abstraction.
- `lib/queue/`: Background Job Producers and Consumers.
- `prisma/`: Database Schema and Migrations.

## 3. Validation
- All inputs coming from the client (Server Actions, API routes) MUST be validated using **Zod** schemas before reaching the Service layer.

## 4. Error Handling
- Services should throw typed `Error` objects with descriptive messages.
- Server Actions should `catch` these errors and return a standardized object: `{ error: string }` or `{ success: true, data: any }`.
- Do NOT leak raw database or API error messages to the client.

## 5. Authorization
- Services must accept a `userId` or `workspaceId` and verify that the user has permission to perform the action on the requested resource.
- Never trust client-provided IDs without verifying ownership.

## 6. Testing
- Core Domain Services must have unit tests.
- E2E flows should have integration test scripts (e.g., `scripts/test-platform.ts`).

## 7. Logging & Observability
- Do not rely solely on `console.log`.
- Critical actions (auth, tenant creation, billing changes, AI execution) MUST be logged to the database via `AuditService.log()`.
