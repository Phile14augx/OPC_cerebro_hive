import { Industry } from "./types";

export const finance: Industry = {
  name: "Financial Services",
  slug: "finance",
  color: "#0B5FFF", // Deep Blue
  
  engineConfig: {
    heroTheme: "finance",
    backgroundAnimation: "transaction-network",
    primaryColor: "#0B5FFF", // Deep Blue
    secondaryColor: "#00D084", // Emerald
    accentColor: "#FFD166" // Gold
  },
  
  hero: {
    title: "AI-Native Financial Intelligence",
    subtitle: "FINANCIAL SERVICES",
    description: "Design secure, compliant, and intelligent financial systems that automate operations, prevent fraud, optimize risk, and deliver real-time executive intelligence.",
    primaryCta: "Explore Architectures",
    secondaryCta: "Book Financial AI Workshop"
  },
  
  overview: {
    maturityScore: 98,
    currentChallengesSummary: "Legacy architecture, regulatory pressure, and siloed data slowing digital transformation.",
    opportunitySummary: "From Compliance to Cognition. From Transactions to Intelligence.",
    statistics: [
      { metric: "300+", label: "Financial AI Use Cases" },
      { metric: "28+", label: "Solution Blueprints" },
      { metric: "14", label: "AI Agents" },
      { metric: "35+", label: "Reference Architectures" },
      { metric: "99.99%", label: "Platform Availability" },
      { metric: "Enterprise Grade", label: "Security" }
    ]
  },

  segments: [
    "Retail Banking",
    "Corporate Banking",
    "Investment Banking",
    "Insurance",
    "Wealth Management",
    "Payments",
    "Capital Markets",
    "Treasury",
    "Compliance",
    "Risk",
    "FinTech",
    "Lending"
  ],

  challenges: [
    {
      title: "Fraud Intelligence",
      pain: "Real-time payment fraud, Identity theft, AML, Chargebacks.",
      cost: "$42B+ annually in fraud losses",
      businessImpact: "Revenue Leakage & Trust Loss",
      priority: "Critical",
      category: "Fraud",
      problems: ["Payment Fraud", "Identity Theft", "Account Takeover", "Money Laundering"],
      solutions: ["Fraud AI Agent", "Knowledge Graph", "Behavioral Analytics", "Real-Time Risk Scoring"],
      outcomes: ["↓ Fraud Losses", "↑ Detection Accuracy", "↑ Customer Trust"],
      techStack: ["Neo4j", "OpenAI", "Kafka", "Redis"],
      aiAgent: "Fraud Detection Agent",
      readiness: { implementation: "12 Weeks", complexity: "Medium", roi: "Very High" }
    },
    {
      title: "Compliance Automation",
      pain: "KYC, AML, Basel III, PCI DSS, GDPR, SOX, ISO 27001 compliance costs.",
      cost: "10-15% of total operational costs",
      businessImpact: "Regulatory Fines",
      priority: "High",
      category: "Compliance",
      problems: ["Manual KYC/AML", "Policy Updates", "Audit Preparation", "Reporting Overhead"],
      solutions: ["Compliance AI Agent", "Document AI", "Policy Blueprint Engine", "Automated Auditing"],
      outcomes: ["↓ Compliance Costs", "↑ Audit Readiness", "↓ Human Error"],
      techStack: ["LlamaIndex", "Anthropic", "PostgreSQL", "React"],
      aiAgent: "Regulatory Agent",
      readiness: { implementation: "16 Weeks", complexity: "High", roi: "High" }
    },
    {
      title: "Customer Intelligence",
      pain: "Long approvals, Manual onboarding, Poor personalization, Slow service.",
      cost: "High customer churn rates",
      businessImpact: "Lost Market Share",
      priority: "High",
      category: "Customer",
      problems: ["Fragmented Journeys", "Slow Onboarding", "Generic Offers", "Support Delays"],
      solutions: ["Customer Agent", "Hyper-Personalization", "Omnichannel Bot", "Automated Onboarding"],
      outcomes: ["↑ Customer Retention", "↓ Time to Onboard", "↑ Wallet Share"],
      techStack: ["LangGraph", "ElasticSearch", "Azure", "Spark"],
      aiAgent: "Customer Experience Agent",
      readiness: { implementation: "10 Weeks", complexity: "Low", roi: "High" }
    },
    {
      title: "Dynamic Risk",
      pain: "Credit, Operational, Liquidity, Market, Cyber, Third-party risks.",
      cost: "Systemic vulnerabilities",
      businessImpact: "Catastrophic Failure",
      priority: "Critical",
      category: "Risk",
      problems: ["Static Models", "Siloed Data", "Delayed Reporting", "Market Volatility"],
      solutions: ["Risk Engine AI", "Stress Testing Models", "Predictive Analytics", "Real-Time Dashboard"],
      outcomes: ["↓ Credit Defaults", "↑ Capital Efficiency", "↑ Executive Visibility"],
      techStack: ["Databricks", "Pinecone", "AWS", "TensorFlow"],
      aiAgent: "Risk Management Agent",
      readiness: { implementation: "14 Weeks", complexity: "High", roi: "Very High" }
    }
  ],

  opportunityMatrix: [
    { name: "Fraud Intelligence", description: "Transactions -> Behavior Analytics -> Graph Engine -> LLM -> Fraud Score -> Alert", roi: "High" },
    { name: "Intelligent KYC", description: "Documents -> OCR -> Knowledge Graph -> Identity Verification -> Decision", roi: "High" },
    { name: "Loan Intelligence", description: "Application -> Credit Bureau -> Risk AI -> Approval -> Customer", roi: "Medium" },
    { name: "Wealth Advisor", description: "Portfolio -> Market Data -> AI Advisor -> Recommendations", roi: "Medium" },
    { name: "Treasury Intelligence", description: "Cash -> Forecast -> Optimization -> Executive Dashboard", roi: "High" },
    { name: "Regulatory Intelligence", description: "Policies -> Knowledge Graph -> AI -> Compliance Reports", roi: "High" }
  ],
  
  architecture: {
    nodes: [
      { id: "customer", position: { x: 0, y: 150 }, data: { label: "Customer", type: "client" } },
      { id: "channels", position: { x: 200, y: 150 }, data: { label: "Digital Channels", type: "system" } },
      { id: "gateway", position: { x: 400, y: 150 }, data: { label: "API Gateway", type: "gateway", status: "Healthy" } },
      { id: "identity", position: { x: 600, y: 50 }, data: { label: "Identity", type: "system" } },
      { id: "kg", position: { x: 600, y: 250 }, data: { label: "Knowledge Graph", type: "database" } },
      { id: "vdb", position: { x: 800, y: 250 }, data: { label: "Vector DB", type: "database" } },
      { id: "llm", position: { x: 1000, y: 150 }, data: { label: "LLM Router", type: "ai", status: "Active" } },
      { id: "swarm", position: { x: 1200, y: 150 }, data: { label: "Agent Swarm", type: "agent" } },
      { id: "core", position: { x: 1400, y: 50 }, data: { label: "Core Banking", type: "database" } },
      { id: "crm", position: { x: 1400, y: 250 }, data: { label: "CRM", type: "database" } },
      { id: "treasury", position: { x: 1600, y: 150 }, data: { label: "Treasury", type: "system" } },
      { id: "dashboard", position: { x: 1800, y: 150 }, data: { label: "Executive Dashboard", type: "client" } }
    ],
    edges: []
  },
  
  agents: [
    { name: "Risk Agent", description: "Monitors portfolio risk and calculates exposure.", capabilities: ["Credit Scoring", "Stress Testing"], tools: ["Market APIs", "Internal Ledgers"], outputs: ["Risk Reports"] },
    { name: "Compliance Agent", description: "Ensures regulatory adherence in real-time.", capabilities: ["Policy checking", "Report generation"], tools: ["Reg Graph"], outputs: ["Audit Logs"] },
    { name: "AML Agent", description: "Anti-money laundering detection.", capabilities: ["Network analysis", "Behavior flags"], tools: ["Graph DB"], outputs: ["Alerts"] },
    { name: "Fraud Agent", description: "Real-time transaction authorization.", capabilities: ["Anomaly detection", "Pattern matching"], tools: ["Transaction Core"], outputs: ["Block/Allow"] },
    { name: "Treasury Agent", description: "Cash flow optimization.", capabilities: ["Liquidity forecasting", "FX hedging"], tools: ["ERP"], outputs: ["Treasury Plan"] },
    { name: "Portfolio Agent", description: "Wealth management optimization.", capabilities: ["Asset allocation", "Rebalancing"], tools: ["Market Feeds"], outputs: ["Trades"] },
    { name: "Audit Agent", description: "Continuous auditing of financial systems.", capabilities: ["Reconciliation", "Anomaly detection"], tools: ["Ledgers"], outputs: ["Exceptions"] },
    { name: "Customer Agent", description: "Personalized banking concierge.", capabilities: ["Intent recognition", "Next-best-action"], tools: ["CRM"], outputs: ["Responses"] },
    { name: "Payments Agent", description: "Intelligent payment routing.", capabilities: ["Least-cost routing", "Failed payment retry"], tools: ["Payment Gateways"], outputs: ["Routing Rules"] },
    { name: "Executive Agent", description: "Board-level insights and forecasting.", capabilities: ["Natural language querying", "Scenario planning"], tools: ["Data Lake"], outputs: ["Dashboards"] },
    { name: "Collections Agent", description: "Automated debt recovery.", capabilities: ["Propensity to pay", "Tone analysis"], tools: ["Dialer API"], outputs: ["Negotiation Strategies"] },
    { name: "Loan Agent", description: "Credit application processing.", capabilities: ["Document extraction", "Bureau querying"], tools: ["OCR", "Credit Bureaus"], outputs: ["Decisions"] }
  ],
  
  erpIntegration: [
    "Accounting",
    "Procurement",
    "Treasury",
    "HR",
    "Inventory",
    "Executive AI"
  ],
  
  techStack: [
    { layer: "Cloud & Infrastructure", technologies: ["Azure", "AWS", "GCP", "Kubernetes"] },
    { layer: "AI & Models", technologies: ["OpenAI", "Anthropic", "LangGraph", "LlamaIndex"] },
    { layer: "Data & Persistence", technologies: ["Neo4j", "Pinecone", "Kafka", "Spark", "PostgreSQL", "Redis"] },
    { layer: "Application", technologies: ["React", "Spring Boot"] }
  ],
  
  outcomes: [
    { metric: "Reduce fraud losses", label: "Fraud Detection", description: "Real-time prevention." },
    { metric: "Accelerate approval workflows", label: "Loan Processing", description: "Instant decisions." },
    { metric: "Automate regulatory reporting", label: "Compliance", description: "Always-on audits." },
    { metric: "Personalize financial journeys", label: "Customer Experience", description: "Hyper-personalization." },
    { metric: "Improve portfolio visibility", label: "Risk", description: "Holistic view." },
    { metric: "Reduce manual processes", label: "Operations", description: "Straight-through processing." }
  ],
  
  caseStudy: {
    client: "Global Bank",
    title: "Loan Automation",
    timeline: "3 Months",
    architecture: "Document AI + Agent Swarm",
    outcome: "Executive Outcomes",
    metric: "90% Faster"
  },
  
  roadmap: [
    { phase: "Phase 1", name: "Assessment", description: "Current State & Opportunity Mapping." },
    { phase: "Phase 2", name: "Architecture", description: "Define AI blueprints." },
    { phase: "Phase 3", name: "Pilot", description: "Deploy targeted agents." },
    { phase: "Phase 4", name: "Enterprise Rollout", description: "Scale across segments." },
    { phase: "Phase 5", name: "Optimization", description: "Continuous Intelligence." }
  ],
  
  compliance: [
    { badge: "PCI DSS", description: "Payment Card Industry Data Security Standard" },
    { badge: "ISO 27001", description: "Information Security Management" },
    { badge: "SOC 2", description: "System and Organization Controls" },
    { badge: "Basel III", description: "Global Regulatory Framework for Banks" },
    { badge: "GDPR", description: "General Data Protection Regulation" },
    { badge: "SOX", description: "Sarbanes-Oxley Act" },
    { badge: "KYC", description: "Know Your Customer" },
    { badge: "AML", description: "Anti-Money Laundering" }
  ],
  
  relatedProducts: [
    "DecisionDNA™",
    "CerebroSphere™",
    "HiveMatrix™",
    "SynapseX™",
    "AgentForge™",
    "CortexOps™",
    "HiveScore™",
    "Quantiva Integration Framework™",
    "NeuroFlow™",
    "AI Value Canvas™"
  ],
  
  relatedSolutions: [
    "Fraud Detection",
    "Document AI",
    "Knowledge AI",
    "Decision Intelligence",
    "Predictive Analytics",
    "Cloud Modernization",
    "ERP Modernization",
    "AI Governance"
  ],
  
  resources: [
    { title: "Financial AI Governance", type: "Paper", link: "/research" },
    { title: "Explainable AI", type: "Paper", link: "/research" },
    { title: "Graph Fraud Detection", type: "Blueprint", link: "/research" },
    { title: "AI Risk Models", type: "Paper", link: "/research" },
    { title: "Enterprise Knowledge Graphs", type: "Paper", link: "/research" },
    { title: "LLM Security", type: "Guide", link: "/research" },
    { title: "Agentic Banking", type: "Paper", link: "/research" }
  ]
};
