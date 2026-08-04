# Testing Patterns

**Analysis Date:** 2026-08-04

## Test Framework

**Runner:**
- Vitest 3.2.4+ (configured in `vitest.config.ts` files)
- TypeScript support via tsx
- ESM-first approach

**Assertion Library:**
- Vitest built-in assertions (expect API)
- No additional assertion library needed

**Test Commands:**

```bash
# Run all tests in a workspace
npm run test                    # Turborepo runs tests across all packages

# Watch mode (per-package)
vitest                          # Run in watch mode

# Coverage reports
npm run test:coverage           # Turborepo coverage across all packages

# Integration tests (root-level)
npm run test:integration        # Uses dotenv to load .env.test
npm run test:integration:watch  # Watch mode for integration tests

# E2E tests
npm run test:e2e                # Turborepo runs e2e tests
```

## Test File Organization

**Location:**
- Co-located `.test.ts` suffix: Same directory as source code (`module.ts` → `module.test.ts`)
- Organized `__tests__` directories: Dedicated `__tests__` subdirectory within src
- Both patterns used across the codebase (e.g., `apps/platform-api/src/modules/runtime/providers/*.test.ts` vs `packages/domain/src/execution/__tests__/*.test.ts`)

**Naming:**
- Co-located: `[SourceFile].test.ts` (e.g., `AIGatewayProviders.test.ts`)
- Organized: `[FeatureName].test.ts` in `__tests__` directory (e.g., `packages/domain/src/execution/__tests__/Execution.test.ts`)
- Both styles acceptable; use consistently within a package

**Directory Pattern:**
```
packages/domain/src/
  execution/
    Execution.ts
    ExecutionId.ts
    ExecutionStatus.ts
    __tests__/
      Execution.test.ts
      ExecutionId.test.ts
      ExecutionEventContract.test.ts
      ExecutionEndToEnd.test.ts
      ... (14 total test files)

apps/platform-api/src/
  modules/runtime/providers/
    AIGatewayProviders.ts
    AIGatewayProviders.test.ts    # co-located
    ToolRuntimeProvider.ts
    ToolRuntimeProvider.test.ts   # co-located
```

## Test Structure

**Test Suite Organization:**
```typescript
import { describe, it, expect, vi } from 'vitest';

describe('ComponentName', () => {
  describe('Feature/Method subset', () => {
    it('describes specific behavior in plain English', () => {
      // Arrange
      const input = ...;
      
      // Act
      const result = component.method(input);
      
      // Assert
      expect(result).toEqual(expected);
    });

    it('describes edge case or error scenario', () => {
      // Setup
      // Action
      // Assertion
    });
  });
});
```

**Nested Suites:**
- Use `describe` for logical grouping (test class name, subsystem, feature)
- One top-level describe per test file
- Optional second-level describes for method/subsystem grouping
- Third level rarely used (flatten if needed)

**Test Names:**
- Plain English describing expected behavior, not implementation
- Start with "should" or use gerund form (more idiomatic in this codebase)
- Specific about condition and outcome

**Examples from codebase:**
```typescript
describe('AIGatewayLLMProvider', () => {
  it('calls gateway.chat() with the messages and model/maxTokens from the context', async () => { ... });
  it('streams via gateway.stream() and forwards each delta when onToken is provided', async () => { ... });
  it('propagates errors from the gateway instead of swallowing them', async () => { ... });
});

describe('Execution.create invariants', () => {
  it('creates a valid Execution in CREATED status', () => { ... });
  it('rejects empty kind', () => { ... });
  it('rejects empty tenantId', () => { ... });
});
```

## Mocking

**Framework:** Vitest built-in `vi` module

**Mock Functions:**
```typescript
// Create a mock function
const mockFn = vi.fn();

// Mock with return value
const mockFn = vi.fn().mockReturnValue(42);
const mockFn = vi.fn().mockResolvedValue({ content: 'response' });
const mockFn = vi.fn().mockRejectedValue(new Error('failed'));

// Mock with implementation
const mockFn = vi.fn((x) => x * 2);

// Assertions on mocks
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith(expectedArgs);
expect(mockFn).toHaveBeenCalledTimes(1);
```

