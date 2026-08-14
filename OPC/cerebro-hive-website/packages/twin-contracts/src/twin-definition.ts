import { z } from 'zod';

const EntityTypeSchema = z.object({ key: z.string().regex(/^[a-z][a-z0-9-]*$/), name: z.string().min(1) });
const RelationshipTypeSchema = z.object({
  key: z.string().regex(/^[a-z][a-z0-9-]*$/),
  from: z.string().regex(/^[a-z][a-z0-9-]*$/),
  to: z.string().regex(/^[a-z][a-z0-9-]*$/),
});
const EntitySchema = z.object({
  key: z.string().regex(/^[a-z][a-z0-9-]*$/),
  name: z.string().min(1),
  typeKey: z.string().regex(/^[a-z][a-z0-9-]*$/),
  attributes: z.record(z.string(), z.unknown()).default({}),
});

export const TwinDefinitionSchema = z.object({
  entityTypes: z.array(EntityTypeSchema).min(1),
  relationshipTypes: z.array(RelationshipTypeSchema),
  variables: z.array(z.object({ key: z.string().min(1), unit: z.string().min(1) })),
  rules: z.array(z.object({ key: z.string().min(1), expression: z.string().min(1) })),
  entities: z.array(EntitySchema).default([]),
}).superRefine((definition, context) => {
  const entityTypes = new Set(definition.entityTypes.map((type) => type.key));
  definition.relationshipTypes.forEach((relationship, index) => {
    for (const endpoint of ['from', 'to'] as const) {
      if (!entityTypes.has(relationship[endpoint])) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ['relationshipTypes', index, endpoint], message: `Unknown entity type: ${relationship[endpoint]}` });
      }
    }
  });
  definition.entities.forEach((entity, index) => {
    if (!entityTypes.has(entity.typeKey)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['entities', index, 'typeKey'],
        message: `Unknown entity type: ${entity.typeKey}`,
      });
    }
  });
});

export type TwinDefinition = z.infer<typeof TwinDefinitionSchema>;
