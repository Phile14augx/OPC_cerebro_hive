import { Industry } from "./types";

export const construction: Industry = {
  name: "Construction",
  slug: "construction",
  color: "#F97316", // Orange
  engineConfig: {
    heroTheme: "construction",
    backgroundAnimation: "smart-factory",
    primaryColor: "#F97316", // Orange
    secondaryColor: "#64748B", // Steel Gray
    accentColor: "#06B6D4" // Cyan
  },
  hero: {
    title: "Building Intelligent Infrastructure",
    subtitle: "CONSTRUCTION AI",
    description: "Mitigate project delays, control costs, and ensure site safety with AI-driven construction intelligence.",
    primaryCta: "Explore Construction AI",
    secondaryCta: "View Architecture",
  },
  overview: {
    maturityScore: 70,
    currentChallengesSummary: "Project delays and supply chain friction.",
    opportunitySummary: "AI-driven scheduling and digital twin simulations.",
    statistics: [
      { metric: "15%", label: "Cost Savings" },
      { metric: "30%", label: "Faster Delivery" },
      { metric: "Zero", label: "Safety Incidents" }
    ]
  },
  segments: ["Commercial", "Residential", "Infrastructure", "Industrial", "Architecture", "Engineering"],
  challenges: [
    {
      title: "Project Delays",
      pain: "Inefficient scheduling and unforeseen site conditions.",
      cost: "Significant cost overruns and penalties",
      businessImpact: "Margin Compression",
      priority: "Critical",
      category: "Operations",
      problems: ["Weather Delays", "Subcontractor Clashes", "Supply Shortages", "Manual Scheduling"],
      solutions: ["Schedule Intelligence AI", "Generative Scheduling", "Weather Forecasting", "Clash Detection"],
      outcomes: ["↑ On-Time Delivery", "↓ Labor Idle Time", "↑ Schedule Predictability"],
      techStack: ["Neo4j", "OpenAI", "AWS", "PostgreSQL"],
      aiAgent: "Planning Agent",
      readiness: { implementation: "14 Weeks", complexity: "High", roi: "Very High" }
    },
    {
      title: "Cost Overruns",
      pain: "Poor estimation and material waste.",
      cost: "10-20% margin erosion",
      businessImpact: "Revenue Leakage",
      priority: "High",
      category: "Operations",
      problems: ["Inaccurate Bids", "Material Waste", "Rework", "Scope Creep"],
      solutions: ["BIM AI", "Parametric Estimating", "Automated Takeoffs", "Waste Tracking"],
      outcomes: ["↑ Bid Accuracy", "↓ Material Waste", "↑ Project Margins"],
      techStack: ["Autodesk Forge", "Databricks", "Pinecone", "LangChain"],
      aiAgent: "Project Agent",
      readiness: { implementation: "12 Weeks", complexity: "Medium", roi: "High" }
    },
    {
      title: "Safety",
      pain: "Accidents and compliance violations on site.",
      cost: "High insurance premiums and project halts",
      businessImpact: "Regulatory Fines",
      priority: "Critical",
      category: "Risk",
      problems: ["PPE Non-compliance", "Hazardous Conditions", "Delayed Reporting", "Poor Training"],
      solutions: ["Safety AI", "Computer Vision Monitoring", "Automated Alerts", "Wearable IoT"],
      outcomes: ["↓ Safety Incidents", "↓ Insurance Premiums", "↑ Compliance"],
      techStack: ["OpenCV", "Azure IoT", "Kafka", "React"],
      aiAgent: "Safety Agent",
      readiness: { implementation: "8 Weeks", complexity: "Medium", roi: "High" }
    }
  ],
  opportunityMatrix: [
    { name: "Procurement Intelligence", description: "Automated sourcing and material tracking.", roi: "High" }
  ],
  architecture: {
    nodes: [
      { id: "site", position: { x: 0, y: 150 }, data: { label: "Construction Site", type: "client" } },
      { id: "bim", position: { x: 200, y: 150 }, data: { label: "BIM System", type: "system", status: "Healthy" } },
      { id: "ai", position: { x: 400, y: 150 }, data: { label: "Construction AI", type: "ai", status: "Active" } },
      { id: "erp", position: { x: 600, y: 150 }, data: { label: "ERP", type: "database" } }
    ],
    edges: []
  },
  agents: [
    { name: "Project Agent", description: "Manages timelines and budgets.", capabilities: ["Scheduling"] },
    { name: "Safety Agent", description: "Monitors site conditions.", capabilities: ["Vision AI"] }
  ],
  erpIntegration: ["Finance", "Procurement", "Project Management"],
  techStack: [{ layer: "Design", technologies: ["BIM", "AutoCAD"] }],
  outcomes: [],
  caseStudy: { client: "Global Builder", title: "AI Scheduling", timeline: "9 Months", architecture: "Construction AI", outcome: "Success", metric: "20%" },
  roadmap: [],
  compliance: [{ badge: "OSHA", description: "Occupational Safety and Health Administration" }],
  relatedProducts: [],
  relatedSolutions: [],
  resources: [],

  seo: {
    title: "Construction AI Solutions | Project Management AI, Safety & BIM Intelligence | CerebroHive",
    description: "CerebroHive deploys AI for construction companies — project management AI, safety monitoring, BIM intelligence, procurement AI, schedule optimization, and construction document processing.",
    keywords: ["construction AI solutions", "construction project management AI", "construction safety AI", "BIM AI", "construction schedule AI", "construction document AI", "building AI technology", "AEC AI solutions", "construction procurement AI"],
  },

  faqs: [
    { question: "How is AI transforming the construction industry?", answer: "Construction AI transforms project delivery through: project management (AI monitors project health across schedules, costs, and risks, alerting project managers to issues before they become crises); safety monitoring (AI-powered computer vision monitors job sites for safety violations, PPE compliance, and hazardous conditions in real time); document intelligence (AI extracts, classifies, and cross-references information from drawings, specifications, contracts, and submittals — reducing RFI and submittal processing time by 60–70%); scheduling (AI optimizes construction sequences and crew allocation considering dependencies, resource availability, and weather); and procurement (AI analyzes bids, evaluates subcontractor performance, and optimizes material purchasing)." },
    { question: "How does AI-powered computer vision improve construction site safety?", answer: "Construction safety AI monitors job site camera feeds in real time to detect: PPE violations (missing hard hats, high-visibility vests, safety glasses, gloves); dangerous proximity (workers or equipment in exclusion zones near heavy machinery or excavations); slip and fall hazards (wet surfaces, cluttered walkways, improperly stored materials); unauthorized access (people in areas restricted during active work); and ergonomic risk (lifting posture, manual material handling patterns associated with injury risk). Safety AI alerts site supervisors immediately when violations are detected, creating an always-on safety monitor that doesn't experience attention fatigue." },
    { question: "How does AI help with construction project scheduling?", answer: "Construction scheduling AI addresses the complexity of coordinating hundreds of interdependent activities, crews, subcontractors, and material deliveries: sequence optimization (AI identifies optimal activity sequences to minimize critical path length); resource leveling (AI smooths resource demands to avoid crew underutilization or overloading); weather sensitivity (AI adjusts schedules based on weather forecasts, automatically rescheduling weather-sensitive activities); delay prediction (AI identifies schedule risks 2–4 weeks in advance based on progress tracking, material delivery statuses, and subcontractor capacity); and recovery planning (AI suggests recovery options when delays occur, modeling the cost and schedule impact of different scenarios)." },
    { question: "What is BIM AI and how does it change design and construction?", answer: "BIM (Building Information Modeling) AI applies intelligence to the 3D digital model of a building: clash detection automation (AI identifies conflicts between structural, mechanical, electrical, and plumbing systems in the BIM model, reducing costly field corrections); quantity takeoff automation (AI extracts material quantities from BIM models automatically for cost estimating); constructability analysis (AI identifies sequences where the model as designed would be difficult or impossible to build, suggesting alternatives); energy optimization (AI simulates building performance and recommends design modifications to improve energy efficiency); and as-built comparison (AI compares field conditions to the BIM model to identify deviations for documentation and correction)." },
    { question: "How does AI improve construction document management?", answer: "Construction document management AI handles the massive volume of information in large construction projects: drawing management (AI classifies, names, and links drawings to the relevant specifications and schedules); RFI processing (AI searches the document set for information responsive to RFIs and drafts answers for engineer/architect review, reducing response time from days to hours); submittal review (AI compares submittals to specification requirements and flags deviations for reviewer attention); change order analysis (AI analyzes the scope and cost impact of proposed changes against the contract documents); and dispute documentation (AI retrieves relevant communications, schedules, and specifications for claims analysis)." },
    { question: "What AI applications exist for construction cost estimating?", answer: "Construction cost estimating AI: quantity takeoff automation (AI extracts material quantities from drawings and specifications, reducing takeoff time by 60–80%); historical data benchmarking (AI compares current estimate components against historical project data to identify outliers and risks); subcontractor bid leveling (AI normalizes subcontractor bids for comparison, identifying scope gaps and exclusions); material price forecasting (AI models material price trends for copper, steel, concrete, and lumber to inform escalation allowances); and risk quantification (AI analyzes project complexity factors to estimate contingency requirements based on historical risk patterns for similar projects)." },
    { question: "How does AI help general contractors manage subcontractors?", answer: "Subcontractor management AI: prequalification (AI scores subcontractor financial health, safety record, and relevant project experience for prequalification decisions); performance tracking (AI aggregates quality, safety, and schedule performance data across subcontractors for ongoing ratings); payment processing (AI validates pay applications against schedule of values and completed work documentation); default risk (AI monitors subcontractor financial indicators and market signals for early warning of financial difficulty); and dispute analysis (AI reviews subcontractor claims against contract documents, daily reports, and schedule data to identify merit and quantum)." },
    { question: "How do owners use AI for construction project oversight?", answer: "Construction owner AI: schedule monitoring (AI tracks actual vs. planned progress from site photos, reports, and sensor data — without relying solely on GC self-reporting); budget analysis (AI monitors committed costs, approved changes, and trends to project final cost at completion with confidence intervals); risk dashboard (AI aggregates schedule, budget, quality, and safety indicators into a single project health view for owner executives); claims prevention (AI monitors for conditions precedent to claims — schedule impacts, owner-caused delays, changed conditions — and triggers documentation requirements); and commissioning (AI monitors building systems during commissioning to identify performance deficiencies before occupancy)." },
    { question: "What AI tools help architects and engineers in design?", answer: "Architecture and engineering design AI: generative design (AI explores thousands of design alternatives to find configurations that optimize for space, structural efficiency, energy performance, and cost simultaneously); code compliance checking (AI reviews designs against building codes and zoning requirements automatically); structural analysis assistance (AI interprets structural analysis results and flags areas requiring engineering judgment); MEP coordination (AI automates the mechanical, electrical, and plumbing coordination process that is traditionally manual and time-consuming); and specification writing (AI generates specification sections from project requirements and selected systems, drawing on standardized specification content)." },
    { question: "What are the ROI metrics for construction AI investments?", answer: "Construction AI ROI metrics: safety AI typically achieves 20–40% reduction in incident rate (direct savings in workers' compensation, project delays from injuries, and reputational impact); document management AI delivers 60–70% reduction in RFI and submittal processing time (directly reducing project admin costs); scheduling AI reduces schedule slippage by 15–25% on complex projects (saving 1–3% of project cost from delay-related impacts); estimating AI reduces takeoff time by 50–70% (enabling teams to bid more work with the same resources); and project controls AI improves cost forecast accuracy by 15–20% at project midpoint (enabling better contingency management and early corrective action)." },
  ],
};
