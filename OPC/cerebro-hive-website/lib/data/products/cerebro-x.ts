import { PackagedProduct } from "../types";

export const cerebroXProduct: PackagedProduct = {
  id: "cerebro-x",
  slug: "cerebro-x",
  title: "Cerebro X",
  summary: "Enterprise AI Intelligence Platform — powering intelligent search, knowledge graph management, reasoning, and contextual AI across every product and workflow.",
  hero: {
    title: "Cerebro X",
    subtitle: "Enterprise AI Intelligence Platform",
    description: "The intelligence layer of the CerebroHive platform. Cerebro X powers intelligent search, knowledge graph construction, multi-hop reasoning, and contextual AI across all enterprise systems.",
    primaryCta: "Request Early Access",
    secondaryCta: "Explore Architecture",
  },
  iconName: "BrainCircuit",
  category: "Platform",
  status: "development",
  maturity: "beta",
  tags: ["Intelligence Layer", "Knowledge Graph", "Reasoning"],

  seo: {
    title: "Cerebro X | Enterprise AI Intelligence Platform | CerebroHive",
    description: "Cerebro X powers intelligent search, knowledge graph management, and contextual AI reasoning across the CerebroHive platform and your enterprise systems.",
    keywords: ["enterprise AI intelligence platform", "knowledge graph software", "AI reasoning platform", "enterprise semantic search", "AI knowledge management", "LLM intelligence layer", "contextual AI platform", "Cerebro X CerebroHive"],
  },

  config: {
    layout: "platform",
    sections: [
      "hero",
      "executive_summary",
      "business_problems",
      "core_capabilities",
      "integration_ecosystem",
      "faq",
      "cta",
    ],
  },

  businessProblems: [
    "Enterprise data is fragmented across dozens of systems, making coherent AI reasoning impossible.",
    "Standard vector search returns semantically similar documents but fails at multi-hop reasoning and relationship inference.",
    "Building a production-grade knowledge graph requires years of specialized engineering that most enterprises cannot staff.",
  ],

  targetPersonas: ["Chief Data Officer", "Head of AI", "Enterprise Architects", "AI Engineering Teams"],
  industries: ["Technology", "Finance", "Healthcare", "Life Sciences", "Legal"],

  coreCapabilities: [
    {
      title: "Enterprise Knowledge Graph",
      description: "Automatically constructs and continuously updates a semantic knowledge graph from all organizational data sources.",
      icon: "Network",
    },
    {
      title: "Multi-Hop Reasoning Engine",
      description: "Answers complex, relationship-dependent questions by traversing the knowledge graph across multiple entity hops.",
      icon: "GitMerge",
    },
    {
      title: "Intelligent Semantic Search",
      description: "Hybrid dense + sparse retrieval with graph-augmented context for high-precision enterprise search.",
      icon: "Search",
    },
    {
      title: "Contextual AI Memory",
      description: "Provides every CerebroHive product and AI agent with persistent, organization-aware contextual memory.",
      icon: "Database",
    },
  ],

  deploymentModels: ["Cloud (AWS/GCP/Azure)", "On-Premises", "Hybrid"],
  securityFeatures: ["Entity-Level Access Control", "Data Lineage Tracking", "Encryption at Rest & Transit", "SOC2 Type II"],

  integrations: [
    { system: "CerebroArchive", type: "Document Ingestion" },
    { system: "HivePulse", type: "Intelligence Provider" },
    { system: "PostgreSQL / pgvector", type: "Vector Store" },
    { system: "Neo4j / Amazon Neptune", type: "Graph Database" },
    { system: "Elasticsearch", type: "Search Backend" },
  ],

  apiReference: "/developers/api/cerebro-x",
  sdkLanguages: ["Python", "TypeScript"],

  platformCapabilities: ["knowledge-fabric", "memory-fabric", "reasoning-engine", "context-engine"],
  relatedServices: ["knowledge-engineering", "intelligence-modernization", "ai-platform-engineering"],
  relatedResearch: ["knowledge-graphs", "enterprise-rag"],

  faqs: [
    {
      question: "What is Cerebro X?",
      answer: "Cerebro X is CerebroHive's Enterprise AI Intelligence Platform — the intelligence layer that powers search, knowledge graph management, multi-hop reasoning, and contextual AI across the entire CerebroHive platform and your enterprise data systems.",
    },
    {
      question: "How does Cerebro X differ from a standard vector database or RAG system?",
      answer: "Cerebro X goes beyond simple vector retrieval. It builds a semantic knowledge graph that captures relationships between entities, not just document similarity. This enables multi-hop reasoning — answering questions that require connecting information across multiple data sources and organizational boundaries — which flat RAG systems cannot do.",
    },
    {
      question: "What types of enterprise data can Cerebro X ingest?",
      answer: "Cerebro X ingests structured data (databases, CRMs, ERPs), unstructured data (PDFs, Word documents, emails, web pages), semi-structured data (JSON, XML, APIs), and streaming data (event buses, real-time feeds). It normalizes and relates all of these into a unified knowledge graph.",
    },
    {
      question: "How does Cerebro X power the other CerebroHive products?",
      answer: "Cerebro X acts as the shared intelligence substrate. CerebroArchive uses it for RAG retrieval, CerebroCopilot uses it for context-aware answers, CerebroResearch uses it for hypothesis generation, and HivePulse uses it to give AI agents organizational knowledge. Every product becomes smarter because they share the same knowledge graph.",
    },
    {
      question: "Can Cerebro X be deployed in regulated industries with strict data residency requirements?",
      answer: "Yes. Cerebro X supports on-premises, VPC, and air-gapped deployment for regulated industries like healthcare, finance, and government. All data processing occurs within the customer's infrastructure boundary, and Cerebro X integrates with existing RBAC and identity management systems.",
    },
    {
      question: "How does Cerebro X keep the knowledge graph current as enterprise data changes?",
      answer: "Cerebro X uses continuous incremental ingestion pipelines that monitor connected data sources for changes. Entity relationships in the graph are updated in near-real-time for streaming sources and on configurable schedules for batch sources, ensuring the knowledge graph reflects current organizational state.",
    },
    {
      question: "What graph database and vector store backends does Cerebro X support?",
      answer: "Cerebro X supports Neo4j, Amazon Neptune, and Azure Cosmos DB for the graph layer, and pgvector, Pinecone, Weaviate, and Elasticsearch for the vector retrieval layer. It can also operate with a unified graph+vector store for simplified deployment.",
    },
    {
      question: "How long does it take to deploy Cerebro X and build the initial knowledge graph?",
      answer: "Initial deployment takes 2–4 weeks depending on data source complexity. A baseline knowledge graph from core enterprise systems (ERP, CRM, document repositories) is operational within 4–6 weeks. Full graph coverage across all enterprise data typically takes 3–6 months as additional connectors are enabled.",
    },
    {
      question: "How does Cerebro X relate to HivePulse?",
      answer: "HivePulse is the operational layer — it deploys and manages AI agents and workflows. Cerebro X is the intelligence layer — it provides the knowledge graph, reasoning capabilities, and contextual memory that make those agents intelligent. HivePulse orchestrates; Cerebro X understands.",
    },
    {
      question: "What is the pricing model for Cerebro X?",
      answer: "Cerebro X is licensed for enterprise deployment with pricing based on data volume ingested, knowledge graph size, and query throughput. It is available as a standalone intelligence platform or bundled with HivePulse and other CerebroHive products. Contact us for a custom quote.",
    },
  ],
};
