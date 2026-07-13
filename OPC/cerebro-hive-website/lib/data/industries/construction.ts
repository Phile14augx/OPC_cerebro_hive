import { Industry } from "./types";

export const construction: Industry = {
  name: "Construction",
  slug: "construction",
  color: "#F97316", // Orange
  engineConfig: {
    heroTheme: "construction",
    backgroundAnimation: "smart-factory",
    primaryColor: "#F97316", // Orange
    secondaryColor: "#64748B", // Steel Gray
    accentColor: "#06B6D4" // Cyan
  },
  hero: {
    title: "Building Intelligent Infrastructure",
    subtitle: "CONSTRUCTION AI",
    description: "Mitigate project delays, control costs, and ensure site safety with AI-driven construction intelligence.",
    primaryCta: "Explore Construction AI",
    secondaryCta: "View Architecture",
  },
  overview: {
    maturityScore: 70,
    currentChallengesSummary: "Project delays and supply chain friction.",
    opportunitySummary: "AI-driven scheduling and digital twin simulations.",
    statistics: [
      { metric: "15%", label: "Cost Savings" },
      { metric: "30%", label: "Faster Delivery" },
      { metric: "Zero", label: "Safety Incidents" }
    ]
  },
  segments: ["Commercial", "Residential", "Infrastructure", "Industrial", "Architecture", "Engineering"],
  challenges: [
    {
      title: "Project Delays",
      pain: "Inefficient scheduling and unforeseen site conditions.",
      cost: "Significant cost overruns and penalties",
      businessImpact: "Margin Compression",
      priority: "Critical",
      category: "Operations",
      problems: ["Weather Delays", "Subcontractor Clashes", "Supply Shortages", "Manual Scheduling"],
      solutions: ["Schedule Intelligence AI", "Generative Scheduling", "Weather Forecasting", "Clash Detection"],
      outcomes: ["↑ On-Time Delivery", "↓ Labor Idle Time", "↑ Schedule Predictability"],
      techStack: ["Neo4j", "OpenAI", "AWS", "PostgreSQL"],
      aiAgent: "Planning Agent",
      readiness: { implementation: "14 Weeks", complexity: "High", roi: "Very High" }
    },
    {
      title: "Cost Overruns",
      pain: "Poor estimation and material waste.",
      cost: "10-20% margin erosion",
      businessImpact: "Revenue Leakage",
      priority: "High",
      category: "Operations",
      problems: ["Inaccurate Bids", "Material Waste", "Rework", "Scope Creep"],
      solutions: ["BIM AI", "Parametric Estimating", "Automated Takeoffs", "Waste Tracking"],
      outcomes: ["↑ Bid Accuracy", "↓ Material Waste", "↑ Project Margins"],
      techStack: ["Autodesk Forge", "Databricks", "Pinecone", "LangChain"],
      aiAgent: "Project Agent",
      readiness: { implementation: "12 Weeks", complexity: "Medium", roi: "High" }
    },
    {
      title: "Safety",
      pain: "Accidents and compliance violations on site.",
      cost: "High insurance premiums and project halts",
      businessImpact: "Regulatory Fines",
      priority: "Critical",
      category: "Risk",
      problems: ["PPE Non-compliance", "Hazardous Conditions", "Delayed Reporting", "Poor Training"],
      solutions: ["Safety AI", "Computer Vision Monitoring", "Automated Alerts", "Wearable IoT"],
      outcomes: ["↓ Safety Incidents", "↓ Insurance Premiums", "↑ Compliance"],
      techStack: ["OpenCV", "Azure IoT", "Kafka", "React"],
      aiAgent: "Safety Agent",
      readiness: { implementation: "8 Weeks", complexity: "Medium", roi: "High" }
    }
  ],
  opportunityMatrix: [
    { name: "Procurement Intelligence", description: "Automated sourcing and material tracking.", roi: "High" }
  ],
  architecture: {
    nodes: [
      { id: "site", position: { x: 0, y: 150 }, data: { label: "Construction Site", type: "client" } },
      { id: "bim", position: { x: 200, y: 150 }, data: { label: "BIM System", type: "system", status: "Healthy" } },
      { id: "ai", position: { x: 400, y: 150 }, data: { label: "Construction AI", type: "ai", status: "Active" } },
      { id: "erp", position: { x: 600, y: 150 }, data: { label: "ERP", type: "database" } }
    ],
    edges: []
  },
  agents: [
    { name: "Project Agent", description: "Manages timelines and budgets.", capabilities: ["Scheduling"] },
    { name: "Safety Agent", description: "Monitors site conditions.", capabilities: ["Vision AI"] }
  ],
  erpIntegration: ["Finance", "Procurement", "Project Management"],
  techStack: [{ layer: "Design", technologies: ["BIM", "AutoCAD"] }],
  outcomes: [],
  caseStudy: { client: "Global Builder", title: "AI Scheduling", timeline: "9 Months", architecture: "Construction AI", outcome: "Success", metric: "20%" },
  roadmap: [],
  compliance: [{ badge: "OSHA", description: "Occupational Safety and Health Administration" }],
  relatedProducts: [],
  relatedSolutions: [],
  resources: []
};
