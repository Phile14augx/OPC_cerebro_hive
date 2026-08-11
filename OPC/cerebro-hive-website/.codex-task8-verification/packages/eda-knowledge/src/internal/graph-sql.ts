/**
 * Graph SQL — ADR 0012 (D1). INTERNAL.
 *
 * Everything under `internal/` is off-limits to other packages
 * (`eda-graph-sql-containment`). Confining SQL here is what makes the
 * Postgres → native-graph migration a contained change rather than a rewrite:
 * the public API is expressed in graph terms, so it maps to Cypher unchanged.
 */
export function rawGraphQuery(_sql: string): never {
  throw new Error('not implemented — Phase 4');
}
