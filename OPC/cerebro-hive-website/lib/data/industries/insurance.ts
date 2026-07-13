import { Industry } from "./types";

export const insurance: Industry = {
  name: "Insurance",
  slug: "insurance",
  color: "#1D4ED8", // Deep Blue
  engineConfig: {
    heroTheme: "insurance",
    backgroundAnimation: "transaction-network",
    primaryColor: "#1D4ED8", // Deep Blue
    secondaryColor: "#7E22CE", // Purple
    accentColor: "#06B6D4" // Cyan
  },
  hero: {
    title: "AI-Native Insurance Operations",
    subtitle: "INTELLIGENT INSURANCE",
    description: "Modernize underwriting, accelerate claims processing, and mitigate risk with predictive AI models.",
    primaryCta: "Explore Insurtech AI",
    secondaryCta: "View Architecture",
  },
  overview: {
    maturityScore: 90,
    currentChallengesSummary: "Manual claims processing and static risk models.",
    opportunitySummary: "Automated underwriting and real-time fraud prevention.",
    statistics: [
      { metric: "60%", label: "Faster Claims" },
      { metric: "30%", label: "Fraud Reduction" },
      { metric: "24/7", label: "Policy Support" }
    ]
  },
  segments: ["Property & Casualty", "Life Insurance", "Health Insurance", "Reinsurance", "Brokers"],
  challenges: [
    {
      title: "Claims Processing",
      pain: "Manual adjudication slows down payouts.",
      cost: "High operational costs and low customer satisfaction",
      businessImpact: "Customer Churn",
      priority: "Critical",
      category: "Operations",
      problems: ["Manual Review", "Inaccurate Estimates", "Slow Payouts", "Customer Frustration"],
      solutions: ["Claims AI Agent", "Computer Vision for Damage", "Automated Adjudication", "Instant Payouts"],
      outcomes: ["↓ Processing Time", "↓ Loss Adjustment Expense", "↑ NPS"],
      techStack: ["OpenCV", "Anthropic", "Kafka", "PostgreSQL"],
      aiAgent: "Claims Adjudication Agent",
      readiness: { implementation: "14 Weeks", complexity: "Medium", roi: "Very High" }
    },
    {
      title: "Fraud Detection",
      pain: "Undetected fraudulent claims bleeding revenue.",
      cost: "$80B+ annually across the industry",
      businessImpact: "Revenue Leakage",
      priority: "Critical",
      category: "Fraud",
      problems: ["Staged Accidents", "Exaggerated Claims", "Identity Theft", "Provider Fraud"],
      solutions: ["Fraud AI Agent", "Network Analytics", "Behavioral Scoring", "Anomaly Detection"],
      outcomes: ["↓ Fraud Losses", "↑ False Positive Ratio", "↑ Investigation Efficiency"],
      techStack: ["Neo4j", "Spark", "TensorFlow", "AWS"],
      aiAgent: "Fraud Detection Agent",
      readiness: { implementation: "12 Weeks", complexity: "High", roi: "Very High" }
    },
    {
      title: "Underwriting",
      pain: "Static pricing models failing to capture real-time risk.",
      cost: "Suboptimal pricing and lost margins",
      businessImpact: "Margin Compression",
      priority: "High",
      category: "Risk",
      problems: ["Data Silos", "Manual Risk Assessment", "Slow Quotes", "Inaccurate Pricing"],
      solutions: ["Underwriting AI Agent", "Alternative Data Sources", "Dynamic Pricing", "Automated Quoting"],
      outcomes: ["↑ Quote Speed", "↑ Loss Ratio Accuracy", "↑ Underwriter Capacity"],
      techStack: ["Databricks", "Pinecone", "Azure", "LangGraph"],
      aiAgent: "Intelligent Underwriter Agent",
      readiness: { implementation: "16 Weeks", complexity: "High", roi: "High" }
    }
  ],
  opportunityMatrix: [
    { name: "Policy Assistant", description: "AI-driven customer support for policy inquiries.", roi: "High" }
  ],
  architecture: {
    nodes: [
      { id: "customer", position: { x: 0, y: 150 }, data: { label: "Policyholder", type: "client" } },
      { id: "api", position: { x: 200, y: 150 }, data: { label: "Gateway", type: "gateway", status: "Healthy" } },
      { id: "ai", position: { x: 400, y: 150 }, data: { label: "Claims AI", type: "ai", status: "Active" } },
      { id: "core", position: { x: 600, y: 150 }, data: { label: "Core Systems", type: "system" } }
    ],
    edges: []
  },
  agents: [
    { name: "Claims Agent", description: "Automates the claims lifecycle.", capabilities: ["Adjudication"] },
    { name: "Underwriting Agent", description: "Assesses risk and prices policies.", capabilities: ["Risk Scoring"] }
  ],
  erpIntegration: ["Finance", "Claims Management"],
  techStack: [{ layer: "Data", technologies: ["Databricks", "Snowflake"] }],
  outcomes: [],
  caseStudy: { client: "Global Insurer", title: "Automated Claims", timeline: "6 Months", architecture: "Claims AI", outcome: "Success", metric: "60%" },
  roadmap: [],
  compliance: [{ badge: "HIPAA", description: "For Health Insurance" }],
  relatedProducts: [],
  relatedSolutions: [],
  resources: []
};
