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

  seo: {
    title: "CerebroSphere™ | Enterprise AI Command Center & Architecture Visualization | CerebroHive",
    description: "CerebroSphere is an enterprise AI command center that auto-discovers and visualizes your entire AI agent architecture in real-time — with digital twin simulation for safe infrastructure planning before deployment.",
    keywords: ["AI command center software", "enterprise AI architecture visualization", "AI topology management", "AI observability platform", "digital twin AI infrastructure", "AI system monitoring", "enterprise AI control plane", "AI fleet visualization"],
  },

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
