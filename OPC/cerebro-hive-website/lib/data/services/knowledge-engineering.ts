import { EnterpriseService } from "../types";

export const knowledgeEngineeringService: EnterpriseService = {
  id: "knowledge-engineering",
  slug: "knowledge-engineering",
  title: "Knowledge Engineering™",
  summary: "Knowledge graphs, RAG pipelines, and enterprise data structuring.",
  hero: {
    title: "Knowledge Engineering™",
    subtitle: "RAG & Graphs",
    description: "Transform unstructured documents, manuals, and codebases into precise, queryable knowledge graphs that eliminate AI hallucinations."
  },
  iconName: "Network",
  category: "Engineering",
  status: "production",
  tags: ["RAG", "Knowledge Graphs", "Ontology", "Semantic Search"],
  
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
      "roi",
      "cta"
    ]
  },

  executiveProblem: "Generative AI models are only as good as the context provided. When fed unstructured, contradictory enterprise documents, they hallucinate or fail entirely.",
  businessImpact: "Poor knowledge retrieval leads to incorrect AI outputs in customer-facing and mission-critical applications, destroying trust and ROI.",

  businessChallenges: [
    {
      title: "Context Window Limits",
      description: "You cannot stuff millions of enterprise documents into an LLM's context window."
    },
    {
      title: "Flat Vector Search Failures",
      description: "Traditional vector databases lack the semantic understanding of hierarchical enterprise concepts."
    }
  ],

  targetPersonas: ["Head of AI", "VP of Data", "Chief Knowledge Officer"],
  industries: ["Legal", "Life Sciences", "Aerospace", "Government"],
  methodologyOverview: "We design strict enterprise ontologies, build high-fidelity extraction pipelines, and deploy GraphRAG to ensure absolute accuracy and traceability in AI responses.",

  timeline: [
    {
      title: "Ontology Definition",
      duration: "Weeks 1-2",
      activities: ["Taxonomy Design", "Relationship Mapping"]
    },
    {
      title: "Pipeline Construction",
      duration: "Weeks 3-6",
      activities: ["PDF/OCR Extraction", "Chunking Strategy", "Graph Construction"]
    },
    {
      title: "RAG Optimization",
      duration: "Weeks 7-8",
      activities: ["Retrieval Tuning", "Citation Verification", "Accuracy Benchmarking"]
    }
  ],

  successMetrics: [
    { metric: "Hallucination Rate", value: "< 0.1%", timeframe: "Post-Launch" },
    { metric: "Retrieval Precision", value: "95%+", timeframe: "Post-Launch" }
  ],

  products: ["cerebro-archive", "cerebro-research"],
  platformCapabilities: ["knowledge-fabric", "memory-fabric", "eval"],
  relatedResearch: ["enterprise-rag", "knowledge-graphs"],

  deliverables: [
    "Enterprise Knowledge Ontology",
    "Automated Graph Construction Pipeline",
    "Tuned GraphRAG API Endpoints"
  ],

  engagementModel: "Project-Based Implementation",

  pricing: {
    type: "Fixed Scope",
    description: "Determined by document volume and domain complexity.",
  }
};
