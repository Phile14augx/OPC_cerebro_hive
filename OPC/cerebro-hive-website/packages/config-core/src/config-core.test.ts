import { describe, expect, it } from 'vitest';
import { ConfigManager } from './index';

describe('ConfigManager', () => {
  it('delegates reads to an injected loader and preserves missing-key errors', () => {
    const manager = new ConfigManager({ load: () => ({ mode: 'test' }), get: <T>(key: string) => { if (key !== 'mode') throw new Error('missing'); return 'test' as T; }, has: key => key === 'mode' });
    expect(manager.get('mode')).toBe('test');
    expect(manager.get('missing', 'fallback')).toBe('fallback');
    expect(() => manager.get('missing')).toThrow('missing');
  });
});
