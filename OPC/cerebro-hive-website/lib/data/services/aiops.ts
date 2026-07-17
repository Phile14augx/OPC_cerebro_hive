import { EnterpriseService } from "../types";

export const aiopsService: EnterpriseService = {
  id: "aiops",
  slug: "aiops",
  title: "AI Operations (AIOps)™",
  summary: "Full-lifecycle operation and managed services for enterprise AI systems.",
  hero: {
    title: "AI Operations (AIOps)™",
    subtitle: "Managed Services",
    description: "Let us monitor, maintain, and optimize your AI deployments in production 24/7."
  },
  iconName: "Activity",
  category: "Operations",
  status: "production",
  tags: ["Managed Services", "Ops", "Monitoring", "SRE"],
  
  config: {
    layout: "standard",
    sections: [
      "hero",
      "executive_summary",
      "architecture",
      "products",
      "roi",
      "cta"
    ]
  },

  executiveProblem: "Once AI models and agents hit production, traditional IT ops teams lack the specialized tooling and skills to monitor for drift, hallucinations, and token latency.",
  businessImpact: "Unmonitored AI systems degrade over time, leading to poor user experiences and escalating cloud costs.",

  businessChallenges: [
    {
      title: "Model Degradation",
      description: "Without continuous evaluation, models drift from their baseline accuracy."
    },
    {
      title: "Unpredictable Costs",
      description: "Runaway agent loops can consume massive amounts of token budget overnight."
    }
  ],

  targetPersonas: ["VP of Operations", "CIO", "Head of SRE"],
  industries: ["Cross-Industry"],
  methodologyOverview: "We provide 24/7 managed services using HiveOps and CerebroSphere to monitor your entire AI fleet, ensuring high availability and cost efficiency.",

  timeline: [
    {
      title: "Onboarding & Instrumentation",
      duration: "Weeks 1-2",
      activities: ["Deploy Observability Agents", "Establish Baseline Metrics"]
    },
    {
      title: "Active Management",
      duration: "Ongoing",
      activities: ["24/7 Incident Response", "Cost Optimization"]
    }
  ],

  successMetrics: [
    { metric: "MTTR", value: "< 15 Mins", timeframe: "SLA" },
    { metric: "Uptime", value: "99.99%", timeframe: "SLA" }
  ],

  products: ["hive-ops", "cerebro-sphere"],
  platformCapabilities: ["observatory", "eval"],
  relatedResearch: [],

  deliverables: [
    "24/7 Fleet Monitoring",
    "Monthly Optimization Reports",
    "Incident Response SLAs"
  ],

  engagementModel: "Managed Services Retainer",

  pricing: {
    type: "Tiered Managed Services",
    description: "Billed monthly based on the size of the deployed AI fleet.",
  }
};
