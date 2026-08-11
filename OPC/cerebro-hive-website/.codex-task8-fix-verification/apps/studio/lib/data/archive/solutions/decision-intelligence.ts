import { Solution } from "./types";

export const decision_intelligence: Solution = {
  name: "Decision Intelligence & Dashboards",
  slug: "decision-intelligence",
  category: "Data & Intelligence",
  color: "#00E5FF",
  tagline: "AI-Powered Executive Insights",
  implementationWeeks: "8-12 Weeks",
  readiness: "Enterprise Ready",
  difficulty: "Medium",
  deploymentModels: ["Cloud"],
  roiLevel: "High",
  industries: ["Finance", "Retail", "Healthcare"],
  
  hero: {
    title: "Decision Intelligence",
    subtitle: "Data & Intelligence",
    description: "Move beyond static BI dashboards to predictive, prescriptive, and natural language decision intelligence.",
    primaryCta: "Book Strategy Session",
    secondaryCta: "Download Architecture Guide"
  },
  overview: "Empower executives and operators with AI that doesn't just show data, but recommends actions and predicts outcomes.",
  businessProblems: [
    { problem: "Static Dashboards", impact: "Users must interpret data manually.", aiSolution: "Prescriptive recommendations." }
  ],
  pipeline: [
    { id: "data", label: "Data Warehouse", subLabels: ["Snowflake"] },
    { id: "semantic", label: "Semantic Layer", subLabels: ["Metrics"] },
    { id: "predict", label: "Predictive Models", subLabels: ["Forecasts"] },
    { id: "llm", label: "NLQ Engine", subLabels: ["Text-to-SQL"] },
    { id: "ui", label: "Action Dashboard", subLabels: ["Insights"] }
  ],
  workflowSteps: [
    { step: 1, name: "Ask", description: "User asks a question in plain English." },
    { step: 2, name: "Query", description: "AI translates to SQL and fetches data." },
    { step: 3, name: "Analyze", description: "AI generates insights and charts." }
  ],
  capabilities: [
    { name: "Text-to-SQL", description: "Ask questions in natural language.", techUsed: ["LLMs"] }
  ],
  architecture: { nodes: [], edges: [] },
  workflows: { nodes: [], edges: [] },
  agents: [],
  techStack: [],
  techStackFlat: [
    { name: "Snowflake / BigQuery", role: "Data Warehouse" },
    { name: "Looker / PowerBI", role: "Visualization" }
  ],
  roi: [
    { metric: "80%", label: "Time Saved", description: "Less time building reports." },
    { metric: "100%", label: "Adoption", description: "Business user adoption." },
    { metric: "2x", label: "Insights", description: "More actionable insights." },
    { metric: "8 Wks", label: "Deployment", description: "Time to value." }
  ],
  timeline: [
    { phase: "Data Prep", week: "Weeks 1-4", description: "Semantic layer setup." },
    { phase: "AI Integration", week: "Weeks 5-8", description: "Text-to-SQL tuning." },
    { phase: "Rollout", week: "Weeks 9-12", description: "User training." }
  ],
  deliverables: ["Semantic Layer", "NLQ Interface", "Dashboards"],
  engagementModels: ["Implementation"],
  securityFeatures: ["Row-level Security"],
  integrations: ["Salesforce", "ERP"],
  featuredCaseStudy: {
    industry: "Retail",
    title: "Executive Chat Dashboard",
    timeline: "10 Weeks",
    outcome: "Executives now query sales data via chat.",
    metric: "100% Adoption",
    description: "Replaced 50 static dashboards with a single AI chat interface.",
    savings: "$1M Saved"
  },
  caseStudy: { industry: "Enterprise", title: "Transformation", timeline: "12 Weeks", outcome: "Improvement", metric: "40%" },
  resources: []
};
