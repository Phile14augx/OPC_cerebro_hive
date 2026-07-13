import { Industry } from "./types";

export const government: Industry = {
  name: "Government",
  slug: "government",
  color: "#10B981", // Emerald
  engineConfig: {
    heroTheme: "government",
    backgroundAnimation: "transaction-network",
    primaryColor: "#10B981", // Emerald
    secondaryColor: "#1E3A8A", // Navy
    accentColor: "#06B6D4" // Cyan
  },
  hero: {
    title: "AI for Secure Digital Government",
    subtitle: "PUBLIC SECTOR AI",
    description: "Transform citizen services and secure national infrastructure with intelligent, compliant AI systems.",
    primaryCta: "Explore Gov AI",
    secondaryCta: "View Architectures",
  },
  overview: {
    maturityScore: 85,
    currentChallengesSummary: "Legacy infrastructure and fragmented citizen services.",
    opportunitySummary: "AI-driven citizen portals and secure automated governance.",
    statistics: [
      { metric: "100+", label: "Gov AI Deployments" },
      { metric: "Zero", label: "Data Breaches" },
      { metric: "24/7", label: "Automated Services" }
    ]
  },
  segments: ["Federal", "State & Local", "Defense", "Intelligence", "Public Health", "Transportation"],
  challenges: [
    {
      title: "Citizen Services",
      pain: "Slow response times and complex bureaucratic processes.",
      cost: "Low citizen satisfaction",
      businessImpact: "Trust Erosion",
      priority: "Critical",
      category: "Customer",
      problems: ["Long Wait Times", "Confusing Portals", "Manual Processing", "Inaccessible Services"],
      solutions: ["Citizen AI Assistant", "Omnichannel Chatbots", "Automated Routing", "Multi-lingual Support"],
      outcomes: ["↑ Citizen Satisfaction", "↓ Wait Times", "↑ Accessibility"],
      techStack: ["OpenAI", "LangChain", "Azure GovCloud", "Redis"],
      aiAgent: "Citizen Services Agent",
      readiness: { implementation: "12 Weeks", complexity: "Medium", roi: "High" }
    },
    {
      title: "Legacy Systems",
      pain: "Aging infrastructure hindering digital transformation.",
      cost: "High maintenance and security risks",
      businessImpact: "Operational Friction",
      priority: "High",
      category: "Operations",
      problems: ["Mainframe Dependency", "Data Silos", "High Maintenance", "Slow Deployments"],
      solutions: ["Code Refactoring AI", "API Gateways", "Cloud Migration", "Automated Testing"],
      outcomes: ["↓ Tech Debt", "↑ Deployment Speed", "↓ Maintenance Costs"],
      techStack: ["AWS GovCloud", "Kubernetes", "Kafka", "PostgreSQL"],
      aiAgent: "Infrastructure Modernization Agent",
      readiness: { implementation: "24 Weeks", complexity: "High", roi: "High" }
    },
    {
      title: "Cybersecurity",
      pain: "Increasing threats to national data sovereignty.",
      cost: "Severe national security risks",
      businessImpact: "Data Breaches",
      priority: "Critical",
      category: "Risk",
      problems: ["Advanced Persistent Threats", "Phishing", "Insider Threats", "Zero-day Exploits"],
      solutions: ["Threat Intelligence AI", "Behavioral Analytics", "Automated Quarantine", "Zero Trust"],
      outcomes: ["↑ Threat Detection", "↓ Dwell Time", "↑ Compliance"],
      techStack: ["ElasticSearch", "Splunk", "CrowdStrike", "Neo4j"],
      aiAgent: "Security Operations Agent",
      readiness: { implementation: "16 Weeks", complexity: "High", roi: "Very High" }
    }
  ],
  opportunityMatrix: [
    { name: "Smart Governance", description: "AI-driven policy analysis and secure data exchange.", roi: "High" },
    { name: "Fraud Analytics", description: "Detecting tax and benefits fraud with behavioral AI.", roi: "High" }
  ],
  architecture: {
    nodes: [
      { id: "citizen", position: { x: 0, y: 150 }, data: { label: "Citizen", type: "client" } },
      { id: "portal", position: { x: 200, y: 150 }, data: { label: "Portal", type: "gateway", status: "Healthy" } },
      { id: "kg", position: { x: 400, y: 150 }, data: { label: "Knowledge Graph", type: "database" } },
      { id: "ai", position: { x: 600, y: 150 }, data: { label: "Government AI", type: "ai", status: "Active" } },
      { id: "dept", position: { x: 800, y: 150 }, data: { label: "Departments", type: "system" } }
    ],
    edges: []
  },
  agents: [
    { name: "Citizen Agent", description: "Guides citizens through government services.", capabilities: ["NLP", "Routing"] },
    { name: "Policy Agent", description: "Analyzes legislative impacts.", capabilities: ["Document Analysis"] },
    { name: "Security Agent", description: "Monitors sovereign networks.", capabilities: ["Threat Detection"] }
  ],
  erpIntegration: ["Finance", "HR", "Procurement"],
  techStack: [{ layer: "Cloud", technologies: ["Azure GovCloud", "AWS GovCloud"] }],
  outcomes: [],
  caseStudy: { client: "Federal Agency", title: "Digital Modernization", timeline: "12 Months", architecture: "Gov AI", outcome: "Success", metric: "100%" },
  roadmap: [],
  compliance: [{ badge: "FedRAMP", description: "Federal Risk and Authorization Management Program" }],
  relatedProducts: [],
  relatedSolutions: [],
  resources: []
};
