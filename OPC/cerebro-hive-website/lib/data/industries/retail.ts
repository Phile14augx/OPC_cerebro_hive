import { Industry } from "./types";

export const retail: Industry = {
  name: "Retail",
  slug: "retail",
  color: "#E81CFF", // Retail Magenta
  
  tier: "Core Enterprise",
  category: "Retail",
  subcategory: "E-Commerce & Stores",
  featured: true,
  
  engineConfig: {
    heroTheme: "retail",
    backgroundAnimation: "transaction-network", // We will use transaction-network but styled for commerce
    primaryColor: "#E81CFF", // Retail Magenta
    secondaryColor: "#8B5CF6", // Royal Purple
    accentColor: "#00E5FF" // Electric Blue
  },
  
  hero: {
    title: "AI-Powered Commerce Intelligence",
    subtitle: "INTELLIGENT RETAIL",
    description: "Connect stores, e-commerce, warehouses, customers, and enterprise systems through AI-native intelligence that personalizes experiences, optimizes inventory, predicts demand, and accelerates retail growth.",
    primaryCta: "Explore Retail AI",
    secondaryCta: "View Commerce Architecture",
  },
  
  overview: {
    maturityScore: 100,
    currentChallengesSummary: "Fragmented customer journeys, stockouts, and static pricing.",
    opportunitySummary: "AI-native omnichannel operations and real-time inventory intelligence.",
    statistics: [
      { metric: "450+", label: "Retail AI Use Cases" },
      { metric: "32+", label: "Commerce Blueprints" },
      { metric: "16", label: "Retail AI Agents" },
      { metric: "120+", label: "Commerce Integrations" }
    ]
  },
  
  maturity: {
    aiAdoption: 7,
    automation: 8,
    knowledge: 6
  },
  
  aiOpportunities: [
    { domain: "Customer Personalization", score: 10 },
    { domain: "Inventory Forecasting", score: 9 },
    { domain: "Dynamic Pricing", score: 8 },
    { domain: "Supply Chain", score: 7 }
  ],

  segments: [
    "Stores",
    "E-Commerce",
    "Customers",
    "Inventory",
    "Warehouse",
    "Pricing",
    "Marketing",
    "Supply Chain",
    "Loyalty",
    "Customer Support",
    "Merchandising",
    "Executive Intelligence"
  ],

  challenges: [
    {
      title: "Customer Personalization",
      pain: "Poor personalization and fragmented journeys across physical and digital storefronts.",
      cost: "Low engagement and customer churn",
      businessImpact: "Revenue Leakage",
      priority: "Critical",
      category: "Customer",
      problems: ["Fragmented Journeys", "Generic Offers", "Low Conversion", "High Churn"],
      solutions: ["Customer Agent", "Recommendation Engine", "360-Degree Profile", "Real-Time Triggers"],
      outcomes: ["↑ Conversion Rate", "↑ Customer Lifetime Value", "↓ Churn"],
      techStack: ["Neo4j", "Redis", "LangGraph", "Kafka"],
      aiAgent: "Customer Experience Agent",
      readiness: { implementation: "8 Weeks", complexity: "Low", roi: "Very High" }
    },
    {
      title: "Inventory Intelligence",
      pain: "Stockouts, overstock, and manual replenishment cycles.",
      cost: "Inventory inaccuracies and carrying costs",
      businessImpact: "Capital Inefficiency",
      priority: "High",
      category: "Inventory",
      problems: ["Stockouts", "Overstocking", "Manual Replenishment", "Shrinkage"],
      solutions: ["Inventory Agent", "Demand Forecasting", "Automated Orders", "Safety Stock AI"],
      outcomes: ["↓ Stockouts", "↓ Carrying Costs", "↑ Inventory Turnover"],
      techStack: ["Databricks", "Pinecone", "Azure", "TensorFlow"],
      aiAgent: "Inventory Optimization Agent",
      readiness: { implementation: "12 Weeks", complexity: "Medium", roi: "High" }
    },
    {
      title: "Dynamic Pricing",
      pain: "Static pricing, margin erosion, and competitive pressure.",
      cost: "Promotion inefficiency",
      businessImpact: "Margin Compression",
      priority: "High",
      category: "Pricing",
      problems: ["Static Pricing", "Margin Erosion", "Competitor Pressure", "Ineffective Promos"],
      solutions: ["Pricing Agent", "Elasticity Modeling", "Competitor Scraping", "Real-Time Adjustments"],
      outcomes: ["↑ Profit Margins", "↑ Promo ROI", "↑ Market Share"],
      techStack: ["PostgreSQL", "Spark", "Anthropic", "Kubernetes"],
      aiAgent: "Pricing Strategy Agent",
      readiness: { implementation: "14 Weeks", complexity: "High", roi: "High" }
    },
    {
      title: "Supply Chain",
      pain: "Delayed fulfillment and supplier visibility issues.",
      cost: "Logistics inefficiencies",
      businessImpact: "Demand Uncertainty",
      priority: "Critical",
      category: "Supply Chain",
      problems: ["Delayed Fulfillment", "Supplier Risk", "Demand Uncertainty", "High Shipping Costs"],
      solutions: ["Supply Chain Agent", "Route Optimization", "Supplier Scoring", "Predictive Logistics"],
      outcomes: ["↓ Fulfillment Time", "↓ Logistics Costs", "↑ Supplier Reliability"],
      techStack: ["AWS", "ElasticSearch", "LlamaIndex", "OpenAI"],
      aiAgent: "Logistics Orchestration Agent",
      readiness: { implementation: "16 Weeks", complexity: "High", roi: "Very High" }
    }
  ],

  opportunityMatrix: [
    { name: "Customer Personalization", description: "Knowledge graph-driven AI profiles for tailored experiences.", roi: "High" },
    { name: "Demand Forecasting", description: "Predictive inventory planning using external signals and sales history.", roi: "High" },
    { name: "Inventory Intelligence", description: "Automated replenishment bridging warehouse and store systems.", roi: "High" },
    { name: "Dynamic Pricing", description: "Real-time price optimization based on demand and competitors.", roi: "High" },
    { name: "Customer Support AI", description: "Autonomous AI agents resolving customer inquiries instantly.", roi: "Medium" },
    { name: "Store Intelligence", description: "Vision AI and POS analytics empowering store managers.", roi: "Medium" }
  ],
  
  architecture: {
    nodes: [
      { id: "customer", position: { x: 0, y: 150 }, data: { label: "Customer", type: "client" } },
      { id: "api", position: { x: 200, y: 150 }, data: { label: "API Gateway", type: "gateway", status: "Healthy" } },
      { id: "kg", position: { x: 400, y: 100 }, data: { label: "Knowledge Graph", type: "database" } },
      { id: "vector", position: { x: 400, y: 200 }, data: { label: "Vector DB", type: "database" } },
      { id: "llm", position: { x: 600, y: 150 }, data: { label: "LLM Router", type: "ai", status: "Active" } },
      { id: "agents", position: { x: 800, y: 150 }, data: { label: "AI Agents", type: "agent" } },
      { id: "ecommerce", position: { x: 1000, y: 50 }, data: { label: "E-Commerce", type: "system" } },
      { id: "pos", position: { x: 1000, y: 150 }, data: { label: "Store POS", type: "system" } },
      { id: "erp", position: { x: 1000, y: 250 }, data: { label: "Retail ERP", type: "system" } },
      { id: "dashboard", position: { x: 1200, y: 150 }, data: { label: "Executive Dashboard", type: "system" } }
    ],
    edges: []
  },
  
  agents: [
    { name: "Customer Agent", description: "Maintains real-time 360-degree profiles of shoppers.", capabilities: ["Profile Unification", "Intent Prediction"], tools: ["CDP", "CRM"], outputs: ["Personalization Signals"] },
    { name: "Recommendation Agent", description: "Generates hyper-personalized product suggestions.", capabilities: ["Collaborative Filtering", "Vector Search"], tools: ["E-Commerce", "App"], outputs: ["Product Feeds"] },
    { name: "Pricing Agent", description: "Dynamically adjusts pricing to maximize margin and conversion.", capabilities: ["Competitor Analysis", "Elasticity Modeling"], tools: ["ERP", "Pricing Engine"], outputs: ["Price Updates"] },
    { name: "Inventory Agent", description: "Predicts stockouts and triggers automated replenishment.", capabilities: ["Demand Forecasting", "Safety Stock Optimization"], tools: ["Warehouse Management", "Suppliers"], outputs: ["Purchase Orders"] },
    { name: "Marketing Agent", description: "Orchestrates omnichannel campaigns based on real-time trends.", capabilities: ["Content Generation", "Audience Segmentation"], tools: ["Marketing Automation"], outputs: ["Campaigns"] }
  ],
  
  erpIntegration: [
    "Sales",
    "Inventory",
    "Warehouse",
    "Procurement",
    "Finance",
    "Customer Intelligence",
    "Executive Analytics"
  ],
  
  techStack: [
    { layer: "AI Models", technologies: ["OpenAI", "Anthropic", "LlamaIndex", "LangGraph"] },
    { layer: "Data Infrastructure", technologies: ["Kafka", "Spark", "PostgreSQL", "ElasticSearch"] },
    { layer: "Knowledge Base", technologies: ["Neo4j", "Redis"] },
    { layer: "Cloud & Ops", technologies: ["Azure", "AWS", "Google Cloud", "Docker", "Kubernetes"] }
  ],
  
  outcomes: [
    { metric: "Conversion", label: "Increase", description: "Improve personalization quality and conversion rates." },
    { metric: "Availability", label: "Optimize", description: "Optimize stock availability and warehouse efficiency." },
    { metric: "Visibility", label: "Enhance", description: "Enhance fulfillment visibility across the supply chain." },
    { metric: "Coordination", label: "Improve", description: "Improve omnichannel operational coordination." }
  ],
  
  caseStudy: {
    client: "Global Retail Chain",
    title: "Inventory Optimization",
    timeline: "16 Weeks",
    architecture: "Enterprise Demand Forecasting Pipeline",
    outcome: "Operational Improvements",
    metric: "35%"
  },
  
  roadmap: [
    { phase: "Phase 1", name: "Retail Assessment", description: "Customer Journey Mapping and Data Harmonization." },
    { phase: "Phase 2", name: "AI Opportunity Discovery", description: "Design Commerce Reference Architecture." },
    { phase: "Phase 3", name: "Pilot Store", description: "Deploy Vision AI and Predictive Inventory." },
    { phase: "Phase 4", name: "Enterprise Rollout", description: "Continuous Commerce Optimization across all locations." }
  ],
  
  compliance: [
    { badge: "PCI DSS", description: "Payment Card Industry Data Security Standard", whyItMatters: "Secures customer payment data.", affectedWorkflows: ["Checkout", "Payments"] },
    { badge: "GS1", description: "Global Standards for Supply Chain", whyItMatters: "Standardizes barcodes and RFID.", affectedWorkflows: ["Inventory", "Logistics"] },
    { badge: "GDPR / CCPA", description: "Consumer Data Privacy Frameworks", whyItMatters: "Protects customer profiles.", affectedWorkflows: ["Marketing", "Loyalty"] }
  ],
  
  relatedIndustries: ["manufacturing", "logistics", "finance"],
  
  relatedProducts: [
    "Quantiva Integration Framework™",
    "DecisionDNA™",
    "CerebroSphere™",
    "HiveMatrix™",
    "AgentForge™",
    "AI Value Canvas™"
  ],
  
  relatedSolutions: [
    "Customer Personalization",
    "Demand Forecasting",
    "Inventory Optimization",
    "Dynamic Pricing",
    "Retail Computer Vision"
  ],
  
  resources: [
    { title: "Retail AI Architecture", type: "Whitepaper", link: "/research" },
    { title: "Agentic Commerce", type: "Research Paper", link: "/research" },
    { title: "Omnichannel AI", type: "Solution Brief", link: "/research" }
  ]
};
