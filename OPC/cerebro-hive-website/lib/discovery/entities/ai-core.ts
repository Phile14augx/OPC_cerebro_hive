import { SITE_URL } from '../config';
import type { DiscoveryEntity } from '../knowledge-graph/types';

export const ENTITY_ENTERPRISE_AI: DiscoveryEntity = {
  name: 'Enterprise AI',
  description: 'The deployment of artificial intelligence systems within enterprise organizations to automate processes, enhance decision-making, and create competitive advantages at scale.',
  url: `${SITE_URL}/platform`,
  sameAs: ['https://en.wikipedia.org/wiki/Artificial_intelligence'],
};

export const ENTITY_GENERATIVE_AI: DiscoveryEntity = {
  name: 'Generative AI',
  description: 'AI systems capable of generating text, images, code, and other content — including large language models like GPT-4o, Claude, and Gemini — used to power enterprise automation and creativity.',
  url: `${SITE_URL}/services/ai-strategy`,
};

export const ENTITY_LLM: DiscoveryEntity = {
  name: 'Large Language Model',
  alternateName: 'LLM',
  description: 'Deep learning models trained on massive text datasets capable of understanding, generating, and reasoning about human language — the foundation of modern enterprise AI systems.',
  url: `${SITE_URL}/platform`,
};

export const ENTITY_FOUNDATION_MODELS: DiscoveryEntity = {
  name: 'Foundation Models',
  description: 'Large pre-trained AI models (GPT-4o, Claude, Gemini, Llama) that serve as the base for fine-tuning and enterprise AI applications.',
  url: `${SITE_URL}/platform`,
};
