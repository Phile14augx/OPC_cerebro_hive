import { EnterpriseService } from "../types";

export const autonomousTransformationService: EnterpriseService = {
  id: "autonomous-transformation",
  slug: "autonomous-transformation",
  title: "Autonomous Enterprise Transformation™",
  summary: "Org-wide agent adoption and workforce augmentation programs.",
  hero: {
    title: "Autonomous Enterprise Transformation™",
    subtitle: "Scaling Agents",
    description: "Move from manual human workflows to autonomous multi-agent systems at enterprise scale. Re-architect how your company works."
  },
  iconName: "Bot",
  category: "Transformation",
  status: "production",
  tags: ["Agents", "Automation", "Workforce", "Change Management"],
  
  config: {
    layout: "enterprise",
    sections: [
      "hero",
      "executive_summary",
      "business_challenges",
      "methodology",
      "roadmap",
      "products",
      "roi",
      "faq",
      "cta"
    ]
  },

  executiveProblem: "Operational scaling is bottlenecked by human throughput. Hiring more people to handle repetitive cognitive tasks destroys margins and agility.",
  businessImpact: "Competitors deploying agentic workflows are operating at 10x the speed with a fraction of the overhead. Manual processes represent an existential risk.",

  businessChallenges: [
    {
      title: "Process Bottlenecks",
      description: "Critical business processes (e.g., procurement, support, compliance) are gated by human review."
    },
    {
      title: "High Error Rates",
      description: "Manual data entry and cognitive fatigue lead to costly errors in standard operating procedures."
    },
    {
      title: "Resistance to Change",
      description: "Workforce apprehension regarding AI adoption requires careful change management and upskilling."
    }
  ],

  targetPersonas: ["COO", "Chief Transformation Officer", "CHRO", "CEO"],
  industries: ["Logistics", "Customer Experience", "Back-office Operations", "Insurance"],
  methodologyOverview: "We map high-volume cognitive tasks, architect multi-agent systems to execute them, and train your workforce to act as 'Agent Managers' rather than operators.",

  timeline: [
    {
      title: "Process Mining",
      duration: "Weeks 1-4",
      activities: ["Task Analysis", "Automation Potential Scoring", "SOP Documentation"]
    },
    {
      title: "Agent Swarm Design",
      duration: "Weeks 5-8",
      activities: ["AgentOS Configuration", "Role Definition", "Human-in-the-Loop Safeguards"]
    },
    {
      title: "Deployment & Training",
      duration: "Weeks 9-16",
      activities: ["Shadow Mode Testing", "Workforce Upskilling", "Full Production Rollout"]
    }
  ],

  successMetrics: [
    { metric: "Operational Cost", value: "-45%", timeframe: "Year 1" },
    { metric: "Process Throughput", value: "24/7", timeframe: "Post-Launch" },
    { metric: "Error Reduction", value: "99%", timeframe: "Post-Launch" }
  ],

  products: ["cerebro-studio", "cerebro-flow", "cerebro-copilot", "hive-ops"],
  platformCapabilities: ["agentos", "agent-mesh", "flow", "cortex"],
  relatedResearch: ["agent-architectures", "digital-twins"],

  deliverables: [
    "Agentic Operating Model",
    "Deployed Multi-Agent Swarms",
    "Change Management Playbook",
    "Workforce Transition Plan"
  ],

  engagementModel: "Multi-year Strategic Partnership",

  pricing: {
    type: "Partnership Model",
    description: "Multi-phase engagement tied to specific business transformation outcomes.",
  }
};
