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

  seo: {
    title: "Knowledge Engineering & RAG Systems | Enterprise AI Knowledge | CerebroHive",
    description: "CerebroHive builds enterprise RAG pipelines, knowledge graphs, semantic search systems, and vector databases — turning unstructured organizational knowledge into AI-queryable intelligence.",
    keywords: [
      "knowledge engineering AI", "enterprise RAG pipeline", "knowledge graph development",
      "vector database implementation", "semantic search enterprise", "RAG architecture consulting",
      "enterprise knowledge management AI", "LLM knowledge retrieval", "ontology engineering",
    ],
  },

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
  },

  faqs: [
    {
      question: "What is knowledge engineering in enterprise AI?",
      answer: "Knowledge engineering in enterprise AI is the discipline of capturing, structuring, and making accessible organizational knowledge so that AI systems can reason about it accurately. It includes building RAG pipelines that connect LLMs to enterprise documents, creating knowledge graphs that represent relationships between entities (products, customers, regulations, processes), and designing ontologies that define the domain vocabulary AI uses to understand business context.",
    },
    {
      question: "What is RAG and why do enterprises need it?",
      answer: "RAG (Retrieval-Augmented Generation) is an AI architecture pattern that combines information retrieval with language generation. Instead of relying solely on an LLM's training data, RAG retrieves relevant documents or data chunks from an enterprise knowledge base and injects them into the LLM prompt before generating a response. Enterprises need RAG because: LLMs don't know your proprietary documents; training data has a cutoff date; and hallucinations are dramatically reduced when the model is anchored to retrieved evidence.",
    },
    {
      question: "What is a knowledge graph and how does it differ from a vector database?",
      answer: "A knowledge graph is a structured representation of entities and their relationships — like a map of how concepts, people, products, and processes are connected. A vector database stores text as numerical embeddings, enabling semantic similarity search. They serve complementary purposes: vector databases are best for finding semantically similar documents; knowledge graphs are best for traversing relationships ('what products are associated with this customer segment?'). CerebroHive often combines both in a hybrid retrieval architecture for enterprise knowledge systems.",
    },
    {
      question: "What types of enterprise documents can you process in a RAG system?",
      answer: "CerebroHive's ingestion pipelines handle: PDF documents (contracts, reports, research); Word and Excel files; SharePoint and Confluence pages; Slack and Teams conversation history; email archives; database records (structured data); web pages and HTML content; code repositories; and multimedia (with transcription). We handle document pre-processing including OCR for scanned documents, table extraction, image captioning, and multi-language support.",
    },
    {
      question: "How do you ensure RAG systems return accurate, non-hallucinated answers?",
      answer: "We implement multiple accuracy controls: hybrid search (combining semantic vector search with keyword BM25) to improve recall; cross-encoder re-ranking to select the most relevant chunks; citation injection (every answer cites the source document and passage); confidence scoring with uncertainty flagging; retrieval evaluation using precision and recall metrics; and answer validation agents that verify claims against retrieved context before returning responses to users.",
    },
    {
      question: "Which vector databases do you work with?",
      answer: "CerebroHive has production experience with Qdrant, Weaviate, Pinecone, Milvus, ChromaDB, and pgvector (PostgreSQL extension). Selection depends on: scale requirements (millions vs. billions of vectors), deployment model (cloud-managed vs. self-hosted), filtering complexity (metadata-rich vs. pure semantic), and latency requirements. For enterprise deployments requiring data residency, we prefer Qdrant or Weaviate deployed within the client's own infrastructure.",
    },
    {
      question: "What is semantic search and how does it differ from keyword search?",
      answer: "Keyword search (like traditional SQL LIKE queries or Elasticsearch) finds documents containing exact words. Semantic search understands meaning — it finds documents that are conceptually related even if they use different words. A keyword search for 'car' won't return documents about 'automobile'; a semantic search will. For enterprise knowledge systems, semantic search dramatically improves recall, especially for technical domains where users ask questions using different terminology than documents use.",
    },
    {
      question: "How do you handle access control in a RAG knowledge system?",
      answer: "We implement document-level and user-level access control in the retrieval layer: each document chunk is tagged with access metadata (department, clearance level, project); at query time, the retrieval filter is scoped to documents the user is permitted to access; we integrate with enterprise identity providers (Azure AD, Okta) for authentication; and all retrievals are logged for compliance auditing. Users never receive content from documents they don't have permission to view.",
    },
    {
      question: "How long does it take to build an enterprise knowledge system?",
      answer: "A production RAG system for a single domain (e.g., HR policies, technical documentation, legal contracts) typically takes 6–10 weeks: 2 weeks for document ingestion and pipeline setup, 2 weeks for search optimization and evaluation, 2 weeks for UI and API integration, and 2 weeks for testing, security review, and deployment. Multi-domain systems with knowledge graph integration and complex access control take 16–24 weeks.",
    },
    {
      question: "What is chunking strategy and why does it matter for RAG quality?",
      answer: "Chunking is how you split documents into pieces for indexing. Poor chunking is the most common cause of RAG failures. If chunks are too large, the signal-to-noise ratio is high; if too small, context is lost. CerebroHive uses adaptive chunking strategies: semantic chunking (split at topic boundaries), hierarchical chunking (preserve document structure with parent-child relationships), and sliding window chunking (with overlap for context continuity). We evaluate chunking quality empirically using retrieval benchmarks on your specific documents.",
    },
    {
      question: "Can you connect our RAG system to live data sources that change frequently?",
      answer: "Yes — we build incremental indexing pipelines that monitor data sources for changes and update the vector index in near-real-time. This includes: webhook listeners for document management systems (SharePoint, Google Drive, Notion); CDC (Change Data Capture) pipelines for databases; RSS/API polling for external data sources; and scheduled full re-indexing for batch sources. The system maintains index freshness without requiring full rebuilds.",
    },
    {
      question: "How do you evaluate the quality of a RAG system after deployment?",
      answer: "We measure RAG quality across four dimensions: retrieval quality (precision@K, recall@K — are the right chunks being retrieved?); answer faithfulness (does the answer reflect the retrieved context?); answer relevance (does the answer address the user's question?); and answer completeness (is all relevant information included?). We use automated evaluation frameworks (RAGAS, TruLens) and human evaluation panels for domain-specific quality assessment. Evaluation is continuous — not a one-time post-launch check.",
    },
  ],
};
