import { SITE_URL } from '../config';
import type { DiscoveryEntity } from '../knowledge-graph/types';

export const ENTITY_HIVE_MARKETPLACE: DiscoveryEntity = {
  name: 'HiveMarketplace',
  description: 'The CerebroHive Marketplace for enterprise AI agents, workflow automation templates, MCP server implementations, data connectors, and platform extensions.',
  url: `${SITE_URL}/marketplace`,
};

export const MARKETPLACE_CATEGORIES = [
  'AI Agents',
  'Workflow Templates',
  'Data Connectors',
  'Knowledge Bases',
  'Analytics Plugins',
  'Security & Compliance',
  'Industry Solutions',
  'Developer Tools',
  'MCP Servers',
] as const;
