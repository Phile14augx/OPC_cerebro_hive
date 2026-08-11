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
  resources: [],

  seo: {
    title: "Logistics AI Solutions | Supply Chain, Route Optimization & Warehouse AI | CerebroHive",
    description: "CerebroHive deploys AI for logistics and supply chain — route optimization, demand sensing, warehouse AI, shipment tracking intelligence, carrier selection, and freight optimization.",
    keywords: ["logistics AI solutions", "supply chain AI", "route optimization AI", "warehouse AI", "freight AI", "demand sensing AI", "logistics automation", "AI for 3PL", "supply chain intelligence"],
  },

  faqs: [
    { question: "How is AI transforming logistics and supply chain?", answer: "AI is transforming logistics across: route optimization (AI finds optimal delivery routes considering traffic, time windows, and vehicle constraints, reducing fuel costs 10–15%); demand sensing (AI integrates sell-through data, economic signals, and market intelligence for more accurate short-term forecasts); warehouse operations (AI directs picking robots, optimizes slot assignments, and manages labor allocation); shipment visibility (AI predicts ETAs and proactively communicates delays to customers and downstream operations); and carrier management (AI selects optimal carriers and routes based on cost, reliability, and capacity)." },
    { question: "How does AI improve last-mile delivery efficiency?", answer: "Last-mile AI optimizes the most expensive part of delivery (typically 40–50% of total logistics cost): dynamic route optimization (AI recalculates routes in real time as new orders arrive, traffic changes, or deliveries fail); delivery time window prediction (AI tells customers when to expect their package with 90%+ accuracy); failed delivery prediction (AI identifies high-risk delivery addresses and proactively arranges alternatives); and autonomous delivery scheduling (AI coordinates drone or autonomous vehicle deployments within regulatory constraints)." },
    { question: "What is demand sensing and how is it different from demand forecasting?", answer: "Demand forecasting predicts demand weeks or months ahead using historical patterns and seasonality. Demand sensing predicts demand days or hours ahead using real-time signals: point-of-sale data, warehouse inventory levels, weather, competitor stock levels, social media trends, and economic indicators. Demand sensing accuracy is dramatically higher for short-term horizons (1–14 days) and enables logistics providers to dynamically adjust capacity allocations, pre-position inventory, and optimize carrier commitments without waiting for weekly planning cycles." },
    { question: "How does AI optimize warehouse operations?", answer: "Warehouse AI covers: slotting optimization (placing fast-moving items closest to packing stations, AI calculates optimal slot for every SKU based on order patterns); pick path optimization (AI sequences picks to minimize travel distance); labor management (AI forecasts throughput and allocates workers to zones based on inbound order volume); robotic orchestration (AI coordinates pick robots with human pickers for hybrid operations); and quality control (computer vision verifies picks and packing accuracy before shipment)." },
    { question: "How do you build an AI-powered shipment visibility platform?", answer: "CerebroHive builds shipment visibility platforms that aggregate data from multiple carrier APIs, EDI feeds, IoT trackers, and web scraping — normalizing it into a unified shipment data model. AI adds predictive capabilities: ETA prediction (ML models trained on historical transit times, carrier performance, and real-time traffic); exception prediction (predicting delays before they happen based on patterns in carrier data and external signals); and automated customer communication (AI drafts and sends proactive delay notifications when exceptions are detected)." },
    { question: "How does AI help with freight procurement and carrier selection?", answer: "Freight AI automates the most time-consuming parts of procurement: RFP analysis (AI extracts and normalizes carrier bids, compares on consistent criteria); lane optimization (AI recommends carrier allocation by lane to minimize cost while maintaining reliability thresholds); spot market intelligence (AI monitors spot rates and recommends opportunistic buys when spot is favorable vs. contract); and carrier performance scoring (AI tracks on-time delivery, damage rates, and invoice accuracy across carriers to inform renewal negotiations)." },
    { question: "What AI use cases exist for 3PL and freight forwarders?", answer: "3PLs and freight forwarders benefit from AI across: customer quoting automation (AI generates accurate quotes in seconds from shipment details); document processing (AI extracts data from bills of lading, customs documents, and invoices automatically); customs classification (AI suggests HS codes and flags compliance issues); capacity planning (AI forecasts warehouse utilization and staffing needs); and customer service (AI answers shipment status inquiries and handles standard exception notifications autonomously)." },
    { question: "How does AI improve fleet management?", answer: "Fleet AI covers: predictive maintenance (AI analyzes OBD and telematics data to predict failures before breakdowns, reducing roadside events by 30–50%); driver behavior analysis (AI identifies risky driving patterns — harsh braking, speeding, fatigue indicators — and triggers coaching interventions); fuel optimization (AI identifies inefficient routes and driving behaviors contributing to excess fuel consumption); and EV fleet range management (AI optimizes EV charging schedules and routing to ensure vehicles complete planned deliveries within battery range)." },
    { question: "What data sources do logistics AI systems typically integrate?", answer: "Logistics AI systems integrate: TMS (Transportation Management Systems like MercuryGate, Oracle TMS, SAP TM) for order and shipment data; WMS (Warehouse Management Systems like Manhattan, Blue Yonder) for inventory and labor data; carrier APIs and EDI feeds for tracking events; telematics and IoT device data for fleet and cargo monitoring; ERP for demand and financial data; external data (traffic APIs, weather, port conditions, fuel price indexes); and customer systems (order management, e-commerce platforms) for demand signals." },
    { question: "What ROI do logistics companies achieve from AI?", answer: "Logistics AI ROI examples from CerebroHive clients: route optimization → 10–15% fuel and driver cost reduction; demand sensing → 15–25% reduction in emergency air freight; warehouse slotting AI → 8–12% improvement in pick productivity; carrier selection AI → 5–10% freight spend reduction; predictive maintenance → 20–40% reduction in unplanned vehicle downtime; and customer service AI → 50–65% reduction in inquiry-to-response time. We model expected ROI for each use case during the discovery phase and track actuals monthly." },
  ],
};
