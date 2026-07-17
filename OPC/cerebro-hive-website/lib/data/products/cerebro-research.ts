import { PackagedProduct } from "../types";

export const cerebroResearchProduct: PackagedProduct = {
  id: "cerebro-research",
  slug: "cerebro-research",
  title: "CerebroResearch™",
  summary: "Enterprise Research Platform for scientific workflows and paper analysis.",
  hero: {
    title: "CerebroResearch™",
    subtitle: "Enterprise Research Platform",
    description: "Accelerate R&D with agents that read, synthesize, and draft research."
  },
  iconName: "Microscope",
  category: "Research",
  status: "production",
  maturity: "ga",
  tags: ["R&D", "Science"],
  
  config: {
    layout: "saas",
    sections: [
      "hero",
      "executive_summary",
      "core_capabilities",
      "cta"
    ]
  },

  businessProblems: [
    "R&D teams spend 80% of their time reading papers instead of doing novel research."
  ],

  targetPersonas: ["R&D Teams", "Data Scientists"],
  industries: ["Life Sciences", "Pharmaceuticals", "Academic"],

  coreCapabilities: [
    {
      title: "Literature Review Agent",
      description: "Summarizes thousands of PDFs overnight.",
      icon: "BookOpen"
    },
    {
      title: "Hypothesis Generation",
      description: "Suggests novel correlations based on vast datasets.",
      icon: "Lightbulb"
    }
  ],

  deploymentModels: ["VPC", "SaaS"],
  securityFeatures: ["IP Protection"],
  integrations: [],

  platformCapabilities: ["knowledge-fabric", "reasoning-engine"],
  relatedServices: ["knowledge-engineering"],
  relatedResearch: []
};
