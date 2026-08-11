export interface AcademyCourse {
  id: string;
  code: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  title: string;
  desc: string;
  duration: string;
  modules: number;
  price: string;
  usd: string;
  cert: string;
  topics: string[];
}

export interface LearningPath {
  title: string;
  desc: string;
  href: string;
  tag: string;
  bullets: string[];
}

export const courses: AcademyCourse[] = [
  {
    id: "pe101",
    code: "PE-101",
    level: "Beginner",
    title: "Introduction to Prompt Engineering",
    desc: "Master zero-shot, few-shot, chain-of-thought, and system prompt design patterns. Build a reusable prompt library for business workflows.",
    duration: "20 hours",
    modules: 8,
    price: "₹4,999",
    usd: "$60",
    cert: "Certified Prompt Engineer (CPE)",
    topics: ["Zero-shot & Few-shot Prompting", "Chain-of-Thought Reasoning", "System Prompt Architecture", "Prompt Injection Defense", "Business Prompt Templates", "Multi-Model Comparison"],
  },
  {
    id: "bg201",
    code: "BG-201",
    level: "Intermediate",
    title: "Building with LLM APIs",
    desc: "Integrate OpenAI, Anthropic, and Google Gemini APIs into production Python applications. API design, rate limiting, cost optimization, and fallback strategies.",
    duration: "35 hours",
    modules: 12,
    price: "₹9,999",
    usd: "$120",
    cert: "Certified LLM Developer (CLD)",
    topics: ["OpenAI & Anthropic API Integration", "Streaming & Function Calling", "Rate Limiting & Cost Control", "Multi-Model Fallback Logic", "Async Python Patterns", "API Security & Key Management"],
  },
  {
    id: "rp301",
    code: "RP-301",
    level: "Intermediate",
    title: "RAG Pipeline Development",
    desc: "Build production-grade Retrieval-Augmented Generation systems with Pinecone, Weaviate, and pgvector. Chunking strategies, embedding models, and reranking.",
    duration: "40 hours",
    modules: 14,
    price: "₹14,999",
    usd: "$180",
    cert: "Certified RAG Engineer (CRE)",
    topics: ["Vector Database Architecture", "Chunking & Embedding Strategies", "Pinecone & Weaviate Setup", "Hybrid Search (BM25 + Dense)", "Reranking with Cross-Encoders", "Production RAG Evaluation"],
  },
  {
    id: "ma401",
    code: "MA-401",
    level: "Advanced",
    title: "Multi-Agent Systems with LangGraph",
    desc: "Design and deploy stateful multi-agent workflows using LangGraph and LangChain. Build supervisor hierarchies, tool-calling agents, and human-in-the-loop systems.",
    duration: "50 hours",
    modules: 16,
    price: "₹19,999",
    usd: "$240",
    cert: "Certified Agent Architect (CAA)",
    topics: ["LangGraph State Machines", "Supervisor & Worker Architectures", "Tool-Calling & Function Agents", "Memory Systems (Short & Long-Term)", "Human-in-the-Loop Design", "Agent Observability with LangSmith"],
  },
  {
    id: "ft501",
    code: "FT-501",
    level: "Advanced",
    title: "LLM Fine-Tuning & Alignment",
    desc: "Fine-tune open-source LLMs (Mistral, LLaMA, Phi) using LoRA/QLoRA on domain-specific datasets. RLHF basics, DPO, and model evaluation frameworks.",
    duration: "45 hours",
    modules: 15,
    price: "₹24,999",
    usd: "$300",
    cert: "Certified Fine-Tuning Specialist (CFS)",
    topics: ["LoRA & QLoRA Training", "Dataset Preparation & Curation", "Mistral / LLaMA / Phi Architectures", "DPO & RLHF Overview", "Model Evaluation (MMLU, HellaSwag)", "Deployment with vLLM & Ollama"],
  },
  {
    id: "ea601",
    code: "EA-601",
    level: "Intermediate",
    title: "Enterprise AI Automation with n8n",
    desc: "Automate end-to-end business workflows using n8n + AI nodes. CRM automation, document processing, email triage, and approval workflows at enterprise scale.",
    duration: "30 hours",
    modules: 10,
    price: "₹12,999",
    usd: "$155",
    cert: "Certified Automation Builder (CAB)",
    topics: ["n8n Architecture & Self-Hosting", "AI Nodes & OpenAI Integration", "CRM Automation (HubSpot, Salesforce)", "Document Processing Pipelines", "Webhook & API Integration", "Error Handling & Monitoring"],
  },
  {
    id: "ve701",
    code: "VE-701",
    level: "Advanced",
    title: "AI for BFSI & Regulated Industries",
    desc: "Apply AI in banking, insurance, and capital markets while maintaining DPDP Act 2023, RBI, and SEBI compliance. Covers fraud detection, credit scoring, and KYC automation.",
    duration: "40 hours",
    modules: 13,
    price: "₹22,999",
    usd: "$275",
    cert: "Certified AI Compliance Practitioner (CACP)",
    topics: ["DPDP Act 2023 for AI", "RBI AI Guidelines", "KYC Automation with AI", "Fraud Detection Models", "Credit Scoring with ML", "Explainable AI (XAI) for Audits"],
  },
  {
    id: "ap801",
    code: "AP-801",
    level: "Beginner",
    title: "AI Product Management",
    desc: "Lead AI product strategy, roadmap, and team alignment. Learn to evaluate AI feasibility, write AI-focused PRDs, and measure AI feature success metrics.",
    duration: "25 hours",
    modules: 9,
    price: "₹8,999",
    usd: "$110",
    cert: "Certified AI Product Manager (CAPM)",
    topics: ["AI Feasibility Assessment", "Writing AI-Specific PRDs", "AI Feature Metrics & KPIs", "Cross-Functional AI Team Leadership", "Build vs Buy vs API Framework", "AI Ethics & Responsible Product Development"],
  },
  {
    id: "gs901",
    code: "GS-901",
    level: "Advanced",
    title: "AI Strategy & Governance",
    desc: "Build enterprise AI governance frameworks, risk registers, and readiness audits. Designed for CTOs, CDOs, and AI strategy leads responsible for organizational AI transformation.",
    duration: "35 hours",
    modules: 11,
    price: "₹29,999",
    usd: "$360",
    cert: "Certified AI Strategist (CAS)",
    topics: ["AI Maturity Assessment", "AI Risk Register Construction", "Responsible AI Frameworks", "Vendor Evaluation for AI", "Build the AI Center of Excellence", "90-Day AI Transformation Roadmap"],
  },
  {
    id: "da1001",
    code: "DA-1001",
    level: "Intermediate",
    title: "Data Engineering for AI",
    desc: "Build reliable data pipelines that power AI systems. Modern lakehouse architecture, dbt, Airflow orchestration, and feature store design for ML models.",
    duration: "45 hours",
    modules: 15,
    price: "₹17,999",
    usd: "$215",
    cert: "Certified AI Data Engineer (CADE)",
    topics: ["Data Lakehouse Architecture", "dbt for Data Transformation", "Airflow Pipeline Orchestration", "Feature Store Design", "Data Quality & Observability", "AI-Ready Data Schema Patterns"],
  },
];

export const learningPaths: LearningPath[] = [
  {
    title: "Individual Courses",
    desc: "Search, filter, and enroll in targeted courses. Track lesson progress and trigger completion certificates synced to your profile.",
    href: "/academy/courses",
    tag: "Self-Paced",
    bullets: ["LangChain & Multi-Agent Frameworks", "LLM Fine-Tuning & RAG Pipelines", "Introduction to Prompt Engineering"],
  },
  {
    title: "Learning Paths",
    desc: "Follow curated, sequential tracks designed to take you from foundational concepts to enterprise-grade system deployment.",
    href: "/academy/learning-paths",
    tag: "Structured",
    bullets: ["AI Developer Path (6 Months)", "AI Architect Path (6 Months)", "AI Product Manager Path (3 Months)"],
  },
  {
    title: "Corporate Programs",
    desc: "Tailor cohort workshops for development teams. Administer cohort lists and reallocate employee seats dynamically.",
    href: "/academy/corporate-programs",
    tag: "Enterprise",
    bullets: ["Dedicated Slack communication channel", "Proctored corporate certification", "Live hands-on agent workshops"],
  },
];
