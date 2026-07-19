import { PackagedProduct } from "../types";

export const cerebroArchiveProduct: PackagedProduct = {
  id: "cerebro-archive",
  slug: "cerebro-archive",
  title: "CerebroArchive™",
  summary: "The enterprise Knowledge Intelligence Platform — AI-native research repository, knowledge graph, semantic search, document intelligence, and organizational memory for enterprises that think at scale.",
  hero: {
    title: "CerebroArchive™",
    subtitle: "Knowledge Intelligence Platform",
    description: "Transform how your organization captures, indexes, retrieves, and reasons over its collective intelligence. CerebroArchive is the living knowledge graph behind every intelligent workflow — connecting research, documentation, datasets, models, prompts, and enterprise memory into one semantically searchable system.",
    primaryCta: "Explore Knowledge Platform",
    secondaryCta: "View Architecture",
  },
  iconName: "Archive",
  category: "Intelligence",
  status: "production",
  maturity: "ga",
  tags: ["Knowledge Graph", "Semantic Search", "Research Repository", "Document Intelligence", "RAG", "Enterprise Memory"],

  // Ecosystem Positioning
  ecosystemLayer: "business",
  moduleConnections: ["cerebro-copilot", "cerebro-studio", "cerebro-flow", "cerebro-insight"],
  platformServices: ["vector-search", "ai-gateway", "search", "storage", "event-bus"],
  providesCapabilities: ["knowledge-graph", "semantic-retrieval", "document-intelligence", "model-registry", "research-hub"],

  seo: {
    title: "CerebroArchive™ | Enterprise Knowledge Intelligence Platform | CerebroHive",
    description: "CerebroArchive is an AI-native enterprise knowledge platform combining semantic search, knowledge graph management, document intelligence, research repositories, and enterprise memory — the intelligence backbone for every AI workflow.",
    keywords: [
      "enterprise knowledge management platform",
      "AI knowledge graph software",
      "semantic search enterprise",
      "document intelligence platform",
      "RAG knowledge base",
      "enterprise AI memory",
      "research repository platform",
      "knowledge intelligence software",
      "enterprise vector search",
      "AI document processing",
    ],
  },

  config: {
    layout: "platform",
    sections: [
      "hero",
      "executive_summary",
      "business_problems",
      "core_capabilities",
      "architecture_overview",
      "integration_ecosystem",
      "deployment_models",
      "security_compliance",
      "api_sdk",
      "faq",
      "cta",
    ],
  },

  businessProblems: [
    "Enterprise knowledge is locked inside siloed documents, wikis, databases, and individual team members — invisible to AI systems.",
    "Research outputs, technical papers, and benchmarks are scattered across tools with no semantic retrieval layer.",
    "AI models answer questions based on generic training data rather than the organization's own proprietary knowledge.",
    "Document intelligence is manual — teams spend thousands of hours summarizing, extracting, and classifying content.",
    "There is no versioned, auditable registry for prompt templates, AI models, and evaluation datasets.",
  ],

  targetPersonas: ["Chief Knowledge Officer", "Enterprise Architects", "Research Teams", "AI/ML Engineers", "Legal & Compliance", "Content Strategy"],
  industries: ["Financial Services", "Life Sciences", "Legal", "Healthcare", "Technology", "Government", "Professional Services"],

  coreCapabilities: [
    {
      title: "Enterprise Knowledge Graph",
      description: "A semantically indexed, AI-enriched knowledge graph connecting documents, research, people, processes, and systems — the organizational memory layer for every AI workflow.",
      icon: "Network",
    },
    {
      title: "Semantic Search Engine",
      description: "Vector-powered enterprise search that understands meaning, not just keywords — retrieve the most relevant knowledge across millions of documents in milliseconds.",
      icon: "Search",
    },
    {
      title: "Research Hub",
      description: "Centralized repository for academic papers, technical reports, whitepapers, benchmarks, and internal research — with AI-generated summaries and citation graphs.",
      icon: "BookOpen",
    },
    {
      title: "Document Intelligence",
      description: "AI-powered extraction, classification, summarization, and entity recognition across contracts, reports, invoices, regulations, and unstructured enterprise content.",
      icon: "FileText",
    },
    {
      title: "Model & Prompt Registry",
      description: "Versioned registry for prompt templates, fine-tuned model checkpoints, evaluation datasets, and model cards — enabling governance and reproducibility across AI teams.",
      icon: "Package",
    },
    {
      title: "Enterprise Wiki & Documentation",
      description: "AI-assisted documentation management with automatic linking, gap detection, versioning, and semantic search across all internal documentation.",
      icon: "Book",
    },
    {
      title: "AI Learning Library",
      description: "Curated certification courses, learning paths, and enterprise AI training content — the knowledge layer powering internal upskilling and certification programs.",
      icon: "GraduationCap",
    },
    {
      title: "Dataset Manager",
      description: "Manage, version, and govern enterprise datasets for AI training, evaluation, and fine-tuning — with lineage tracking and compliance-ready audit trails.",
      icon: "Database",
    },
    {
      title: "AI Indexing Engine",
      description: "Automated ingestion pipelines that continuously index new knowledge from connected data sources — documents, APIs, databases, and real-time event streams.",
      icon: "Zap",
    },
    {
      title: "Knowledge Workspaces",
      description: "Project-scoped knowledge environments for research teams — private workspaces with shared indexing, collaborative annotation, and AI-assisted synthesis.",
      icon: "Layers",
    },
  ],

  deploymentModels: ["SaaS (Cloud)", "Private Cloud (VPC)", "On-Premises", "Air-Gapped Enterprise"],
  securityFeatures: [
    "Zero-Trust Architecture",
    "Field-Level Encryption",
    "SOC 2 Type II",
    "GDPR Compliant",
    "HIPAA Ready",
    "Role-Based Access Control",
    "Document-Level Permissions",
    "Full Audit Logging",
  ],

  integrations: [
    { system: "CerebroCopilot™", type: "Knowledge Source" },
    { system: "CerebroStudio™", type: "Prompt & Model Registry" },
    { system: "CerebroFlow™", type: "Knowledge-Triggered Workflows" },
    { system: "SharePoint / Confluence", type: "Document Import" },
    { system: "Notion / Google Drive", type: "Knowledge Sync" },
    { system: "S3 / Azure Blob / GCS", type: "Object Storage" },
    { system: "OpenSearch / Elasticsearch", type: "Search Backend" },
    { system: "pgvector / Pinecone / Weaviate", type: "Vector Database" },
  ],

  apiReference: "/developers/api/cerebro-archive",
  sdkLanguages: ["Python", "TypeScript", "Go"],
  platformCapabilities: ["knowledge-graph", "semantic-search", "vector-store", "document-pipeline"],
  relatedServices: ["ai-strategy", "enterprise-architecture", "knowledge-management"],
  relatedResearch: ["enterprise-rag", "knowledge-graph-patterns", "semantic-retrieval"],

  faqs: [
    {
      question: "What is CerebroArchive™?",
      answer: "CerebroArchive is CerebroHive's Knowledge Intelligence Platform — an AI-native system that indexes, organizes, and makes retrievable the entire knowledge base of an enterprise. It combines a semantic knowledge graph, document intelligence, research repository, model registry, and AI learning library into one unified platform.",
    },
    {
      question: "How does CerebroArchive power other CerebroHive modules?",
      answer: "CerebroArchive is the intelligence backbone of the entire ecosystem. CerebroCopilot retrieves answers from the knowledge graph. CerebroStudio pulls prompt templates and model checkpoints from the registry. CerebroFlow triggers workflows when new knowledge is indexed. CerebroInsight analyzes knowledge consumption patterns. Every module is made smarter by CerebroArchive.",
    },
    {
      question: "Does CerebroArchive replace our existing knowledge management tools?",
      answer: "CerebroArchive is designed to integrate with and augment existing tools like Confluence, SharePoint, Notion, and Google Drive — not replace them immediately. It connects to your existing knowledge sources, builds a unified semantic index on top, and makes that knowledge accessible to AI systems and teams through a single retrieval layer.",
    },
    {
      question: "How does the semantic search differ from standard enterprise search?",
      answer: "Standard enterprise search matches keywords. CerebroArchive's semantic search understands meaning, context, and intent. A query like 'regulations affecting our supply chain in Southeast Asia' retrieves conceptually relevant documents even if they don't contain those exact words — dramatically improving knowledge retrieval quality for AI workflows.",
    },
  ],
};
