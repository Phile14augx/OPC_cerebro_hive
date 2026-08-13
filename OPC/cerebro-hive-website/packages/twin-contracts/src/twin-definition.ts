import { z } from 'zod';

export const EntityTypeSchema = z.object({ key: z.string().regex(/^[a-z][a-z0-9-]*$/), name: z.string().min(1), category: z.enum(['PHYSICAL', 'BUSINESS', 'PROCESS', 'PEOPLE', 'ENVIRONMENT']).optional(), attributes: z.array(z.object({ key: z.string().min(1), type: z.enum(['string', 'number', 'boolean', 'datetime']), unit: z.string().optional() })).default([]) });
export const RelationshipTypeSchema = z.object({
  key: z.string().regex(/^[a-z][a-z0-9-]*$/),
  from: z.string().regex(/^[a-z][a-z0-9-]*$/),
  to: z.string().regex(/^[a-z][a-z0-9-]*$/),
  cardinality: z.enum(['ONE_TO_ONE', 'ONE_TO_MANY', 'MANY_TO_MANY']).default('ONE_TO_MANY'),
});

export const TwinDefinitionSchema = z.object({
  entityTypes: z.array(EntityTypeSchema).min(1),
  relationshipTypes: z.array(RelationshipTypeSchema),
  variables: z.array(z.object({ key: z.string().min(1), unit: z.string().min(1) })),
  rules: z.array(z.object({ key: z.string().min(1), expression: z.string().min(1) })),
}).superRefine((definition, context) => {
  const entityTypes = new Set(definition.entityTypes.map((type) => type.key));
  definition.relationshipTypes.forEach((relationship, index) => {
    for (const endpoint of ['from', 'to'] as const) {
      if (!entityTypes.has(relationship[endpoint])) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ['relationshipTypes', index, endpoint], message: `Unknown entity type: ${relationship[endpoint]}` });
      }
    }
  });
});

export type TwinDefinition = z.infer<typeof TwinDefinitionSchema>;
