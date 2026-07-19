import { PackagedProduct } from "../types";

export const cerebroXProduct: PackagedProduct = {
  id: "cerebro-x",
  slug: "cerebro-x",
  title: "Cerebro X™",
  summary: "The AI Gateway powering the entire CerebroHive platform — intelligent model routing, provider abstraction, prompt orchestration, cost optimization, observability, and enterprise-grade AI access control across all modules.",
  hero: {
    title: "Cerebro X™",
    subtitle: "Enterprise AI Gateway",
    description: "The shared intelligence layer connecting every CerebroHive module to the world's leading AI models. Cerebro X abstracts model complexity, optimizes costs, enforces governance, and provides unified observability — so every product in the ecosystem benefits from production-grade AI access without managing individual provider integrations.",
    primaryCta: "Explore AI Gateway",
    secondaryCta: "View API Reference",
  },
  iconName: "Zap",
  category: "Foundation",
  status: "production",
  maturity: "ga",
  tags: ["AI Gateway", "Model Routing", "LLM Abstraction", "Prompt Orchestration", "Cost Optimization", "AI Observability"],

  // Ecosystem Positioning — Shared Platform Service (AI Gateway)
  ecosystemLayer: "foundation",
  moduleConnections: ["cerebro-copilot", "cerebro-studio", "cerebro-flow", "cerebro-archive", "hivepulse"],
  platformServices: ["ai-gateway", "model-registry", "cost-management", "observability"],
  providesCapabilities: ["model-routing", "provider-abstraction", "prompt-orchestration", "ai-cost-management", "ai-observability"],

  seo: {
    title: "Cerebro X™ | Enterprise AI Gateway | CerebroHive",
    description: "Cerebro X is the AI Gateway powering the CerebroHive platform — providing intelligent model routing, multi-provider abstraction, prompt orchestration, cost optimization, and enterprise AI observability as a shared service across all modules.",
    keywords: [
      "enterprise AI gateway",
      "LLM gateway platform",
      "AI model routing software",
      "multi-model AI abstraction",
      "enterprise LLM management",
      "AI cost optimization platform",
      "prompt orchestration platform",
      "AI observability platform",
      "enterprise AI API gateway",
      "model registry enterprise",
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
    "Each AI project integrates directly with different model providers, creating fragmented, inconsistent, ungoverned AI access.",
    "AI infrastructure costs are invisible — there is no centralized view of model usage, token spend, or cost attribution by team.",
    "Switching between AI providers requires re-engineering integrations instead of changing a configuration.",
    "There is no consistent layer enforcing safety guardrails, rate limits, and content policies across AI-powered applications.",
    "AI model performance and quality degrade without systematic monitoring, alerting, and comparative evaluation.",
  ],

  targetPersonas: ["Platform Engineers", "AI/ML Engineers", "Enterprise Architects", "CTO", "AI Governance Teams"],
  industries: ["Technology", "Financial Services", "Healthcare", "Professional Services", "Any Enterprise with AI Workloads"],

  coreCapabilities: [
    {
      title: "Intelligent Model Router",
      description: "Route AI requests to the optimal model based on task type, latency requirements, cost constraints, and quality thresholds — automatically, without application code changes.",
      icon: "GitBranch",
    },
    {
      title: "Multi-Provider Abstraction",
      description: "Unified API layer abstracting OpenAI, Anthropic Claude, Google Gemini, Meta Llama, Mistral, Cohere, and custom fine-tuned models behind a single consistent interface.",
      icon: "Layers",
    },
    {
      title: "Prompt Orchestration Engine",
      description: "Centralized prompt management with version control, A/B testing, caching, token optimization, and response transformation — decoupling prompts from application code.",
      icon: "MessageSquare",
    },
    {
      title: "AI Cost Management",
      description: "Real-time token usage tracking, cost attribution by team and project, budget enforcement, automatic fallback to cheaper models, and reserved capacity optimization.",
      icon: "DollarSign",
    },
    {
      title: "AI Observability",
      description: "Distributed tracing across every model call, latency monitoring, error rate alerting, output quality scoring, hallucination detection, and model performance dashboards.",
      icon: "Activity",
    },
    {
      title: "Rate Limiting & Load Balancing",
      description: "Per-tenant, per-team, and per-application rate limits with intelligent load balancing across model providers and geographic regions to ensure fair access and high availability.",
      icon: "Sliders",
    },
    {
      title: "Response Caching",
      description: "Semantic and exact-match caching for AI responses — dramatically reduce costs and latency for repeated or similar queries without sacrificing response quality.",
      icon: "Database",
    },
    {
      title: "Model Registry",
      description: "Versioned registry for all AI models in use — including fine-tuned proprietary models, model cards, performance benchmarks, and deployment metadata.",
      icon: "Package",
    },
  ],

  deploymentModels: ["SaaS (Cloud)", "Private Cloud (VPC)", "On-Premises", "Air-Gapped Enterprise"],
  securityFeatures: [
    "mTLS for All Model Traffic",
    "API Key Rotation",
    "Per-Tenant Isolation",
    "Prompt Injection Detection",
    "AI Output Guardrails",
    "SOC 2 Type II",
    "Data Residency Controls",
  ],

  integrations: [
    { system: "OpenAI / Azure OpenAI", type: "LLM Provider" },
    { system: "Anthropic Claude", type: "LLM Provider" },
    { system: "Google Gemini / Vertex AI", type: "LLM Provider" },
    { system: "Meta Llama / Hugging Face", type: "Open Source Models" },
    { system: "Mistral / Cohere", type: "LLM Provider" },
    { system: "CerebroStudio™", type: "Prompt Registry Consumer" },
    { system: "CerebroCopilot™", type: "Primary AI Consumer" },
    { system: "HiveShield™", type: "Guardrails Enforcement" },
  ],

  apiReference: "/developers/api/cerebro-x",
  sdkLanguages: ["Python", "TypeScript", "Go", "REST"],
  platformCapabilities: ["ai-gateway", "model-routing", "prompt-registry", "ai-observability"],
  relatedServices: ["ai-platform-engineering", "enterprise-architecture"],
  relatedResearch: ["llm-evaluation", "ai-cost-optimization"],

  faqs: [
    {
      question: "What is Cerebro X™?",
      answer: "Cerebro X is the AI Gateway at the heart of the CerebroHive platform. Every AI-powered feature across all modules — from CerebroCopilot's responses to CerebroFlow's AI workflow steps — routes through Cerebro X. It provides model abstraction, cost governance, safety guardrails, and observability as shared platform services.",
    },
    {
      question: "Can teams use Cerebro X independently without other CerebroHive modules?",
      answer: "Yes. Cerebro X exposes a standalone API that any application can use to access multiple AI providers through a single, governed gateway. Teams benefit from model routing, cost optimization, and observability even if they are not yet using other CerebroHive modules.",
    },
    {
      question: "How does Cerebro X reduce AI costs?",
      answer: "Cerebro X reduces AI costs through intelligent model routing (cheaper models for simpler tasks), semantic response caching (reusing computed answers), token optimization (trimming redundant context), and cost attribution (exposing waste at the team level so it can be addressed).",
    },
  ],
};
