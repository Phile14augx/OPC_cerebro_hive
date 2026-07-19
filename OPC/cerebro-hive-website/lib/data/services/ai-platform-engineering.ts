import { EnterpriseService } from "../types";

export const aiPlatformEngineeringService: EnterpriseService = {
  id: "ai-platform-engineering",
  slug: "ai-platform-engineering",
  title: "AI Platform Engineering™",
  summary: "Building robust, scalable enterprise AI platforms on Cerebro technology.",
  hero: {
    title: "AI Platform Engineering™",
    subtitle: "Custom Platform Build",
    description: "Our core engineering teams build, integrate, and deploy your proprietary AI platform directly into your secure cloud."
  },
  iconName: "HardHat",
  category: "Engineering",
  status: "production",
  tags: ["Implementation", "Engineering", "Kubernetes", "Cloud"],

  seo: {
    title: "AI Platform Engineering | Enterprise LLM & Agent Infrastructure | CerebroHive",
    description: "CerebroHive builds production-grade enterprise AI platforms — LLM inference infrastructure, RAG pipelines, multi-agent orchestration, MLOps, and cloud-native AI architectures.",
    keywords: [
      "AI platform engineering", "enterprise LLM infrastructure", "RAG pipeline development",
      "multi-agent system architecture", "MLOps platform build", "AI infrastructure consulting",
      "LangChain enterprise", "vector database integration", "AI cloud architecture",
    ],
  },

  config: {
    layout: "enterprise",
    sections: [
      "hero",
      "executive_summary",
      "architecture",
      "roadmap",
      "products",
      "roi",
      "cta"
    ]
  },

  executiveProblem: "Building an internal AI platform from scratch takes years of specialized engineering talent, delaying time-to-market.",
  businessImpact: "Attempting DIY AI platforms results in fragile infrastructure, high technical debt, and an inability to keep pace with rapid LLM advancements.",

  businessChallenges: [
    {
      title: "Talent Scarcity",
      description: "Finding engineers capable of distributed systems, ML ops, and agent orchestration is nearly impossible."
    },
    {
      title: "Integration Complexity",
      description: "Wiring foundational models into legacy enterprise IAM, databases, and networks securely."
    }
  ],

  targetPersonas: ["VP of Engineering", "Chief Architect", "CTO"],
  industries: ["Technology", "Telecommunications", "Software", "Enterprise IT"],
  methodologyOverview: "We use the Cerebro Platform as a foundational blueprint, extending and customizing it to fit perfectly within your VPC.",

  timeline: [
    {
      title: "Architecture Blueprinting",
      duration: "Weeks 1-3",
      activities: ["Network Topology Design", "Security Review", "Component Selection"]
    },
    {
      title: "Platform Construction",
      duration: "Weeks 4-12",
      activities: ["Kubernetes Setup", "Service Mesh Deployment", "AgentOS Integration"]
    },
    {
      title: "Handover & Training",
      duration: "Weeks 13-16",
      activities: ["SRE Training", "Documentation Handoff", "Day-2 Operations Setup"]
    }
  ],

  successMetrics: [
    { metric: "Time-to-Market", value: "3 Months", timeframe: "Vs. 18 Months DIY" },
    { metric: "Uptime SLA", value: "99.99%", timeframe: "Production" }
  ],

  products: ["cerebro-studio", "hive-ops"],
  platformCapabilities: ["agentos", "guard", "observatory", "connect"],
  relatedResearch: ["agent-architectures"],

  deliverables: [
    "Production-Ready AI Platform",
    "Infrastructure-as-Code Repositories",
    "CI/CD Pipelines",
    "Runbooks & Technical Documentation"
  ],

  engagementModel: "Agile Engineering Sprints",

  pricing: {
    type: "Sprint-Based Execution",
    description: "Dedicated engineering squads billed per sprint.",
  },

  faqs: [
    {
      question: "What is enterprise AI platform engineering?",
      answer: "Enterprise AI platform engineering is the technical discipline of designing, building, and operating the infrastructure that powers AI systems at organizational scale. It includes LLM inference infrastructure, vector database deployment, RAG pipeline architecture, multi-agent orchestration systems, MLOps tooling, observability layers, and security controls — all integrated into the enterprise technology stack.",
    },
    {
      question: "What tech stack does CerebroHive use for AI platform builds?",
      answer: "CerebroHive builds on proven open-source and cloud-native technologies: LangChain, LangGraph, and CrewAI for agent orchestration; Qdrant, Weaviate, and Pinecone for vector storage; FastAPI and gRPC for inference APIs; Kubernetes and Helm for deployment; MLflow and DVC for experiment tracking; and Grafana and OpenTelemetry for observability. We select the right stack for each client's cloud environment (AWS, Azure, GCP, or on-premises).",
    },
    {
      question: "How do you build RAG pipelines for enterprises?",
      answer: "Our RAG pipeline architecture follows a five-stage process: (1) Document ingestion and pre-processing (parsing, chunking, cleaning); (2) Embedding generation using appropriate embedding models; (3) Vector store indexing with metadata filtering; (4) Query routing and retrieval optimization (hybrid search, re-ranking); (5) Generation with context injection and output validation. We add enterprise controls including access-level filtering, audit logging, and PII detection.",
    },
    {
      question: "What is the Model Context Protocol (MCP) and how does your team use it?",
      answer: "The Model Context Protocol (MCP) is an open standard for connecting AI models to external tools, data sources, and APIs in a structured, secure way. CerebroHive engineers build MCP tool servers that expose enterprise data (databases, APIs, file systems) to AI models in a controlled manner — enabling agents to query CRMs, ERPs, and internal knowledge bases without direct data exposure. This makes our AI architectures vendor-portable and future-proof.",
    },
    {
      question: "How long does it take to build an enterprise AI platform?",
      answer: "A foundational AI platform with core RAG, agent orchestration, and observability can be delivered in 8–12 weeks using our sprint-based methodology. A full production platform with custom model fine-tuning, enterprise SSO integration, multi-tenant architecture, and governance controls typically takes 16–24 weeks. We work in 2-week sprints with defined deliverables and continuous stakeholder demos.",
    },
    {
      question: "How do you handle LLM selection — which models do you recommend?",
      answer: "We take a model-agnostic approach, selecting LLMs based on the specific use case requirements: GPT-4o or Claude for complex reasoning; Gemini for multimodal tasks; Llama 3 or Mistral for on-premises or open-weight deployments; domain-specific fine-tuned models where pre-training data overlap is insufficient. We also build multi-model routing layers so the platform can switch models based on cost, latency, and quality requirements.",
    },
    {
      question: "What does MLOps mean for enterprise AI platforms?",
      answer: "MLOps (Machine Learning Operations) for enterprise AI platforms refers to the practices and tooling that ensure AI models are reliably trained, evaluated, deployed, monitored, and retrained. In our builds, this includes: automated CI/CD pipelines for model deployment; experiment tracking with MLflow; data versioning with DVC; model registry management; drift detection and alerting; and A/B testing infrastructure for comparing model versions in production.",
    },
    {
      question: "How do you secure an enterprise AI platform?",
      answer: "We implement security at every layer: network isolation with VPC and private endpoints; encryption at rest and in transit; role-based access control (RBAC) for model and data access; input sanitization and prompt injection detection; output filtering and PII redaction; audit logging for all model interactions; and compliance controls for GDPR, HIPAA, and SOC 2 as required. Security is architected from day one, not added after.",
    },
    {
      question: "Can you integrate AI into our existing ERP, CRM, or legacy systems?",
      answer: "Yes — enterprise integration is a core capability. We build connectors and adapters for SAP, Salesforce, ServiceNow, Microsoft Dynamics, Oracle, and custom legacy systems. We use REST APIs, GraphQL, webhooks, event streaming (Kafka), and ETL pipelines to feed enterprise data into AI systems in real time. Where legacy APIs don't exist, we build extraction layers that read from databases directly.",
    },
    {
      question: "What is multi-agent orchestration and when does an enterprise need it?",
      answer: "Multi-agent orchestration refers to coordinating multiple specialized AI agents that each handle a distinct subtask, passing context between them to complete complex workflows. An enterprise needs it when: tasks require multiple specialized skills (research + reasoning + writing + validation); workflows are too long for a single LLM context window; parallel processing is required for speed; or different steps require different models or data access permissions. CerebroHive builds multi-agent systems using LangGraph and custom orchestration layers.",
    },
    {
      question: "What does observability mean for AI platforms and why does it matter?",
      answer: "AI platform observability means being able to monitor, trace, and understand every interaction between users, AI models, tools, and data in real time. It includes: latency tracking per model call; token consumption and cost monitoring; retrieval quality metrics (precision, recall); hallucination rate detection; user satisfaction signals; and infrastructure health dashboards. Without observability, enterprise AI systems are black boxes — CerebroHive instruments every platform with OpenTelemetry and Grafana dashboards from day one.",
    },
    {
      question: "How do you handle data privacy when enterprise data is sent to LLMs?",
      answer: "We implement multiple layers of data privacy protection: PII detection and redaction before data reaches any LLM; customer-managed encryption keys for all stored embeddings; on-premises or VPC-deployed models for the highest sensitivity use cases; data residency controls to keep data within specific cloud regions; and contractual data processing agreements with all LLM providers. For regulated industries, we prioritize open-weight models (Llama, Mistral) deployed within the client's own infrastructure.",
    },
  ],
};