**Patterns:**
- Mock external dependencies (databases, APIs, services)
- Use `as unknown as InterfaceType` for type casting in tests
- Create minimal fake objects matching the interface

**Example from `AIGatewayProviders.test.ts`:**
```typescript
const chat = vi.fn().mockResolvedValue({ content: 'real response' });
const gateway = { chat, stream: vi.fn() } as unknown as AIGateway;
const provider = new AIGatewayLLMProvider(gateway);

const result = await provider.invokeModel([...], context);

expect(result).toBe('real response');
expect(chat).toHaveBeenCalledWith({
  messages: [...],
  model: 'gpt-4o',
  maxTokens: 256,
});
```

**What to Mock:**
- External HTTP APIs and SDKs
- Database calls (repositories)
- File system operations
- Time-dependent functions (use `vi.useFakeTimers()` if needed)
- OS/environment interactions

**What NOT to Mock:**
- Pure utility functions
- Simple objects/primitives (create real instances)
- Internal domain logic (test the real implementation)
- Error classes (should be real for type checking)

## Fixtures and Factories

**Test Data Creation:**
- Define helper functions within test file (not external fixtures yet)
- Preferred pattern: `makeEntity()` or `fakeContext()` functions
- Override only what matters for the test case

**Example from `AIGatewayProviders.test.ts`:**
```typescript
function fakeContext(overrides: { model?: string; tokens?: number } = {}): any {
  return {
    modelSelection: { provider: 'auto', model: overrides.model ?? 'claude-sonnet-4-6' },
    budget: { tokens: overrides.tokens ?? 512 },
  };
}

// Usage
const context = fakeContext({ model: 'gpt-4o', tokens: 256 });
```

**Example from `Execution.test.ts`:**
```typescript
function makeExecution(overrides: Partial<Parameters<typeof Execution.create>[0]> = {}) {
  return Execution.create({
    kind: 'Agent',
    tenantId: 'tenant-1',
    traceId: 'trace-1',
    correlationId: 'corr-1',
    ...overrides,
  });
}

// Usage
const exec = makeExecution();
const exec2 = makeExecution({ kind: 'Workflow', tenantId: 'tenant-2' });
```

**Location:**
- Define in test file itself (top-level or inside describe block)
- Shared fixtures across files not yet centralized; code duplication acceptable at this stage

## Coverage

**Requirements:** Not enforced at package level (no threshold configuration detected)

**View Coverage:**
```bash
npm run test:coverage           # Generate coverage reports across monorepo
```

**Coverage artifacts:**
- Generated in `coverage/` directory per package
- HTML reports available after run
- Accessible via IDE extensions (VS Code Coverage Gutters, etc.)

## Test Types

**Unit Tests:**
- Test individual functions, classes, or pure logic
- Location: Co-located `.test.ts` or `__tests__` directories
- Scope: Single module or class
- Dependencies: Mocked
- Example: `AIGatewayProviders.test.ts`, `Execution.test.ts`

**Integration Tests:**
- Test interactions between multiple components
- Location: `tests/integration/` directory
- Run via: `npm run test:integration`
- Scope: Multiple modules, services, or systems
- Dependencies: Real or partially mocked (e.g., test databases)
- Configuration: `.env.test` file for test environment variables

**E2E Tests:**
- Test full workflows from user entry point
- Run via: `npm run test:e2e`
- Framework: Not specified in package.json analysis
- Typically run against deployed/staging environments

## Common Patterns

**Async Testing:**
- Use `async/await` in test function
- Functions automatically return promise for async tests
- Example from `AIGatewayProviders.test.ts`:

