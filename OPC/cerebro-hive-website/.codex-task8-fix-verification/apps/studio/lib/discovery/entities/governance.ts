import { SITE_URL } from '../config';
import type { DiscoveryEntity } from '../knowledge-graph/types';

export const ENTITY_AI_GOVERNANCE: DiscoveryEntity = {
  name: 'AI Governance',
  description: 'The framework of policies, processes, and controls ensuring AI systems are used ethically, safely, compliantly, and in alignment with business objectives and regulatory requirements.',
  url: `${SITE_URL}/services/ai-governance`,
};

export const ENTITY_RESPONSIBLE_AI: DiscoveryEntity = {
  name: 'Responsible AI',
  description: 'The practice of designing AI systems that are fair, explainable, robust, secure, and aligned with human values — covering bias mitigation, transparency, and accountability.',
  url: `${SITE_URL}/services/ai-governance`,
};

export const ENTITY_AI_COMPLIANCE: DiscoveryEntity = {
  name: 'AI Compliance',
  description: 'Ensuring enterprise AI deployments meet regulatory requirements including EU AI Act, GDPR, HIPAA, SOC2, and sector-specific regulations across healthcare, finance, and government.',
  url: `${SITE_URL}/services/ai-governance`,
};

export const ENTITY_AI_RISK: DiscoveryEntity = {
  name: 'AI Risk Management',
  description: 'Systematic identification, assessment, and mitigation of risks arising from AI systems — including model bias, data privacy violations, adversarial attacks, and unintended automation failures.',
  url: `${SITE_URL}/services/ai-governance`,
};
