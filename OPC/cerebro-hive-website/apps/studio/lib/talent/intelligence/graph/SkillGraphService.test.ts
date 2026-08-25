import assert from 'node:assert/strict';
import { test } from 'vitest';
import { SkillGraphService } from './SkillGraphService';

test('fails closed when canonical skill graph persistence is unavailable', async () => {
  const service = new SkillGraphService();

  await assert.rejects(
    service.recordEvidence(
      'candidate-1',
      'Advanced SQL',
      91,
      0.95,
      'Window function analysis',
      'assessment',
    ),
    /ERR_SCHEMA_MISSING: skillEvidence schema is unavailable/,
  );
});
