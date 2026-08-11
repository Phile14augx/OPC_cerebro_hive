import { SITE_URL } from '../config';
import type { DiscoveryEntity } from '../knowledge-graph/types';

export const ENTITY_HIVEPULSE: DiscoveryEntity = {
  name: 'HivePulse',
  alternateName: 'Enterprise AI Operating System',
  description: 'HivePulse is CerebroHive\'s Enterprise AI Operating System — a unified control plane for deploying, managing, and orchestrating AI agents, intelligent workflows, and enterprise knowledge systems.',
  url: `${SITE_URL}/products/hivepulse`,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Cloud, On-Premise, Hybrid',
};

export const ENTITY_CEREBRO_X: DiscoveryEntity = {
  name: 'Cerebro X',
  alternateName: 'Enterprise AI Intelligence Platform',
  description: 'Cerebro X is CerebroHive\'s intelligence layer — powering enterprise search, knowledge graph management, contextual reasoning, and AI orchestration across every product and workflow.',
  url: `${SITE_URL}/products/cerebro-x`,
  applicationCategory: 'BusinessApplication',
};

export const ENTITY_DEVELOPER_PLATFORM: DiscoveryEntity = {
  name: 'CerebroHive Developer Platform',
  description: 'REST API, Python/TypeScript SDKs, MCP server implementations, CLI tools, and OpenAPI specification for building integrations and extensions on CerebroHive.',
  url: `${SITE_URL}/developers`,
};

export const ENTITY_AI_COE: DiscoveryEntity = {
  name: 'AI Center of Excellence',
  alternateName: 'AI CoE',
  description: 'A centralized enterprise team that drives AI strategy, standardizes tools and practices, builds internal AI capability, and governs AI deployment across business units.',
  url: `${SITE_URL}/services/coe`,
};

export const ENTITY_AI_FACTORY: DiscoveryEntity = {
  name: 'AI Factory',
  description: 'An operational model for producing AI solutions at scale — combining standardized processes, reusable components, and automation pipelines to accelerate AI from concept to production.',
  url: `${SITE_URL}/services/ai-factory`,
};
