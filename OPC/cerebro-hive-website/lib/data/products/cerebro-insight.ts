import { PackagedProduct } from "../types";

export const cerebroInsightProduct: PackagedProduct = {
  id: "cerebro-insight",
  slug: "cerebro-insight",
  title: "CerebroInsight™",
  summary: "The enterprise AI Analytics Platform — executive dashboards, AI-powered forecasting, operational intelligence, workforce analytics, and natural language business intelligence for data-driven enterprises.",
  hero: {
    title: "CerebroInsight™",
    subtitle: "AI Analytics Platform",
    description: "Transform enterprise data into executive intelligence. CerebroInsight combines traditional BI with AI-powered forecasting, anomaly detection, and natural language querying — giving executives, operators, and analysts a single platform for understanding and acting on every dimension of business performance.",
    primaryCta: "Explore Analytics Platform",
    secondaryCta: "View Dashboard Gallery",
  },
  iconName: "BarChart2",
  category: "Intelligence",
  status: "production",
  maturity: "ga",
  tags: ["Business Intelligence", "AI Forecasting", "Analytics", "Executive Dashboards", "NLP Query", "Operational Intelligence"],

  // Ecosystem Positioning
  ecosystemLayer: "business",
  moduleConnections: ["cerebro-archive", "cerebro-flow", "cerebro-copilot", "cerebro-sphere", "hive-ops"],
  platformServices: ["ai-gateway", "search", "vector-search", "event-bus", "storage"],
  providesCapabilities: ["analytics-engine", "forecasting", "executive-dashboards", "workforce-analytics"],

  seo: {
    title: "CerebroInsight™ | Enterprise AI Analytics Platform | CerebroHive",
    description: "CerebroInsight is an enterprise AI analytics platform delivering executive dashboards, AI forecasting, natural language BI, workforce analytics, and operational intelligence — turning enterprise data into actionable decisions.",
    keywords: [
      "enterprise AI analytics platform",
      "AI business intelligence software",
      "AI forecasting platform",
      "executive dashboard software",
      "natural language BI",
      "operational analytics platform",
      "workforce analytics software",
      "AI predictive analytics",
      "enterprise reporting platform",
      "AI data analytics enterprise",
    ],
  },

  config: {
    layout: "platform",
    sections: [
      "hero",
      "executive_summary",
      "business_problems",
      "core_capabilities",
      "architecture_overview",
      "integration_ecosystem",
      "deployment_models",
      "faq",
      "cta",
    ],
  },

  businessProblems: [
    "Executives receive static reports that are outdated before they are read — there is no real-time intelligence layer.",
    "Data teams spend 80% of their time preparing data and 20% generating insights that should be automated.",
    "Business users cannot self-serve analytics without querying SQL or depending on engineering teams.",
    "AI systems generate valuable operational data but organizations have no platform to analyze and act on it.",
    "Forecasting models are one-off projects disconnected from live business operations.",
  ],

  targetPersonas: ["CEO", "CFO", "COO", "Business Analysts", "Data Analysts", "Operations Managers", "HR Leaders"],
  industries: ["Financial Services", "Retail", "Manufacturing", "Healthcare", "Technology", "Energy", "Logistics"],

  coreCapabilities: [
    {
      title: "Executive Intelligence Cockpit",
      description: "Board-ready executive dashboards aggregating KPIs, financial performance, operational metrics, AI system health, and strategic initiative tracking in real time.",
      icon: "Monitor",
    },
    {
      title: "AI Forecasting Engine",
      description: "Multi-variable forecasting for revenue, demand, resource capacity, workforce planning, and risk indicators — updated continuously from live operational data.",
      icon: "TrendingUp",
    },
    {
      title: "Natural Language Analytics",
      description: "Query any data source in plain English — 'What was our highest-cost AI workflow last quarter?' — and receive instant visualizations, summaries, and drill-down paths.",
      icon: "MessageSquare",
    },
    {
      title: "Operational Analytics",
      description: "Real-time dashboards for supply chain, customer operations, IT performance, and business processes — with AI-detected anomalies and recommended interventions.",
      icon: "Activity",
    },
    {
      title: "Workforce Intelligence",
      description: "Headcount planning, skills gap analysis, productivity metrics, and talent mobility insights — connected to Talent OS data for AI-powered people analytics.",
      icon: "Users",
    },
    {
      title: "Financial Analytics",
      description: "P&L analysis, cost center attribution, AI spend optimization, ROI tracking across initiatives, and budget variance detection with automated alerts.",
      icon: "DollarSign",
    },
    {
      title: "AI System Analytics",
      description: "Performance telemetry across all CerebroHive modules — agent throughput, model accuracy trends, workflow success rates, knowledge retrieval quality, and system cost attribution.",
      icon: "Cpu",
    },
    {
      title: "Predictive Risk Monitoring",
      description: "AI-driven early warning indicators for operational, financial, compliance, and security risks — with recommended mitigation actions and escalation routing.",
      icon: "AlertTriangle",
    },
  ],

  deploymentModels: ["SaaS (Cloud)", "Private Cloud (VPC)", "On-Premises"],
  securityFeatures: [
    "Row-Level Data Security",
    "SOC 2 Type II",
    "GDPR Compliant",
    "Role-Based Dashboard Access",
    "PII Masking",
    "Full Audit Logging",
  ],

  integrations: [
    { system: "CerebroFlow™", type: "Workflow Analytics Source" },
    { system: "CerebroSphere™", type: "Executive Dashboards" },
    { system: "Snowflake / BigQuery / Redshift", type: "Data Warehouse" },
    { system: "dbt / Airbyte", type: "Data Pipeline" },
    { system: "Tableau / Power BI", type: "Visualization Export" },
    { system: "Salesforce / SAP", type: "Business Data Source" },
    { system: "HiveOps™", type: "Infrastructure Metrics" },
  ],

  apiReference: "/developers/api/cerebro-insight",
  sdkLanguages: ["Python", "TypeScript"],
  platformCapabilities: ["analytics-engine", "forecasting", "nl-query", "dashboard-builder"],
  relatedServices: ["ai-strategy", "data-intelligence", "enterprise-analytics"],
  relatedResearch: ["ai-forecasting-patterns", "enterprise-analytics-architecture"],

  faqs: [
    {
      question: "What makes CerebroInsight different from Tableau or Power BI?",
      answer: "CerebroInsight is AI-native — it doesn't just visualize data, it reasons over it. Natural language querying, AI forecasting, anomaly detection, and automated insight generation are built-in. It also has deep integration with the CerebroHive platform, providing unique analytics on AI system performance, agent behavior, workflow efficiency, and knowledge consumption that generic BI tools cannot access.",
    },
    {
      question: "Can business users self-serve analytics without SQL knowledge?",
      answer: "Yes. CerebroInsight's natural language interface allows any business user to query data in plain English. Underlying query generation, data modeling, and visualization selection are handled automatically. Business users can create, customize, and share dashboards without technical support.",
    },
  ],
};
