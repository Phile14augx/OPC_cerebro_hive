import { PackagedProduct } from "../types";

export const cerebroSphereProduct: PackagedProduct = {
  id: "cerebro-sphere",
  slug: "cerebro-sphere",
  title: "CerebroSphere™",
  summary: "AI Command Center: live architecture, agent topology, and metrics.",
  hero: {
    title: "CerebroSphere™",
    subtitle: "AI Command Center",
    description: "Visualize and manage your enterprise AI architecture in real-time."
  },
  iconName: "Globe2",
  category: "Management",
  status: "production",
  maturity: "ga",
  tags: ["Command Center", "Topology", "Digital Twin"],
  
  config: {
    layout: "platform",
    sections: [
      "hero",
      "executive_summary",
      "core_capabilities",
      "architecture_overview",
      "cta"
    ]
  },

  businessProblems: [
    "Enterprise AI architectures are too complex to understand via spreadsheets.",
    "Lack of a centralized view for C-level executives."
  ],

  targetPersonas: ["Enterprise Architects", "CIO", "CTO"],
  industries: ["Cross-Industry"],

  coreCapabilities: [
    {
      title: "Live Topology Map",
      description: "Auto-discovers and visualizes all running agents and their data flows.",
      icon: "Map"
    },
    {
      title: "Digital Twin Overlay",
      description: "Simulate changes to the architecture before deploying them.",
      icon: "Copy"
    }
  ],

  deploymentModels: ["SaaS"],
  securityFeatures: [],
  integrations: [],

  platformCapabilities: ["agent-mesh", "simulator"],
  relatedServices: ["ai-strategy"],
  relatedResearch: []
};
