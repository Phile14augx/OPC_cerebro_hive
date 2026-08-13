import { describe, expect, it } from 'vitest';

import { ProvenanceSchema } from './provenance';

describe('ProvenanceSchema', () => {
  it('rejects an observation without classification and temporal provenance', () => {
    expect(() => ProvenanceSchema.parse({ source: 'factory-simulator' })).toThrow();
  });
});
