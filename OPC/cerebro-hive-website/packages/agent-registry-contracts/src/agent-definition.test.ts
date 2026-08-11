import { describe, expect, it } from 'vitest';
import { validateForPublication } from './agent-definition';
import { publishableDefinition } from './test-fixtures';

describe('AgentDefinitionV1 publication validation', () => {
  it('rejects an action declared as both allowed and prohibited', () => {
    const result = validateForPublication({
      ...publishableDefinition,
      prohibitedActions: [{ actionRef: 'action:invoice.read', description: 'Conflicting declaration' }],
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContainEqual(expect.objectContaining({
      code: 'AGENT_DEFINITION_ACTION_CONFLICT',
      path: 'prohibitedActions.0.actionRef',
    }));
  });

  it('treats VALID as publishable now, not merely structurally valid', () => {
    const result = validateForPublication({ ...publishableDefinition, purpose: '' });

    expect(result.success).toBe(false);
    expect(result.errors).toContainEqual(expect.objectContaining({
      code: 'AGENT_DEFINITION_REQUIRED',
      path: 'purpose',
    }));
  });
});
