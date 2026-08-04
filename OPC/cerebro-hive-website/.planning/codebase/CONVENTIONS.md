# Coding Conventions

**Analysis Date:** 2026-08-04

## Naming Patterns

**Files:**
- Class files: PascalCase (e.g., `ErrorMapper.ts`, `AIGatewayProviders.ts`, `EngineeringReviewController.ts`)
- Utility/module files: camelCase (e.g., `agents.commands.ts`, `agents.handlers.ts`, `agents.routes.ts`)
- Directories: kebab-case (e.g., `agent-builder`, `ai-gateway`, `core-bus`)

**Functions:**
- Regular functions: camelCase (e.g., `bootstrap()`, `onRequestLog()`, `makeExecution()`, `fakeContext()`)
- Event handlers: "on" prefix with camelCase (e.g., `onRequestLog()`, `onSendLog()`, `onBeforeRequest()`)
- Factory/builder functions: verb prefix with camelCase (e.g., `makeExecution()`, `createAgentCommand()`)

**Classes:**
- PascalCase with semantic suffix (e.g., `ErrorMapper`, `CreateAgentCommand`, `CreateAgentCommandHandler`, `AIGatewayLLMProvider`)
- Command classes: "[Action]Command" pattern (e.g., `CreateAgentCommand`)
- Handler classes: "[Action]CommandHandler" pattern (e.g., `CreateAgentCommandHandler`)
- Error classes: "[Type]Error" pattern (e.g., `ValidationError`, `AuthorizationError`, `InvariantViolationError`)
- Controller classes: "[Domain]Controller" pattern (e.g., `EngineeringReviewController`)
- Service classes: "[Domain]Service" pattern (e.g., `ExecutionRuntimeService`, `AgentRuntimeService`)
- Provider classes: "[Type]Provider" pattern (e.g., `AIGatewayLLMProvider`, `ToolRuntimeToolProvider`)

**Interfaces:**
- PascalCase without prefix
- Data Transfer Objects: "DTO" suffix (e.g., `EngineeringReviewSummaryDTO`, `ReviewStatisticsDTO`)
- Contract/capability interfaces: "I" prefix or capability name (e.g., `ICommandHandler<T>`, `IAgentBuilderCapability`)
- Repositories: "Repository" suffix (e.g., `AgentRepository`, `WorkspaceRepository`)
- Type-only imports use `type` keyword (e.g., `import type { Request } from 'express'`)

**Type Aliases:**
- PascalCase (e.g., `ExecutionId`, `WorkspaceId`)

**Constants:**
- UPPER_SNAKE_CASE for module-level constants
- CONSTANT_STATUS_VALUES in string literals (e.g., `'CREATED'`, `'COMPLETED'`, `'CLOSED'`)

**Variables:**
- camelCase for local variables and properties (e.g., `requestId`, `traceId`, `statusCode`)
- Unused parameters prefixed with `_` (e.g., `_reply`, `_payload`)

## Code Style

**Formatting:**
- Tool: Prettier
- Config: `.prettierrc.json`
- Tab width: 2 spaces
- Semicolons: Required
- Quotes: Double quotes (not single)
- Trailing commas: All
- Print width: 100 characters (120 for JSON, 80 for Markdown)
- Arrow function parentheses: Always (even single param)
- Line endings: LF (Unix)

**Linting:**
- Tool: ESLint with TypeScript support
- Config: `.eslintrc.base.json` (base), `.eslintrc.eda.json` (domain-specific)
- Rules enforced:
  - No `any` types (`@typescript-eslint/no-explicit-any: error`)
  - No non-null assertions (`@typescript-eslint/no-non-null-assertion: error`)
  - Strict type imports with separate type imports (`consistent-type-imports`)
  - No unused variables (except prefixed with `_`)
  - Prefer nullish coalescing (`??`) over logical OR (`||`)
  - Prefer optional chaining (`?.`)
  - No floating promises
  - Exhaustive switch checking
  - No circular imports (max depth: 3)
  - No `require()` statements (ES modules only)

**TypeScript Configuration:**
- Target: ES2022
- Strict mode: Enabled
- Module: CommonJS for packages, Node16 for apps
- Declaration: Generated for packages
- Force consistent casing in file names

## Import Organization

**Order** (enforced by `eslint-plugin-import`):
1. Builtin Node modules (e.g., `import { readFile } from 'node:fs'`)
2. External dependencies (e.g., `import Fastify from 'fastify'`)
3. Internal imports (monorepo packages via `@cerebro/*`)
4. Parent directory imports (e.g., `import { foo } from '../'`)
5. Sibling imports (e.g., `import { foo } from './'`)
6. Index imports (e.g., `import { foo } from '.'`)
7. Type-only imports (using `import type`)

**Within each group:**
- Alphabetically sorted (case-insensitive)
- Blank line between groups
- Named imports before default imports

**Path Aliases:**
- Monorepo packages: `@cerebro/*` (workspace protocol `workspace:*` or `workspace:^`)
- No path aliases for relative imports within packages

**Example from `bootstrap.ts`:**
```typescript
import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

import { requestContextHook } from './middleware/RequestContextMiddleware';
import { requireAuthHook } from './middleware/AuthMiddleware';
import { createRequireWorkspaceAccessHook } from './middleware/WorkspaceAccessMiddleware';
import { onRequestLog, onSendLog } from './middleware/RequestLogger';
import type { WorkspaceRepository, AgentConversationRepository, PrismaUnitOfWork } from '@cerebro/database';
import { ErrorMapper } from './errors/ErrorMapper';
import type { ExecutionRuntimeKernel } from '@cerebro/runtime-core/src/execution/kernel/ExecutionRuntimeKernel';
```

