import { SITE_URL } from '../config';
import type { DiscoveryEntity } from '../knowledge-graph/types';

export const ENTITY_AI_AGENT: DiscoveryEntity = {
  name: 'AI Agent',
  description: 'An autonomous software system powered by an LLM that perceives its environment, reasons, plans, and takes actions to achieve specific goals without continuous human intervention.',
  url: `${SITE_URL}/services/autonomous-transformation`,
};

export const ENTITY_MULTI_AGENT: DiscoveryEntity = {
  name: 'Multi-Agent Systems',
  description: 'Architectures where multiple specialized AI agents collaborate, delegate tasks, and coordinate to solve complex enterprise problems that exceed the capability of a single agent.',
  url: `${SITE_URL}/platform`,
};

export const ENTITY_MCP: DiscoveryEntity = {
  name: 'Model Context Protocol',
  alternateName: 'MCP',
  description: 'An open standard by Anthropic that enables AI models to securely connect with external tools, databases, APIs, and data sources in a standardized, interoperable way.',
  url: `${SITE_URL}/developers`,
  sameAs: ['https://modelcontextprotocol.io'],
};

export const ENTITY_AUTONOMOUS_TRANSFORMATION: DiscoveryEntity = {
  name: 'Autonomous AI Transformation',
  description: 'The enterprise-wide shift from human-operated processes to AI-operated workflows through intelligent agents, automated reasoning, and continuous self-improvement loops.',
  url: `${SITE_URL}/services/autonomous-transformation`,
};
