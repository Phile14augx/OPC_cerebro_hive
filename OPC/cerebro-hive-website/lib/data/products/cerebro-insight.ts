import { PackagedProduct } from "../types";

export const cerebroInsightProduct: PackagedProduct = {
  id: "cerebro-insight",
  slug: "cerebro-insight",
  title: "CerebroInsight™",
  summary: "AI dashboards and forecasting for leadership.",
  hero: {
    title: "CerebroInsight™",
    subtitle: "Executive Analytics",
    description: "Real-time AI-driven forecasting and operational insights for the C-suite, instantly generated from raw enterprise data."
  },
  iconName: "LineChart",
  category: "Analytics",
  status: "production",
  maturity: "ga",
  tags: ["Analytics", "Dashboards", "BI"],
  
  config: {
    layout: "saas",
    sections: [
      "hero",
      "executive_summary",
      "core_capabilities",
      "feature_matrix",
      "cta"
    ]
  },

  businessProblems: [
    "Executives rely on static weekly reports that are outdated the moment they are generated.",
    "Answering a new business question takes days of data engineering.",
    "Traditional BI tools require SQL knowledge or data analysts."
  ],

  targetPersonas: ["CEO", "CFO", "VP of Strategy"],
  industries: ["Cross-Industry"],

  coreCapabilities: [
    {
      title: "Natural Language Queries",
      description: "Ask questions in plain English and instantly receive charts, graphs, and insights.",
      icon: "MessageSquare"
    },
    {
      title: "Predictive Forecasting",
      description: "AI agents continuously analyze trends to predict future KPIs and anomalies.",
      icon: "TrendingUp"
    },
    {
      title: "Dynamic Dashboards",
      description: "Dashboards that automatically adapt and reorganize based on what metrics are currently anomalous.",
      icon: "Layout"
    }
  ],

  deploymentModels: ["SaaS"],
  securityFeatures: ["Row-Level Security (RLS)", "Data Anonymization"],
  
  integrations: [
    { system: "Snowflake", type: "Data Source" },
    { system: "Databricks", type: "Data Source" },
    { system: "PostgreSQL", type: "Data Source" }
  ],

  platformCapabilities: ["intelligence-hub", "cortex"],
  relatedServices: ["ai-strategy"],
  relatedResearch: []
};
