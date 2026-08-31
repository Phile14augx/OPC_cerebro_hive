import { expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

export function assertNoMutation(originalState: Map<string, string>, currentState: Map<string, string>): void {
  expect(currentState.size).toBe(originalState.size);
  for (const [key, val] of originalState.entries()) {
    expect(currentState.get(key)).toBe(val);
  }
}

export function captureWorktreeState(worktreePath: string): Map<string, string> {
  const state = new Map<string, string>();
  if (!fs.existsSync(worktreePath)) return state;
  function walk(dir: string) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file === '.git') continue;
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else {
        const content = fs.readFileSync(fullPath, 'utf8');
        state.set(fullPath, content);
      }
    }
  }
  walk(worktreePath);
  return state;
}
