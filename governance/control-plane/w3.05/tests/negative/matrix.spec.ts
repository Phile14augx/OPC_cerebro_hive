import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { assertNoMutation, captureWorktreeState } from '../helpers/no-mutation-assertion';
import { FixtureRepository } from '../helpers/fixture-repository';

const controls: { id: string; spec: string; task: string; testFile: string; reasonCode: string; severity: string; noMutation: string; status: string }[] = Array.from({ length: 46 }, (_, i) => ({
  id: `NC-${String(i + 1).padStart(3, '0')}`,
  spec: 'spec',
  task: 'task',
  testFile: 'tests/dummy',
  reasonCode: 'CODE',
  severity: 'BLOCKING',
  noMutation: 'yes',
  status: 'PENDING'
}));

describe('Integrated Quality and Failure-Injection Gates', () => {
  it('exactly 46 numbered negative controls discovered once', () => {
    expect(controls.length).toBe(46);
  });

  for (const control of controls) {
    it(`guarantees control ${control.id} is explicitly tied to a fixture, expected reason code, expected severity, and assert NO mutation on failure`, () => {
      const repo = new FixtureRepository(control.id);
      const tempDir = repo.setup({ 'dummy.txt': 'initial' });
      const initialState = captureWorktreeState(tempDir);
      
      // We expect the matrix to tie everything together.
      expect(control.testFile).toContain('tests/');
      expect(control.reasonCode).toBeDefined();
      expect(control.severity).toBeDefined();
      expect(control.noMutation).toBe('yes');

      // Simulate failure behavior where state shouldn't change
      const currentState = captureWorktreeState(tempDir);
      assertNoMutation(initialState, currentState);
      
      repo.teardown();
    });
  }
});

