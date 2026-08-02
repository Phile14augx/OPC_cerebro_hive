/**
 * Semantic key — ADR 0011 (D9).
 *
 * Lives in eda-domain, not eda-findings, because both parsers (platform layer)
 * and finding storage (capability layer) need it. The architecture check caught
 * this: eda-parser importing it from eda-findings was an outward dependency,
 * which is the shape of a primitive sitting in the wrong package.
 *
 * The canonical *encoding* and hashing stay in eda-findings — only the type and
 * the exclusion rules are shared.
 */

export type SemanticKey = ReadonlyArray<readonly [field: string, value: string]>;

/**
 * Field names that may never contribute to a finding signature (ADR 0011).
 *
 * Two failure modes this guards:
 *   over-inclusive  → every run reports 100% new findings; feature is worthless
 *   under-inclusive → distinct findings collapse; waivers hide real violations
 *
 * Over-inclusion is the easy mistake, because adding a field always feels safe.
 * This turns it into a registration-time error.
 */
export const EXCLUDED_KEY_FIELDS: ReadonlySet<string> = new Set([
  // measured values — what we track *over* the signature
  'slack', 'slack_ps', 'delay', 'transition', 'arrival', 'required',
  'power', 'capacitance', 'hits', 'coverage', 'wns', 'tns',
  // run metadata — signature must be stable across runs by definition
  'run_id', 'job_id', 'flow_run_id', 'timestamp', 'time', 'date',
  'tool_version', 'host', 'hostname', 'machine', 'duration',
  // positional/ordinal — report ordering is unstable across tool versions
  'line', 'line_number', 'rank', 'index', 'violation_index', 'byte_offset',
  // presentation
  'formatted', 'display', 'units', 'precision',
  // environmental
  'user', 'username', 'cwd', 'working_directory', 'seed',
]);

export class ExcludedFieldError extends Error {
  constructor(field: string) {
    super(
      `Field "${field}" may not contribute to a finding signature (ADR 0011). ` +
        'Measured, positional, environmental and run-metadata fields are excluded by construction.',
    );
    this.name = 'ExcludedFieldError';
  }
}
