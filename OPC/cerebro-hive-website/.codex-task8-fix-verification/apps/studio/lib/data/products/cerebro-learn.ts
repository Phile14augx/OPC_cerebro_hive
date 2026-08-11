import { PackagedProduct } from "../types";

/**
 * @deprecated CerebroLearn has been absorbed into CerebroArchive™.
 * Its capabilities (AI certification courses, learning paths, corporate programs)
 * are now delivered as the AI Learning Library sub-module within CerebroArchive.
 * This file is retained for backward compatibility only.
 */
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
  maturity: "legacy",
  tags: ["Training", "LMS"],
  ecosystemLayer: "platform-foundation", // @deprecated — absorbed into CerebroArchive™

  seo: {
    title: "CerebroLearn™ | Corporate AI Training & Certification Platform | CerebroHive",
    description: "CerebroLearn is a corporate AI learning platform with hands-on labs, structured certification paths, and practical AI courses — designed to upskill enterprise teams in LLMs, agents, RAG, and AI engineering.",
    keywords: ["corporate AI training platform", "enterprise AI certification", "AI upskilling software", "AI learning management system", "enterprise AI education", "AI skills training", "AI certification courses", "workplace AI training"],
  },

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
