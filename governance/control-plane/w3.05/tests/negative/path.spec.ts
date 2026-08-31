import { describe, it, expect } from 'vitest';
import { resolvePathIdentity } from '../../src/canonicalization';
import path from 'path';
import fs from 'fs';

describe('Path Identity - Negative', () => {
  const root = path.resolve(__dirname, '..');
  
  it('prevents relative path traversals', () => {
    expect(() => resolvePathIdentity(root, '../outside.txt')).toThrowError(/ESCAPE/);
    expect(() => resolvePathIdentity(root, 'positive/../../outside.txt')).toThrowError(/ESCAPE/);
  });

  it('prevents mixed-separator evasion', () => {
    expect(() => resolvePathIdentity(root, '..\\outside.txt')).toThrowError(/ESCAPE/);
    expect(() => resolvePathIdentity(root, 'positive/..\\..\\outside.txt')).toThrowError(/ESCAPE/);
    expect(() => resolvePathIdentity(root, 'positive\\..\\..\\outside.txt')).toThrowError(/ESCAPE/);
  });

  it('prevents absolute path outside root', () => {
    expect(() => resolvePathIdentity(root, '/tmp/outside.txt')).toThrowError(/ESCAPE/);
    expect(() => resolvePathIdentity(root, 'C:\\Windows\\System32')).toThrowError(/ESCAPE/);
  });
  
  it('rejects null bytes', () => {
    expect(() => resolvePathIdentity(root, 'positive/path\0.spec.ts')).toThrowError(/INVALID/);
  });
  
  it('rejects device names', () => {
    expect(() => resolvePathIdentity(root, 'CON')).toThrowError(/DEVICE/);
    expect(() => resolvePathIdentity(root, 'aux.txt')).toThrowError(/DEVICE/);
    expect(() => resolvePathIdentity(root, 'COM1')).toThrowError(/DEVICE/);
    expect(() => resolvePathIdentity(root, 'prn.ext')).toThrowError(/DEVICE/);
  });

  it('prevents intermediate symlink evasion for non-existent files', () => {
    const linkPath = path.join(root, 'symlink_out');
    const targetPath = path.resolve(root, '..'); // outside root
    
    // Create junction
    try { fs.symlinkSync(targetPath, linkPath, 'junction'); } catch { /* ignore */ }
    
    try {
      expect(() => resolvePathIdentity(root, 'symlink_out/new_file.txt')).toThrowError(/ESCAPE/);
      expect(() => resolvePathIdentity(root, 'symlink_out/non_existent_dir/new_file.txt')).toThrowError(/ESCAPE/);
    } finally {
      try { fs.unlinkSync(linkPath); } catch { /* ignore */ }
    }
  });
});
