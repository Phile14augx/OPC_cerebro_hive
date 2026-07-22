import { Industry } from "./types";

export const insurance: Industry = {
  name: "Insurance",
  slug: "insurance",
  color: "#1D4ED8", // Deep Blue
  engineConfig: {
    heroTheme: "insurance",
    backgroundAnimation: "transaction-network",
    primaryColor: "#1D4ED8", // Deep Blue
    secondaryColor: "#7E22CE", // Purple
    accentColor: "#06B6D4" // Cyan
  },
  hero: {
    title: "AI-Native Insurance Operations",
    subtitle: "INTELLIGENT INSURANCE",
    description: "Modernize underwriting, accelerate claims processing, and mitigate risk with predictive AI models.",
    primaryCta: "Explore Insurtech AI",
    secondaryCta: "View Architecture",
  },
  overview: {
    maturityScore: 90,
    currentChallengesSummary: "Manual claims processing and static risk models.",
    opportunitySummary: "Automated underwriting and real-time fraud prevention.",
    statistics: [
      { metric: "60%", label: "Faster Claims" },
      { metric: "30%", label: "Fraud Reduction" },
      { metric: "24/7", label: "Policy Support" }
    ]
  },
  segments: ["Property & Casualty", "Life Insurance", "Health Insurance", "Reinsurance", "Brokers"],
  challenges: [
    {
      title: "Claims Processing",
      pain: "Manual adjudication slows down payouts.",
      cost: "High operational costs and low customer satisfaction",
      businessImpact: "Customer Churn",
      priority: "Critical",
      category: "Operations",
      problems: ["Manual Review", "Inaccurate Estimates", "Slow Payouts", "Customer Frustration"],
      solutions: ["Claims AI Agent", "Computer Vision for Damage", "Automated Adjudication", "Instant Payouts"],
      outcomes: ["↓ Processing Time", "↓ Loss Adjustment Expense", "↑ NPS"],
      techStack: ["OpenCV", "Anthropic", "Kafka", "PostgreSQL"],
      aiAgent: "Claims Adjudication Agent",
      readiness: { implementation: "14 Weeks", complexity: "Medium", roi: "Very High" }
    },
    {
      title: "Fraud Detection",
      pain: "Undetected fraudulent claims bleeding revenue.",
      cost: "$80B+ annually across the industry",
      businessImpact: "Revenue Leakage",
      priority: "Critical",
      category: "Fraud",
      problems: ["Staged Accidents", "Exaggerated Claims", "Identity Theft", "Provider Fraud"],
      solutions: ["Fraud AI Agent", "Network Analytics", "Behavioral Scoring", "Anomaly Detection"],
      outcomes: ["↓ Fraud Losses", "↑ False Positive Ratio", "↑ Investigation Efficiency"],
      techStack: ["Neo4j", "Spark", "TensorFlow", "AWS"],
      aiAgent: "Fraud Detection Agent",
      readiness: { implementation: "12 Weeks", complexity: "High", roi: "Very High" }
    },
    {
      title: "Underwriting",
      pain: "Static pricing models failing to capture real-time risk.",
      cost: "Suboptimal pricing and lost margins",
      businessImpact: "Margin Compression",
      priority: "High",
      category: "Risk",
      problems: ["Data Silos", "Manual Risk Assessment", "Slow Quotes", "Inaccurate Pricing"],
      solutions: ["Underwriting AI Agent", "Alternative Data Sources", "Dynamic Pricing", "Automated Quoting"],
      outcomes: ["↑ Quote Speed", "↑ Loss Ratio Accuracy", "↑ Underwriter Capacity"],
      techStack: ["Databricks", "Pinecone", "Azure", "LangGraph"],
      aiAgent: "Intelligent Underwriter Agent",
      readiness: { implementation: "16 Weeks", complexity: "High", roi: "High" }
    }
  ],
  opportunityMatrix: [
    { name: "Policy Assistant", description: "AI-driven customer support for policy inquiries.", roi: "High" }
  ],
  architecture: {
    nodes: [
      { id: "customer", position: { x: 0, y: 150 }, data: { label: "Policyholder", type: "client" } },
      { id: "api", position: { x: 200, y: 150 }, data: { label: "Gateway", type: "gateway", status: "Healthy" } },
      { id: "ai", position: { x: 400, y: 150 }, data: { label: "Claims AI", type: "ai", status: "Active" } },
      { id: "core", position: { x: 600, y: 150 }, data: { label: "Core Systems", type: "system" } }
    ],
    edges: []
  },
  agents: [
    { name: "Claims Agent", description: "Automates the claims lifecycle.", capabilities: ["Adjudication"] },
    { name: "Underwriting Agent", description: "Assesses risk and prices policies.", capabilities: ["Risk Scoring"] }
  ],
  erpIntegration: ["Finance", "Claims Management"],
  techStack: [{ layer: "Data", technologies: ["Databricks", "Snowflake"] }],
  outcomes: [],
  caseStudy: { client: "Global Insurer", title: "Automated Claims", timeline: "6 Months", architecture: "Claims AI", outcome: "Success", metric: "60%" },
  roadmap: [],
  compliance: [{ badge: "HIPAA", description: "For Health Insurance" }],
  relatedProducts: [],
  relatedSolutions: [],
  resources: [],

  seo: {
    title: "Insurance AI Solutions | Underwriting AI, Claims Automation & Fraud Detection | CerebroHive",
    description: "CerebroHive deploys AI for insurance companies — automated underwriting, claims processing AI, fraud detection, policy document AI, customer service automation, and actuarial AI for P&C, life, and health insurers.",
    keywords: ["insurance AI solutions", "underwriting AI", "claims automation AI", "insurance fraud detection", "insurance document AI", "actuarial AI", "P&C insurance AI", "health insurance AI", "life insurance AI", "InsurTech AI"],
  },

  faqs: [
    { question: "How is AI transforming the insurance industry?", answer: "Insurance AI transforms across the value chain: underwriting (AI automates risk assessment, document extraction, and pricing recommendation for standard risks); claims (AI automates first notice of loss, damage assessment, fraud detection, and payment processing for straightforward claims); customer service (AI handles policy inquiries, coverage questions, and claims status autonomously); product development (AI identifies unmet needs and models the profitability of new products); distribution (AI powers agent recommendation engines and direct-to-consumer quote personalization); and actuarial functions (AI improves reserve estimation, catastrophe modeling, and rate-setting accuracy)." },
    { question: "How does AI improve the insurance underwriting process?", answer: "Underwriting AI accelerates and improves decisions across the submission lifecycle: document extraction (AI extracts structured data from applications, loss runs, and supporting documents automatically); risk scoring (ML models score submission risk using internal and third-party data, surfacing the most important risk factors for underwriter review); straight-through processing (AI automatically binds standard risks within appetite without underwriter involvement); appetite filtering (AI identifies submissions outside underwriting appetite before human review, reducing wasted effort); and portfolio analytics (AI monitors the underwritten portfolio for concentration risk, emerging loss trends, and pricing adequacy)." },
    { question: "What is AI claims automation and what types of claims can be automated?", answer: "Claims automation AI processes straightforward claims without human involvement: auto glass claims (AI verifies coverage, confirms loss details, and issues payment automatically); simple property claims (AI processes first notice of loss, verifies coverage, and instructs settlement for claims below threshold values); travel insurance claims (AI processes straightforward trip cancellation, delay, and baggage claims); and medical claims (AI applies coverage rules, adjudicates standard claims, and routes complex claims for human review). CerebroHive helps insurers implement automation that targets 40–60% straight-through processing for eligible claim types." },
    { question: "How does AI detect insurance fraud?", answer: "Insurance fraud AI detects: application fraud (identifying misrepresentations in applications by cross-referencing claimed information against external data sources); claims fraud (identifying anomalous patterns in claims submissions — inflated estimates, staged accidents, suspicious timing); network fraud (graph analytics identifying fraud rings — interconnected claimants, medical providers, and body shops participating in coordinated fraud); and first-party fraud (behavior patterns indicating intentional misrepresentation vs. honest errors). AI fraud detection reduces false positive rates vs. rule-based systems, ensuring legitimate claims aren't delayed while suspicious claims are investigated." },
    { question: "How does AI help with insurance customer service?", answer: "Insurance customer service AI handles: policy information (coverage details, premium amounts, payment history); claims status (real-time updates without claim handler involvement); first notice of loss (AI collects loss details, verifies coverage, and opens claims); payment processing (premium payment, installment setup, overpayment refunds); policy change requests (address updates, vehicle substitutions, beneficiary changes within straight-through processing rules); and certificate of insurance (AI generates standard COIs on demand without agent involvement)." },
    { question: "What AI applications exist for life and annuity insurers?", answer: "Life and annuity AI applications: application processing (AI extracts data from applications, orders and interprets attending physician statements, and flags underwriting exceptions); underwriting automation (AI makes underwriting decisions for standard applicants without human review); in-force management (AI monitors policyholder changes that may indicate lapse risk and triggers retention interventions); beneficiary support (AI helps beneficiaries navigate claims processes during a difficult time); and annuity income optimization (AI models income scenarios to help distribution partners advise clients on payout options)." },
    { question: "How do insurers use AI for catastrophe modeling and risk aggregation?", answer: "Catastrophe modeling AI: loss estimation (AI improves hurricane, earthquake, wildfire, and flood loss estimates by integrating higher-resolution property data, climate science, and historical claims); secondary perils (AI models emerging risks — convective storms, wildfires in new geographies — that traditional cat models underestimate); portfolio aggregation (AI analyzes geographic and hazard exposure concentration across a portfolio in real time); and climate risk (AI projects how loss profiles will change over 5, 10, and 20-year horizons as climate patterns shift, informing long-term pricing and portfolio strategy)." },
    { question: "How does AI help insurance companies with regulatory compliance?", answer: "Insurance regulatory compliance AI: rate filing support (AI extracts supporting data and generates actuarial exhibits for rate filings); form filing (AI compares policy forms against regulatory requirements and prior approved forms to identify differences requiring disclosure); market conduct (AI monitors claims handling timeliness and complaint patterns for potential market conduct issues); fraud reporting (AI prepares suspicious activity reports and coordinates with SIU investigations); and financial reporting (AI automates data extraction and reconciliation for statutory financial statements)." },
    { question: "What is telematics AI and how is it used for usage-based insurance?", answer: "Telematics AI powers usage-based insurance (UBI) by: processing vehicle telemetry (GPS location, accelerometers, OBD data) to assess individual driving behavior; scoring drivers on factors like harsh braking, acceleration, cornering, time of day, and highway vs. city driving; translating behavior scores into premium adjustments that reflect actual risk; identifying high-risk driving events for feedback to policyholders; and detecting crash events for automatic first notice of loss initiation. Telematics AI enables carriers to attract lower-risk drivers with personalized premiums while maintaining pricing adequacy." },
    { question: "How do InsurTech companies use AI to compete with traditional carriers?", answer: "InsurTechs use AI as a competitive advantage through: real-time underwriting (AI enables quote-to-bind in seconds for personal lines, removing friction from the purchase process); continuous underwriting (AI monitors policyholders for risk changes during the policy period, adjusting prices at renewal based on real data rather than application self-reporting); frictionless claims (AI processes and pays simple claims in hours rather than weeks, dramatically improving customer experience); personalized products (AI enables micro-segmented products tailored to specific customer needs and risk profiles); and distribution efficiency (AI powers lead scoring, agent recommendation, and direct-to-consumer conversion optimization)." },
  ],
};
