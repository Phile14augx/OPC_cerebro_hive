import { Industry } from "./types";

export const manufacturing: Industry = {
  name: "Smart Manufacturing",
  slug: "manufacturing",
  color: "#00E5FF", // Electric Cyan
  
  tier: "Core Enterprise",
  category: "Manufacturing",
  subcategory: "Industrial Production",
  featured: true,
  
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

  maturity: {
    aiAdoption: 6,
    automation: 9,
    knowledge: 5
  },
  
  aiOpportunities: [
    { domain: "Predictive Maintenance", score: 9 },
    { domain: "Supply Chain", score: 8 },
    { domain: "Quality Control", score: 10 },
    { domain: "Production Planning", score: 7 }
  ],

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
    { badge: "ISO 9001", description: "Quality Management Systems", whyItMatters: "Ensures consistent quality.", affectedWorkflows: ["Quality Control"] },
    { badge: "ISO 14001", description: "Environmental Management", whyItMatters: "Governs sustainability.", affectedWorkflows: ["Waste Management"] },
    { badge: "OSHA", description: "Occupational Safety and Health", whyItMatters: "Worker safety regulations.", affectedWorkflows: ["Plant Floor"] },
    { badge: "RoHS", description: "Restriction of Hazardous Substances", whyItMatters: "Limits hazardous materials.", affectedWorkflows: ["Procurement"] },
    { badge: "SOC 2", description: "System and Organization Controls" },
    { badge: "GDPR", description: "General Data Protection Regulation" }
  ],
  
  relatedIndustries: ["retail", "energy", "logistics"],
  
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
  ],

  seo: {
    title: "Manufacturing AI Solutions | Industry 4.0, Predictive Maintenance & Quality AI | CerebroHive",
    description: "CerebroHive deploys AI for manufacturing — predictive maintenance, computer vision quality control, supply chain AI, production scheduling optimization, and Industry 4.0 transformation.",
    keywords: [
      "manufacturing AI solutions", "Industry 4.0 AI", "predictive maintenance AI",
      "quality control AI", "computer vision manufacturing", "supply chain AI",
      "production scheduling AI", "industrial AI consulting", "smart factory AI",
      "manufacturing AI transformation", "OEE optimization AI", "defect detection AI",
    ],
  },

  faqs: [
    {
      question: "How is AI transforming manufacturing and Industry 4.0?",
      answer: "AI is transforming manufacturing across five domains: predictive maintenance (AI predicts equipment failures before they occur, reducing unplanned downtime by 30–50%); quality control (computer vision detects defects at machine speed with superhuman consistency); supply chain intelligence (AI optimizes demand forecasting, supplier risk monitoring, and logistics coordination); production optimization (AI-driven scheduling maximizes OEE while minimizing material waste and energy consumption); and knowledge management (capturing and making searchable the tribal knowledge of experienced production workers).",
    },
    {
      question: "What is predictive maintenance AI and how does it work?",
      answer: "Predictive maintenance AI uses sensor data from industrial equipment — vibration, temperature, pressure, acoustic emissions, current draw — to predict failures before they happen. Machine learning models learn normal operating patterns and detect anomalies that precede failures. CerebroHive builds predictive maintenance systems using time-series ML models (LSTM, Transformer-based anomaly detection), edge computing for real-time sensor processing, and integration with CMMS systems (SAP PM, IBM Maximo) to automatically generate work orders when failure probability exceeds thresholds.",
    },
    {
      question: "How does AI-powered computer vision improve manufacturing quality control?",
      answer: "Computer vision quality control replaces or augments human visual inspection with AI cameras that inspect at production line speed: detecting surface defects (scratches, dents, discoloration); verifying assembly completeness (all components present and correctly positioned); measuring dimensional accuracy (sub-millimeter precision using structured light or stereo vision); and reading labels and barcodes for traceability. CerebroHive deploys vision systems using YOLO-based detection models, 3D point cloud analysis for complex geometries, and edge inference hardware (NVIDIA Jetson, Intel Movidius) that operates within existing production cells without latency.",
    },
    {
      question: "How does AI help manufacturers with supply chain optimization?",
      answer: "Manufacturing supply chain AI addresses: demand sensing (combining sell-through data, macroeconomic signals, and market intelligence for more accurate forecasts); inventory optimization (AI determines optimal safety stock levels balancing service level against carrying cost); supplier risk monitoring (AI watches supplier financial health, geopolitical risk, and delivery performance, flagging risks early); logistics optimization (route planning, carrier selection, consolidation opportunities); and materials requirements planning (AI-enhanced MRP that adapts to real-time production data rather than relying on static assumptions).",
    },
    {
      question: "What AI use cases exist for production scheduling optimization?",
      answer: "Production scheduling AI solves the complex combinatorial problem of sequencing jobs across machines, crews, and materials to maximize throughput while meeting delivery commitments. AI approaches include: reinforcement learning for dynamic scheduling that adapts to machine downtime or demand changes; constraint optimization algorithms for capacity-constrained environments; digital twin simulation for evaluating what-if scenarios before committing to a schedule; and NLP interfaces that let production planners interact with the scheduling system in natural language. CerebroHive integrates scheduling AI with SAP PP, Oracle Manufacturing Cloud, and MES systems.",
    },
    {
      question: "How do you capture and preserve manufacturing tribal knowledge with AI?",
      answer: "Manufacturers face a critical knowledge retention crisis as experienced workers retire, taking decades of tacit knowledge with them. CerebroHive's knowledge capture approach: structured interviews with subject matter experts converted to searchable knowledge bases; historical maintenance records analyzed to extract failure-fix patterns; SOP documentation automatically generated from observed workflows; troubleshooting guides built from technician notes and CMMS histories; and conversational AI interfaces (industrial chatbots) that let new technicians query the captured knowledge in natural language.",
    },
    {
      question: "What is OEE and how does AI improve it?",
      answer: "OEE (Overall Equipment Effectiveness) measures manufacturing productivity across three components: availability (equipment running vs. scheduled runtime), performance (actual speed vs. design speed), and quality (good parts vs. total parts). AI improves OEE by: reducing unplanned downtime (predictive maintenance → higher availability); identifying micro-stoppages and speed losses through real-time sensor analysis (→ higher performance); and catching defects earlier through computer vision (→ higher quality). A 5–10% OEE improvement in a large manufacturing facility can generate millions in annual value.",
    },
    {
      question: "How do you integrate AI with existing MES, ERP, and SCADA systems?",
      answer: "CerebroHive builds integration layers that connect AI systems to manufacturing technology stacks: OPC-UA connectors for SCADA and PLC data; REST/SOAP API integration with SAP, Oracle, and Infor ERP; MQTT and Kafka for real-time IoT data streaming; MES integration with Siemens Opcenter, Rockwell FactoryTalk, and Dassault Apriso. We extract data for AI processing without disrupting existing systems and write results back to the systems operators already use — no separate AI interface required.",
    },
    {
      question: "What cybersecurity considerations exist for AI in manufacturing environments?",
      answer: "Manufacturing AI in OT (Operational Technology) environments requires careful cybersecurity design: network segmentation between IT and OT networks (ICS/SCADA networks must be isolated from AI systems that connect to enterprise networks); read-only data access from OT systems to AI (AI never writes directly to PLC or SCADA systems); air-gapped or unidirectional data diode architecture for highest-security environments; anomaly detection on OT network traffic (AI monitoring for industrial cyber threats); and incident response plans specific to OT environments where downtime has physical safety implications.",
    },
    {
      question: "How long does it take to deploy AI in a manufacturing facility?",
      answer: "Manufacturing AI deployment timelines: a computer vision quality control system for a single line takes 8–14 weeks (including camera installation, model training on your defect types, and MES integration); a predictive maintenance system for 20–50 assets takes 12–20 weeks (including sensor audit, data historian integration, and model training); a supply chain AI program takes 16–24 weeks; and a full smart factory transformation with multiple AI capabilities takes 12–18 months. We always deploy AI in parallel with existing processes first, validating AI recommendations against human decisions before granting any autonomous action authority.",
    },
  ],
};
