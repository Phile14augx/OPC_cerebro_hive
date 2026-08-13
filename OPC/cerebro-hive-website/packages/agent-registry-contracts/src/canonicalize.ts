import { createHash } from 'node:crypto';
import { AgentDefinitionV1Schema, type AgentDefinitionV1 } from './agent-definition';

const normalizeText = (value: string) => value.replace(/\r\n?/g, '\n').normalize('NFC');

function normalizeUnknown(value: unknown): unknown {
  if (typeof value === 'string') return normalizeText(value);
  if (Array.isArray(value)) return value.map(normalizeUnknown);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, child]) => child !== undefined)
        .map(([key, child]) => [key, normalizeUnknown(child)]),
    );
  }
  return Object.is(value, -0) ? 0 : value;
}

const by = (key: string) => (left: Record<string, unknown>, right: Record<string, unknown>) =>
  String(left[key]).localeCompare(String(right[key]));

export function normalizeAgentDefinition(input: unknown): AgentDefinitionV1 {
  const parsed = AgentDefinitionV1Schema.parse(normalizeUnknown(input));
  return {
    ...parsed,
    capabilities: [...parsed.capabilities].sort(by('capabilityRef')),
    allowedActions: [...parsed.allowedActions].sort(by('actionRef')),
    prohibitedActions: [...parsed.prohibitedActions].sort(by('actionRef')),
    toolPermissions: [...parsed.toolPermissions]
      .map(permission => ({ ...permission, operations: [...permission.operations].sort() }))
      .sort(by('toolRef')),
    knowledgeSources: [...parsed.knowledgeSources].sort(by('knowledgeSourceRef')),
  };
}

function stableJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  const object = value as Record<string, unknown>;
  return `{${Object.keys(object).sort().map(key => `${JSON.stringify(key)}:${stableJson(object[key])}`).join(',')}}`;
}

export function canonicalizeAgentDefinition(input: unknown): string {
  return stableJson(normalizeAgentDefinition(input));
}

export function hashAgentDefinition(input: unknown): string {
  return createHash('sha256').update(canonicalizeAgentDefinition(input), 'utf8').digest('hex');
}
