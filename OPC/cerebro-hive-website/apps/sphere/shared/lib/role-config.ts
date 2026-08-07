/**
 * CerebroSphere — Role configuration
 * Defines which panels each C-suite role sees and the priority order.
 * Claude uses this to tailor narrative generation to the correct audience.
 */
import type { RoleProfile, UserRole } from './types';

export const ROLE_PROFILES: Record<UserRole, RoleProfile> = {
  ceo: {
    role: 'ceo',
    label: 'CEO',
    description: 'Strategic overview — revenue, growth, risk, and enterprise health',
    color: 'var(--role-ceo)',
    panels: [
      'ai-narrative',
      'platform-health',
      'business-kpis',
      'active-alerts',
      'product-grid',
      'cost-finops',
    ],
  },
  cto: {
    role: 'cto',
    label: 'CTO',
    description: 'Technical depth — agent fleet, system health, performance, and deployments',
    color: 'var(--role-cto)',
    panels: [
      'ai-narrative',
      'platform-health',
      'agent-fleet',
      'product-grid',
      'workflow-activity',
      'security-posture',
      'cost-finops',
    ],
  },
  coo: {
    role: 'coo',
    label: 'COO',
    description: 'Operational excellence — workflows, throughput, SLAs, and team performance',
    color: 'var(--role-coo)',
    panels: [
      'ai-narrative',
      'platform-health',
      'workflow-activity',
      'agent-fleet',
      'active-alerts',
      'business-kpis',
    ],
  },
  dept: {
    role: 'dept',
    label: 'Dept Head',
    description: 'Department view — team KPIs, relevant workflows, and budget utilisation',
    color: 'var(--role-dept)',
    panels: [
      'ai-narrative',
      'business-kpis',
      'workflow-activity',
      'active-alerts',
      'cost-finops',
    ],
  },
};

export const DEFAULT_ROLE: UserRole = 'ceo';

/** Ordered list for the role switcher UI */
export const ROLE_ORDER: UserRole[] = ['ceo', 'cto', 'coo', 'dept'];

/** Map role → Claude audience instruction for narrative generation */
export const ROLE_AUDIENCE: Record<UserRole, string> = {
  ceo: 'a CEO who cares about revenue growth, enterprise risk, competitive positioning, and board-level metrics. Avoid deep technical details.',
  cto: 'a CTO who cares about system reliability, agent performance, infrastructure health, security posture, and technical debt. Include relevant technical specifics.',
  coo: 'a COO who cares about operational throughput, workflow efficiency, SLA adherence, team productivity, and process optimisation.',
  dept: 'a department head who cares about their team\'s KPIs, budget utilisation, workflow completion rates, and alerts relevant to their function.',
};
