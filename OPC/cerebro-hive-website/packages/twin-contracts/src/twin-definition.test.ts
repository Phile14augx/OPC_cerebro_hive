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
});
