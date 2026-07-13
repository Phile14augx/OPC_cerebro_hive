import { Industry } from "./types";

export const logistics: Industry = {
  name: "Logistics",
  slug: "logistics",
  color: "#3B82F6", // Blue
  engineConfig: {
    heroTheme: "logistics",
    backgroundAnimation: "smart-factory",
    primaryColor: "#3B82F6", // Blue
    secondaryColor: "#F97316", // Orange
    accentColor: "#06B6D4" // Cyan
  },
  hero: {
    title: "AI-Driven Supply Chain Intelligence",
    subtitle: "GLOBAL LOGISTICS AI",
    description: "Orchestrate global supply chains with predictive routing, fleet visibility, and automated warehouses.",
    primaryCta: "Explore Logistics AI",
    secondaryCta: "View Architecture",
  },
  overview: {
    maturityScore: 82,
    currentChallengesSummary: "Supply chain disruptions and routing inefficiencies.",
    opportunitySummary: "Predictive routing and autonomous warehouse operations.",
    statistics: [
      { metric: "20%", label: "Fuel Savings" },
      { metric: "35%", label: "Faster Fulfillment" },
      { metric: "99%", label: "Tracking Accuracy" }
    ]
  },
  segments: ["Freight", "3PL", "Warehousing", "Last Mile", "Maritime", "Aviation"],
  challenges: [
    {
      title: "Route Optimization",
      pain: "Inefficient routing burning fuel and missing SLAs.",
      cost: "High transportation costs",
      businessImpact: "Margin Compression",
      priority: "Critical",
      category: "Supply Chain",
      problems: ["Static Routing", "Weather Delays", "Traffic Congestion", "Fuel Waste"],
      solutions: ["Route Optimization AI", "Dynamic Re-routing", "Weather Integration", "Predictive ETA"],
      outcomes: ["↓ Fuel Consumption", "↑ On-Time Delivery", "↓ Fleet Wear"],
      techStack: ["Databricks", "Kafka", "Google Maps API", "Python"],
      aiAgent: "Route Agent",
      readiness: { implementation: "10 Weeks", complexity: "High", roi: "Very High" }
    },
    {
      title: "Fleet Visibility",
      pain: "Blind spots in global transit networks.",
      cost: "Lost cargo and compliance fines",
      businessImpact: "Customer Churn",
      priority: "High",
      category: "Operations",
      problems: ["Data Silos", "GPS Blind Spots", "Manual Updates", "Customs Delays"],
      solutions: ["Fleet Intelligence AI", "IoT Tracking", "Automated Customs Docs", "Digital Control Tower"],
      outcomes: ["↑ Supply Chain Visibility", "↓ Lost Cargo", "↑ Customer Trust"],
      techStack: ["AWS IoT", "Snowflake", "ElasticSearch", "React"],
      aiAgent: "Fleet Agent",
      readiness: { implementation: "12 Weeks", complexity: "Medium", roi: "High" }
    },
    {
      title: "Warehouse Efficiency",
      pain: "Labor shortages and slow fulfillment processes.",
      cost: "High labor costs and delayed shipments",
      businessImpact: "Operational Friction",
      priority: "Critical",
      category: "Inventory",
      problems: ["Poor Layouts", "Manual Picking", "Inventory Shrinkage", "High Turnover"],
      solutions: ["Warehouse AI", "Robotic Orchestration", "Pick Path Optimization", "Vision AI QA"],
      outcomes: ["↑ Fulfillment Speed", "↓ Labor Costs", "↑ Inventory Accuracy"],
      techStack: ["NVIDIA Isaac", "ROS", "PyTorch", "Redis"],
      aiAgent: "Warehouse Agent",
      readiness: { implementation: "16 Weeks", complexity: "High", roi: "Very High" }
    }
  ],
  opportunityMatrix: [
    { name: "Demand Planning", description: "Predictive AI for capacity planning.", roi: "High" }
  ],
  architecture: {
    nodes: [
      { id: "fleet", position: { x: 0, y: 150 }, data: { label: "Global Fleet", type: "system" } },
      { id: "iot", position: { x: 200, y: 150 }, data: { label: "Telematics", type: "gateway", status: "Healthy" } },
      { id: "ai", position: { x: 400, y: 150 }, data: { label: "Logistics AI", type: "ai", status: "Active" } },
      { id: "erp", position: { x: 600, y: 150 }, data: { label: "WMS / TMS", type: "database" } }
    ],
    edges: []
  },
  agents: [
    { name: "Route Agent", description: "Optimizes delivery paths in real-time.", capabilities: ["Routing"] },
    { name: "Warehouse Agent", description: "Manages inventory and robotics.", capabilities: ["Orchestration"] }
  ],
  erpIntegration: ["TMS", "WMS", "Finance"],
  techStack: [{ layer: "Data", technologies: ["Kafka", "Snowflake"] }],
  outcomes: [],
  caseStudy: { client: "Global 3PL", title: "Smart Routing", timeline: "4 Months", architecture: "Logistics AI", outcome: "Success", metric: "20%" },
  roadmap: [],
  compliance: [{ badge: "ISO 28000", description: "Security Management Systems for Supply Chain" }],
  relatedProducts: [],
  relatedSolutions: [],
  resources: []
};
