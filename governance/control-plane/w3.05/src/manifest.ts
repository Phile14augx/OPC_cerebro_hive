import * as fs from 'fs';
import { SchemaRegistry } from './schemas/registry.js';
import type { RunManifest, ValidationResult } from './types.js';

const registry = new SchemaRegistry();

export function validateManifest(payload: unknown): ValidationResult<RunManifest> {
  return registry.validate<RunManifest>('run-manifest', payload);
}

export function loadManifest(filePath: string): ValidationResult<RunManifest> {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const payload = JSON.parse(content);
    return validateManifest(payload);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      valid: false,
      findings: [{
        code: 'CONTROL_PARSE_INVALID',
        severity: 'BLOCKING',
        message: `Failed to parse manifest: ${message}`,
        evidenceRefs: []
      }]
    };
  }
}
