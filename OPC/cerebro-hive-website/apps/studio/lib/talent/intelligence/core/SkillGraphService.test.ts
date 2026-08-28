import assert from 'node:assert/strict';
import { test } from 'vitest';
import { SkillGraphService } from './SkillGraphService';

test('rejects malformed evaluator evidence before it reaches the skill graph', async () => {
  const service = new SkillGraphService();

  await assert.rejects(
    service.recordEvidence('candidate-1', 'capability-1', { score: 87 }),
    TypeError,
  );
});

test('accepts complete evaluator evidence', async () => {
  const service = new SkillGraphService();

  await assert.doesNotReject(
    service.recordEvidence('candidate-1', 'capability-1', {
      capabilityId: 'capability-1',
      score: 87,
      confidence: 0.92,
      reasoning: 'Demonstrated reliable query-planning knowledge.',
    }),
  );
});

test('rejects out-of-range evidence scores and confidence values', async () => {
  const service = new SkillGraphService();

  await assert.rejects(
    service.recordEvidence('candidate-1', 'capability-1', {
      capabilityId: 'capability-1',
      score: 101,
      confidence: 1.2,
      reasoning: 'Malformed score range.',
    }),
    TypeError,
  );
});
