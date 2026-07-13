import { Industry } from "./types";

export const energy: Industry = {
  name: "Energy & Utilities",
  slug: "energy",
  color: "#22C55E", // Green
  engineConfig: {
    heroTheme: "energy",
    backgroundAnimation: "smart-factory",
    primaryColor: "#22C55E", // Green
    secondaryColor: "#0EA5E9", // Electric Blue
    accentColor: "#F97316" // Orange
  },
  hero: {
    title: "AI for Intelligent Energy Networks",
    subtitle: "SMART GRID INTELLIGENCE",
    description: "Optimize grid stability, forecast energy demand, and predict asset failures with industrial AI.",
    primaryCta: "Explore Energy AI",
    secondaryCta: "View Grid Architecture",
  },
  overview: {
    maturityScore: 80,
    currentChallengesSummary: "Grid instability, manual maintenance, and renewable integration.",
    opportunitySummary: "Predictive maintenance and automated grid balancing.",
    statistics: [
      { metric: "40%", label: "Downtime Reduction" },
      { metric: "25%", label: "Efficiency Gain" },
      { metric: "100%", label: "Carbon Visibility" }
    ]
  },
  segments: ["Power Generation", "Renewables", "Transmission", "Distribution", "Water Utilities", "Oil & Gas"],
  challenges: [
    {
      title: "Grid Stability",
      pain: "Balancing supply and demand with volatile renewable sources.",
      cost: "Blackouts and energy waste",
      businessImpact: "Service Interruption",
      priority: "Critical",
      category: "Operations",
      problems: ["Renewable Intermittency", "Peak Load Spikes", "Legacy Grid Tech", "Voltage Fluctuations"],
      solutions: ["Smart Grid AI", "Demand Response Automation", "Energy Storage Optimization", "Real-Time Balancing"],
      outcomes: ["↑ Grid Resilience", "↓ Blackout Frequency", "↑ Renewable Utilization"],
      techStack: ["AWS IoT", "TimescaleDB", "Kafka", "TensorFlow"],
      aiAgent: "Grid Orchestration Agent",
      readiness: { implementation: "16 Weeks", complexity: "High", roi: "Very High" }
    },
    {
      title: "Asset Maintenance",
      pain: "Unexpected failures in critical infrastructure.",
      cost: "High repair costs and regulatory fines",
      businessImpact: "Asset Depreciation",
      priority: "High",
      category: "Risk",
      problems: ["Aging Infrastructure", "Reactive Repairs", "Remote Asset Blindness", "High Maintenance Costs"],
      solutions: ["Predictive Maintenance AI", "Digital Twins", "Drone Inspection AI", "IoT Sensor Fusion"],
      outcomes: ["↓ Unplanned Downtime", "↓ Maintenance Costs", "↑ Asset Lifespan"],
      techStack: ["Azure IoT", "Databricks", "OpenCV", "PostgreSQL"],
      aiAgent: "Asset Maintenance Agent",
      readiness: { implementation: "12 Weeks", complexity: "Medium", roi: "High" }
    },
    {
      title: "Carbon Reporting",
      pain: "Manual tracking of emissions and ESG compliance.",
      cost: "Regulatory fines and brand damage",
      businessImpact: "Compliance Risk",
      priority: "Medium",
      category: "Compliance",
      problems: ["Data Fragmentation", "Manual Reporting", "Inaccurate Baselines", "Audit Failures"],
      solutions: ["Carbon Intelligence Agent", "Automated Data Ingestion", "Real-time Emissions Tracking", "ESG Dashboards"],
      outcomes: ["↑ Reporting Accuracy", "↓ Audit Time", "↑ ESG Rating"],
      techStack: ["Snowflake", "dbt", "Anthropic", "React"],
      aiAgent: "Sustainability Agent",
      readiness: { implementation: "8 Weeks", complexity: "Low", roi: "High" }
    }
  ],
  opportunityMatrix: [
    { name: "Energy Forecasting", description: "Predicting demand spikes using weather and historical data.", roi: "High" }
  ],
  architecture: {
    nodes: [
      { id: "grid", position: { x: 0, y: 150 }, data: { label: "Smart Grid", type: "system" } },
      { id: "iot", position: { x: 200, y: 150 }, data: { label: "IoT Gateway", type: "gateway", status: "Healthy" } },
      { id: "ai", position: { x: 400, y: 150 }, data: { label: "Energy AI", type: "ai", status: "Active" } },
      { id: "scada", position: { x: 600, y: 150 }, data: { label: "SCADA", type: "database" } }
    ],
    edges: []
  },
  agents: [
    { name: "Grid Agent", description: "Monitors and balances the grid.", capabilities: ["Load Balancing"] },
    { name: "Plant Agent", description: "Optimizes power generation.", capabilities: ["Yield Optimization"] }
  ],
  erpIntegration: ["EAM", "Field Service"],
  techStack: [{ layer: "IoT", technologies: ["Azure IoT", "AWS IoT Core"] }],
  outcomes: [],
  caseStudy: { client: "National Grid", title: "Smart Grid AI", timeline: "12 Months", architecture: "Energy AI", outcome: "Success", metric: "99.9%" },
  roadmap: [],
  compliance: [{ badge: "NERC CIP", description: "Critical Infrastructure Protection" }],
  relatedProducts: [],
  relatedSolutions: [],
  resources: []
};