```typescript
it('calls gateway.chat() with the messages and model/maxTokens from the context', async () => {
  const chat = vi.fn().mockResolvedValue({ content: 'real response' });
  const gateway = { chat, stream: vi.fn() } as unknown as AIGateway;
  const provider = new AIGatewayLLMProvider(gateway);

  const result = await provider.invokeModel(
    [{ role: 'user', content: 'hi' }],
    fakeContext({ model: 'gpt-4o', tokens: 256 })
  );

  expect(result).toBe('real response');
});
```

**Generator/Stream Testing:**
- Mock async generators with `vi.fn().mockReturnValue(fakeGenerator())`
- Manually iterate or await collection

```typescript
async function* fakeStream() {
  yield { id: '1', delta: 'Hel', done: false };
  yield { id: '1', delta: 'lo', done: true };
}

const stream = vi.fn().mockReturnValue(fakeStream());
const provider = new AIGatewayLLMProvider(gateway);

const tokens: string[] = [];
const result = await provider.invokeModel([...], context, (t) => tokens.push(t));

expect(tokens).toEqual(['Hel', 'lo']);
```

**Error Testing:**
- Mock rejected promises for error paths
- Use `.rejects.toThrow()` assertion
- Example from `AIGatewayProviders.test.ts`:

```typescript
it('propagates errors from the gateway instead of swallowing them', async () => {
  const gateway = {
    chat: vi.fn().mockRejectedValue(new Error('provider down')),
    stream: vi.fn(),
  } as unknown as AIGateway;
  const provider = new AIGatewayLLMProvider(gateway);

  await expect(provider.invokeModel([], fakeContext())).rejects.toThrow('provider down');
});
```

**Invariant/Validation Testing:**
- Test constructor or initialization errors
- Verify exceptions thrown for invalid state
- Example from `Execution.test.ts`:

```typescript
it('rejects empty kind', () => {
  expect(() => makeExecution({ kind: '' })).toThrow(InvariantViolationError);
});

it('rejects self-parenting via reconstitute', () => {
  const exec = makeExecution();
  const props = exec.toProps();
  expect(() =>
    Execution.reconstitute({ ...props, parentExecutionId: props.id })
  ).toThrow(InvariantViolationError);
});
```

**State Transition Testing:**
- Set up initial state, apply transitions, verify outcomes
- Example from `Execution.test.ts`:

```typescript
it('sets startedAt on first transition to RUNNING', () => {
  const exec = makeExecution();
  expect(exec.startedAt).toBeUndefined();
  exec.transitionTo(ExecutionStatus.Validating);
  exec.transitionTo(ExecutionStatus.Queued);
  exec.transitionTo(ExecutionStatus.Running);
  expect(exec.startedAt).toBeInstanceOf(Date);
});
```

## Test-Specific Utilities

**Value Objects and IDs:**
- Use proper constructors/factories in tests (not string literals)
- Example: `ExecutionId.of('abc-123')`, `WorkspaceId.of('ws-1')`
- Enables invariant validation in tests

**Aggregate Creation:**
- Use `Entity.create()` factory methods with overrides
- Test reconstitution paths (rehydration from persistence)
- Example from `Execution.test.ts`:

```typescript
const exec = Execution.create({ kind: 'Agent', tenantId: '...', ... });
const props = exec.toProps();
const reconstructed = Execution.reconstitute(props);
expect(reconstructed.equals(exec)).toBe(true);
```

## Best Practices

1. **Test behavior, not implementation** — Tests should not break when internal code is refactored
2. **Keep setup minimal** — Use factory functions with sensible defaults
3. **One assertion focus per test** — Multiple related assertions OK, but avoid testing multiple concerns
4. **Clear test names** — Names should read as documentation
5. **No test interdependence** — Each test must run independently
6. **Use snapshot tests sparingly** — Prefer explicit assertions for clarity
7. **Test error paths** — Errors are behavior, not just success cases
8. **Keep fakes simple** — Mock only what's needed; avoid over-mocking

---

*Testing analysis: 2026-08-04*
