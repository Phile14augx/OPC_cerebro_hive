import { Industry } from "./types";

export const manufacturing: Industry = {
  name: "Smart Manufacturing",
  slug: "manufacturing",
  color: "#00E5FF", // Electric Cyan
  
  engineConfig: {
    heroTheme: "manufacturing",
    backgroundAnimation: "smart-factory",
    primaryColor: "#00E5FF", // Electric Cyan
    secondaryColor: "#3A86FF", // Industrial Blue
    accentColor: "#FF5400" // Safety Orange
  },
  
  hero: {
    title: "AI-Powered Manufacturing Intelligence",
    subtitle: "SMART MANUFACTURING",
    description: "Create autonomous factories where machines, people, ERP systems, robots, and AI collaborate to optimize production, quality, maintenance, energy, and supply chains in real time.",
    primaryCta: "Explore Smart Factory",
    secondaryCta: "View Architecture"
  },
  
  overview: {
    maturityScore: 92,
    currentChallengesSummary: "Siloed IT/OT systems, reactive maintenance, and rigid supply chains.",
    opportunitySummary: "Transform factories into AI-native, autonomous production ecosystems.",
    statistics: [
      { metric: "500+", label: "Industrial AI Use Cases" },
      { metric: "35+", label: "Factory Blueprints" },
      { metric: "18", label: "Industrial AI Agents" },
      { metric: "50+", label: "Reference Architectures" },
      { metric: "100+", label: "Equipment Integrations" },
      { metric: "Enterprise Scale", label: "OT + IT Integration" }
    ]
  },

  segments: [
    "Production",
    "Quality",
    "Maintenance",
    "Warehouse",
    "Supply Chain",
    "Procurement",
    "Planning",
    "Energy",
    "Safety",
    "Logistics",
    "Engineering",
    "Executive Operations"
  ],

  challenges: [
    {
      title: "Production Intelligence",
      pain: "Low OEE, downtime, bottlenecks, and inefficient scheduling.",
      cost: "Millions lost per hour of downtime",
      businessImpact: "Reduced Throughput",
      priority: "Critical",
      category: "Operations",
      problems: ["Machine Downtime", "Scheduling Conflicts", "Bottlenecks", "Low OEE"],
      solutions: ["Production AI Agent", "Digital Twin Simulation", "Automated Scheduling", "Throughput Analytics"],
      outcomes: ["↑ OEE", "↓ Idle Time", "↑ Production Throughput"],
      techStack: ["AWS IoT", "Kafka", "Databricks", "React"],
      aiAgent: "Production Optimization Agent",
      readiness: { implementation: "14 Weeks", complexity: "High", roi: "Very High" }
    },
    {
      title: "Predictive Maintenance",
      pain: "Reactive repairs, machine failures, spare inventory issues.",
      cost: "High unplanned maintenance costs",
      businessImpact: "Asset Depreciation",
      priority: "Critical",
      category: "Risk",
      problems: ["Unplanned Failures", "High Spare Costs", "Reactive Maintenance", "Lost Lifespan"],
      solutions: ["Maintenance Agent", "IoT Sensor Data", "Anomaly Detection", "Automated Ticketing"],
      outcomes: ["↓ Unplanned Downtime", "↓ Spare Parts Inventory", "↑ Asset Life"],
      techStack: ["Azure IoT", "Spark", "TensorFlow", "PostgreSQL"],
      aiAgent: "Maintenance Intelligence Agent",
      readiness: { implementation: "12 Weeks", complexity: "Medium", roi: "High" }
    },
    {
      title: "Quality Assurance",
      pain: "Defect detection, inspection limits, traceability gaps, manual QA.",
      cost: "Scrap & Rework costs",
      businessImpact: "Brand Reputation",
      priority: "High",
      category: "Compliance",
      problems: ["Manual Inspection", "False Positives", "Scrap Costs", "Traceability"],
      solutions: ["Vision Agent", "Computer Vision Models", "Automated Rejection", "Root Cause Analysis"],
      outcomes: ["↑ Defect Detection", "↓ Scrap Rates", "↑ Output Quality"],
      techStack: ["OpenCV", "PyTorch", "Kafka", "ElasticSearch"],
      aiAgent: "Quality Assurance Agent",
      readiness: { implementation: "10 Weeks", complexity: "Medium", roi: "High" }
    },
    {
      title: "Supply Chain",
      pain: "Demand uncertainty, inventory hoarding, supplier risk.",
      cost: "High working capital tied up",
      businessImpact: "Missed Orders",
      priority: "High",
      category: "Supply Chain",
      problems: ["Demand Volatility", "Supplier Delays", "Stockouts", "Excess Inventory"],
      solutions: ["Supply Chain Agent", "Demand Forecasting", "Dynamic Routing", "Supplier Scoring"],
      outcomes: ["↓ Stockouts", "↓ Working Capital", "↑ On-Time Delivery"],
      techStack: ["Neo4j", "Anthropic", "Redis", "Spring Boot"],
      aiAgent: "Supply Chain Intelligence Agent",
      readiness: { implementation: "16 Weeks", complexity: "High", roi: "High" }
    }
  ],

  opportunityMatrix: [
    { name: "Predictive Maintenance", description: "Machine -> Sensors -> IoT Gateway -> AI Models -> Failure Prediction -> Maintenance", roi: "High" },
    { name: "Computer Vision QA", description: "Camera -> Vision AI -> Defect Detection -> Quality Dashboard", roi: "High" },
    { name: "Production Intelligence", description: "MES -> ERP -> Knowledge Graph -> AI -> Optimization", roi: "High" },
    { name: "Supply Chain Intelligence", description: "Suppliers -> Forecasting -> Inventory AI -> Planning", roi: "Medium" },
    { name: "Digital Twin", description: "Factory -> Digital Twin -> Simulation -> Optimization", roi: "High" },
    { name: "Energy Intelligence", description: "Meters -> IoT -> Energy AI -> Optimization", roi: "Medium" }
  ],
  
  architecture: {
    nodes: [
      { id: "sensors", position: { x: 0, y: 150 }, data: { label: "Sensors", type: "client" } },
      { id: "gateway", position: { x: 200, y: 150 }, data: { label: "Edge Gateway", type: "gateway", status: "Healthy" } },
      { id: "iot", position: { x: 400, y: 150 }, data: { label: "Industrial IoT", type: "system" } },
      { id: "kg", position: { x: 600, y: 50 }, data: { label: "Knowledge Graph", type: "database" } },
      { id: "vdb", position: { x: 600, y: 250 }, data: { label: "Vector DB", type: "database" } },
      { id: "llm", position: { x: 800, y: 150 }, data: { label: "LLM Router", type: "ai", status: "Active" } },
      { id: "agents", position: { x: 1000, y: 150 }, data: { label: "AI Agents", type: "agent" } },
      { id: "mes", position: { x: 1200, y: 50 }, data: { label: "MES", type: "database" } },
      { id: "erp", position: { x: 1200, y: 250 }, data: { label: "ERP", type: "database" } },
      { id: "scada", position: { x: 1400, y: 150 }, data: { label: "SCADA", type: "system" } },
      { id: "dashboard", position: { x: 1600, y: 150 }, data: { label: "Executive Dashboard", type: "client" } }
    ],
    edges: []
  },
  
  agents: [
    { name: "Production Agent", description: "Dynamically optimizes production schedules and bottlenecks.", capabilities: ["Scheduling", "OEE Tracking"], tools: ["MES", "SCADA"], outputs: ["Schedules"] },
    { name: "Maintenance Agent", description: "Predicts asset failures before they occur.", capabilities: ["Vibration Analysis", "Thermal Monitoring"], tools: ["IoT Gateway"], outputs: ["Work Orders"] },
    { name: "Quality Agent", description: "Inspects products in real time using vision models.", capabilities: ["Computer Vision", "Tolerance Checking"], tools: ["Cameras", "MES"], outputs: ["QA Alerts"] },
    { name: "Supply Chain Agent", description: "Balances inventory levels against volatile demand.", capabilities: ["Demand Forecasting", "Supplier Risk Scoring"], tools: ["ERP", "External Feeds"], outputs: ["Procurement Plans"] },
    { name: "Warehouse Agent", description: "Optimizes AGV routing and pick paths.", capabilities: ["Pathfinding", "Space Optimization"], tools: ["WMS"], outputs: ["Routes"] },
    { name: "Energy Agent", description: "Minimizes power consumption during peak loads.", capabilities: ["Load Balancing", "Carbon Tracking"], tools: ["Smart Meters"], outputs: ["Energy Profiles"] },
    { name: "Safety Agent", description: "Monitors factory floor for PPE compliance and hazards.", capabilities: ["Video Analytics", "Geofencing"], tools: ["CCTV"], outputs: ["Safety Violations"] },
    { name: "Vision Agent", description: "General purpose camera monitoring.", capabilities: ["Object Detection"], tools: ["Cameras"], outputs: ["Logs"] }
  ],
  
  erpIntegration: [
    "Manufacturing",
    "Production Planning",
    "Procurement",
    "Inventory",
    "Warehouse",
    "Finance",
    "Quality",
    "Maintenance",
    "Executive Intelligence"
  ],
  
  techStack: [
    { layer: "Cloud & Edge", technologies: ["Azure IoT", "AWS IoT", "Kubernetes"] },
    { layer: "AI & Models", technologies: ["OpenAI", "Anthropic", "LangGraph", "LlamaIndex"] },
    { layer: "Data & Persistence", technologies: ["Kafka", "Spark", "Neo4j", "PostgreSQL", "Redis"] },
    { layer: "Protocols & Apps", technologies: ["MQTT", "OPC UA", "Node-RED", "React", "Spring Boot"] }
  ],
  
  outcomes: [
    { metric: "Increase Overall Equipment Effectiveness", label: "Production", description: "Maximized OEE." },
    { metric: "Reduce unplanned downtime", label: "Maintenance", description: "Zero surprise failures." },
    { metric: "Improve defect detection", label: "Quality", description: "Sub-millimeter accuracy." },
    { metric: "Optimize inventory and planning", label: "Supply Chain", description: "Lean inventory." },
    { metric: "Reduce energy consumption", label: "Energy", description: "Sustainable operations." },
    { metric: "Improve production visibility", label: "Operations", description: "Real-time control tower." }
  ],
  
  caseStudy: {
    client: "Automotive Manufacturer",
    title: "Predictive Maintenance",
    timeline: "6 Months",
    architecture: "Edge AI + Kafka + Industrial Agents",
    outcome: "Operational Improvements",
    metric: "35% Less Downtime"
  },
  
  roadmap: [
    { phase: "Phase 1", name: "Operational Assessment", description: "Current Factory state mapping." },
    { phase: "Phase 2", name: "AI Opportunity Mapping", description: "Identify high ROI use cases." },
    { phase: "Phase 3", name: "Reference Architecture", description: "Design OT/IT integration." },
    { phase: "Phase 4", name: "Pilot Line", description: "Deploy to a single production line." },
    { phase: "Phase 5", name: "Factory Rollout", description: "Scale across the facility." },
    { phase: "Phase 6", name: "Continuous Optimization", description: "Enterprise Integration." }
  ],
  
  compliance: [
    { badge: "ISA-95", description: "Enterprise-Control System Integration" },
    { badge: "IEC 62443", description: "Industrial Communication Networks Security" },
    { badge: "ISO 9001", description: "Quality Management Systems" },
    { badge: "ISO 55000", description: "Asset Management" },
    { badge: "OPC UA", description: "Industrial Interoperability Standard" },
    { badge: "MQTT", description: "Lightweight IoT Messaging" },
    { badge: "Industry 4.0", description: "Smart Factory Framework" },
    { badge: "Industry 5.0", description: "Human-Centric Smart Automation" }
  ],
  
  relatedProducts: [
    "Quantiva Integration Framework™",
    "SynapseX™",
    "AgentForge™",
    "CortexOps™",
    "DecisionDNA™",
    "HiveMatrix™",
    "CerebroSphere™",
    "NeuroFlow™",
    "HiveScore™",
    "AI Value Canvas™"
  ],
  
  relatedSolutions: [
    "Predictive Maintenance",
    "Computer Vision AI",
    "Industrial IoT",
    "Digital Twin",
    "Knowledge Management",
    "Hyperautomation",
    "ERP Modernization",
    "Cloud Modernization"
  ],
  
  resources: [
    { title: "Industrial AI", type: "Guide", link: "/research" },
    { title: "Industry 5.0", type: "Paper", link: "/research" },
    { title: "Digital Twins", type: "Blueprint", link: "/research" },
    { title: "Computer Vision", type: "Case Study", link: "/research" },
    { title: "Industrial Knowledge Graphs", type: "Paper", link: "/research" },
    { title: "Edge AI", type: "Guide", link: "/research" },
    { title: "Industrial Agents", type: "Paper", link: "/research" },
    { title: "Factory Automation", type: "Report", link: "/research" }
  ]
};
