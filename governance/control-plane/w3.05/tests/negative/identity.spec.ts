import { describe, expect, it } from 'vitest';
import { resolveIdentity } from '../../src/identity.js';

describe('Identity Resolution (Negative)', () => {
  it('rejects non-string identities', () => {
    expect(() => resolveIdentity(null)).toThrowError(/identity/i);
    expect(() => resolveIdentity(123)).toThrowError(/identity/i);
    expect(() => resolveIdentity({})).toThrowError(/identity/i);
    expect(() => resolveIdentity(undefined)).toThrowError(/identity/i);
  });

  it('rejects empty strings and whitespace strings', () => {
    expect(() => resolveIdentity('')).toThrowError(/identity/i);
    expect(() => resolveIdentity('   ')).toThrowError(/identity/i);
  });

  it('rejects multiline regex bypass attempts and strings with whitespace', () => {
    expect(() => resolveIdentity('CODEX_B0\nMALICIOUS')).toThrowError(/identity/i);
    expect(() => resolveIdentity(' CODEX_B0 ')).toThrowError(/identity/i);
    expect(() => resolveIdentity('CODEX_B0\r')).toThrowError(/identity/i);
  });

  it('rejects an unknown identity prefix', () => {
    expect(() => resolveIdentity('UNKNOWN_0')).toThrowError(/identity/i);
  });

  it('rejects a malformed identity string', () => {
    expect(() => resolveIdentity('CODEXB0')).toThrowError(/identity/i);
  });
});
