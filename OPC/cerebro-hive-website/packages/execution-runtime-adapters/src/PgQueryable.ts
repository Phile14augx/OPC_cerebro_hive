/**
 * Phase 9g-1 — the minimal shape both adapters in this package need from a
 * Postgres connection/pool. Deliberately NOT `pg`'s own `Pool` type: a real
 * `pg.Pool` instance satisfies this interface structurally (its `query()`
 * method's real signature is a superset of what's declared here), so this
 * package's adapters can be constructed with a real `Pool` in production
 * while being unit-testable against a lightweight fake in this sandbox
 * (which has no reachable Postgres server to test against for real) without
 * needing `pg`'s types at all in the adapters' own signatures.
 */
export interface PgQueryResult {
  readonly rows: readonly Record<string, unknown>[];
}

export interface PgQueryable {
  query(text: string, params?: readonly unknown[]): Promise<PgQueryResult>;
}
