import { Industry } from "./types";

export const finance: Industry = {
  name: "Financial Services",
  slug: "finance",
  color: "#0B5FFF", // Deep Blue
  
  tier: "Core Enterprise",
  category: "Finance",
  subcategory: "Banking & Capital Markets",
  featured: true,
  
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
  
  maturity: {
    aiAdoption: 8,
    automation: 9,
    knowledge: 7
  },
  
  aiOpportunities: [
    { domain: "Fraud & Risk", score: 10 },
    { domain: "Compliance", score: 9 },
    { domain: "Wealth Management", score: 7 },
    { domain: "Customer Experience", score: 8 }
  ],

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
    { badge: "PCI DSS", description: "Payment Card Industry Data Security Standard", whyItMatters: "Secures credit card transactions.", affectedWorkflows: ["Payments"] },
    { badge: "ISO 27001", description: "Information Security Management", whyItMatters: "Ensures information security.", affectedWorkflows: ["IT Infrastructure"] },
    { badge: "SOC 2", description: "System and Organization Controls", whyItMatters: "Validates cloud security practices.", affectedWorkflows: ["Cloud"] },
    { badge: "Basel III", description: "Global Regulatory Framework for Banks", whyItMatters: "Governs capital adequacy.", affectedWorkflows: ["Treasury", "Risk"] },
    { badge: "GDPR", description: "General Data Protection Regulation" },
    { badge: "SOX", description: "Sarbanes-Oxley Act", whyItMatters: "Governs financial reporting.", affectedWorkflows: ["Accounting"] },
    { badge: "KYC", description: "Know Your Customer", whyItMatters: "Mandates identity verification.", affectedWorkflows: ["Onboarding"] },
    { badge: "AML", description: "Anti-Money Laundering", whyItMatters: "Prevents illegal money transfers.", affectedWorkflows: ["Transactions"] }
  ],
  
  relatedIndustries: ["healthcare", "government", "retail"],
  
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
  ],

  seo: {
    title: "Financial Services AI Solutions | AI for Banking, Insurance & FinTech | CerebroHive",
    description: "CerebroHive deploys AI for financial services — fraud detection, credit risk AI, regulatory reporting automation, AML monitoring, wealth management AI, and compliant LLM infrastructure for banks and insurers.",
    keywords: [
      "financial services AI", "banking AI solutions", "AI fraud detection",
      "credit risk AI", "AML AI monitoring", "regulatory reporting AI",
      "fintech AI consulting", "wealth management AI", "insurance AI solutions",
      "SR 11-7 model risk", "financial AI compliance", "FFIEC AI guidance",
    ],
  },

  faqs: [
    {
      question: "How is AI used in financial services?",
      answer: "Financial services AI spans six major domains: fraud and financial crime (real-time transaction anomaly detection, AML monitoring, sanctions screening); credit and lending (alternative data credit scoring, loan origination automation, portfolio risk assessment); customer experience (AI-powered financial advisors, intelligent customer service, personalized product recommendations); regulatory compliance (automated regulatory reporting, regulatory change monitoring, audit trail generation); trading and investment (sentiment analysis, algorithmic strategy optimization, risk factor modeling); and operations (document processing, KYC/AML onboarding, reconciliation).",
    },
    {
      question: "How does AI improve fraud detection in banking?",
      answer: "AI fraud detection improves on rule-based systems by identifying complex, evolving fraud patterns that static rules miss. Machine learning models analyze hundreds of behavioral and contextual signals simultaneously — transaction velocity, device fingerprinting, geolocation consistency, merchant category patterns, time-series anomalies — and score transactions in real time (sub-100ms latency). CerebroHive builds fraud detection systems that achieve 95%+ precision (low false positives) while maintaining high recall on novel fraud patterns, with model explainability for regulatory review.",
    },
    {
      question: "What is model risk management (SR 11-7) and how does CerebroHive ensure compliance?",
      answer: "SR 11-7 (Federal Reserve Supervisory Guidance on Model Risk Management) requires banks to govern all models used for risk assessment, credit decisions, pricing, and reporting through a formal Model Risk Management (MRM) framework. This includes: model inventory and documentation; independent model validation (IV) by a team separate from model developers; model performance monitoring and back-testing; and governance oversight by model risk committees. CerebroHive produces SR 11-7 compliant documentation for all AI models it builds, supports independent validation processes, and designs monitoring systems that satisfy MRM requirements.",
    },
    {
      question: "Can AI help with AML (Anti-Money Laundering) compliance?",
      answer: "Yes — AI significantly improves AML effectiveness over traditional rule-based systems. AI applications include: transaction monitoring (identifying suspicious patterns that rules miss, reducing false positive rates by 40–60%); suspicious activity report (SAR) narrative generation (AI drafts SAR narratives from investigation data, saving analyst time); customer risk scoring (dynamic risk assessment integrating behavioral, network, and contextual data); and network analysis (identifying money laundering rings through graph analytics on transaction networks). CerebroHive builds AML AI systems with full audit trails and regulatory examination readiness.",
    },
    {
      question: "How does generative AI help financial institutions with regulatory reporting?",
      answer: "Generative AI automates the most labor-intensive parts of regulatory reporting: data extraction from multiple source systems into standardized formats; rule interpretation (translating regulatory requirements into data transformation logic); report narrative generation (writing qualitative commentary sections based on quantitative data); exception identification and documentation; and change tracking (monitoring regulatory changes and flagging reports that need updating). Financial institutions using AI for regulatory reporting reduce reporting cycle time by 30–50% and free compliance analysts for higher-value tasks.",
    },
    {
      question: "How do you ensure AI models are fair and unbiased in credit decisions?",
      answer: "CerebroHive implements fair lending compliance into credit AI from the ground up: proxy variable identification and removal (identifying variables that are proxies for protected characteristics like race, gender, or religion); disparate impact analysis (testing whether model outcomes differ significantly across demographic groups); adverse action reason code generation (providing ECOA/FCRA-compliant explanations for credit denials); and ongoing monitoring for disparate impact drift. We align all credit models with ECOA, Fair Housing Act, and CFPB guidance on algorithmic fairness.",
    },
    {
      question: "What AI use cases are viable for insurance companies?",
      answer: "Insurance AI spans underwriting (automated risk assessment, document extraction from applications, pricing optimization); claims processing (first notice of loss automation, damage assessment from images and documents, fraud detection, subrogation identification); customer service (AI-powered claims status, policy inquiry, coverage explanation); product personalization (usage-based insurance, behavioral pricing); and risk management (catastrophe modeling, portfolio concentration analysis, reinsurance optimization). CerebroHive has delivered AI systems for P&C, life, and health insurers.",
    },
    {
      question: "How do wealth management firms use AI?",
      answer: "Wealth management AI applications include: client communication automation (AI-generated portfolio commentary, rebalancing rationale, market update summaries); proposal generation (automated investment proposal documents from client financial profiles); portfolio risk analysis (real-time risk factor exposure, scenario analysis, ESG scoring); compliance monitoring (suitability checking, trade surveillance, regulation best interest documentation); and prospecting (AI-powered lead scoring, relationship intelligence from CRM and market data, next-best-action recommendations).",
    },
    {
      question: "Can AI be deployed on-premises in financial institutions that prohibit cloud data sharing?",
      answer: "Yes — CerebroHive specializes in on-premises and private cloud AI deployments for financial institutions with strict data residency and cloud restrictions. Approaches include: air-gapped deployment (fully on-premises LLMs like Llama 3 or Mistral deployed on private GPU infrastructure); VPC-isolated cloud (all data and models within the institution's own cloud tenant, never shared with AI providers); federated learning (models trained across distributed data without centralizing sensitive data); and customer-managed encryption (all data encrypted with institution-owned keys). We have delivered compliant AI infrastructure for tier-1 banks.",
    },
    {
      question: "How long does a financial services AI deployment typically take?",
      answer: "Financial services AI timelines are longer than other industries due to regulatory requirements, security reviews, and procurement processes. A fraud detection model can be in production in 12–16 weeks; a credit scoring model requires 20–32 weeks (including independent validation); an AML transaction monitoring system takes 24–40 weeks (vendor approval, BSA officer sign-off, regulatory notification in some cases); and a full regulatory reporting automation program takes 6–12 months. CerebroHive plans for these timelines from the start and works with your compliance, legal, and procurement teams from day one.",
    },
  ],
};
