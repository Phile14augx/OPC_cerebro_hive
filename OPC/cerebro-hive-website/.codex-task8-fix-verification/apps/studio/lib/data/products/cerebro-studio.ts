import { PackagedProduct } from "../types";

export const cerebroStudioProduct: PackagedProduct = {
  id: "cerebro-studio",
  slug: "cerebro-studio",
  title: "CerebroStudio™",
  summary: "The enterprise AI Development Platform — visual agent builder, prompt studio, workflow designer, RAG builder, model playground, and evaluation studio for teams building production AI systems.",
  hero: {
    title: "CerebroStudio™",
    subtitle: "AI Development Platform",
    description: "The engineering workspace for enterprise AI. CerebroStudio provides a visual, integrated environment for building, testing, evaluating, and deploying AI agents, RAG pipelines, prompts, and workflows — without losing the rigor and governance that enterprise AI demands.",
    primaryCta: "Start Building",
    secondaryCta: "View Developer Docs",
  },
  iconName: "Code2",
  category: "Intelligence",
  status: "production",
  maturity: "ga",
  tags: ["Agent Builder", "Prompt Studio", "RAG Builder", "AI Development", "Evaluation", "Low-Code AI"],

  // Ecosystem Positioning
  ecosystemLayer: "business",
  moduleConnections: ["cerebro-archive", "cerebro-flow", "hivepulse", "cerebro-copilot"],
  platformServices: ["ai-gateway", "model-registry", "event-bus", "storage"],
  providesCapabilities: ["agent-development", "prompt-engineering", "rag-pipelines", "model-evaluation"],

  seo: {
    title: "CerebroStudio™ | Enterprise AI Development Platform | CerebroHive",
    description: "CerebroStudio is an enterprise AI development platform providing visual agent builder, prompt studio, RAG pipeline designer, evaluation framework, and model playground — built for teams deploying AI at enterprise scale.",
    keywords: [
      "enterprise AI development platform",
      "AI agent builder",
      "prompt engineering tool",
      "RAG pipeline builder",
      "LLM evaluation framework",
      "AI workflow designer",
      "enterprise LLM platform",
      "visual AI builder",
      "no-code AI platform",
      "model playground enterprise",
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
      "developer_experience",
      "deployment_models",
      "api_sdk",
      "faq",
      "cta",
    ],
  },

  businessProblems: [
    "AI engineering teams spend more time configuring infrastructure than building intelligent systems.",
    "Prompt engineering is undisciplined — no versioning, no evaluation, no governance across teams.",
    "RAG pipelines are built from scratch for every project, accumulating technical debt.",
    "There is no standardized evaluation framework to measure AI quality before production deployment.",
    "Business teams cannot participate in AI development without deep ML engineering knowledge.",
  ],

  targetPersonas: ["AI Engineers", "LLM Engineers", "Prompt Engineers", "ML Engineers", "Solution Architects", "Product Teams"],
  industries: ["Technology", "Financial Services", "Healthcare", "Retail", "Manufacturing", "Professional Services"],

  coreCapabilities: [
    {
      title: "Visual Agent Builder",
      description: "Drag-and-drop interface for designing multi-agent systems — define agent roles, tool access, memory, orchestration logic, and escalation paths without writing boilerplate code.",
      icon: "Cpu",
    },
    {
      title: "Prompt Studio",
      description: "Versioned prompt engineering workspace with A/B testing, structured templates, variable injection, chain-of-thought optimization, and output evaluation built in.",
      icon: "MessageSquare",
    },
    {
      title: "RAG Pipeline Builder",
      description: "Visual pipeline designer for Retrieval-Augmented Generation — configure chunking strategies, embedding models, vector stores, hybrid retrieval, and re-ranking in a unified editor.",
      icon: "GitBranch",
    },
    {
      title: "Evaluation Studio",
      description: "Automated AI evaluation framework measuring accuracy, hallucination rate, latency, faithfulness, and cost — run before every deployment to enforce quality gates.",
      icon: "BarChart2",
    },
    {
      title: "Model Playground",
      description: "Side-by-side comparison of outputs across GPT-4, Claude, Gemini, Llama, Mistral, and custom fine-tuned models — with latency, cost, and quality scoring.",
      icon: "Layers",
    },
    {
      title: "Workflow Designer",
      description: "Build agentic workflows with conditional branches, human-in-the-loop approval steps, retry logic, and tool integrations — all exportable to CerebroFlow for production execution.",
      icon: "Workflow",
    },
    {
      title: "Dataset Manager",
      description: "Create, version, and annotate evaluation datasets for fine-tuning and RLHF — with import/export support for major training frameworks and lineage tracking.",
      icon: "Database",
    },
    {
      title: "API Playground",
      description: "Interactive API explorer for every CerebroHive service — test, inspect, and generate SDK code directly from live API documentation.",
      icon: "Code",
    },
  ],

  deploymentModels: ["SaaS (Cloud)", "Private Cloud (VPC)", "On-Premises"],
  securityFeatures: [
    "Prompt Injection Detection",
    "Model Output Guardrails",
    "Secrets Management",
    "Role-Based Workspace Access",
    "Full Audit Logging",
    "SOC 2 Type II",
  ],

  integrations: [
    { system: "CerebroArchive™", type: "Prompt & Model Registry" },
    { system: "CerebroFlow™", type: "Workflow Export" },
    { system: "HivePulse™", type: "Agent Deployment Target" },
    { system: "OpenAI / Anthropic / Google", type: "LLM Provider" },
    { system: "Hugging Face", type: "Model Hub" },
    { system: "LangChain / LangGraph", type: "Agent Framework" },
    { system: "Pinecone / Weaviate / pgvector", type: "Vector Store" },
    { system: "GitHub / GitLab", type: "Version Control" },
  ],

  apiReference: "/developers/api/cerebro-studio",
  sdkLanguages: ["Python", "TypeScript"],
  platformCapabilities: ["agent-builder", "prompt-registry", "rag-builder", "evaluation-engine"],
  relatedServices: ["ai-engineering", "ai-strategy", "enterprise-architecture"],
  relatedResearch: ["enterprise-rag", "agent-architectures", "llm-evaluation"],

  faqs: [
    {
      question: "Who is CerebroStudio™ designed for?",
      answer: "CerebroStudio is designed for enterprise AI engineering teams — AI engineers, LLM engineers, solution architects, and technically capable product teams. It provides a visual, integrated environment that accelerates development while maintaining the governance, versioning, and evaluation rigor that enterprise AI deployments require.",
    },
    {
      question: "Does CerebroStudio replace tools like LangChain or LangGraph?",
      answer: "No. CerebroStudio is built on top of frameworks like LangChain and LangGraph, providing a visual layer, evaluation studio, and enterprise governance over the underlying agent execution. Teams that prefer to write code directly can still do so — Studio provides visual tooling for design, testing, and governance without abstracting away the engineering layer.",
    },
    {
      question: "How does the Evaluation Studio work?",
      answer: "The Evaluation Studio automatically measures AI output quality across multiple dimensions: accuracy, faithfulness, hallucination rate, context relevance, response latency, and cost per query. Teams define golden datasets and quality thresholds. Every prompt or workflow change triggers an automated evaluation run before promotion to production.",
    },
  ],
};
