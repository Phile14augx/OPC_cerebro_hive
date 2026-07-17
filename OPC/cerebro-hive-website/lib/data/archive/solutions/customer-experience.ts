import { Solution } from "./types";

export const customer_experience: Solution = {
  name: "AI Customer Experience Platform",
  slug: "customer-experience",
  category: "Customer Experience",
  color: "#00F57A",
  tagline: "Hyper-Personalized Engagement",
  implementationWeeks: "8-12 Weeks",
  readiness: "Enterprise Ready",
  difficulty: "Medium",
  deploymentModels: ["Cloud"],
  roiLevel: "High",
  industries: ["Retail", "Telecom", "Banking"],
  
  hero: {
    title: "AI Customer Experience",
    subtitle: "Customer Experience",
    description: "Transform customer journeys with real-time personalization, autonomous support agents, and sentiment analysis.",
    primaryCta: "Book Strategy Session",
    secondaryCta: "Download Architecture Guide"
  },
  overview: "Deliver 1:1 personalization at scale. Our CX platform uses AI to anticipate customer needs, resolve issues instantly, and increase lifetime value.",
  businessProblems: [
    { problem: "Poor Support Deflection", impact: "High call center costs.", aiSolution: "Autonomous Support Agents." }
  ],
  pipeline: [
    { id: "events", label: "Customer Events", subLabels: ["Web, App, CRM"] },
    { id: "profile", label: "Customer 360", subLabels: ["Unified Profile"] },
    { id: "decision", label: "Next Best Action", subLabels: ["AI Engine"] },
    { id: "delivery", label: "Omnichannel Delivery", subLabels: ["Email, Chat, SMS"] }
  ],
  workflowSteps: [
    { step: 1, name: "Listen", description: "Capture customer signals in real-time." },
    { step: 2, name: "Analyze", description: "AI determines intent and sentiment." },
    { step: 3, name: "Engage", description: "Deliver personalized response." }
  ],
  capabilities: [
    { name: "Autonomous Support", description: "Resolve level 1 & 2 tickets via AI chat.", techUsed: ["LLMs", "RAG"] }
  ],
  architecture: { nodes: [], edges: [] },
  workflows: { nodes: [], edges: [] },
  agents: [],
  techStack: [],
  techStackFlat: [
    { name: "Twilio / Segment", role: "CDP & Comms" },
    { name: "OpenAI", role: "Conversational AI" }
  ],
  roi: [
    { metric: "60%", label: "Deflection Rate", description: "Support tickets resolved automatically." },
    { metric: "25%", label: "CSAT Increase", description: "Customer satisfaction score." },
    { metric: "15%", label: "LTV Increase", description: "Higher lifetime value." },
    { metric: "8 Wks", label: "Deployment", description: "Time to value." }
  ],
  timeline: [
    { phase: "Integration", week: "Weeks 1-4", description: "CDP and CRM integration." },
    { phase: "AI Tuning", week: "Weeks 5-8", description: "Agent training." },
    { phase: "Rollout", week: "Weeks 9-12", description: "A/B testing." }
  ],
  deliverables: ["CX Architecture", "Support Agents", "CDP Setup"],
  engagementModels: ["Implementation"],
  securityFeatures: ["PII Masking"],
  integrations: ["Salesforce", "Zendesk", "Shopify"],
  featuredCaseStudy: {
    industry: "Telecom",
    title: "Proactive Retention Platform",
    timeline: "12 Weeks",
    outcome: "Reduced churn by 18% using predictive next-best-action.",
    metric: "18% Churn Reduction",
    description: "Integrated AI with legacy CRM to predict churn and offer personalized discounts.",
    savings: "$15M Retained Revenue"
  },
  caseStudy: { industry: "Enterprise", title: "Transformation", timeline: "12 Weeks", outcome: "Improvement", metric: "40%" },
  resources: []
};
