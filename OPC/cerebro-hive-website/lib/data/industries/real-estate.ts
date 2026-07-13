import { Industry } from "./types";

export const realEstate: Industry = {
  name: "Real Estate",
  slug: "real-estate",
  color: "#EAB308", // Gold
  engineConfig: {
    heroTheme: "real-estate",
    backgroundAnimation: "transaction-network",
    primaryColor: "#EAB308", // Gold
    secondaryColor: "#1E3A8A", // Navy
    accentColor: "#10B981" // Emerald
  },
  hero: {
    title: "AI-Powered Property Intelligence",
    subtitle: "PROPTECH AI",
    description: "Optimize building performance, elevate tenant experiences, and maximize portfolio yield.",
    primaryCta: "Explore PropTech AI",
    secondaryCta: "View Architecture",
  },
  overview: {
    maturityScore: 75,
    currentChallengesSummary: "Fragmented property data and reactive maintenance.",
    opportunitySummary: "Smart building automation and AI leasing.",
    statistics: [
      { metric: "25%", label: "Energy Savings" },
      { metric: "40%", label: "Faster Leasing" },
      { metric: "95%", label: "Tenant Retention" }
    ]
  },
  segments: ["Commercial", "Residential", "Industrial", "Retail", "REITs", "Property Management"],
  challenges: [
    {
      title: "Property Management",
      pain: "Manual administration of massive property portfolios.",
      cost: "High OPEX and low visibility",
      businessImpact: "Operational Friction",
      priority: "High",
      category: "Operations",
      problems: ["Data Silos", "Manual Reporting", "Vendor Mismanagement", "Reactive Maintenance"],
      solutions: ["Property Analytics AI", "Digital Twins", "Automated Work Orders", "Vendor Scoring"],
      outcomes: ["↓ OPEX", "↑ Portfolio Visibility", "↑ Asset Value"],
      techStack: ["Databricks", "Azure", "React", "Node.js"],
      aiAgent: "Property Agent",
      readiness: { implementation: "12 Weeks", complexity: "Medium", roi: "High" }
    },
    {
      title: "Tenant Experience",
      pain: "Slow response to tenant requests leading to churn.",
      cost: "High vacancy rates",
      businessImpact: "Revenue Leakage",
      priority: "High",
      category: "Customer",
      problems: ["Slow Maintenance", "Poor Communication", "Manual Renewals", "Lack of Amenities"],
      solutions: ["Tenant Agent", "Omnichannel Bot", "Smart Building App", "Automated Renewals"],
      outcomes: ["↑ Tenant Satisfaction", "↑ Renewal Rates", "↓ Vacancy"],
      techStack: ["OpenAI", "LangGraph", "Twilio", "PostgreSQL"],
      aiAgent: "Tenant Agent",
      readiness: { implementation: "8 Weeks", complexity: "Low", roi: "Very High" }
    },
    {
      title: "Occupancy & Leasing",
      pain: "Long vacant periods and inefficient lead matching.",
      cost: "Lost rental income",
      businessImpact: "Capital Inefficiency",
      priority: "Critical",
      category: "Operations",
      problems: ["Slow Lead Qualification", "Manual Tours", "Poor Pricing Models", "High Broker Fees"],
      solutions: ["Leasing AI", "Automated Lead Scoring", "Virtual Tours", "Dynamic Pricing"],
      outcomes: ["↓ Days on Market", "↑ Lead Conversion", "↑ Rental Yield"],
      techStack: ["Pinecone", "ElasticSearch", "AWS", "Python"],
      aiAgent: "Leasing Agent",
      readiness: { implementation: "10 Weeks", complexity: "Medium", roi: "High" }
    }
  ],
  opportunityMatrix: [
    { name: "Facility Intelligence", description: "Smart HVAC and lighting optimization.", roi: "High" }
  ],
  architecture: {
    nodes: [
      { id: "building", position: { x: 0, y: 150 }, data: { label: "Smart Building", type: "system" } },
      { id: "iot", position: { x: 200, y: 150 }, data: { label: "IoT Gateway", type: "gateway", status: "Healthy" } },
      { id: "ai", position: { x: 400, y: 150 }, data: { label: "PropTech AI", type: "ai", status: "Active" } },
      { id: "dashboard", position: { x: 600, y: 150 }, data: { label: "Portfolio Dashboard", type: "client" } }
    ],
    edges: []
  },
  agents: [
    { name: "Leasing Agent", description: "Qualifies leads and schedules tours.", capabilities: ["NLP"] },
    { name: "Facility Agent", description: "Optimizes building energy usage.", capabilities: ["IoT Analytics"] }
  ],
  erpIntegration: ["Finance", "Leasing", "Maintenance"],
  techStack: [{ layer: "IoT", technologies: ["Smart Sensors", "HVAC Controllers"] }],
  outcomes: [],
  caseStudy: { client: "Commercial REIT", title: "Smart Buildings", timeline: "6 Months", architecture: "PropTech AI", outcome: "Success", metric: "30%" },
  roadmap: [],
  compliance: [{ badge: "LEED", description: "Leadership in Energy and Environmental Design" }],
  relatedProducts: [],
  relatedSolutions: [],
  resources: []
};
