import { PackagedProduct } from "../types";

export const hiveOpsProduct: PackagedProduct = {
  id: "hive-ops",
  slug: "hive-ops",
  title: "HiveOps™",
  summary: "Operations Center to deploy, monitor, and scale agents in production.",
  hero: {
    title: "HiveOps™",
    subtitle: "Operations Center",
    description: "The control plane for your entire AI fleet. Monitor performance, latency, and costs across thousands of deployed agents."
  },
  iconName: "Settings",
  category: "Operations",
  status: "production",
  maturity: "ga",
  tags: ["DevOps", "Monitoring", "LLMOps"],

  seo: {
    title: "HiveOps™ | Enterprise LLMOps & AI Agent Operations Platform | CerebroHive",
    description: "HiveOps is an enterprise LLMOps platform for deploying, monitoring, and scaling AI agents in production — with granular token cost attribution, fleet management, and zero-downtime model rollbacks.",
    keywords: ["LLMOps platform", "AI agent monitoring software", "enterprise LLM operations", "AI fleet management", "LLM cost tracking", "AI deployment platform", "AI model operations", "enterprise AI DevOps"],
  },

  config: {
    layout: "infrastructure",
    sections: [
      "hero",
      "executive_summary",
      "core_capabilities",
      "feature_matrix",
      "developer_experience",
      "cta"
    ]
  },

  businessProblems: [
    "No visibility into token costs or latency across different model providers.",
    "Hard to version and rollback agent deployments without downtime."
  ],

  targetPersonas: ["DevOps", "AI Engineers", "Platform Engineers"],
  industries: ["Cross-Industry"],

  coreCapabilities: [
    {
      title: "Fleet Management",
      description: "Manage thousands of agents, update prompts, and switch models dynamically.",
      icon: "Server"
    },
    {
      title: "Cost & Token Tracking",
      description: "Granular attribution of LLM costs to specific departments or users.",
      icon: "DollarSign"
    }
  ],

  deploymentModels: ["SaaS", "Private Cloud"],
  securityFeatures: [],
  integrations: [
    { system: "Datadog", type: "Metrics Export" },
    { system: "Prometheus", type: "Metrics Export" }
  ],

  apiReference: "/developers/api/ops",
  sdkLanguages: ["Python", "Go", "TypeScript"],

  platformCapabilities: ["observatory", "eval"],
  relatedServices: ["aiops"],
  relatedResearch: []
};
