import { PackagedProduct } from "../types";

export const cerebroLearnProduct: PackagedProduct = {
  id: "cerebro-learn",
  slug: "cerebro-learn",
  title: "CerebroLearn™",
  summary: "Corporate AI Learning, training, certification, and hands-on labs.",
  hero: {
    title: "CerebroLearn™",
    subtitle: "Corporate AI Learning",
    description: "Upskill your workforce with hands-on AI training and certifications."
  },
  iconName: "GraduationCap",
  category: "Education",
  status: "production",
  maturity: "ga",
  tags: ["Training", "LMS"],
  
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
    "Workforce lacks practical AI skills, hindering digital transformation."
  ],

  targetPersonas: ["HR", "All Employees"],
  industries: ["Cross-Industry"],

  coreCapabilities: [
    {
      title: "Interactive Labs",
      description: "Learn by doing in a sandboxed AI environment.",
      icon: "Code"
    },
    {
      title: "Certification Paths",
      description: "Official CerebroHive certifications for your team.",
      icon: "Award"
    }
  ],

  deploymentModels: ["SaaS"],
  securityFeatures: [],
  integrations: [],

  platformCapabilities: ["simulator"],
  relatedServices: ["coe"],
  relatedResearch: []
};
