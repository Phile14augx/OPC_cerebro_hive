import { describe, expect, it } from 'vitest';
import { evaluateTwinDefinitionPolicy } from './twin-policy';

const definition = {
  entityTypes: [{ key: 'asset', name: 'Asset' }],
  relationshipTypes: [],
  variables: [],
  rules: [],
  entities: [{ key: 'asset-1', name: 'Asset 1', typeKey: 'asset', attributes: {} }],
};

describe('twin definition policy', () => {
  it('accepts a bounded generic definition', () => {
    expect(evaluateTwinDefinitionPolicy(definition)).toEqual({ allowed: true });
  });

  it('rejects duplicate runtime entity keys', () => {
    expect(
      evaluateTwinDefinitionPolicy({
        ...definition,
        entities: [...definition.entities, { ...definition.entities[0] }],
      }),
    ).toEqual({ allowed: false, reason: 'DUPLICATE_ENTITY_KEY' });
  });

  it('rejects executable rule expressions', () => {
    expect(
      evaluateTwinDefinitionPolicy({
        ...definition,
        rules: [{ key: 'unsafe', expression: 'eval("danger")' }],
      }),
    ).toEqual({ allowed: false, reason: 'UNSAFE_RULE_EXPRESSION' });
  });
});
