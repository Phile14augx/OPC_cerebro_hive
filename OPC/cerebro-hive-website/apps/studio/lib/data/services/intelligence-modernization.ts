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

  seo: {
    title: "Intelligence Modernization | Legacy Data to AI-Ready | CerebroHive",
    description: "CerebroHive modernizes enterprise intelligence infrastructure — migrating legacy data systems, building data pipelines, constructing knowledge graphs, and making organizational data AI-queryable.",
    keywords: [
      "intelligence modernization", "data modernization for AI", "legacy system AI migration",
      "enterprise data pipeline AI", "knowledge graph enterprise", "data engineering AI",
      "AI-ready data infrastructure", "data lake to AI", "enterprise data modernization",
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
  },

  faqs: [
    {
      question: "What is intelligence modernization?",
      answer: "Intelligence modernization is the process of transforming an enterprise's information architecture — legacy databases, siloed document repositories, disconnected data systems — into a unified, AI-queryable intelligence layer. It goes beyond data migration: it involves building semantic understanding into the data layer through knowledge graphs, vector indexes, and enrichment pipelines so that AI systems can reason about organizational knowledge, not just query records.",
    },
    {
      question: "Why do enterprises need intelligence modernization before scaling AI?",
      answer: "Most enterprise AI initiatives fail not because of AI capability gaps but because of data gaps: data locked in legacy systems, inconsistent formats, poor quality, missing metadata, siloed ownership. Before AI can reason about organizational knowledge, the data must be accessible, clean, contextualized, and semantically structured. Intelligence modernization is the foundation that makes AI useful — without it, you have powerful AI models reasoning about poor data, which produces unreliable results.",
    },
    {
      question: "What does CerebroHive's intelligence modernization engagement cover?",
      answer: "Our intelligence modernization engagements cover: legacy data assessment (cataloging all data sources, quality scoring, access complexity analysis); data pipeline engineering (building ETL/ELT pipelines to consolidate data into a unified layer); knowledge graph construction (creating entity relationship graphs that capture how business concepts relate); vector indexing (making unstructured documents semantically searchable); data quality remediation (cleaning, standardizing, enriching data); and integration with AI systems (connecting the modernized data layer to LLMs, RAG systems, and agent tools).",
    },
    {
      question: "How do you handle legacy database migration for AI?",
      answer: "Legacy database migration for AI readiness follows a phased approach: (1) Data discovery and profiling — cataloging schemas, row counts, data quality, and access patterns; (2) Semantic enrichment — mapping legacy field names and codes to business-meaningful concepts; (3) Integration layer design — building APIs or ETL pipelines that expose data to AI systems without breaking existing applications; (4) Incremental migration — moving data to modern storage (data lakehouse, cloud databases) while maintaining legacy system continuity; (5) Validation — confirming AI system outputs are consistent between legacy and modern data sources.",
    },
    {
      question: "What data engineering stack does CerebroHive use for modernization projects?",
      answer: "CerebroHive builds modern data stacks using: Apache Spark and dbt for data transformation; Apache Kafka for real-time event streaming; Delta Lake or Apache Iceberg for data lakehouse architectures; Airflow or Prefect for pipeline orchestration; Great Expectations for data quality validation; dbt for transformation logic and lineage documentation; and Databricks, Snowflake, or BigQuery as the analytical foundation. The stack is selected based on the client's existing cloud environment and operational capabilities.",
    },
    {
      question: "How do you build a knowledge graph from enterprise data?",
      answer: "Building an enterprise knowledge graph involves: entity extraction (identifying key entities — products, customers, regulations, processes — from structured and unstructured sources); relationship mapping (defining how entities relate — 'Customer purchased Product', 'Regulation applies to Industry'); ontology design (formalizing the domain vocabulary using OWL or RDF standards); graph database construction (loading entities and relationships into a graph store like Neo4j or Amazon Neptune); and query layer integration (exposing the knowledge graph to AI agents and RAG systems through Cypher queries or GraphQL APIs).",
    },
    {
      question: "How long does an intelligence modernization project take?",
      answer: "Intelligence modernization timeline depends on data volume and complexity. A focused single-domain modernization (e.g., making all product documentation AI-queryable) takes 8–12 weeks. A multi-source enterprise knowledge layer covering 5–10 data systems takes 16–24 weeks. A full enterprise intelligence platform spanning 20+ systems with knowledge graph construction and real-time pipeline integration can take 6–12 months. CerebroHive uses an iterative delivery model — the first AI-usable data layer is available within 6–8 weeks, expanded progressively.",
    },
    {
      question: "What is a data lakehouse and why is it preferred for AI workloads?",
      answer: "A data lakehouse combines the flexibility of a data lake (storing any data format at low cost) with the performance and governance of a data warehouse (structured queries, ACID transactions, schema enforcement). For AI workloads, the lakehouse is preferred because: AI training and fine-tuning require access to large volumes of diverse data in their raw form; RAG systems need fast, filtered access to document collections; ML feature engineering benefits from version-controlled data transformations; and the open formats (Parquet, Delta) integrate directly with AI tooling like Spark ML and HuggingFace datasets.",
    },
    {
      question: "How do you ensure data quality for AI training and inference?",
      answer: "CerebroHive implements data quality controls at three stages: ingestion (schema validation, completeness checks, format normalization); transformation (business rule validation, referential integrity checks, duplicate detection); and AI readiness (embedding quality checks, chunk coherence validation, relevance sampling for RAG pipelines). We use Great Expectations for automated data quality contracts that run on every pipeline execution, blocking downstream AI systems from consuming data that fails quality thresholds.",
    },
    {
      question: "How do you connect modernized data to existing business intelligence tools?",
      answer: "Intelligence modernization doesn't replace existing BI tools — it extends them. We build data integration layers that serve both BI dashboards (Tableau, Power BI, Looker) and AI systems from the same unified data layer. SQL interfaces expose data to BI tools; vector indexes and knowledge graph APIs serve AI systems. This eliminates the duplicate data management problem where BI teams and AI teams maintain separate data pipelines for the same source data.",
    },
    {
      question: "Can you modernize data from on-premises systems without moving everything to the cloud?",
      answer: "Yes — we support hybrid data modernization where sensitive data remains on-premises while AI processing occurs in secure cloud environments. Approaches include: on-premises data lakehouse (using Apache Iceberg with on-premises compute); change data capture (CDC) pipelines that replicate only non-sensitive fields to cloud; private connectivity (VPN, Direct Connect) between on-premises systems and cloud AI services; and locally-deployed vector stores (Qdrant, Milvus) that keep embeddings within the client's perimeter. Data residency requirements are a primary design input.",
    },
    {
      question: "What happens to our legacy systems — do we have to shut them down?",
      answer: "No — intelligence modernization is designed to coexist with legacy systems, not replace them. We build read-only integration layers that extract data from legacy systems without modifying them. Legacy systems continue serving their original purposes while the modernized intelligence layer serves AI workloads. Over time, as AI demonstrates value and operational confidence builds, organizations may choose to migrate away from legacy systems — but the intelligence modernization program doesn't force or require this.",
    },
  ],
};
