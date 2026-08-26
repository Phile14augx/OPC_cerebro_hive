import type { OrganizationNodeData } from '@/lib/services/organizationService';

const departmentThemes = new Set([
  'executive',
  'engineering',
  'research',
  'consulting',
  'business',
]);

const isDepartmentTheme = (value: unknown): value is OrganizationNodeData['theme'] => (
  typeof value === 'string' && departmentThemes.has(value)
);

export const isOrganizationNodeData = (data: Record<string, unknown>): data is OrganizationNodeData => (
  typeof data.id === 'string'
  && (data.type === 'executive' || data.type === 'department' || data.type === 'team')
  && isDepartmentTheme(data.theme)
  && typeof data.title === 'string'
);
