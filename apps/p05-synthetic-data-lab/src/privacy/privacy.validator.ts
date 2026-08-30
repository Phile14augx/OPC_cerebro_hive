/**
 * PrivacyValidator
 *
 * Enforces k-anonymity on a synthetic dataset.
 *
 * k-Anonymity definition: every equivalence class formed by the
 * quasi-identifier (QI) columns must contain at least `k` records.
 *
 * The validator is intentionally free of any framework dependency so it
 * can be instantiated directly in tests without a DI container.
 */
export class PrivacyValidator {
  /**
   * Evaluate whether `dataset` satisfies k-anonymity under the given config.
   *
   * @param dataset        Array of records (objects with arbitrary keys).
   * @param config.k       Minimum equivalence-class size (inclusive).
   * @param config.quasiIdentifiers  Column names to use as QIs.
   *                       Defaults to all columns present in the first record.
   *
   * @returns `{ compliant: boolean }` — true iff every equivalence class
   *          has at least `k` members (vacuously true for an empty dataset).
   */
  evaluate(
    dataset: Record<string, unknown>[],
    config: { k: number; quasiIdentifiers?: string[] },
  ): { compliant: boolean } {
    // Vacuous truth: no records → no group can violate k-anonymity
    if (dataset.length === 0) {
      return { compliant: true };
    }

    const qis: string[] =
      config.quasiIdentifiers && config.quasiIdentifiers.length > 0
        ? config.quasiIdentifiers
        : Object.keys(dataset[0]);

    // Build equivalence classes keyed by the JSON-serialised QI tuple
    const groups = new Map<string, number>();
    for (const record of dataset) {
      const keyObj: Record<string, unknown> = {};
      for (const qi of qis) {
        keyObj[qi] = record[qi];
      }
      const key = JSON.stringify(keyObj);
      groups.set(key, (groups.get(key) ?? 0) + 1);
    }

    // k-Anonymity requirement: every group must reach the threshold
    for (const count of groups.values()) {
      if (count < config.k) {
        return { compliant: false };
      }
    }

    return { compliant: true };
  }
}
