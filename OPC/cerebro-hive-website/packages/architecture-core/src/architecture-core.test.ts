import { describe, expect, it } from 'vitest';
import { CapabilityManifestSchema } from './manifests/CapabilityManifest';
import { NamingConventions } from './standards/Naming';

describe('architecture core contracts', () => {
  it('applies manifest defaults and rejects an invalid maturity', () => {
    expect(CapabilityManifestSchema.parse({ id: 'cap', displayName: 'Cap', version: '1.0.0', maturity: 'Stable', owner: 'team' })).toMatchObject({ dependencies: [], permissions: [], configSchemaVersion: '1.0' });
    expect(() => CapabilityManifestSchema.parse({ id: 'cap', displayName: 'Cap', version: '1', maturity: 'Unknown', owner: 'team' })).toThrow();
    expect(NamingConventions.PACKAGE_PREFIX).toBe('@cerebro/');
  });
});
