import { EnterpriseService } from "../types";

export const aiGovernanceService: EnterpriseService = {
  id: "ai-governance",
  slug: "ai-governance",
  title: "AI Governance & Trust™",
  summary: "Responsible AI, policy, and compliance.",
  hero: {
    title: "AI Governance & Trust™",
    subtitle: "Risk Management",
    description: "Ensure your AI initiatives comply with global regulations, internal policies, and ethical standards."
  },
  iconName: "Scale",
  category: "Governance",
  status: "production",
  tags: ["Governance", "Compliance", "Ethics", "Risk"],
  
  config: {
    layout: "standard",
    sections: [
      "hero",
      "executive_summary",
      "business_challenges",
      "methodology",
      "roadmap",
      "products",
      "roi",
      "cta"
    ]
  },

  executiveProblem: "As AI permeates the enterprise, the risk of data leaks, biased decisions, and regulatory fines (like the EU AI Act) grows exponentially.",
  businessImpact: "A single compliance violation or public bias incident can result in millions in fines and irreparable brand damage.",

  businessChallenges: [
    {
      title: "Regulatory Uncertainty",
      description: "Navigating emerging frameworks like the EU AI Act and NIST AI RMF is complex."
    },
    {
      title: "Black Box Models",
      description: "Inability to audit or explain the reasoning behind AI-driven decisions."
    }
  ],

  targetPersonas: ["Chief Risk Officer", "CISO", "General Counsel", "CIO"],
  industries: ["Financial Services", "Healthcare", "Government"],
  methodologyOverview: "We map your AI portfolio against global regulatory requirements and implement technical guardrails to enforce compliance automatically.",

  timeline: [
    {
      title: "Risk Assessment",
      duration: "Weeks 1-2",
      activities: ["AI Portfolio Audit", "Gap Analysis vs Regulations"]
    },
    {
      title: "Policy Development",
      duration: "Weeks 3-4",
      activities: ["Drafting Acceptable Use Policies", "Defining Risk Tiers"]
    },
    {
      title: "Guardrail Implementation",
      duration: "Weeks 5-8",
      activities: ["Deploying HiveShield", "Setting up Audit Logs"]
    }
  ],

  successMetrics: [
    { metric: "Compliance Coverage", value: "100%", timeframe: "Post-Launch" },
    { metric: "Audit Ready", value: "24/7", timeframe: "Post-Launch" }
  ],

  products: ["hive-shield"],
  platformCapabilities: ["guard", "governance", "eval"],
  relatedResearch: ["ai-safety"],

  deliverables: [
    "Comprehensive AI Risk Assessment",
    "Enterprise AI Policy Document",
    "Automated Compliance Dashboards"
  ],

  engagementModel: "Project-Based Advisory & Implementation",

  pricing: {
    type: "Fixed Scope",
    description: "Based on the size of the existing AI portfolio and regulatory requirements.",
  }
};
