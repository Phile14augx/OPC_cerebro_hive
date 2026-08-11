import { Solution } from "./types";

export const predictive_analytics: Solution = {
  name: "Predictive Analytics & Forecasting",
  slug: "predictive-analytics",
  category: "Data & Intelligence",
  color: "#B300FF",
  tagline: "Anticipate Market Changes",
  implementationWeeks: "10-16 Weeks",
  readiness: "Enterprise Ready",
  difficulty: "High",
  deploymentModels: ["Cloud", "On-Premises"],
  roiLevel: "High",
  industries: ["Retail", "Supply Chain", "Finance"],
  
  hero: {
    title: "Predictive Analytics",
    subtitle: "Data & Intelligence",
    description: "Leverage advanced machine learning to forecast demand, predict failures, and optimize pricing.",
    primaryCta: "Book Strategy Session",
    secondaryCta: "Download Architecture Guide"
  },
  overview: "Move from reactive to proactive operations. Our predictive models identify patterns in historical data to forecast future events with high accuracy.",
  businessProblems: [
    { problem: "Stockouts & Overstock", impact: "Lost revenue and high carrying costs.", aiSolution: "AI demand forecasting." }
  ],
  pipeline: [
    { id: "source", label: "Historical Data", subLabels: ["ERP, CRM"] },
    { id: "prep", label: "Feature Engineering", subLabels: ["Transformations"] },
    { id: "train", label: "Model Training", subLabels: ["XGBoost, LSTMs"] },
    { id: "evaluate", label: "Evaluation", subLabels: ["Accuracy Metrics"] },
    { id: "serve", label: "Real-time Scoring", subLabels: ["API endpoints"] }
  ],
  workflowSteps: [
    { step: 1, name: "Ingest", description: "Collect real-time signals." },
    { step: 2, name: "Score", description: "Generate predictions." },
    { step: 3, name: "Act", description: "Trigger downstream automations." }
  ],
  capabilities: [
    { name: "Demand Forecasting", description: "Predict future sales volumes.", techUsed: ["Time Series"] }
  ],
  architecture: { nodes: [], edges: [] },
  workflows: { nodes: [], edges: [] },
  agents: [],
  techStack: [],
  techStackFlat: [
    { name: "Python / scikit-learn", role: "Modeling" },
    { name: "Databricks", role: "Compute" }
  ],
  roi: [
    { metric: "25%", label: "Inventory Reduction", description: "Optimized stock levels." },
    { metric: "15%", label: "Revenue Lift", description: "Better pricing." },
    { metric: "40%", label: "Downtime Reduction", description: "Predictive maintenance." },
    { metric: "12 Wks", label: "Deployment", description: "Time to value." }
  ],
  timeline: [
    { phase: "Data Audit", week: "Weeks 1-3", description: "Data quality checks." },
    { phase: "Modeling", week: "Weeks 4-10", description: "Training algorithms." },
    { phase: "Deployment", week: "Weeks 11-16", description: "API rollout." }
  ],
  deliverables: ["Trained Models", "API Endpoints", "Performance Dashboards"],
  engagementModels: ["Custom ML Development"],
  securityFeatures: ["Data Anonymization"],
  integrations: ["SAP", "Oracle"],
  featuredCaseStudy: {
    industry: "Retail",
    title: "Global Supply Chain Forecasting",
    timeline: "16 Weeks",
    outcome: "Reduced inventory holding costs by 22% across 400 stores.",
    metric: "22% Cost Reduction",
    description: "Built custom XGBoost models to predict SKU-level demand.",
    savings: "$12M Saved"
  },
  caseStudy: { industry: "Enterprise", title: "Transformation", timeline: "12 Weeks", outcome: "Improvement", metric: "40%" },
  resources: []
};
