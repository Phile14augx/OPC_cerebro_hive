import { Industry } from "./types";

export const telecom: Industry = {
  name: "Telecommunications",
  slug: "telecom",
  color: "#A855F7", // Purple
  engineConfig: {
    heroTheme: "telecom",
    backgroundAnimation: "transaction-network",
    primaryColor: "#A855F7", // Purple
    secondaryColor: "#06B6D4", // Cyan
    accentColor: "#3B82F6" // Blue
  },
  hero: {
    title: "AI-Native Connected Networks",
    subtitle: "TELCO INTELLIGENCE",
    description: "Optimize 5G networks, predict faults, and personalize subscriber experiences with AI.",
    primaryCta: "Explore Telco AI",
    secondaryCta: "View Architecture",
  },
  overview: {
    maturityScore: 88,
    currentChallengesSummary: "Network congestion and high customer churn.",
    opportunitySummary: "Self-healing networks and proactive customer care.",
    statistics: [
      { metric: "30%", label: "Less Downtime" },
      { metric: "25%", label: "Churn Reduction" },
      { metric: "40%", label: "OpEx Savings" }
    ]
  },
  segments: ["Wireless", "Broadband", "Satellite", "IoT Connectivity", "Infrastructure"],
  challenges: [
    {
      title: "Network Congestion",
      pain: "Poor resource allocation leading to slow speeds during peak times.",
      cost: "Suboptimal CAPEX spend and angry customers",
      businessImpact: "Customer Churn",
      priority: "Critical",
      category: "Operations",
      problems: ["Peak Spikes", "Inefficient Bandwidth", "Manual Slicing", "Spectrum Waste"],
      solutions: ["Network AI Agent", "Dynamic Slicing", "Predictive Load Balancing", "Traffic Shaping"],
      outcomes: ["↑ Network Speeds", "↓ CAPEX Requirements", "↑ QoE"],
      techStack: ["Kubernetes", "Kafka", "TensorFlow", "Redis"],
      aiAgent: "Network Operations Agent",
      readiness: { implementation: "16 Weeks", complexity: "High", roi: "Very High" }
    },
    {
      title: "Fault Detection",
      pain: "Reactive maintenance causing prolonged outages.",
      cost: "SLA penalties and massive truck roll costs",
      businessImpact: "Operational Friction",
      priority: "Critical",
      category: "Risk",
      problems: ["Silent Failures", "Alarm Storms", "Manual Diagnostics", "Unnecessary Truck Rolls"],
      solutions: ["Fault Agent", "Root Cause Analysis AI", "Self-Healing Networks", "Predictive Maintenance"],
      outcomes: ["↓ Mean Time to Repair (MTTR)", "↓ Truck Rolls", "↑ Network Uptime"],
      techStack: ["Splunk", "ElasticSearch", "Databricks", "Python"],
      aiAgent: "Fault Agent",
      readiness: { implementation: "12 Weeks", complexity: "High", roi: "High" }
    },
    {
      title: "Customer Churn",
      pain: "Inability to predict and prevent subscriber churn.",
      cost: "High customer acquisition costs to replace lost subs",
      businessImpact: "Revenue Leakage",
      priority: "High",
      category: "Customer",
      problems: ["Generic Offers", "Poor Support", "Hidden Dissatisfaction", "Price Sensitivity"],
      solutions: ["Customer Agent", "Churn Prediction", "Next-Best-Action", "Hyper-Personalization"],
      outcomes: ["↓ Churn Rate", "↑ ARPU", "↑ NPS"],
      techStack: ["Neo4j", "OpenAI", "AWS", "Snowflake"],
      aiAgent: "Customer Experience Agent",
      readiness: { implementation: "10 Weeks", complexity: "Medium", roi: "Very High" }
    }
  ],
  opportunityMatrix: [
    { name: "Capacity Planning", description: "AI-driven CAPEX optimization for tower placement.", roi: "High" }
  ],
  architecture: {
    nodes: [
      { id: "tower", position: { x: 0, y: 150 }, data: { label: "5G Infrastructure", type: "client" } },
      { id: "oss", position: { x: 200, y: 150 }, data: { label: "OSS / BSS", type: "system", status: "Healthy" } },
      { id: "ai", position: { x: 400, y: 150 }, data: { label: "Telco AI", type: "ai", status: "Active" } },
      { id: "noc", position: { x: 600, y: 150 }, data: { label: "NOC Dashboard", type: "client" } }
    ],
    edges: []
  },
  agents: [
    { name: "Network Agent", description: "Balances load and slices networks.", capabilities: ["Optimization"] },
    { name: "Customer Agent", description: "Resolves billing and tech issues.", capabilities: ["Support"] }
  ],
  erpIntegration: ["OSS/BSS", "Billing"],
  techStack: [{ layer: "Network", technologies: ["5G Core", "Edge Computing"] }],
  outcomes: [],
  caseStudy: { client: "Tier 1 Telco", title: "Self-Healing Network", timeline: "8 Months", architecture: "Telco AI", outcome: "Success", metric: "40%" },
  roadmap: [],
  compliance: [{ badge: "FCC", description: "Regulatory Compliance" }],
  relatedProducts: [],
  relatedSolutions: [],
  resources: []
};
