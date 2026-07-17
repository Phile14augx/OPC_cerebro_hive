import { EnterpriseService } from "../types";

export const aiFactoryService: EnterpriseService = {
  id: "ai-factory",
  slug: "ai-factory",
  title: "AI Factory™",
  summary: "Rapid, repeatable delivery model for AI use cases.",
  hero: {
    title: "AI Factory™",
    subtitle: "Use Case Delivery",
    description: "A scaled delivery model to churn out AI solutions rapidly across departments using a standardized assembly line."
  },
  iconName: "Factory",
  category: "Delivery",
  status: "production",
  tags: ["Scale", "Delivery", "Agile", "Factory Model"],
  
  config: {
    layout: "enterprise",
    sections: [
      "hero",
      "executive_summary",
      "methodology",
      "architecture",
      "deliverables",
      "products",
      "roi",
      "cta"
    ]
  },

  executiveProblem: "Departments have dozens of viable AI use cases, but IT cannot deliver them fast enough, creating a massive backlog and shadow IT.",
  businessImpact: "Slow time-to-market for AI solutions results in lost productivity gains and falling behind more agile competitors.",

  businessChallenges: [
    {
      title: "Delivery Bottlenecks",
      description: "Central IT lacks the capacity to service the AI demands of every business unit."
    },
    {
      title: "Inconsistent Standards",
      description: "Custom-building every solution leads to inconsistent UI, security, and maintenance overhead."
    }
  ],

  targetPersonas: ["CIO", "VP of Application Development", "Head of AI Delivery"],
  industries: ["Financial Services", "Retail", "Manufacturing", "Healthcare"],
  methodologyOverview: "We establish a dedicated 'Factory' team that ingests business requirements, utilizes CerebroStudio to rapidly assemble agents, and deploys them into a standardized environment.",

  timeline: [
    {
      title: "Factory Setup",
      duration: "Weeks 1-2",
      activities: ["Toolchain Configuration", "Intake Process Design"]
    },
    {
      title: "First Wave Execution",
      duration: "Weeks 3-6",
      activities: ["Top 3 Use Cases Delivered", "User Acceptance Testing"]
    },
    {
      title: "Continuous Delivery",
      duration: "Ongoing",
      activities: ["Bi-weekly Sprints", "Continuous Deployment of Agents"]
    }
  ],

  successMetrics: [
    { metric: "Use Case Delivery Time", value: "2 Weeks", timeframe: "Per sprint" },
    { metric: "Development Cost", value: "-60%", timeframe: "Compared to custom builds" }
  ],

  products: ["cerebro-studio", "cerebro-flow"],
  platformCapabilities: ["agentos", "flow", "connect"],
  relatedResearch: [],

  deliverables: [
    "AI Factory Operating Model",
    "Continuous Stream of Deployed AI Solutions",
    "Standardized Agent UI/UX Templates"
  ],

  engagementModel: "Capacity Retainer",

  pricing: {
    type: "Capacity Retainer",
    description: "Dedicated pod of AI Engineers, Designers, and Product Managers billed monthly.",
  }
};
