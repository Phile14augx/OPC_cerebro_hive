import type { TwinDefinition } from '@cerebro/twin-contracts';

export type PolicyResult = { allowed: true } | { allowed: false; reason: string };

export function evaluateTwinDefinitionPolicy(definition: TwinDefinition): PolicyResult {
  if (definition.entityTypes.length > 100) {
    return { allowed: false, reason: 'ENTITY_TYPE_LIMIT_EXCEEDED' };
  }
  if (definition.entities.length > 10_000) {
    return { allowed: false, reason: 'ENTITY_LIMIT_EXCEEDED' };
  }
  const entityKeys = new Set<string>();
  for (const entity of definition.entities) {
    if (entityKeys.has(entity.key)) return { allowed: false, reason: 'DUPLICATE_ENTITY_KEY' };
    entityKeys.add(entity.key);
  }
  const unsafeExpression = definition.rules.some((rule) =>
    /<script|javascript:|eval\s*\(|new\s+Function/i.test(rule.expression),
  );
  if (unsafeExpression) return { allowed: false, reason: 'UNSAFE_RULE_EXPRESSION' };
  return { allowed: true };
}
