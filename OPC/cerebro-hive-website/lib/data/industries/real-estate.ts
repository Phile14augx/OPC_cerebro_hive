import { Industry } from "./types";

export const realEstate: Industry = {
  name: "Real Estate & PropTech",
  slug: "real-estate",
  color: "#EAB308", // Gold

  tier: "Enterprise Verticals",
  category: "Real Estate",
  subcategory: "Commercial, Residential, Industrial & REITs",
  featured: true,

  engineConfig: {
    heroTheme: "real-estate",
    backgroundAnimation: "transaction-network",
    primaryColor: "#EAB308", // Gold
    secondaryColor: "#1E3A8A", // Navy
    accentColor: "#10B981" // Emerald
  },

  hero: {
    title: "AI-Powered Property Intelligence",
    subtitle: "PROPTECH AI",
    description: "Optimize building performance, elevate tenant experiences, and maximize portfolio yield with autonomous, segment-specialized property intelligence.",
    primaryCta: "Book Industry Workshop",
    secondaryCta: "Download Blueprint"
  },

  overview: {
    maturityScore: 68,
    currentChallengesSummary: "Fragmented portfolio data, reactive maintenance, manual leasing pipelines, and siloed underwriting suppress NOI across commercial, residential, and industrial holdings.",
    opportunitySummary: "Segment-specialized leasing agents, predictive facility management, digital-twin buildings, and automated underwriting unlock portfolio-wide yield and compress time-to-decision.",
    statistics: [
      { metric: "25%", label: "Energy Savings" },
      { metric: "40%", label: "Faster Leasing" },
      { metric: "95%", label: "Tenant Retention" },
      { metric: "3.2x", label: "Portfolio ROI" }
    ]
  },

  maturity: {
    aiAdoption: 5,
    automation: 5,
    knowledge: 6
  },

  aiOpportunities: [
    { domain: "Leasing & Marketing", score: 9 },
    { domain: "Facilities & Energy", score: 8 },
    { domain: "Investment & Underwriting", score: 7 },
    { domain: "Tenant Experience", score: 8 },
    { domain: "Compliance & ESG", score: 6 }
  ],

  segments: [
    "Commercial Office",
    "Multifamily Residential",
    "Industrial & Logistics",
    "Retail Centers",
    "REITs & Investment Funds",
    "Property Management",
    "Facilities & Energy",
    "Construction & Development"
  ],

  challenges: [
    {
      title: "Multifamily Leasing & Renewals",
      pain: "Slow lead response and manual renewal negotiations drive up vacancy across residential portfolios.",
      cost: "Lost rental income and elevated turnover costs",
      businessImpact: "Capital Inefficiency",
      priority: "Critical",
      category: "Pricing",
      problems: ["Slow Lead Qualification", "Manual Tour Scheduling", "Static Pricing Models", "Reactive Renewal Outreach"],
      solutions: ["Multifamily Leasing Agent", "Automated Lead Scoring", "AI Virtual Tours", "Dynamic Rent Pricing Engine"],
      outcomes: ["↓ Days on Market", "↑ Lead-to-Lease Conversion", "↑ Renewal Rate"],
      techStack: ["Pinecone", "Elasticsearch", "AWS", "Python"],
      aiAgent: "Multifamily Leasing Agent",
      readiness: { implementation: "10 Weeks", complexity: "Medium", roi: "High" }
    },
    {
      title: "Commercial Office Tenant Experience",
      pain: "Slow response to tenant service requests and poor space-utilization visibility erode retention in office portfolios.",
      cost: "High vacancy and reduced effective rent",
      businessImpact: "Revenue Leakage",
      priority: "High",
      category: "Customer",
      problems: ["Slow Maintenance Response", "Poor Tenant Communication", "Manual Renewals", "Unclear Space Utilization"],
      solutions: ["Commercial Tenant Concierge Agent", "Omnichannel Service Bot", "Smart Building App", "Space Utilization Analytics"],
      outcomes: ["↑ Tenant Satisfaction", "↑ Renewal Rate", "↓ Vacancy"],
      techStack: ["OpenAI", "LangGraph", "Twilio", "PostgreSQL"],
      aiAgent: "Commercial Tenant Concierge Agent",
      readiness: { implementation: "8 Weeks", complexity: "Low", roi: "Very High" }
    },
    {
      title: "Industrial & Logistics Facility Operations",
      pain: "Reactive maintenance and manual dock/warehouse scheduling create downtime across distribution and logistics assets.",
      cost: "Unplanned downtime and premium emergency repair costs",
      businessImpact: "Operational Friction",
      priority: "High",
      category: "Operations",
      problems: ["Reactive Maintenance", "Manual Dock Scheduling", "Energy Waste", "Fragmented Vendor Management"],
      solutions: ["Industrial Facility Agent", "Predictive Maintenance AI", "Automated Dock Scheduling", "Vendor Performance Scoring"],
      outcomes: ["↓ Unplanned Downtime", "↓ Energy Spend", "↑ Asset Uptime"],
      techStack: ["Databricks", "Azure IoT", "React", "Node.js"],
      aiAgent: "Industrial Facility Agent",
      readiness: { implementation: "12 Weeks", complexity: "Medium", roi: "High" }
    },
    {
      title: "REIT Investment Underwriting",
      pain: "Manual deal screening and inconsistent market comps slow acquisition cycles and increase mispricing risk for investment funds.",
      cost: "Missed acquisitions and mispriced capital deployment",
      businessImpact: "Financial Instability",
      priority: "Critical",
      category: "Risk",
      problems: ["Manual Deal Screening", "Inconsistent Market Comps", "Slow Due Diligence", "Fragmented Portfolio Reporting"],
      solutions: ["Underwriting AI Agent", "Automated Comp Analysis", "Document AI Due Diligence", "Portfolio Risk Dashboard"],
      outcomes: ["↓ Time to Term Sheet", "↑ Underwriting Accuracy", "↑ Deal Velocity"],
      techStack: ["Anthropic", "Snowflake", "Kafka", "Tableau"],
      aiAgent: "Underwriting & Investment Agent",
      readiness: { implementation: "14 Weeks", complexity: "High", roi: "High" }
    },
    {
      title: "Portfolio-Wide ESG & Compliance Reporting",
      pain: "Manual data collection across mixed-use portfolios delays ESG disclosures and fair-housing compliance audits.",
      cost: "Regulatory penalties and investor reporting delays",
      businessImpact: "Administrative Burden",
      priority: "Medium",
      category: "Compliance",
      problems: ["Manual ESG Data Collection", "Fragmented Compliance Records", "Fair Housing Audit Gaps", "Delayed GRESB Submissions"],
      solutions: ["Compliance & ESG Agent", "Automated GRESB Reporting", "Fair Housing Monitoring", "Unified Portfolio Data Layer"],
      outcomes: ["↓ Reporting Cycle Time", "↑ Audit Readiness", "↑ ESG Score"],
      techStack: ["Neo4j", "GCP", "Looker", "Airflow"],
      aiAgent: "Compliance & ESG Agent",
      readiness: { implementation: "9 Weeks", complexity: "Medium", roi: "Medium" }
    }
  ],

  opportunityMatrix: [
    { name: "Facility Intelligence", description: "Smart HVAC, lighting, and energy optimization across building types.", roi: "High" },
    { name: "AI Leasing & Marketing", description: "Segment-specialized lead scoring, virtual tours, and dynamic pricing.", roi: "High" },
    { name: "Predictive Maintenance", description: "IoT-driven failure prediction for industrial and multifamily assets.", roi: "High" },
    { name: "Underwriting Automation", description: "AI-assisted deal screening and comp analysis for acquisitions.", roi: "Medium" },
    { name: "Digital Twin Buildings", description: "Real-time simulation of building performance and tenant flows.", roi: "Medium" },
    { name: "ESG & Compliance Automation", description: "Automated GRESB, LEED, and fair-housing reporting.", roi: "Emerging" }
  ],

  architecture: {
    nodes: [
      { id: "building", position: { x: 0, y: 150 }, data: { label: "Smart Building / Portfolio", type: "client" } },
      { id: "iot", position: { x: 200, y: 150 }, data: { label: "IoT Gateway", type: "gateway", status: "Healthy" } },
      { id: "lakehouse", position: { x: 400, y: 150 }, data: { label: "Property Data Lakehouse", type: "database" } },
      { id: "ai", position: { x: 600, y: 150 }, data: { label: "PropTech AI Core", type: "ai", status: "Active" } },
      { id: "leasing_agent", position: { x: 800, y: 80 }, data: { label: "Leasing Agent", type: "agent" } },
      { id: "facility_agent", position: { x: 800, y: 220 }, data: { label: "Facility Agent", type: "agent" } },
      { id: "underwriting_agent", position: { x: 1000, y: 150 }, data: { label: "Underwriting Agent", type: "agent" } },
      { id: "dashboard", position: { x: 1200, y: 150 }, data: { label: "Portfolio Dashboard", type: "system" } }
    ],
    edges: []
  },

  workflows: {
    nodes: [],
    edges: []
  },

  agents: [
    { name: "Multifamily Leasing Agent", description: "Qualifies residential leads, schedules tours, and negotiates renewals.", capabilities: ["Lead Scoring", "NLP Negotiation"], tools: ["CRM", "Virtual Tour Engine"], outputs: ["Qualified Leads", "Signed Renewals"] },
    { name: "Commercial Tenant Concierge Agent", description: "Handles office and retail tenant requests and renewal workflows.", capabilities: ["Omnichannel Support", "Sentiment Analysis"], tools: ["Ticketing System", "Smart Building App"], outputs: ["Resolved Tickets", "Renewal Offers"] },
    { name: "Industrial Facility Agent", description: "Predicts equipment failure and schedules dock/warehouse operations across logistics assets.", capabilities: ["Predictive Maintenance", "IoT Analytics"], tools: ["BMS", "Work Order System"], outputs: ["Maintenance Schedules", "Uptime Reports"] },
    { name: "Underwriting & Investment Agent", description: "Screens acquisition targets and automates comp analysis for REITs and funds.", capabilities: ["Deal Screening", "Comp Analysis"], tools: ["Market Data Feeds", "Document AI"], outputs: ["Deal Memos", "Risk Scores"] },
    { name: "Portfolio Intelligence Agent", description: "General-purpose cross-segment agent that aggregates performance, ESG, and compliance signals across the entire portfolio.", capabilities: ["Cross-Portfolio Analytics", "Anomaly Detection"], tools: ["Data Lakehouse", "BI Dashboard"], outputs: ["Portfolio Health Reports", "Risk Alerts"] }
  ],

  erpIntegration: [
    "Property Management System",
    "Lease Accounting",
    "Maintenance & Work Orders",
    "Tenant Billing",
    "Capital Projects",
    "Asset & Portfolio Management"
  ],

  techStack: [
    { layer: "AI Models", technologies: ["Claude 3 Opus", "GPT-4o", "Fine-tuned Vision Models"] },
    { layer: "IoT & Building Systems", technologies: ["Smart Sensors", "HVAC Controllers", "BMS Integrations"] },
    { layer: "Knowledge & Data", technologies: ["Neo4j", "Pinecone", "Snowflake"] },
    { layer: "Frontend", technologies: ["Next.js", "React Flow", "Framer Motion"] }
  ],

  outcomes: [
    { metric: "25%", label: "Energy Savings", description: "Across HVAC and lighting via predictive facility optimization" },
    { metric: "40%", label: "Faster Leasing", description: "Reduction in days-on-market via AI lead scoring and dynamic pricing" },
    { metric: "95%", label: "Tenant Retention", description: "Improved renewal rate from concierge and proactive maintenance agents" },
    { metric: "3.2x", label: "Portfolio ROI", description: "Return on AI investment across leasing, facilities, and underwriting" }
  ],

  caseStudy: {
    client: "Meridian Commercial REIT",
    title: "Portfolio-Wide Smart Building & Leasing Deployment",
    timeline: "16 Weeks",
    architecture: "PropTech AI Digital Twin Platform",
    outcome: "31% Operating Expense Reduction",
    metric: "31%"
  },

  roadmap: [
    { phase: "Phase 1", name: "Data Unification", description: "Integrate property management, IoT, and lease accounting systems into a single data lakehouse." },
    { phase: "Phase 2", name: "Segment Agent Pilots", description: "Deploy specialized leasing, tenant, and facility agents in pilot buildings per asset class." },
    { phase: "Phase 3", name: "Underwriting & ESG Automation", description: "Roll out investment underwriting agent and automated ESG/compliance reporting." },
    { phase: "Phase 4", name: "Portfolio-Wide Scale", description: "Deploy the full agent swarm and digital twin across the entire property portfolio." }
  ],

  compliance: [
    {
      badge: "Fair Housing Act",
      description: "U.S. federal law prohibiting discrimination in residential leasing and marketing",
      whyItMatters: "Governs how AI leasing and pricing agents screen and communicate with residential applicants.",
      affectedWorkflows: ["Lead Scoring", "Tenant Screening", "Marketing Outreach"],
      supportedProducts: ["AgentForge™", "HiveMatrix™"]
    },
    {
      badge: "LEED",
      description: "Leadership in Energy and Environmental Design",
      whyItMatters: "Certifies sustainable building performance monitored by facility and energy agents.",
      affectedWorkflows: ["Energy Management", "Facility Reporting"]
    },
    {
      badge: "GRESB / ESG",
      description: "Global Real Estate Sustainability Benchmark",
      whyItMatters: "Institutional investors require standardized ESG disclosures across property portfolios.",
      affectedWorkflows: ["Compliance Reporting", "Investor Disclosures"]
    },
    {
      badge: "SOC 2 Type II",
      description: "Security, Availability, and Confidentiality",
      whyItMatters: "Validates strict security practices for tenant and financial data via third-party audit."
    }
  ],

  relatedProducts: [
    "AgentForge™",
    "HiveMatrix™",
    "Cerebro Analytics"
  ],

  relatedSolutions: [
    "AI Agents & Digital Workforce",
    "Predictive Analytics & Forecasting",
    "AI Customer Experience Platform"
  ],

  relatedIndustries: [
    "construction", // Development and capital projects overlap
    "finance", // Investment underwriting overlap
    "insurance" // Property and casualty overlap
  ],

  resources: [
    { title: "PropTech AI Architecture Guide", type: "Whitepaper", link: "/research" },
    { title: "Meridian Commercial REIT Deployment", type: "Case Study", link: "/research" },
    { title: "Segment-Specialized Leasing Agents", type: "Research Paper", link: "/research" }
  ],

  digitalTwin: {
    overview: {
      title: "Portfolio Operations & Leasing Twin",
      description: "End-to-end simulation of tenant leasing, facility maintenance, and portfolio reporting across commercial, residential, and industrial assets.",
      primaryNodes: ["prospect", "ai_agent", "dashboard"]
    },
    workflow: {
      nodes: [
        { id: "prospect", label: "Prospect / Tenant", type: "entity", icon: "user", purpose: "Lead inquiry or existing tenant service request" },
        { id: "pms", label: "Property Management System", type: "database", purpose: "Retrieve unit availability, lease terms, and tenant history" },
        { id: "segment_router", label: "Segment Router", type: "logic", purpose: "Route request to the specialized agent for the relevant asset class", processingTimeMs: 800 },
        { id: "ai_agent", label: "Specialized PropTech Agent", type: "agent", purpose: "Score lead, schedule maintenance, or negotiate renewal depending on segment" },
        { id: "pricing", label: "Dynamic Pricing Engine", type: "logic", purpose: "Calculate optimal rent or lease terms in real time", processingTimeMs: 1500 },
        { id: "offer", label: "Lease / Work Order", type: "system", purpose: "Generate lease offer or maintenance work order" },
        { id: "dashboard", label: "Portfolio Dashboard", type: "system", purpose: "Update occupancy, NOI, and asset health metrics" }
      ],
      connections: [
        { from: "prospect", to: "pms", animated: true },
        { from: "pms", to: "segment_router", animated: true },
        { from: "segment_router", to: "ai_agent", animated: true },
        { from: "ai_agent", to: "pricing", animated: true },
        { from: "pricing", to: "offer", animated: true },
        { from: "offer", to: "dashboard", animated: true }
      ]
    },
    architecture: {
      nodes: [
        { id: "iot_gateway", label: "IoT Gateway", type: "system", techStack: ["Azure IoT", "Smart Sensors"] },
        { id: "lake", label: "Property Data Lakehouse", type: "database", techStack: ["Snowflake"] },
        { id: "vector", label: "Vector Store", type: "database", techStack: ["Pinecone"] },
        { id: "llm", label: "PropTech LLM", type: "ai", techStack: ["Claude 3 Opus"] },
        { id: "orchestrator", label: "AgentOS", type: "system", techStack: ["LangGraph"] }
      ],
      connections: [
        { from: "iot_gateway", to: "lake" },
        { from: "lake", to: "vector" },
        { from: "vector", to: "llm" },
        { from: "llm", to: "orchestrator" }
      ]
    },
    agents: [
      { id: "leasing_agent", name: "Leasing Agent", role: "Lead Scoring & Negotiation" },
      { id: "facility_agent", name: "Facility Agent", role: "Predictive Maintenance" },
      { id: "underwriting_agent", name: "Underwriting Agent", role: "Deal Screening" }
    ],
    metrics: [
      { id: "buildings", label: "Buildings Monitored", startValue: 118, endValue: 120, format: "number" },
      { id: "occupancy", label: "Occupancy Rate", startValue: 92, endValue: 95, format: "percentage", suffix: "%" },
      { id: "energy", label: "Energy Savings", startValue: 22, endValue: 25, format: "percentage", suffix: "%" },
      { id: "response", label: "Response Time", startValue: 900, endValue: 320, format: "time", suffix: "ms" }
    ],
    events: [
      { timeOffset: 0, nodeId: "prospect", state: "receiving", message: "Inquiry Received" },
      { timeOffset: 1200, nodeId: "pms", state: "processing", message: "Availability Retrieved" },
      { timeOffset: 2400, nodeId: "segment_router", state: "processing", message: "Routed to Segment Agent" },
      { timeOffset: 3600, nodeId: "ai_agent", state: "reasoning", message: "Scoring Lead / Diagnosing Issue" },
      { timeOffset: 5800, nodeId: "ai_agent", state: "completed", message: "Assessment Complete" },
      { timeOffset: 6200, nodeId: "pricing", state: "executing", message: "Calculating Optimal Terms" },
      { timeOffset: 8000, nodeId: "offer", state: "completed", message: "Offer / Work Order Generated" },
      { timeOffset: 9200, nodeId: "dashboard", state: "monitoring", message: "Portfolio Metrics Updated" }
    ],
    integrations: ["Yardi", "AppFolio", "RealPage", "Azure IoT"]
  },

  seo: {
    title: "Real Estate AI Solutions | PropTech AI, Property Intelligence & CRE Analytics | CerebroHive",
    description: "CerebroHive deploys AI for real estate companies — property valuation AI, tenant experience AI, lease document intelligence, facility management AI, and CRE portfolio analytics.",
    keywords: ["real estate AI solutions", "PropTech AI", "property valuation AI", "CRE AI analytics", "tenant experience AI", "lease AI", "facility management AI", "real estate investment AI", "property management AI"],
  },

  faqs: [
    { question: "How is AI transforming real estate?", answer: "Real estate AI transforms across the property lifecycle: investment (AI analyzes market data, property fundamentals, and financial projections to score investment opportunities and model portfolio performance); leasing (AI powers smart search, personalized property recommendations, and automated tour scheduling for residential and commercial leasing); operations (AI manages building systems, predicts maintenance needs, and optimizes energy consumption for commercial and multifamily properties); tenant experience (AI-powered portals handle maintenance requests, payments, and communications autonomously); and transaction intelligence (AI assists with due diligence document review, title search, and contract analysis)." },
    { question: "How does AI power property valuation?", answer: "Property valuation AI uses automated valuation models (AVMs) that combine: comparable sales analysis (AI finds and weights the most relevant comparable transactions for each property using machine learning, outperforming traditional appraiser comp selection); hedonic pricing models (AI captures the value contribution of individual property attributes — bedrooms, location, school quality, transit access — trained on millions of transactions); market trend integration (AI incorporates current market momentum and local supply-demand dynamics); and condition adjustment (AI integrates property condition data from inspection reports, satellite imagery, and listing photos to adjust base valuations)." },
    { question: "What is a smart building and how does AI enable it?", answer: "A smart building uses AI to optimize its physical environment and operations: HVAC optimization (AI controls heating, cooling, and ventilation based on occupancy predictions, weather forecasts, and energy prices, reducing energy cost 15–30%); predictive maintenance (AI monitors building equipment — chillers, elevators, electrical systems — for failure precursors); occupancy intelligence (AI uses anonymized sensor data to understand how spaces are being used, informing space planning decisions); security (AI-powered access control, video analytics, and visitor management); and tenant experience (AI coordinates services, handles requests, and provides personalized building experiences through a mobile app)." },
    { question: "How does AI help with lease abstraction and document management?", answer: "Real estate AI handles the massive document burden in property management: lease abstraction (AI extracts key lease terms — rent, term, renewal options, operating expense provisions, use restrictions — from lease documents at a fraction of human time); lease comparison (AI flags material differences between proposed and standard lease forms); critical date monitoring (AI tracks lease expiration dates, option exercise windows, and rent escalation dates, alerting property managers in advance); diligence document review (AI processes stacks of leases, service contracts, and title documents in acquisition due diligence); and CAM reconciliation (AI validates landlord CAM calculations against lease provisions)." },
    { question: "What AI applications exist for commercial real estate investment management?", answer: "CRE investment management AI: deal sourcing (AI monitors market data, ownership records, and distress signals to identify acquisition opportunities before they're broadly marketed); underwriting automation (AI extracts rent rolls, operating statements, and market data to accelerate financial modeling); portfolio analytics (AI tracks portfolio performance across markets, property types, and vintages, identifying concentration risks and performance outliers); asset management (AI monitors property-level KPIs and flags underperforming assets requiring intervention); and disposition timing (AI models optimal hold-sell analysis based on projected market conditions and portfolio objectives)." },
    { question: "How does AI improve tenant experience in multifamily and commercial properties?", answer: "Tenant experience AI: maintenance request management (AI triages maintenance requests, dispatches vendors, and provides status updates autonomously); move-in and move-out (AI guides residents through move-in and move-out processes, inspections, and deposit handling); amenity booking (AI manages reservations for building amenities — conference rooms, fitness facilities, parking); concierge services (AI-powered building assistant answers resident questions, provides local recommendations, and coordinates building services); and renewal management (AI identifies renewal-risk residents early and triggers personalized retention interventions)." },
    { question: "What AI tools help residential real estate agents and brokerages?", answer: "Residential real estate AI: lead nurturing (AI personalizes communications with prospects based on their property search behavior, price range, and timeline); listing intelligence (AI analyzes comparable listings to recommend competitive pricing and optimal listing presentation); property description generation (AI writes compelling, accurate property descriptions from structured listing data); market analysis reports (AI generates comparative market analyses and neighborhood reports automatically); client matching (AI identifies which properties in the inventory best match each buyer's stated and revealed preferences); and transaction management (AI tracks contract milestones, reminds parties of upcoming deadlines, and prepares document checklists)." },
    { question: "How does AI help property managers with maintenance operations?", answer: "Property maintenance AI: work order prioritization (AI triages maintenance requests by urgency and operational impact, ensuring critical issues are addressed first); vendor dispatch optimization (AI routes vendors to minimize travel time and maximize first-call resolution rates); preventive maintenance scheduling (AI schedules preventive maintenance based on equipment age, usage, and failure history rather than fixed calendar intervals); cost analysis (AI tracks vendor performance, invoice accuracy, and cost per work order type for vendor management decisions); and procurement (AI analyzes parts and material spend to identify volume purchasing opportunities)." },
    { question: "Can AI predict real estate market trends and property appreciation?", answer: "Real estate market prediction AI integrates signals across: economic indicators (employment, income growth, population migration, interest rates); supply signals (permit activity, construction starts, inventory levels); demand signals (search volume, days on market, showing traffic, offer-to-list ratios); investment flows (institutional capital deployment, REIT activity, foreign investment patterns); and alternative data (credit card spending trends, job posting activity, mobility data). ML models trained on these signals can generate market forecasts at the ZIP code and neighborhood level with better accuracy than traditional appraisal-based methods — though no AI can perfectly predict future markets." },
    { question: "What PropTech platforms does CerebroHive integrate AI with?", answer: "CerebroHive integrates AI with major PropTech platforms: Yardi (property management, accounting, and investment management); AppFolio (residential property management); RealPage (multifamily property intelligence); MRI Software (commercial and residential property management); CoStar and Loopnet (commercial real estate data and marketing); Buildium (residential property management); and custom property management systems. We also integrate with building management systems (BACnet, Modbus, KNX protocols), IoT sensor platforms (Azure IoT Hub, AWS IoT Core), and smart building platforms (Siemens Desigo CC, Johnson Controls Metasys)." },
  ],
};
