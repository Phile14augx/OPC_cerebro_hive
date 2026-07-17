import { PackagedProduct } from "../types";

export const cerebroStudioProduct: PackagedProduct = {
  id: "cerebro-studio",
  slug: "cerebro-studio",
  title: "CerebroStudio™",
  summary: "Visual IDE for creating agents, workflows, and multi-agent swarms.",
  hero: {
    title: "CerebroStudio™",
    subtitle: "Agent IDE & Orchestration",
    description: "Empower developers and business analysts to build, test, and deploy custom AI agents visually without writing boilerplate code."
  },
  iconName: "PenTool",
  category: "Developer Tools",
  status: "production",
  maturity: "ga",
  tags: ["Low-Code", "Agent Builder", "IDE"],
  
  config: {
    layout: "developer_tool",
    sections: [
      "hero",
      "executive_summary",
      "business_problems",
      "core_capabilities",
      "architecture_overview",
      "feature_matrix",
      "integration_ecosystem",
      "developer_experience",
      "cta"
    ]
  },

  businessProblems: [
    "Building AI agents requires scarce, highly specialized engineering talent.",
    "Prompt engineering and tool calling logic are brittle and hard to maintain in code.",
    "Business logic gets lost in translation between domain experts and software engineers."
  ],

  targetPersonas: ["AI Engineers", "Business Analysts", "Product Managers"],
  industries: ["Cross-Industry"],

  coreCapabilities: [
    {
      title: "Visual Flow Builder",
      description: "Drag-and-drop nodes to define agent personas, tools, memory, and guardrails.",
      icon: "Workflow"
    },
    {
      title: "Interactive Sandbox",
      description: "Test your agents in real-time with an integrated chat playground and debugger.",
      icon: "PlayCircle"
    },
    {
      title: "One-Click Deployment",
      description: "Compile visual flows into optimized AgentOS manifests and deploy instantly.",
      icon: "Rocket"
    }
  ],

  deploymentModels: ["SaaS", "Private Cloud (VPC)"],
  securityFeatures: ["RBAC", "Audit Logging", "Prompt Injection Filters"],
  
  integrations: [
    { system: "GitHub", type: "Native Integration" },
    { system: "Jira", type: "Tool Integration" },
    { system: "Slack", type: "Deployment Channel" }
  ],

  apiReference: "/developers/api/studio",
  sdkLanguages: ["TypeScript", "Python"],

  platformCapabilities: ["agentos", "flow", "connect"],
  relatedServices: ["autonomous-transformation", "ai-factory"],
  relatedResearch: ["agent-architectures"]
};
