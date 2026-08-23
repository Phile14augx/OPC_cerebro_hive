# Cohort F5 Evidence

## Reconciled Markers
- **W0.2-SUP-059**: `apps/studio/app/api/v1/hiveforge/catalog/route.ts`
  - Removed `// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ARCH-LINT: Deferred`
  - Fix: Added `AuthService` token verification, Workspace checks, and structurally checked `bp.manifest.spec.template` to avoid `any` casting.
- **W0.2-SUP-060**: `apps/studio/app/api/v1/hiveforge/deployments/route.ts`
  - Removed `// eslint-disable-next-line @typescript-eslint/no-unused-vars -- ARCH-LINT: Deferred`
  - Fix: Added Negative Controls with proper Auth, Workspace constraints, parsed JSON with structural type guards, and removed the unused `idempotencyKey` variable from destructuring.
- **W0.2-SUP-061**: `apps/studio/app/api/webhooks/github/route.ts`
  - Removed `// eslint-disable-next-line @typescript-eslint/no-unused-vars -- ARCH-LINT: Deferred`
  - Fix: Removed unused `recordMetrics` import. Added strict payload checks, `try/catch` for `JSON.parse` to avoid 500 error leakages, and type assertions to enforce expected types rather than raw `any` parsing.

## Code Quality Check
- All modified files passed ESLint checks.
- All modified files passed TypeScript compiler checks (`tsc --noEmit`). No typecheck errors introduced.
