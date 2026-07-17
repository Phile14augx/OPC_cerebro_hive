import { EnterpriseService } from "../types";

export const industryAcceleratorService: EnterpriseService = {
  id: "industry-accelerator",
  slug: "industry-accelerator",
  title: "Industry AI Accelerator™",
  summary: "Vertical accelerators for Banking, Healthcare, Manufacturing, and more.",
  hero: {
    title: "Industry AI Accelerator™",
    subtitle: "Vertical Solutions",
    description: "Jumpstart your transformation with industry-specific AI models, compliance guardrails, and pre-built workflows."
  },
  iconName: "Rocket",
  category: "Verticals",
  status: "production",
  tags: ["Industry", "Accelerators", "Verticals"],
  
  config: {
    layout: "enterprise",
    sections: [
      "hero",
      "executive_summary",
      "architecture",
      "deliverables",
      "roi",
      "cta"
    ]
  },

  executiveProblem: "Generic foundational models lack the domain-specific knowledge required to handle nuanced industry use cases like medical diagnosis or complex financial compliance.",
  businessImpact: "Using horizontal AI for vertical problems leads to inaccuracies, compliance failures, and poor user adoption.",

  businessChallenges: [
    {
      title: "Domain Knowledge",
      description: "Models must understand industry jargon, specific ontologies, and niche edge cases."
    },
    {
      title: "Regulatory Compliance",
      description: "Heavily regulated industries (like Healthcare's HIPAA) require specialized handling of data."
    }
  ],

  targetPersonas: ["Business Unit Leaders", "Chief Innovation Officer"],
  industries: ["Banking", "Healthcare", "Manufacturing", "Retail", "Energy"],
  methodologyOverview: "We deploy pre-configured instances of the Cerebro Platform tailored with industry-specific ontologies, tuned models, and compliant guardrails out of the box.",

  timeline: [
    {
      title: "Accelerator Deployment",
      duration: "Weeks 1-3",
      activities: ["Provision Infrastructure", "Load Industry Ontologies"]
    },
    {
      title: "Customization",
      duration: "Weeks 4-8",
      activities: ["Integrate with Client Systems", "Fine-tune Models"]
    }
  ],

  successMetrics: [
    { metric: "Deployment Speed", value: "3x Faster", timeframe: "Vs. Custom Build" },
    { metric: "Domain Accuracy", value: "99%", timeframe: "Post-Launch" }
  ],

  products: ["cerebro-flow", "cerebro-insight"],
  platformCapabilities: ["knowledge-fabric", "cortex", "connect"],
  relatedResearch: [],

  deliverables: [
    "Industry-Specific Knowledge Graph",
    "Pre-built Workflows & Integrations",
    "Domain-Tuned AI Agents"
  ],

  engagementModel: "Fixed Scope Accelerator",

  pricing: {
    type: "Fixed Scope",
    description: "Packaged pricing for standard accelerators, with optional customization retainers.",
  }
};
