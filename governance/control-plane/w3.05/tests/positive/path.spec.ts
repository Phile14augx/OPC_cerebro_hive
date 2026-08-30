import { describe, it, expect } from 'vitest';
import { resolvePathIdentity } from '../../src/canonicalization';
import path from 'path';

describe('Path Identity - Positive', () => {
  it('resolves a simple path correctly', () => {
    const root = path.resolve(__dirname, '..');
    const result = resolvePathIdentity(root, 'positive/path.spec.ts');
    expect(result).toBe(path.resolve(root, 'positive/path.spec.ts'));
  });
  
  it('handles absolute paths within root', () => {
    const root = path.resolve(__dirname, '..');
    const absoluteCandidate = path.resolve(root, 'positive/path.spec.ts');
    const result = resolvePathIdentity(root, absoluteCandidate);
    expect(result).toBe(absoluteCandidate);
  });
});
