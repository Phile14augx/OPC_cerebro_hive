import {
  ENTITY_RAG, ENTITY_KNOWLEDGE_GRAPH, ENTITY_VECTOR_DB, ENTITY_ENTERPRISE_SEARCH,
  ENTITY_AI_AGENT, ENTITY_MULTI_AGENT, ENTITY_MCP,
  ENTITY_AI_GOVERNANCE, ENTITY_RESPONSIBLE_AI, ENTITY_AI_COMPLIANCE,
  ENTITY_MLOPS, ENTITY_DATA_ENGINEERING, ENTITY_AI_PLATFORM, ENTITY_AIOPS,
  ENTITY_HIVEPULSE, ENTITY_CEREBRO_X, ENTITY_AI_COE, ENTITY_AI_FACTORY,
  ENTITY_ENTERPRISE_AI, ENTITY_GENERATIVE_AI, ENTITY_LLM,
} from '../entities';
import type { KnowledgeGraphNode } from './types';

export const KNOWLEDGE_GRAPH: KnowledgeGraphNode[] = [
  {
    entity: ENTITY_ENTERPRISE_AI,
    relatedServices: ['ai-strategy', 'autonomous-transformation', 'ai-platform-engineering'],
    relatedProducts: ['hivepulse', 'cerebro-x', 'cerebro-flow'],
    relatedGuides: ['enterprise-ai-transformation', 'enterprise-ai-agents'],
    relatedCourses: ['GS-901', 'AP-801'],
  },
  {
    entity: ENTITY_GENERATIVE_AI,
    relatedServices: ['ai-strategy', 'ai-factory', 'ai-platform-engineering'],
    relatedProducts: ['cerebro-copilot', 'cerebro-studio', 'hivepulse'],
    relatedGuides: ['enterprise-ai-transformation'],
    relatedCourses: ['BG-201', 'FT-501'],
  },
  {
    entity: ENTITY_LLM,
    relatedServices: ['ai-platform-engineering', 'knowledge-engineering', 'ai-factory'],
    relatedProducts: ['cerebro-copilot', 'cerebro-x'],
    relatedCourses: ['BG-201', 'FT-501', 'PE-101'],
  },
  {
    entity: ENTITY_RAG,
    relatedServices: ['knowledge-engineering', 'ai-platform-engineering'],
    relatedProducts: ['cerebro-archive', 'cerebro-research', 'hivepulse'],
    relatedIndustries: ['healthcare', 'finance', 'legal'],
    relatedGuides: ['rag-architecture'],
    relatedCourses: ['RP-301'],
  },
  {
    entity: ENTITY_KNOWLEDGE_GRAPH,
    relatedServices: ['knowledge-engineering', 'intelligence-modernization'],
    relatedProducts: ['cerebro-archive', 'cerebro-x'],
    relatedIndustries: ['healthcare', 'finance'],
    relatedGuides: ['rag-architecture', 'enterprise-ai-agents'],
  },
  {
    entity: ENTITY_VECTOR_DB,
    relatedServices: ['knowledge-engineering', 'ai-platform-engineering'],
    relatedProducts: ['cerebro-archive'],
    relatedCourses: ['RP-301'],
  },
  {
    entity: ENTITY_AI_AGENT,
    relatedServices: ['autonomous-transformation', 'ai-factory', 'ai-platform-engineering'],
    relatedProducts: ['hivepulse', 'cerebro-flow', 'cerebro-x'],
    relatedIndustries: ['technology', 'finance', 'logistics'],
    relatedGuides: ['enterprise-ai-agents'],
    relatedCourses: ['MA-401'],
  },
  {
    entity: ENTITY_MULTI_AGENT,
    relatedServices: ['autonomous-transformation', 'ai-factory'],
    relatedProducts: ['hivepulse', 'cerebro-flow'],
    relatedGuides: ['enterprise-ai-agents'],
    relatedCourses: ['MA-401'],
  },
  {
    entity: ENTITY_MCP,
    relatedServices: ['ai-platform-engineering', 'knowledge-engineering'],
    relatedProducts: ['hivepulse', 'cerebro-x'],
    relatedIndustries: ['technology'],
  },
  {
    entity: ENTITY_AI_GOVERNANCE,
    relatedServices: ['ai-governance', 'coe', 'ai-strategy'],
    relatedProducts: ['hive-shield'],
    relatedIndustries: ['healthcare', 'finance', 'government'],
    relatedGuides: ['ai-governance-framework'],
    relatedCourses: ['GS-901', 'VE-701'],
  },
  {
    entity: ENTITY_RESPONSIBLE_AI,
    relatedServices: ['ai-governance', 'ai-strategy'],
    relatedGuides: ['ai-governance-framework'],
    relatedCourses: ['GS-901'],
  },
  {
    entity: ENTITY_AI_COMPLIANCE,
    relatedServices: ['ai-governance', 'industry-accelerator'],
    relatedIndustries: ['healthcare', 'finance', 'government'],
    relatedCourses: ['VE-701'],
  },
  {
    entity: ENTITY_MLOPS,
    relatedServices: ['aiops', 'ai-platform-engineering'],
    relatedProducts: ['hive-ops'],
    relatedIndustries: ['technology', 'manufacturing'],
    relatedCourses: ['DA-1001'],
  },
  {
    entity: ENTITY_DATA_ENGINEERING,
    relatedServices: ['ai-platform-engineering', 'intelligence-modernization'],
    relatedProducts: ['cerebro-insight'],
    relatedIndustries: ['finance', 'retail', 'manufacturing'],
    relatedGuides: ['data-engineering-playbook'],
    relatedCourses: ['DA-1001'],
  },
  {
    entity: ENTITY_AI_PLATFORM,
    relatedServices: ['ai-platform-engineering'],
    relatedProducts: ['hivepulse', 'cerebro-x'],
    relatedGuides: ['enterprise-ai-transformation'],
  },
  {
    entity: ENTITY_AIOPS,
    relatedServices: ['aiops'],
    relatedProducts: ['hive-ops'],
    relatedIndustries: ['technology', 'manufacturing'],
  },
  {
    entity: ENTITY_HIVEPULSE,
    relatedServices: ['ai-platform-engineering', 'ai-factory', 'autonomous-transformation'],
    relatedProducts: ['cerebro-x', 'cerebro-flow', 'hive-ops'],
    relatedIndustries: ['technology', 'finance', 'manufacturing'],
    relatedGuides: ['enterprise-ai-agents', 'enterprise-ai-transformation'],
  },
  {
    entity: ENTITY_CEREBRO_X,
    relatedServices: ['knowledge-engineering', 'ai-platform-engineering', 'intelligence-modernization'],
    relatedProducts: ['hivepulse', 'cerebro-archive', 'cerebro-research'],
    relatedGuides: ['rag-architecture', 'enterprise-ai-agents'],
  },
  {
    entity: ENTITY_AI_COE,
    relatedServices: ['coe', 'ai-strategy', 'ai-governance'],
    relatedGuides: ['enterprise-ai-transformation', 'ai-governance-framework'],
    relatedCourses: ['GS-901'],
  },
  {
    entity: ENTITY_AI_FACTORY,
    relatedServices: ['ai-factory', 'autonomous-transformation', 'ai-platform-engineering'],
    relatedProducts: ['hivepulse', 'cerebro-flow'],
    relatedGuides: ['enterprise-ai-transformation'],
  },
];

export function getRelatedEntities(slug: string, type: 'service' | 'product' | 'industry' | 'guide'): KnowledgeGraphNode[] {
  return KNOWLEDGE_GRAPH.filter(node => {
    if (type === 'service') return node.relatedServices?.includes(slug);
    if (type === 'product') return node.relatedProducts?.includes(slug);
    if (type === 'industry') return node.relatedIndustries?.includes(slug);
    if (type === 'guide') return node.relatedGuides?.includes(slug);
    return false;
  });
}
