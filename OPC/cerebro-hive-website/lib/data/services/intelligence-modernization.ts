import { EnterpriseService } from "../types";

export const intelligenceModernizationService: EnterpriseService = {
  id: "intelligence-modernization",
  slug: "intelligence-modernization",
  title: "Enterprise Intelligence Modernization™",
  summary: "Digital transformation for legacy knowledge and data estates.",
  hero: {
    title: "Enterprise Intelligence Modernization™",
    subtitle: "Data & Knowledge Transformation",
    description: "Upgrade your legacy data silos into unified, AI-ready knowledge graphs capable of powering autonomous agents."
  },
  iconName: "Database",
  category: "Data",
  status: "production",
  tags: ["Data Engineering", "Knowledge Graph", "RAG", "Data Migration"],
  
  config: {
    layout: "enterprise",
    sections: [
      "hero",
      "executive_summary",
      "business_challenges",
      "methodology",
      "architecture",
      "roadmap",
      "products",
      "case_studies",
      "roi",
      "cta"
    ]
  },

  executiveProblem: "Decades of unstructured data, duplicate systems, and inaccessible silos prevent organizations from effectively leveraging Generative AI and RAG.",
  businessImpact: "AI investments fail because the underlying data is fragmented, unstructured, and lacks the semantic context required for accurate reasoning.",

  businessChallenges: [
    {
      title: "Data Silos",
      description: "Knowledge trapped across ERPs, CRMs, SharePoint, and legacy databases."
    },
    {
      title: "Hallucination Risks",
      description: "RAG systems hallucinate when ingesting poor quality, contradictory, or outdated documents."
    },
    {
      title: "Lack of Context",
      description: "Flat vector databases fail to understand the complex hierarchical relationships within enterprise data."
    }
  ],

  targetPersonas: ["CDO", "VP of Engineering", "Head of Data", "CIO"],
  industries: ["Manufacturing", "Healthcare", "Financial Services", "Legal"],
  methodologyOverview: "We transition enterprises from legacy relational databases and flat files to multi-modal knowledge graphs optimized for GraphRAG and semantic retrieval.",

  timeline: [
    {
      title: "Data Estate Audit",
      duration: "Weeks 1-3",
      activities: ["Source System Mapping", "Data Quality Assessment", "Security Posture Review"]
    },
    {
      title: "Ontology Engineering",
      duration: "Weeks 4-6",
      activities: ["Domain Modeling", "Knowledge Graph Schema Design", "Entity Resolution Strategy"]
    },
    {
      title: "Pipeline Construction",
      duration: "Weeks 7-12",
      activities: ["Automated Ingestion (ETL)", "Vectorization & Embedding", "Deployment to Memory Fabric™"]
    }
  ],

  successMetrics: [
    { metric: "Retrieval Accuracy", value: "98%+", timeframe: "Post-Migration" },
    { metric: "Data Ingestion Speed", value: "10x", timeframe: "Post-Migration" },
    { metric: "Knowledge Coverage", value: "100%", timeframe: "Across all silos" }
  ],

  products: ["cerebro-archive", "cerebro-insight", "flow"],
  platformCapabilities: ["memory-fabric", "knowledge-fabric", "connect"],
  relatedResearch: ["enterprise-rag", "knowledge-graphs", "memory-systems"],

  deliverables: [
    "Enterprise Data Ontology",
    "Automated ETL & RAG Pipelines",
    "Deployed Knowledge Graph",
    "Data Governance Framework"
  ],

  engagementModel: "Project-Based Implementation",

  pricing: {
    type: "Project-Based",
    description: "Scope dependent on the volume of data sources and complexity of the required ontology.",
  }
};
