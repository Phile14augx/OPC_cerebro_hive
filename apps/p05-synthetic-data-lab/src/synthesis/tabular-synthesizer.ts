/**
 * TabularSynthesizer
 *
 * Rule-based tabular data synthesis engine.
 *
 * For each column the caller may supply an optional `ColumnConfig` specifying:
 *   - `type: 'categorical'` with a `values` array  → round-robin distribution
 *   - `type: 'numeric'`     with optional `min`/`max` → uniform integer sampling in range
 *
 * When no `columnConfig` entry is present for a column the synthesizer falls
 * back to an auto-typed default (numeric index-based integer).
 */

export interface CategoricalColumnConfig {
  type: 'categorical';
  /** Exhaustive list of allowed cardinality values */
  values: string[];
}

export interface NumericColumnConfig {
  type: 'numeric';
  min?: number;
  max?: number;
}

export type ColumnConfig = CategoricalColumnConfig | NumericColumnConfig;

export interface SynthesisSpec {
  /** Ordered list of column names to generate */
  columns: string[];
  /** Number of rows to produce */
  targetRows: number;
  /** Per-column configuration (optional) */
  columnConfig?: Record<string, ColumnConfig>;
}

export class TabularSynthesizer {
  /**
   * Synthesise `spec.targetRows` rows matching the declared column schema.
   *
   * Determinism is NOT guaranteed — each call may produce different values,
   * which matches real synthesis behaviour.  Tests that care about specific
   * value ranges should use the `columnConfig` overrides.
   */
  generate(spec: SynthesisSpec): Record<string, unknown>[] {
    const { columns, targetRows, columnConfig = {} } = spec;
    const rows: Record<string, unknown>[] = [];

    for (let i = 0; i < targetRows; i++) {
      const row: Record<string, unknown> = {};
      for (const col of columns) {
        const cfg = columnConfig[col];
        row[col] = cfg ? this._synthesiseConfigured(col, i, cfg) : this._synthesiseDefault(col, i);
      }
      rows.push(row);
    }

    return rows;
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private _synthesiseConfigured(col: string, rowIndex: number, cfg: ColumnConfig): unknown {
    if (cfg.type === 'categorical') {
      if (!cfg.values || cfg.values.length === 0) {
        throw new Error(`Column "${col}" has categorical config with an empty values array`);
      }
      // Round-robin: guarantees every value appears at least once when
      // targetRows >= values.length, giving maximum cardinality coverage.
      return cfg.values[rowIndex % cfg.values.length];
    }

    if (cfg.type === 'numeric') {
      const min = cfg.min ?? 0;
      const max = cfg.max ?? 1000;
      return this._uniformInt(min, max);
    }

    // Exhaustive check — TypeScript narrowing already covers this
    // but keep a runtime guard for JavaScript callers.
    throw new Error(`Unknown column config type for column "${col}"`);
  }

  private _synthesiseDefault(col: string, rowIndex: number): unknown {
    // Auto-type heuristic:
    //   • column name ends with "id" (case-insensitive) → sequential integer
    //   • otherwise → uniform integer in [0, 9999]
    if (/id$/i.test(col)) {
      return rowIndex + 1;
    }
    return this._uniformInt(0, 9999);
  }

  /**
   * Returns a uniformly distributed integer in the closed interval [min, max].
   */
  private _uniformInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
