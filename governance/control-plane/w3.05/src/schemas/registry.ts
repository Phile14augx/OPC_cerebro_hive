import { Ajv, type AnySchema, type ErrorObject, type ValidateFunction } from 'ajv';

import agent from '../../schemas/agent.schema.json' with { type: 'json' };
import ciAttestation from '../../schemas/ci-attestation.schema.json' with { type: 'json' };
import epoch from '../../schemas/epoch.schema.json' with { type: 'json' };
import externalMutation from '../../schemas/external-mutation.schema.json' with { type: 'json' };
import finding from '../../schemas/finding.schema.json' with { type: 'json' };
import handoff from '../../schemas/handoff.schema.json' with { type: 'json' };
import productContract from '../../schemas/product-contract.schema.json' with { type: 'json' };
import proposal from '../../schemas/proposal.schema.json' with { type: 'json' };
import publicationReceipt from '../../schemas/publication-receipt.schema.json' with { type: 'json' };
import recoveryContract from '../../schemas/recovery-contract.schema.json' with { type: 'json' };
import runManifest from '../../schemas/run-manifest.schema.json' with { type: 'json' };
import sharedInfra from '../../schemas/shared-infra.schema.json' with { type: 'json' };
import worktree from '../../schemas/worktree.schema.json' with { type: 'json' };
import type { Finding, ReasonCode, ValidationResult } from '../types.js';

export const SCHEMA_NAMES = ['epoch', 'agent', 'worktree', 'product-contract', 'recovery-contract', 'external-mutation', 'shared-infra', 'ci-attestation', 'handoff', 'finding', 'proposal', 'run-manifest', 'publication-receipt'] as const;
export type SchemaName = typeof SCHEMA_NAMES[number];
export type RegistryValidationResult<T> = ValidationResult<T> & { reasonCode?: ReasonCode };
const schemas: Record<SchemaName, AnySchema> = { epoch, agent, worktree, 'product-contract': productContract, 'recovery-contract': recoveryContract, 'external-mutation': externalMutation, 'shared-infra': sharedInfra, 'ci-attestation': ciAttestation, handoff, finding, proposal, 'run-manifest': runManifest, 'publication-receipt': publicationReceipt };

function findingFor(schemaName: SchemaName, errors: ErrorObject[] | null | undefined): Finding {
  const scopeMissing = schemaName === 'product-contract' && errors?.some((error) => (error.keyword === 'required' && error.params.missingProperty === 'allow_scopes') || (error.keyword === 'minItems' && error.instancePath === '/allow_scopes'));
  const code: ReasonCode = scopeMissing ? 'SCOPE_MISSING' : 'CONTROL_SCHEMA_INVALID';
  return { code, severity: 'BLOCKING', message: `Invalid ${schemaName} record`, evidenceRefs: [] };
}

export class SchemaRegistry {
  private readonly validators: Record<SchemaName, ValidateFunction>;
  public constructor() {
    const ajv = new Ajv({ allErrors: true, strict: true });
    this.validators = Object.fromEntries(SCHEMA_NAMES.map((name) => [name, ajv.compile(schemas[name])])) as Record<SchemaName, ValidateFunction>;
  }
  public has(name: string): name is SchemaName { return (SCHEMA_NAMES as readonly string[]).includes(name); }
  public compile(name: SchemaName): ValidateFunction { return this.validators[name]; }
  public validate<T>(name: SchemaName | string, value: unknown): RegistryValidationResult<T> {
    if (!this.has(name)) {
      const code: ReasonCode = 'CONTROL_SCHEMA_INVALID';
      return { valid: false, reasonCode: code, findings: [{ code, severity: 'BLOCKING', message: `Unknown schema: ${name}`, evidenceRefs: [] }] };
    }
    const validator = this.compile(name);
    if (validator(value)) return { valid: true, value: value as T, findings: [] };
    const contractFinding = findingFor(name, validator.errors);
    return { valid: false, reasonCode: contractFinding.code, findings: [contractFinding] };
  }
}
