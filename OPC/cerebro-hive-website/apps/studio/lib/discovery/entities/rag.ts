import { SITE_URL } from '../config';
import type { DiscoveryEntity } from '../knowledge-graph/types';

export const ENTITY_RAG: DiscoveryEntity = {
  name: 'Retrieval-Augmented Generation',
  alternateName: 'RAG',
  description: 'A technique that enhances LLM responses by retrieving relevant information from a private knowledge base before generating answers — reducing hallucinations and enabling domain-specific AI.',
  url: `${SITE_URL}/services/knowledge-engineering`,
};

export const ENTITY_VECTOR_DB: DiscoveryEntity = {
  name: 'Vector Database',
  description: 'A database optimized for storing and querying high-dimensional vector embeddings, enabling semantic similarity search for AI applications including RAG pipelines and enterprise search.',
  url: `${SITE_URL}/platform`,
};

export const ENTITY_KNOWLEDGE_GRAPH: DiscoveryEntity = {
  name: 'Knowledge Graph',
  description: 'A structured representation of information where entities and their relationships are stored as interconnected nodes — enabling semantic reasoning and advanced AI retrieval beyond flat vector search.',
  url: `${SITE_URL}/services/knowledge-engineering`,
};

export const ENTITY_ENTERPRISE_SEARCH: DiscoveryEntity = {
  name: 'Enterprise AI Search',
  description: 'AI-powered search systems that understand natural language queries, retrieve from multiple data sources simultaneously, and surface contextually relevant results across an enterprise knowledge base.',
  url: `${SITE_URL}/products/cerebro-archive`,
};
