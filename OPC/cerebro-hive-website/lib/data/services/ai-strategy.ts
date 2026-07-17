import { EnterpriseService } from "../types";

export const aiStrategyService: EnterpriseService = {
  id: "ai-strategy",
  slug: "ai-strategy",
  title: "CerebroAI Strategy™",
  summary: "Executive AI strategy and roadmap development to engineer intelligent enterprises.",
  hero: {
    title: "CerebroAI Strategy™",
    subtitle: "Executive Advisory",
    description: "Map your enterprise AI transformation journey with our principal architects. Move beyond pilots and build a scalable, defensible AI moat."
  },
  iconName: "Compass",
  category: "Strategy",
  status: "production",
  tags: ["Strategy", "Roadmap", "Advisory", "C-Suite"],
  
  config: {
    layout: "enterprise",
    sections: [
      "hero",
      "executive_summary",
      "business_challenges",
      "methodology",
      "roadmap",
      "deliverables",
      "products",
      "roi",
      "faq",
      "cta"
    ]
  },

  executiveProblem: "Organizations struggle to identify high-ROI AI use cases amidst vendor hype, resulting in fragmented shadow AI, disconnected pilots, and unscalable point solutions.",
  businessImpact: "Without a unified strategy, enterprises risk competitive obsolescence, technical debt, and compliance violations as AI adoption scales uncontrollably.",

  businessChallenges: [
    {
      title: "Pilot Purgatory",
      description: "Getting stuck in endless proofs of concept that never reach production due to missing infrastructure or security."
    },
    {
      title: "Shadow AI Risks",
      description: "Employees independently adopting unsafe public LLMs, exposing proprietary data and intellectual property."
    },
    {
      title: "Vendor Lock-in",
      description: "Over-reliance on closed-source model providers leading to skyrocketing inference costs and rigid architectures."
    }
  ],

  targetPersonas: ["CIO", "CDO", "VP of Innovation", "CEO"],
  industries: ["Finance", "Healthcare", "Manufacturing", "Retail"],
  methodologyOverview: "Our strategy engagement follows a rigorous 3-phase methodology: Assessment, Architecture, and Acceleration, designed to deliver board-ready roadmaps within 45 days.",

  timeline: [
    {
      title: "Discovery & Assessment",
      duration: "Week 1-2",
      activities: ["Executive Stakeholder Interviews", "Current State Architecture Review", "Data Maturity Scoring"]
    },
    {
      title: "Use Case Prioritization",
      duration: "Week 3-4",
      activities: ["Feasibility Analysis", "ROI Modeling", "Capability Mapping against Cerebro Platform"]
    },
    {
      title: "Roadmap Formulation",
      duration: "Week 5-6",
      activities: ["Target Operating Model Design", "90-Day Execution Plan", "Board Presentation Delivery"]
    }
  ],

  successMetrics: [
    { metric: "Time-to-Production", value: "-60%", timeframe: "Within 6 Months" },
    { metric: "AI Use Case ROI", value: "3x", timeframe: "Year 1" },
    { metric: "Security Compliance", value: "100%", timeframe: "Day 1" }
  ],

  // Graph Connections
  products: ["cerebro-insight", "cerebro-sphere"],
  platformCapabilities: ["governance", "eval", "observatory"],
  relatedResearch: ["ai-safety", "agent-architectures"],

  deliverables: [
    "Enterprise AI Readiness Assessment",
    "Prioritized Use Case Backlog",
    "Target Platform Architecture",
    "Security & Governance Framework",
    "90-Day Implementation Roadmap"
  ],

  engagementModel: "Fixed Scope Workshop & Advisory Retainer",

  pricing: {
    type: "Fixed Scope Engagement",
    description: "A comprehensive 6-week strategy engagement led by a Principal AI Architect.",
    startingAt: "$45,000"
  },

  faqs: [
    {
      question: "Who should participate from our side?",
      answer: "We require active participation from IT leadership (CIO/CDO) as well as line-of-business owners to ensure the strategy aligns with both technical feasibility and business value."
    },
    {
      question: "Do you only recommend CerebroHive products?",
      answer: "While we leverage the Cerebro Platform to accelerate deployment, our architectural recommendations are vendor-agnostic and focus on open standards."
    }
  ],
};