## Error Handling

**Strategy:** Domain-driven error hierarchy with specific error types

**Pattern:**
- Extend `DomainError` base class (`packages/domain/src/errors/DomainError.ts`)
- Each error type has a unique code (UPPER_SNAKE_CASE)
- Error codes map to HTTP status codes via `ErrorMapper`
- Errors are caught and mapped in middleware (see `ErrorMapper.mapToProblemDetails()`)

**Common Error Types:**
- `ValidationError` → 400 Bad Request
- `AuthorizationError` → 403 Forbidden
- `PolicyViolationError` → 403 Forbidden
- `NotFoundError` → 404 Not Found
- `ConflictError` → 409 Conflict
- `ConcurrencyError` → 409 Conflict
- `DuplicateCommandError` → 409 Conflict
- `InvariantViolationError` → 422 Unprocessable Entity
- `ExternalDependencyError` → 503 Service Unavailable

**Throwing:**
```typescript
throw new ValidationError('Field X is required');
throw new NotFoundError(`Agent ${agentId} not found`);
throw new InvariantViolationError('Cannot transition from COMPLETED state');
```

**Catching:**
```typescript
if (error instanceof DomainError) {
  return this.mapDomainError(error);
}
```

## Logging

**Framework:** Fastify Pino logger (structured JSON logging)

**Patterns:**
- Use `request.log.info(record, 'message')` for structured logging
- Emit as JSON for OTEL/Loki ingestion
- Include traceId, correlationId, tenantId, userId, workspaceId for observability
- Console methods allowed: `.warn()`, `.error()`, `.info()` (see ESLint `no-console` rule)
- Avoid debug logging in production code

**Example from `RequestLogger.ts`:**
```typescript
const record: RequestLogRecord = {
  requestId: ctx?.traceId ?? 'unknown',
  tenantId: ctx?.tenantId ?? 'unauthenticated',
  userId: ctx?.userId,
  workspaceId: ctx?.workspaceId,
  traceId: ctx?.correlationId ?? ctx?.traceId ?? 'unknown',
  method: request.method,
  url: request.url,
  statusCode: reply.statusCode,
  durationMs: start ? Date.now() - start : -1,
  timestamp: new Date().toISOString(),
};
request.log.info(record, 'request completed');
```

## Comments

**When to Comment:**
- Complex business logic requiring explanation
- Non-obvious invariants or state transitions
- Temporary TODOs or workarounds (with issue reference if possible)
- Algorithm explanations

**JSDoc/TSDoc:**
- Use for public functions, classes, and interfaces
- Include parameter descriptions and return types
- Explain "why" not "what" (code shows what)
- Include usage examples for complex functions

**Example from `RequestLogger.ts`:**
```typescript
/**
 * Structured request logger — Production Hardening Sprint (observability gate).
 *
 * Every request that reaches platform-api now emits a structured log line
 * containing the fields operators need to trace an incident: requestId,
 * tenantId, userId, workspaceId, traceId, HTTP method/path/status, and
 * duration. All of those fields are available by the time the onSend hook
 * fires (requireAuthHook has already overwritten tenantId/userId from the
 * verified JWT).
 */
```

## Function Design

**Size:** Prefer small, focused functions (<50 lines)

**Parameters:**
- Use destructuring for object parameters
- Limit to 3-4 parameters; use options object for more
- Include parameter types (no `any`)
- Optional parameters at the end or in options object

**Return Values:**
- Explicit return types (no implicit `any`)
- Return objects over tuples for clarity (e.g., `{ result, error }` not `[result, error]`)
- Use `async/await` for promises (not `.then()` chains)

## Module Design

**Exports:**
- Named exports preferred over default exports
- Export types/interfaces for public APIs
- Use `export type { Foo }` for type-only exports

**Barrel Files:**
- Used in feature directories (`index.ts` re-exports from submodules)
- Not used in flat package src directories
- Keep barrel files simple: one line per export group

**Example:**
```typescript
// packages/domain-model/src/entities/index.ts
export { Entity } from './Entity';
export { AggregateRoot } from './AggregateRoot';
export type { HiveDomainEvent } from '../events/HiveDomainEvent';
```

## Domain-Driven Design Patterns

**Commands:**
- File: `[module].commands.ts`
- Pattern: `export class [Action]Command extends Command`
- Include `idempotencyKey` for replay safety
- Constructor publishes command name via `super('[Action]Command')`

**Command Handlers:**
- File: `[module].handlers.ts`
- Pattern: `export class [Action]CommandHandler implements ICommandHandler<[Action]Command, TResult>`
- Method: `async handle(command: Command, context: RequestContext): Promise<Result<T>>`

**Routes:**
- File: `[module].routes.ts`
- Register command handlers via command bus
- Type routes with Fastify TypeBox provider

## Property Modifiers

**Visibility:**
- Private fields: `#fieldName` (modern) or `private fieldName` (for compatibility)
- Protected: Use only for subclasses
- Public: Default (no modifier)

**Readonly:**
- Use `readonly` for immutable properties
- Common in DTOs and value objects

**Example from DTO:**
```typescript
export interface EngineeringReviewSummaryDTO {
  readonly id: string;
  readonly workflowId: string;
  readonly verdict: string;
}
```

---

*Convention analysis: 2026-08-04*
