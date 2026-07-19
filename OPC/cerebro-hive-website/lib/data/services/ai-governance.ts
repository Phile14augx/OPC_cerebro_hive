import { EnterpriseService } from "../types";

export const aiGovernanceService: EnterpriseService = {
  id: "ai-governance",
  slug: "ai-governance",
  title: "AI Governance & Trust™",
  summary: "Responsible AI, policy, and compliance.",
  hero: {
    title: "AI Governance & Trust™",
    subtitle: "Risk Management",
    description: "Ensure your AI initiatives comply with global regulations, internal policies, and ethical standards."
  },
  iconName: "Scale",
  category: "Governance",
  status: "production",
  tags: ["Governance", "Compliance", "Ethics", "Risk"],

  seo: {
    title: "AI Governance & Risk Management | Responsible AI | CerebroHive",
    description: "CerebroHive builds enterprise AI governance frameworks — AI risk assessment, compliance controls, bias auditing, explainability standards, and responsible AI programs for regulated industries.",
    keywords: [
      "AI governance framework", "enterprise AI compliance", "responsible AI consulting",
      "AI risk management", "AI bias auditing", "AI ethics framework",
      "GDPR AI compliance", "HIPAA AI compliance", "EU AI Act compliance", "AI explainability",
    ],
  },

  config: {
    layout: "standard",
    sections: [
      "hero",
      "executive_summary",
      "business_challenges",
      "methodology",
      "roadmap",
      "products",
      "roi",
      "cta"
    ]
  },

  executiveProblem: "As AI permeates the enterprise, the risk of data leaks, biased decisions, and regulatory fines (like the EU AI Act) grows exponentially.",
  businessImpact: "A single compliance violation or public bias incident can result in millions in fines and irreparable brand damage.",

  businessChallenges: [
    {
      title: "Regulatory Uncertainty",
      description: "Navigating emerging frameworks like the EU AI Act and NIST AI RMF is complex."
    },
    {
      title: "Black Box Models",
      description: "Inability to audit or explain the reasoning behind AI-driven decisions."
    }
  ],

  targetPersonas: ["Chief Risk Officer", "CISO", "General Counsel", "CIO"],
  industries: ["Financial Services", "Healthcare", "Government"],
  methodologyOverview: "We map your AI portfolio against global regulatory requirements and implement technical guardrails to enforce compliance automatically.",

  timeline: [
    {
      title: "Risk Assessment",
      duration: "Weeks 1-2",
      activities: ["AI Portfolio Audit", "Gap Analysis vs Regulations"]
    },
    {
      title: "Policy Development",
      duration: "Weeks 3-4",
      activities: ["Drafting Acceptable Use Policies", "Defining Risk Tiers"]
    },
    {
      title: "Guardrail Implementation",
      duration: "Weeks 5-8",
      activities: ["Deploying HiveShield", "Setting up Audit Logs"]
    }
  ],

  successMetrics: [
    { metric: "Compliance Coverage", value: "100%", timeframe: "Post-Launch" },
    { metric: "Audit Ready", value: "24/7", timeframe: "Post-Launch" }
  ],

  products: ["hive-shield"],
  platformCapabilities: ["guard", "governance", "eval"],
  relatedResearch: ["ai-safety"],

  deliverables: [
    "Comprehensive AI Risk Assessment",
    "Enterprise AI Policy Document",
    "Automated Compliance Dashboards"
  ],

  engagementModel: "Project-Based Advisory & Implementation",

  pricing: {
    type: "Fixed Scope",
    description: "Based on the size of the existing AI portfolio and regulatory requirements.",
  },

  faqs: [
    {
      question: "What is AI governance and why do enterprises need it?",
      answer: "AI governance is the set of policies, processes, controls, and organizational structures that ensure AI systems are developed, deployed, and operated in ways that are safe, fair, compliant, and aligned with organizational values. Enterprises need AI governance because: AI decisions can have significant business, legal, and reputational consequences; regulatory requirements (EU AI Act, GDPR, HIPAA, financial regulations) impose legal obligations; AI systems can embed and amplify bias; and without governance, AI risk accumulates invisibly until it causes an incident.",
    },
    {
      question: "What is the EU AI Act and how does CerebroHive help with compliance?",
      answer: "The EU AI Act is the world's first comprehensive AI regulation, classifying AI systems by risk level (unacceptable, high, limited, minimal) and imposing obligations accordingly. High-risk AI systems (in healthcare, education, employment, financial services, law enforcement) require conformity assessments, technical documentation, data governance, human oversight, and accuracy standards. CerebroHive maps your AI portfolio against the Act's risk categories, identifies compliance gaps, and implements the required controls — including documentation, testing, monitoring, and audit trail systems.",
    },
    {
      question: "What is responsible AI and how do you implement it?",
      answer: "Responsible AI is the practice of designing, building, and deploying AI systems that are fair, transparent, accountable, privacy-preserving, and beneficial. CerebroHive implements responsible AI through: fairness audits (measuring and mitigating demographic bias in model outputs); explainability frameworks (making model decisions interpretable to users and regulators); privacy controls (data minimization, differential privacy, federated learning where applicable); human oversight protocols (human-in-the-loop checkpoints for high-stakes decisions); and accountability structures (clear ownership of AI system performance and failures).",
    },
    {
      question: "How do you audit AI systems for bias?",
      answer: "Our AI bias auditing process follows four steps: (1) Identify protected attributes relevant to the use case (age, gender, race, nationality, disability status); (2) Collect or construct representative test sets covering diverse demographic groups; (3) Measure performance disparities across groups using standard fairness metrics (demographic parity, equalized odds, individual fairness); (4) Diagnose root causes (training data imbalance, proxy features, historical bias in labels) and implement mitigations (reweighting, adversarial debiasing, threshold calibration). We produce a bias audit report with findings and remediation recommendations.",
    },
    {
      question: "What does AI risk management involve?",
      answer: "Enterprise AI risk management involves: cataloging all AI systems in the organization (the AI inventory); classifying each system by risk level (impact severity × probability of failure); assessing specific risks for each system (hallucination, bias, security vulnerabilities, dependency risks, privacy exposure); implementing controls proportional to risk level; establishing monitoring and incident response for live systems; and maintaining a continuous risk review cycle as systems evolve and the regulatory landscape changes.",
    },
    {
      question: "How do you make AI decisions explainable?",
      answer: "Explainability approaches differ by model type: for ML models (gradient boosting, neural networks), we use SHAP or LIME to generate feature attribution explanations; for LLM-based decisions, we implement chain-of-thought logging (capturing reasoning steps), citation injection (showing which documents informed the response), and confidence scoring; for rule-based hybrid systems, we expose the rule path taken. We also design explainability for different audiences — technical teams need model internals, users need plain-language explanations, regulators need audit-ready documentation.",
    },
    {
      question: "What AI governance frameworks do you use?",
      answer: "CerebroHive's governance framework is grounded in NIST AI RMF (Risk Management Framework), ISO/IEC 23053 (Framework for AI Systems), and sector-specific guidelines (FDA AI/ML framework for medical devices, FFIEC guidance for financial AI). We adapt these to the EU AI Act, GDPR, HIPAA, and other applicable regulations based on the client's geography and industry. We don't apply generic frameworks mechanically — we calibrate governance intensity to actual risk levels.",
    },
    {
      question: "How do you handle AI incidents when something goes wrong in production?",
      answer: "CerebroHive designs AI incident response plans as part of every governance engagement: incident classification (severity levels from cosmetic errors to safety-critical failures); detection mechanisms (monitoring dashboards, user feedback channels, automated anomaly detection); escalation paths (who is notified and when for each severity level); containment procedures (how to disable or limit an AI system quickly); root cause analysis (investigation and documentation processes); and remediation workflows (fixing, retraining, redeploying, and communicating to affected parties).",
    },
    {
      question: "Which regulated industries do you have AI governance experience in?",
      answer: "CerebroHive has delivered AI governance programs for: Financial Services (algorithmic trading, credit scoring, fraud detection — addressing FFIEC, SEC, and FINRA requirements); Healthcare (clinical decision support, diagnostic AI — addressing FDA AI/ML guidance, HIPAA, and clinical safety standards); Legal & Compliance (contract AI, regulatory monitoring — addressing attorney-client privilege, legal advice regulations); Government (procurement AI, benefits assessment — addressing public sector AI ethics principles); and Manufacturing (quality control AI, predictive maintenance — addressing industrial safety standards).",
    },
    {
      question: "What is an AI system inventory and why does governance start with one?",
      answer: "An AI system inventory is a catalog of all AI and ML systems in use across the organization — including systems deployed by individual teams, third-party AI tools, and embedded AI in purchased software. Governance starts with inventory because you cannot govern what you don't know exists. Many enterprises discover 3–5× more AI systems during inventory than they expected. The inventory captures: what each system does, what data it uses, who owns it, what decisions it influences, and what regulatory category it falls into.",
    },
    {
      question: "How does AI governance relate to data governance?",
      answer: "AI governance and data governance are deeply intertwined but distinct. Data governance covers data quality, ownership, lineage, and access control — ensuring data assets are reliable, compliant, and properly managed. AI governance extends this: it specifies what data can be used to train AI models, how training data must be documented, what data quality thresholds must be met for AI decisions, and how personally identifiable information must be protected in AI pipelines. CerebroHive designs AI governance to sit on top of and extend existing data governance frameworks.",
    },
    {
      question: "How do you keep AI governance current as regulations change?",
      answer: "AI regulation is evolving rapidly — the EU AI Act, global GDPR equivalents, sector-specific guidelines, and voluntary frameworks like the White House Executive Order on AI all create a dynamic compliance landscape. CerebroHive's governance retainer includes: quarterly regulatory horizon scanning; governance framework updates triggered by new regulation; annual AI portfolio re-audits; and dedicated regulatory briefings for your legal and compliance teams. We treat governance as a living program, not a one-time project.",
    },
    {
      question: "Can you certify or audit AI systems for regulatory submission?",
      answer: "CerebroHive produces governance documentation and technical evidence packages that support regulatory submissions and third-party audits. For healthcare AI, this includes documentation aligned with the FDA's Predetermined Change Control Plan requirements. For financial AI, this includes model risk management documentation aligned with SR 11-7 (Federal Reserve supervisory guidance). We work alongside your legal and regulatory affairs teams to ensure documentation meets the specific requirements of your regulatory body.",
    },
  ],
};
