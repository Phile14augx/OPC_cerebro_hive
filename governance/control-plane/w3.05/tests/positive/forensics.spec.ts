import { describe, expect, it } from 'vitest';
import { captureDirtyState } from '../../src/forensics.js';

describe('Forensics dirty state capture', () => {
  it('generates deterministic dirty_fingerprint for empty git output', () => {
    const result = captureDirtyState('');
    expect(result.staged).toEqual({});
    expect(result.unstaged).toEqual({});
    expect(result.untracked).toEqual({});
    expect(result.dirty_fingerprint).toMatch(/^[0-9a-f]{64}$/);
    
    // Ensure structural closure (no extra properties in the returned parts)
    expect(Object.keys(result.staged).length).toBe(0);
    expect(Object.keys(result.unstaged).length).toBe(0);
    expect(Object.keys(result.untracked).length).toBe(0);
  });

  it('generates a stable fingerprint for a given git status porcelain v1 output', () => {
    const gitOutput = `M  modified_staged.ts\n M modified_unstaged.ts\n?? untracked.ts\n`;
    const result = captureDirtyState(gitOutput);
    
    expect(result.staged).toEqual({});
    expect(result.unstaged).toEqual({});
    expect(result.untracked).toEqual({});
    expect(result.dirty_fingerprint).toMatch(/^[0-9a-f]{64}$/);
    
    const result2 = captureDirtyState(gitOutput);
    expect(result.dirty_fingerprint).toBe(result2.dirty_fingerprint);
    
    const differentOutput = ` M modified_unstaged.ts\n`;
    const result3 = captureDirtyState(differentOutput);
    expect(result.dirty_fingerprint).not.toBe(result3.dirty_fingerprint);
  });
});
