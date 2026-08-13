import { describe, expect, it } from 'vitest';
import { hashAgentDefinition, normalizeAgentDefinition } from './canonicalize';
import { publishableDefinition } from './test-fixtures';

describe('AgentDefinitionV1 canonicalization', () => {
  it('hashes semantically identical unordered declarations identically', () => {
    const left = {
      ...publishableDefinition,
      capabilities: [
        { capabilityRef: 'capability:zeta' },
        { capabilityRef: 'capability:alpha' },
      ],
      toolPermissions: [
        { toolRef: 'tool:zeta', operations: ['write', 'read'] },
        { toolRef: 'tool:alpha', operations: ['read'] },
      ],
    };
    const right = {
      ...left,
      capabilities: [...left.capabilities].reverse(),
      toolPermissions: [...left.toolPermissions].reverse().map(permission => ({
        ...permission,
        operations: [...permission.operations].reverse(),
      })),
    };

    expect(hashAgentDefinition(left)).toBe(hashAgentDefinition(right));
  });

  it('normalizes CRLF and Unicode composition without trimming prompt whitespace', () => {
    const normalized = normalizeAgentDefinition({
      ...publishableDefinition,
      systemInstructions: '  Cafe\u0301\r\nKeep spacing.  ',
    });

    expect(normalized.systemInstructions).toBe('  Café\nKeep spacing.  ');
  });
});
