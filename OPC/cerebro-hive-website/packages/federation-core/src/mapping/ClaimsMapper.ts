import { IdentityClaims } from '@cerebro/identity-core';

export interface MappingRule {
  sourceClaim: string;
  operation: 'copy' | 'map' | 'static';
  targetClaim: string;
  valueMap?: Record<string, unknown>; // Used if operation is 'map'
  staticValue?: unknown; // Used if operation is 'static'
}

export interface MappingProfile {
  id: string;
  issuer: string;
  rules: MappingRule[];
}

export class ClaimsMapper {
  map(externalClaims: Record<string, unknown>, profile: MappingProfile): IdentityClaims {
    const internalClaims: Record<string, unknown> = {};

    for (const rule of profile.rules) {
      if (rule.operation === 'copy') {
        const value = externalClaims[rule.sourceClaim];
        if (value !== undefined) {
          internalClaims[rule.targetClaim] = value;
        }
      } else if (rule.operation === 'map' && rule.valueMap) {
        const sourceValue = externalClaims[rule.sourceClaim];
        if (sourceValue !== undefined) {
          // E.g. sourceClaim 'groups', sourceValue might be an array
          if (Array.isArray(sourceValue)) {
            for (const item of sourceValue) {
              if (typeof item === 'string' && rule.valueMap[item]) {
                internalClaims[rule.targetClaim] = rule.valueMap[item];
                break; // Just taking the first match for simplicity
              }
            }
          } else {
            if (typeof sourceValue === 'string' && rule.valueMap[sourceValue]) {
              internalClaims[rule.targetClaim] = rule.valueMap[sourceValue];
            }
          }
        }
      } else if (rule.operation === 'static') {
        internalClaims[rule.targetClaim] = rule.staticValue;
      }
    }

    return internalClaims as unknown as IdentityClaims;
  }
}
