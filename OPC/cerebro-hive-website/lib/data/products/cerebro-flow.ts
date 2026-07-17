import { PackagedProduct } from "../types";

export const cerebroFlowProduct: PackagedProduct = {
  id: "cerebro-flow",
  slug: "cerebro-flow",
  title: "CerebroFlow™",
  summary: "AI-first BPM built on the Flow engine.",
  hero: {
    title: "CerebroFlow™",
    subtitle: "Workflow Automation",
    description: "Automate complex business processes by orchestrating AI agents, humans, and traditional APIs in a single control plane."
  },
  iconName: "Workflow",
  category: "Automation",
  status: "production",
  maturity: "ga",
  tags: ["BPM", "Automation", "Orchestration"],
  
  config: {
    layout: "saas",
    sections: [
      "hero",
      "executive_summary",
      "business_problems",
      "core_capabilities",
      "architecture_overview",
      "integration_ecosystem",
      "cta"
    ]
  },

  businessProblems: [
    "Traditional RPA is too brittle to handle edge cases or unstructured data.",
    "Humans spend hours acting as 'glue' between incompatible enterprise systems.",
    "End-to-end process visibility is nonexistent across departmental silos."
  ],

  targetPersonas: ["COO", "VP of Operations", "IT Automation Leaders"],
  industries: ["Logistics", "Finance", "Insurance", "Retail"],

  coreCapabilities: [
    {
      title: "Agentic Orchestration",
      description: "Trigger multi-agent swarms to handle complex cognitive tasks as part of a larger workflow.",
      icon: "Bot"
    },
    {
      title: "Human-in-the-loop (HITL)",
      description: "Seamlessly pause workflows for human review, approval, or intervention when confidence is low.",
      icon: "UserCheck"
    },
    {
      title: "Resilient Execution",
      description: "Automatic retries, fallback logic, and state management for long-running async processes.",
      icon: "Activity"
    }
  ],

  deploymentModels: ["SaaS", "Private Cloud (VPC)"],
  securityFeatures: ["State Encryption", "Granular Access Control"],
  
  integrations: [
    { system: "Salesforce", type: "Native Connector" },
    { system: "ServiceNow", type: "Native Connector" },
    { system: "SAP", type: "Native Connector" }
  ],

  apiReference: "/developers/api/flow",
  sdkLanguages: ["TypeScript", "Go"],

  platformCapabilities: ["flow", "reasoning-engine", "connect"],
  relatedServices: ["autonomous-transformation"],
  relatedResearch: []
};
