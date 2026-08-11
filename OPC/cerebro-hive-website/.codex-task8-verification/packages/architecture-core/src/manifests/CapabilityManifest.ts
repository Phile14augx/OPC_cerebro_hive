import { z } from 'zod';

export const CapabilityManifestSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  description: z.string().optional(),
  version: z.string(), // Semantic versioning
  maturity: z.enum(['Experimental', 'Beta', 'Stable', 'Deprecated']),
  owner: z.string(),
  
  // Dependency & Contract Requirements
  dependencies: z.array(z.string()).default([]),
  capabilitiesRequired: z.array(z.string()).default([]),
  capabilitiesExposed: z.array(z.string()).default([]),
  
  // Governance
  permissions: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  category: z.string().optional(),
  
  // Configuration
  configSchemaVersion: z.string().default('1.0'),
  configurationDefaults: z.record(z.any()).optional()
});

export type CapabilityManifest = z.infer<typeof CapabilityManifestSchema>;
