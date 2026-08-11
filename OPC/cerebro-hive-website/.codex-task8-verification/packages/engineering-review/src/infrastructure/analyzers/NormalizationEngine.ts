import { CanonicalFinding } from './models';

/**
 * Normalization Schema definitions
 * Extends the abstract capability of mapping proprietary outputs (SARIF, JSON, CSV)
 * into Cerebro's strict CanonicalFinding schema.
 */
export interface INormalizationEngine<TVendorOutput> {
  /**
   * Version of the vendor schema this parser understands (e.g. 'sarif-v2.1.0')
   */
  readonly supportedSchemaVersion: string;

  /**
   * Maps a vendor-specific finding output into a CanonicalFinding.
   */
  normalize(rawOutput: TVendorOutput): CanonicalFinding[];
}
