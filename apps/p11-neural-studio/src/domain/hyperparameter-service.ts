// ─── Hyperparameter Service ───────────────────────────────────────────────────
// Validates and merges hyperparameter configurations.

import { HyperparameterConfig } from '../contracts';

const DEFAULTS: Required<Pick<HyperparameterConfig, 'dropout' | 'weightDecay'>> = {
  dropout: 0,
  weightDecay: 0,
};

export class HyperparameterService {
  /**
   * Validates a `HyperparameterConfig`, throwing on constraint violations.
   */
  static validate(config: HyperparameterConfig): void {
    if (config.learningRate <= 0 || config.learningRate > 10) {
      throw new RangeError(`learningRate must be in (0, 10], got ${config.learningRate}`);
    }
    if (!Number.isInteger(config.batchSize) || config.batchSize < 1) {
      throw new RangeError(`batchSize must be a positive integer, got ${config.batchSize}`);
    }
    if (!Number.isInteger(config.epochs) || config.epochs < 1) {
      throw new RangeError(`epochs must be a positive integer, got ${config.epochs}`);
    }
    if (config.dropout !== undefined && (config.dropout < 0 || config.dropout >= 1)) {
      throw new RangeError(`dropout must be in [0, 1), got ${config.dropout}`);
    }
    if (config.weightDecay !== undefined && config.weightDecay < 0) {
      throw new RangeError(`weightDecay must be >= 0, got ${config.weightDecay}`);
    }
  }

  /** Returns a new config with missing optional fields filled with defaults. */
  static applyDefaults(config: HyperparameterConfig): HyperparameterConfig {
    return { ...DEFAULTS, ...config };
  }

  /**
   * Merges a partial update into an existing config, validates the result,
   * and returns the merged config.
   */
  static merge(
    base: HyperparameterConfig,
    patch: Partial<HyperparameterConfig>,
  ): HyperparameterConfig {
    const merged: HyperparameterConfig = { ...base, ...patch };
    HyperparameterService.validate(merged);
    return merged;
  }
}
