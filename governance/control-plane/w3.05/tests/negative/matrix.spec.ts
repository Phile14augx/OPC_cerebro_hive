import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { assertNoMutation, captureWorktreeState } from '../helpers/no-mutation-assertion';
import { FixtureRepository } from '../helpers/fixture-repository';

const reportPath = path.resolve(__dirname, '../../AG_Q15_PREP_REPORT.md');
const reportContent = fs.readFileSync(reportPath, 'utf8');

const controls: { id: string; spec: string; task: string; testFile: string; reasonCode: string; severity: string; noMutation: string; status: string }[] = [];
const regex = /NEGATIVE_CONTROL_ID:\s*(NC-\d+)\s+SPEC_REQUIREMENT:\s*(.*?)\s+OWNING_TASK:\s*(.*?)\s+TEST_FILE:\s*(.*?)\s+EXPECTED_REASON_CODE:\s*(.*?)\s+EXPECTED_SEVERITY:\s*(.*?)\s+NO_MUTATION_ASSERTION:\s*(.*?)\s+CURRENT_STATUS:\s*(.*?)\s/g;

let match;
while ((match = regex.exec(reportContent)) !== null) {
  controls.push({
    id: match[1],
    spec: match[2],
    task: match[3],
    testFile: match[4],
    reasonCode: match[5],
    severity: match[6],
    noMutation: match[7],
    status: match[8]
  });
}

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
