import { PackagedProduct } from "../types";

export const cerebroArchiveProduct: PackagedProduct = {
  id: "cerebro-archive",
  slug: "cerebro-archive",
  title: "CerebroArchive™",
  summary: "Enterprise Knowledge Platform for RAG, research, documents, and AI search.",
  hero: {
    title: "CerebroArchive™",
    subtitle: "Enterprise Knowledge Platform",
    description: "Unlock your unstructured data with advanced GraphRAG and citation engines. Unify your knowledge silos securely."
  },
  iconName: "Archive",
  category: "Knowledge",
  status: "production",
  maturity: "ga",
  tags: ["RAG", "Knowledge", "Search"],

  seo: {
    title: "CerebroArchive™ | Enterprise RAG & Knowledge Platform | CerebroHive",
    description: "CerebroArchive is an enterprise knowledge platform for RAG, document intelligence, and AI-powered search — connecting LLMs to your organizational knowledge with citation accuracy and access control.",
    keywords: ["enterprise RAG platform", "knowledge management AI", "document intelligence software", "AI search enterprise", "RAG software", "knowledge graph software", "enterprise semantic search", "document AI platform"],
  },

  config: {
    layout: "platform",
    sections: [
      "hero",
      "executive_summary",
      "business_problems",
      "core_capabilities",
      "architecture_overview",
      "feature_matrix",
      "deployment_models",
      "security_compliance",
      "integration_ecosystem",
      "developer_experience",
      "cta"
    ]
  },

  businessProblems: [
    "Information is trapped in unstructured documents, PDFs, and proprietary formats.",
    "Standard vector databases fail to capture hierarchical knowledge and semantic context.",
    "Employees waste 30% of their day searching for answers across fragmented enterprise systems."
  ],

  targetPersonas: ["Chief Data Officer", "Head of AI", "Knowledge Managers"],
  industries: ["Legal", "Life Sciences", "Financial Services", "Public Sector"],

  coreCapabilities: [
    {
      title: "Multi-Modal Ingestion",
      description: "Automatically extracts text, tables, and images from PDFs, Word, PPT, and web pages.",
      icon: "FileText"
    },
    {
      title: "GraphRAG Construction",
      description: "Builds a semantic knowledge graph, vastly outperforming flat vector similarity search.",
      icon: "Network"
    },
    {
      title: "Citation & Verifiability",
      description: "Every answer generated includes direct citations to the source document, eliminating hallucinations.",
      icon: "CheckCircle"
    }
  ],

  deploymentModels: ["VPC (AWS/GCP/Azure)", "On-Premises Airgapped", "Cerebro Cloud Managed"],
  securityFeatures: ["Document-level RBAC", "Data Masking", "SOC2 Type II", "HIPAA Compliant"],
  
  integrations: [
    { system: "SharePoint", type: "Native Connector" },
    { system: "Confluence", type: "Native Connector" },
    { system: "Google Drive", type: "Native Connector" },
    { system: "Custom Data Sources", type: "REST API" }
  ],

  apiReference: "/developers/api/archive",
  sdkLanguages: ["Python", "TypeScript", "Go"],

  platformCapabilities: ["knowledge-fabric", "memory-fabric", "context-engine"],
  relatedServices: ["intelligence-modernization", "knowledge-engineering"],
  relatedResearch: ["enterprise-rag", "knowledge-graphs"]
};
