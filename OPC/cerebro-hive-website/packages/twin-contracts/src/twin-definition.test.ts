import { describe, expect, it } from 'vitest';

import { TwinDefinitionSchema } from './twin-definition';

describe('TwinDefinitionSchema', () => {
  it('rejects a relationship whose target type is not declared', () => {
    expect(() =>
      TwinDefinitionSchema.parse({
        entityTypes: [{ key: 'motor', name: 'Motor' }],
        relationshipTypes: [{ key: 'installed-on', from: 'motor', to: 'production-line' }],
        variables: [],
        rules: [],
      })
    ).toThrow(/production-line/);
  });

  it('preserves valid entity instances and rejects unknown entity types', () => {
    const definition = {
      entityTypes: [{ key: 'motor', name: 'Motor' }],
      relationshipTypes: [],
      variables: [],
      rules: [],
      entities: [{ key: 'motor-07', name: 'Motor 07', typeKey: 'motor', attributes: {} }],
    };

    expect(TwinDefinitionSchema.parse(definition).entities).toEqual(definition.entities);
    expect(() =>
      TwinDefinitionSchema.parse({
        ...definition,
        entities: [{ ...definition.entities[0], typeKey: 'production-line' }],
      })
    ).toThrow(/production-line/);
  });
});
