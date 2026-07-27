/**
 * DEAD CODE — not used in production. See audit/RESILIENCE-AUDIT.md.
 *
 * This class was never exported from index.ts and always returns the same
 * hardcoded 3-node DAG regardless of the `intent` argument. Real planning
 * is performed by the compiler's RuntimePlanner
 * (apps/platform/src/features/studio/backend-runtime/planner/RuntimePlanner.ts)
 * which produces a RuntimeIR that the TemporalInterpreter executes.
 *
 * This file is retained to prevent import-resolution failures in any file
 * that may reference it, but the class should not be instantiated in new
 * code. Removal is tracked as a follow-up cleanup once all references have
 * been verified to be absent.
 */
export class PlannerService {
  /** @deprecated — returns a hardcoded stub; use RuntimePlanner instead. */
  compile(_intent: string): never {
    throw new Error(
      '[PlannerService] Dead code invoked. Use RuntimePlanner in backend-runtime instead.',
    );
  }
}

/** @deprecated — see PlannerService above. */
export const Planner = new PlannerService();
