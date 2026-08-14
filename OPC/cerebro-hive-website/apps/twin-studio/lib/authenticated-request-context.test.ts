import { describe, expect, it } from 'vitest';
import { DEV_WORKSPACE_ID, localDevelopmentScope } from './dev-auth-scope';

describe('local development auth', () => {
  it('binds to the seeded workspace and ignores caller-supplied workspace ids', () => {
    const spoofed = '00000000-0000-4000-8000-999999999999';
    const scope = localDevelopmentScope();
    expect(scope.workspaceId).toBe(DEV_WORKSPACE_ID);
    expect(scope.workspaceId).not.toBe(spoofed);
  });
});
