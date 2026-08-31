import { createHash } from 'crypto';

export interface DirtyStateEvidence {
  staged: Record<string, never>;
  unstaged: Record<string, never>;
  untracked: Record<string, never>;
  dirty_fingerprint: string;
}

/**
 * Reads standard Git output (e.g. porcelain) and generates a deterministic dirty_fingerprint,
 * matching the worktree.schema.json specifications (where staged, unstaged, and untracked
 * MUST be empty objects to enforce structural closure).
 */
export function captureDirtyState(gitStatusOutput: string): DirtyStateEvidence {
  // We can normalize the output to ensure stable deterministic hashing
  const normalized = gitStatusOutput.trim().split('\n').map(line => line.trim()).filter(Boolean).sort().join('\n');
  
  const fingerprint = createHash('sha256').update(normalized).digest('hex');

  // To strictly adhere to the schemas (no extra properties), we only return exactly what's needed.
  return {
    staged: {},
    unstaged: {},
    untracked: {},
    dirty_fingerprint: fingerprint
  };
}
