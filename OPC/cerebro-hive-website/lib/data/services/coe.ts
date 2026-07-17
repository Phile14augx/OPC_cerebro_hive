import { EnterpriseService } from "../types";

export const coeService: EnterpriseService = {
  id: "coe",
  slug: "coe",
  title: "AI Center of Excellence™",
  summary: "Enterprise enablement and internal capability building.",
  hero: {
    title: "AI Center of Excellence™",
    subtitle: "Enablement",
    description: "Establish internal standards, training, and best practices for AI to empower your own workforce to build safely."
  },
  iconName: "Building2",
  category: "Enablement",
  status: "production",
  tags: ["CoE", "Enablement", "Training", "Standards"],
  
  config: {
    layout: "standard",
    sections: [
      "hero",
      "executive_summary",
      "business_challenges",
      "methodology",
      "roadmap",
      "deliverables",
      "roi",
      "cta"
    ]
  },

  executiveProblem: "Decentralized AI efforts lead to duplicated work, inconsistent architectures, and a lack of standardized training across the enterprise.",
  businessImpact: "Without a central authority for standards and training, the organization fails to build reusable components, slowing overall adoption and increasing risk.",

  businessChallenges: [
    {
      title: "Skills Gap",
      description: "Existing developers lack knowledge in prompt engineering, agent orchestration, and LLM behavior."
    },
    {
      title: "Fragmented Standards",
      description: "Different teams using different tools, models, and frameworks, leading to a maintenance nightmare."
    }
  ],

  targetPersonas: ["CIO", "Chief Innovation Officer", "VP of Engineering"],
  industries: ["Cross-Industry"],
  methodologyOverview: "We help you stand up an internal CoE that acts as the hub for AI governance, architecture standards, and corporate education.",

  timeline: [
    {
      title: "CoE Charter & Design",
      duration: "Weeks 1-2",
      activities: ["Define CoE Mandate", "Identify Key Personnel"]
    },
    {
      title: "Standards Development",
      duration: "Weeks 3-4",
      activities: ["Define Architecture Guidelines", "Select Approved Toolchains"]
    },
    {
      title: "Enablement Rollout",
      duration: "Weeks 5-8",
      activities: ["Launch Internal Training", "Establish Office Hours"]
    }
  ],

  successMetrics: [
    { metric: "Internal AI Projects Launched", value: "3x", timeframe: "Year 1" },
    { metric: "Certified Employees", value: "500+", timeframe: "Year 1" }
  ],

  products: ["cerebro-learn"],
  platformCapabilities: ["simulator"],
  relatedResearch: [],

  deliverables: [
    "CoE Charter & Operating Model",
    "Enterprise AI Architecture Standards",
    "Custom Training Curriculum"
  ],

  engagementModel: "Advisory Retainer",

  pricing: {
    type: "Retainer",
    description: "Ongoing advisory and training support billed monthly.",
  }
};
