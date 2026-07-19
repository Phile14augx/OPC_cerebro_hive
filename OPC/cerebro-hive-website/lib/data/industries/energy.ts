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
  resources: [],

  seo: {
    title: "Energy & Utilities AI Solutions | Predictive Grid, Renewable & Operations AI | CerebroHive",
    description: "CerebroHive deploys AI for energy companies and utilities — predictive grid management, renewable energy forecasting, asset maintenance AI, energy trading intelligence, and utility operations automation.",
    keywords: ["energy AI solutions", "utility AI", "predictive grid management", "renewable energy AI", "solar wind forecasting AI", "energy trading AI", "utility operations AI", "smart grid AI", "energy asset management AI"],
  },

  faqs: [
    { question: "How is AI being used in the energy sector?", answer: "Energy AI applications span: grid management (AI balances supply and demand in real time, predicting load patterns and optimizing dispatch); renewable integration (AI forecasts solar and wind generation for more accurate grid planning); predictive maintenance (AI analyzes sensor data from turbines, transformers, and pipelines to predict failures before outages); energy trading (AI models price movements and optimizes trading positions in energy markets); field operations (AI routes field crews, prioritizes work orders, and processes inspection images for asset health assessment); and customer programs (AI-powered demand response, energy efficiency recommendations, and customer service)." },
    { question: "How does AI improve renewable energy forecasting?", answer: "Renewable energy forecasting AI predicts solar and wind generation with dramatically higher accuracy than physics-based models by integrating: numerical weather prediction data (NWP); satellite imagery for cloud cover and atmospheric conditions; historical generation patterns from each specific asset; real-time sensor telemetry; and ML models (gradient boosting, LSTM, Transformer-based time series) that learn asset-specific characteristics. Accurate renewable forecasts reduce grid balancing costs and enable higher renewable penetration by reducing reserve requirements." },
    { question: "What is predictive maintenance for energy assets?", answer: "Energy asset predictive maintenance AI monitors sensors on critical infrastructure — wind turbines (vibration, temperature, power output, pitch angle), transformers (dissolved gas analysis, thermal imaging, load history), pipelines (pressure, flow, corrosion sensors), and power plants (boiler performance, generator health indicators) — to predict failures 1–8 weeks in advance. This enables planned maintenance during low-demand periods, reduces emergency repair costs by 30–50%, and prevents costly unplanned outages that can cost millions per hour for large utilities." },
    { question: "How do energy trading firms use AI?", answer: "Energy trading AI provides: price forecasting (ML models combining weather, demand patterns, supply fundamentals, and market microstructure data to forecast day-ahead and real-time prices); portfolio optimization (AI optimizes asset dispatch and trading positions across a portfolio of generation, storage, and demand assets); risk management (AI monitors position risk, correlation exposure, and regulatory compliance in real time); and market intelligence (AI analyzes market news, regulatory filings, and competitor behavior for trading strategy insights)." },
    { question: "How does AI support smart grid management?", answer: "Smart grid AI applications: demand response optimization (AI predicts customer response to price signals and dispatches demand response events to balance grid load without manual intervention); distribution automation (AI detects faults, isolates problems, and reroutes power automatically without dispatcher intervention, reducing outage duration); load forecasting (AI predicts hourly, daily, and seasonal demand at the feeder and substation level for capacity planning); and distributed energy resource management (AI coordinates behind-the-meter solar, storage, and EV charging as grid resources)." },
    { question: "What AI use cases exist for oil and gas companies?", answer: "Oil and gas AI applications: exploration (AI analyzes seismic data for subsurface interpretation, reducing exploration drilling risk); drilling optimization (AI recommends drilling parameters in real time to maximize rate of penetration while managing well integrity); production optimization (AI models reservoir behavior and recommends lift optimization strategies for each well); pipeline integrity (AI analyzes inline inspection data for corrosion detection and prioritizes repair work); HSE monitoring (AI monitors site conditions, worker behavior, and equipment status for safety hazards); and emissions monitoring (AI tracks and optimizes methane emissions from production operations)." },
    { question: "How does AI support energy companies' ESG and sustainability goals?", answer: "Energy AI supports ESG through: emissions tracking (AI integrates operational data across facilities to calculate real-time emissions intensity and identify reduction opportunities); decarbonization planning (AI models the cost and schedule of different decarbonization pathways to optimize the transition plan); renewable integration planning (AI identifies optimal renewable development locations and grid interconnection requirements); carbon accounting (AI automates emissions reporting across Scope 1, 2, and 3 categories); and climate risk modeling (AI quantifies the financial impact of physical climate risks on energy assets)." },
    { question: "What data challenges exist in deploying AI for energy companies?", answer: "Energy AI faces several data challenges: OT/IT separation (operational technology systems — SCADA, DCS, PI historian — are isolated from IT networks for security reasons, making data integration complex); data historian volumes (process data comes at high frequency from thousands of sensors, requiring specialized time-series storage and processing); data quality (sensor calibration drift, missing readings, and erroneous values require robust data quality monitoring); and legacy system integration (many energy companies operate equipment with 20–40 year lifetimes, running industrial protocols like Modbus, DNP3, and IEC 61850 that require specialized connectors)." },
    { question: "How do utilities use AI for customer service and demand response?", answer: "Utility customer service AI handles: outage reporting and status (AI-powered IVR and chatbot providing real-time outage information without call center staffing during storm events); bill inquiry and payment (AI answers billing questions, sets up payment plans, and processes adjustments); demand response enrollment (AI identifies customers most likely to enroll and responds to enrollment requests automatically); energy efficiency recommendations (AI analyzes usage data and building characteristics to recommend personalized efficiency improvements); and smart meter support (AI troubleshoots meter connectivity and data issues)." },
    { question: "What is the role of AI in the energy transition?", answer: "AI is a critical enabler of the energy transition: it manages the complexity of a grid with billions of distributed energy resources (solar panels, EV chargers, home batteries) that weren't designed for centralized dispatch; it enables higher renewable penetration by improving forecast accuracy and grid flexibility; it optimizes the cost of decarbonization by finding the most efficient pathway through the transition; it monitors and enforces emissions compliance; and it helps energy companies navigate the regulatory complexity of a rapidly changing policy environment. Without AI, the operational complexity of the energy transition would make it significantly more expensive and slower." },
  ],
};
