import { EnterpriseService } from "../types";

export const aiPlatformEngineeringService: EnterpriseService = {
  id: "ai-platform-engineering",
  slug: "ai-platform-engineering",
  title: "AI Platform Engineering™",
  summary: "Building robust, scalable enterprise AI platforms on Cerebro technology.",
  hero: {
    title: "AI Platform Engineering™",
    subtitle: "Custom Platform Build",
    description: "Our core engineering teams build, integrate, and deploy your proprietary AI platform directly into your secure cloud."
  },
  iconName: "HardHat",
  category: "Engineering",
  status: "production",
  tags: ["Implementation", "Engineering", "Kubernetes", "Cloud"],
  
  config: {
    layout: "enterprise",
    sections: [
      "hero",
      "executive_summary",
      "architecture",
      "roadmap",
      "products",
      "roi",
      "cta"
    ]
  },

  executiveProblem: "Building an internal AI platform from scratch takes years of specialized engineering talent, delaying time-to-market.",
  businessImpact: "Attempting DIY AI platforms results in fragile infrastructure, high technical debt, and an inability to keep pace with rapid LLM advancements.",

  businessChallenges: [
    {
      title: "Talent Scarcity",
      description: "Finding engineers capable of distributed systems, ML ops, and agent orchestration is nearly impossible."
    },
    {
      title: "Integration Complexity",
      description: "Wiring foundational models into legacy enterprise IAM, databases, and networks securely."
    }
  ],

  targetPersonas: ["VP of Engineering", "Chief Architect", "CTO"],
  industries: ["Technology", "Telecommunications", "Software", "Enterprise IT"],
  methodologyOverview: "We use the Cerebro Platform as a foundational blueprint, extending and customizing it to fit perfectly within your VPC.",

  timeline: [
    {
      title: "Architecture Blueprinting",
      duration: "Weeks 1-3",
      activities: ["Network Topology Design", "Security Review", "Component Selection"]
    },
    {
      title: "Platform Construction",
      duration: "Weeks 4-12",
      activities: ["Kubernetes Setup", "Service Mesh Deployment", "AgentOS Integration"]
    },
    {
      title: "Handover & Training",
      duration: "Weeks 13-16",
      activities: ["SRE Training", "Documentation Handoff", "Day-2 Operations Setup"]
    }
  ],

  successMetrics: [
    { metric: "Time-to-Market", value: "3 Months", timeframe: "Vs. 18 Months DIY" },
    { metric: "Uptime SLA", value: "99.99%", timeframe: "Production" }
  ],

  products: ["cerebro-studio", "hive-ops"],
  platformCapabilities: ["agentos", "guard", "observatory", "connect"],
  relatedResearch: ["agent-architectures"],

  deliverables: [
    "Production-Ready AI Platform",
    "Infrastructure-as-Code Repositories",
    "CI/CD Pipelines",
    "Runbooks & Technical Documentation"
  ],

  engagementModel: "Agile Engineering Sprints",

  pricing: {
    type: "Sprint-Based Execution",
    description: "Dedicated engineering squads billed per sprint.",
  }
};
