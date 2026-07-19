import { PackagedProduct } from "../types";

export const cerebroCopilotProduct: PackagedProduct = {
  id: "cerebro-copilot",
  slug: "cerebro-copilot",
  title: "CerebroCopilot™",
  summary: "Enterprise Assistant that works across ERP, CRM, HR, and Finance.",
  hero: {
    title: "CerebroCopilot™",
    subtitle: "Enterprise Assistant",
    description: "Your AI companion for daily workflows, deeply integrated into your tech stack to automate tasks securely."
  },
  iconName: "MessageSquare",
  category: "Productivity",
  status: "production",
  maturity: "ga",
  tags: ["Assistant", "Productivity"],

  seo: {
    title: "CerebroCopilot™ | Enterprise AI Assistant | CerebroHive",
    description: "CerebroCopilot is an enterprise AI assistant that augments every knowledge worker — drafting, analyzing, summarizing, and answering questions with access to your organizational context.",
    keywords: ["enterprise AI assistant", "AI copilot software", "workplace AI tool", "enterprise ChatGPT alternative", "AI productivity tool", "knowledge worker AI", "LLM enterprise assistant", "corporate AI assistant"],
  },

  config: {
    layout: "saas",
    sections: [
      "hero",
      "executive_summary",
      "core_capabilities",
      "feature_matrix",
      "integration_ecosystem",
      "cta"
    ]
  },

  businessProblems: [
    "Employees use unapproved public LLMs, risking data leaks.",
    "Generic enterprise chatbots don't integrate with core systems to take action."
  ],

  targetPersonas: ["All Employees", "CIO"],
  industries: ["Cross-Industry"],

  coreCapabilities: [
    {
      title: "Contextual Awareness",
      description: "Knows who the user is, their role, and what data they have access to.",
      icon: "User"
    },
    {
      title: "Action Execution",
      description: "Can execute tool calls in Jira, Salesforce, and Workday directly from chat.",
      icon: "Zap"
    }
  ],

  deploymentModels: ["SaaS"],
  securityFeatures: ["SSO", "Data Retention Policies"],
  integrations: [
    { system: "Slack", type: "Native App" },
    { system: "Microsoft Teams", type: "Native App" }
  ],

  platformCapabilities: ["agentos", "context-engine", "connect"],
  relatedServices: ["autonomous-transformation"],
  relatedResearch: []
};
