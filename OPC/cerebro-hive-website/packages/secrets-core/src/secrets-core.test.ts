import { describe, expect, it } from 'vitest';
import { InMemoryVaultEngine, MockKeyProvider } from './index';

describe('secrets-core in-memory contracts', () => {
  it('retrieves explicit secret versions, defaults to the latest, and deletes all material', async () => {
    const vault = new InMemoryVaultEngine();
    await vault.storeSecret('vault://service/key', 'first', 1);
    await vault.storeSecret('vault://service/key', 'third', 3);
    await vault.storeSecret('vault://service/key', 'second', 2);

    expect(await vault.retrieveSecret('vault://service/key', 1)).toBe('first');
    expect(await vault.retrieveSecret('vault://service/key')).toBe('third');

    await vault.deleteSecret('vault://service/key');
    expect(await vault.retrieveSecret('vault://service/key')).toBeUndefined();
  });

  it('verifies signatures for the active key and rejects a different payload length', async () => {
    const keys = new MockKeyProvider('key-contract');
    const signature = await keys.sign('approved payload');

    expect(keys.keyId()).toBe('key-contract');
    expect(await keys.verify('approved payload', signature)).toBe(true);
    expect(await keys.verify('short', signature)).toBe(false);
  });
});
