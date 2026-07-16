import { Industry } from "./types";

export const healthcare: Industry = {
  name: "Healthcare & Life Sciences",
  slug: "healthcare",
  color: "#00E676", // Deep Green / Teal
  
  tier: "Core Enterprise",
  category: "Healthcare",
  subcategory: "Hospitals & Health Systems",
  featured: true,
  
  engineConfig: {
    heroTheme: "healthcare",
    backgroundAnimation: "transaction-network",
    primaryColor: "#00E676",
    secondaryColor: "#00B8FF",
    accentColor: "#FFFFFF"
  },
  
  hero: {
    title: "Transforming Healthcare",
    subtitle: "COMPLETE", // based on the user screenshot 'COMPLETE' badge
    description: "Predictive Healthcare, Digital Workforce, Knowledge Intelligence.",
    primaryCta: "Book Industry Workshop",
    secondaryCta: "Download Blueprint"
  },
  
  overview: {
    maturityScore: 100,
    currentChallengesSummary: "Data silos, documentation burden, and claims denials.",
    opportunitySummary: "AI-assisted diagnostics, autonomous scribes, and intelligent scheduling.",
    statistics: [
      { metric: "40%", label: "Reduction" },
      { metric: "97%", label: "Accuracy" },
      { metric: "18%", label: "Lower Cost" },
      { metric: "99.9%", label: "Uptime" }
    ]
  },
  
  maturity: {
    aiAdoption: 7,
    automation: 6,
    knowledge: 8
  },
  
  aiOpportunities: [
    { domain: "Clinical", score: 9 },
    { domain: "Operations", score: 7 },
    { domain: "Revenue Cycle", score: 6 },
    { domain: "Research", score: 8 }
  ],

  segments: [
    "Patient Care",
    "Clinical Operations",
    "RCM & Billing",
    "Radiology",
    "Pathology",
    "Pharmacy",
    "Life Sciences",
    "Telehealth"
  ],

  challenges: [
    {
      title: "Data Silos",
      pain: "Patient data spread across EMRs, labs, and wearables.",
      cost: "$30B+ annually in redundant testing",
      businessImpact: "Diagnosis Delays",
      priority: "Critical",
      category: "Operations",
      problems: ["Fragmented EMRs", "Missing Lab Results", "Unstructured Clinical Notes", "Interoperability Failures"],
      solutions: ["Medical Knowledge Graph", "FHIR Gateway", "Patient AI Profile", "Semantic Search"],
      outcomes: ["↓ Redundant Testing", "↑ Speed to Diagnosis", "↑ Physician Confidence"],
      techStack: ["Neo4j", "Pinecone", "FHIR", "Azure Healthcare APIs"],
      aiAgent: "Patient Intelligence Agent",
      readiness: { implementation: "12 Weeks", complexity: "High", roi: "High" }
    },
    {
      title: "Documentation Burden",
      pain: "Physicians spend 2 hours on EMRs for every 1 hour of patient care.",
      cost: "Severe burnout and turnover",
      businessImpact: "Administrative Burden",
      priority: "Critical",
      category: "Customer",
      problems: ["Manual Charting", "Physician Burnout", "Patient Inattention", "Transcription Errors"],
      solutions: ["Ambient AI Scribe", "Automated Coding", "EMR Auto-Population", "Clinical Summary Gen"],
      outcomes: ["↓ Charting Time (70%)", "↑ Patient Face-Time", "↓ Physician Burnout"],
      techStack: ["Med-PaLM 2", "Whisper", "LangChain", "GCP"],
      aiAgent: "Ambient Scribe Agent",
      readiness: { implementation: "8 Weeks", complexity: "Medium", roi: "Very High" }
    },
    {
      title: "Claims Denials",
      pain: "Manual coding errors lead to high rejection rates.",
      cost: "15-20% revenue leakage",
      businessImpact: "Financial Instability",
      priority: "High",
      category: "Fraud",
      problems: ["Coding Errors", "Missing Pre-Auth", "Payer Rule Changes", "Revenue Leakage"],
      solutions: ["RCM AI Agent", "Pre-adjudication Engine", "Automated Coding", "Denial Prediction"],
      outcomes: ["↓ Denial Rates", "↑ First-Pass Yield", "↑ Days in A/R"],
      techStack: ["Anthropic", "Kafka", "PostgreSQL", "React"],
      aiAgent: "Claims Adjudication Agent",
      readiness: { implementation: "14 Weeks", complexity: "Medium", roi: "High" }
    }
  ],

  opportunityMatrix: [
    { name: "AI Scribe", description: "Automated clinical note generation during encounters.", roi: "High" },
    { name: "Diagnostics", description: "AI-assisted radiology and pathology analysis.", roi: "High" },
    { name: "Scheduling", description: "Predictive no-show prevention and intelligent booking.", roi: "Medium" },
    { name: "Triage", description: "Pre-encounter symptom checking and routing.", roi: "High" },
    { name: "Robotics", description: "Surgical assistance and automated logistics.", roi: "High" },
    { name: "Digital Twin", description: "Patient-specific disease progression modeling.", roi: "Medium" }
  ],
  
  architecture: {
    nodes: [
      { id: "patient", position: { x: 0, y: 150 }, data: { label: "Patient", type: "client" } },
      { id: "fhir", position: { x: 200, y: 150 }, data: { label: "FHIR Gateway", type: "gateway", status: "Healthy" } },
      { id: "lakehouse", position: { x: 400, y: 150 }, data: { label: "Data Lakehouse", type: "database" } },
      { id: "kg", position: { x: 600, y: 150 }, data: { label: "Knowledge Graph", type: "database" } },
      { id: "llm", position: { x: 800, y: 150 }, data: { label: "Medical LLM", type: "ai", status: "Active" } },
      { id: "diag_agent", position: { x: 1000, y: 150 }, data: { label: "Diagnosis Agent", type: "agent" } },
      { id: "treat_agent", position: { x: 1200, y: 150 }, data: { label: "Treatment Agent", type: "agent" } },
      { id: "dashboard", position: { x: 1400, y: 150 }, data: { label: "Clinical Dashboard", type: "system" } }
    ],
    edges: []
  },
  
  agents: [
    { name: "Diagnosis Agent", description: "Cross-references symptoms with medical literature and patient history.", capabilities: ["Differential Diagnosis", "Lab Ordering"], tools: ["EMR", "Labs"], outputs: ["Diagnosis Plans"] },
    { name: "Claims Agent", description: "Pre-adjudicates claims to prevent denials.", capabilities: ["ICD-10 Coding", "Payer Rules Engine"], tools: ["Billing System"], outputs: ["Clean Claims"] },
    { name: "Scheduling Agent", description: "Optimizes provider calendars dynamically.", capabilities: ["No-show Prediction", "Waitlist Management"], tools: ["Scheduling UI"], outputs: ["Optimized Calendar"] },
    { name: "Radiology Agent", description: "Flags anomalies in imaging for prioritized human review.", capabilities: ["Computer Vision", "Anomaly Detection"], tools: ["PACS"], outputs: ["Risk Scores"] }
  ],
  
  erpIntegration: [
    "Patient Registration",
    "Encounter Management",
    "Clinical Notes",
    "Pharmacy Orders",
    "Lab Results",
    "Revenue Cycle",
    "Supply Chain"
  ],
  
  techStack: [
    { layer: "AI Models", technologies: ["Med-PaLM 2", "Claude 3 Opus", "Llama 3 (Fine-tuned)"] },
    { layer: "Knowledge Base", technologies: ["Neo4j", "Pinecone", "Milvus"] },
    { layer: "Integration Layer", technologies: ["Azure Healthcare APIs", "FHIR", "HL7"] },
    { layer: "Frontend", technologies: ["Next.js", "React Flow", "Framer Motion"] }
  ],
  
  outcomes: [
    { metric: "40%", label: "Reduction", description: "In administrative workloads" },
    { metric: "97%", label: "Accuracy", description: "In initial triage diagnostics" },
    { metric: "18%", label: "Lower Cost", description: "In total operational expenditures" },
    { metric: "99.9%", label: "Uptime", description: "Mission-critical availability" }
  ],
  
  caseStudy: {
    client: "Apollo Hospitals",
    title: "Medical AI Assistant Deployment",
    timeline: "18 Weeks",
    architecture: "HIPAA-compliant RAG Pipeline",
    outcome: "42% Operational Improvement",
    metric: "42%"
  },
  
  roadmap: [
    { phase: "Phase 1", name: "Data Harmonization", description: "Integrate EMR and FHIR streams." },
    { phase: "Phase 2", name: "Ambient Scribe Pilot", description: "Deploy AI scribes in select clinics." },
    { phase: "Phase 3", name: "RCM Agent Rollout", description: "Automate claims pre-adjudication." },
    { phase: "Phase 4", name: "Enterprise Scale", description: "Deploy full agent swarm across network." }
  ],
  
  compliance: [
    { 
      badge: "HIPAA", 
      description: "Health Insurance Portability and Accountability Act",
      whyItMatters: "Governs the privacy and security of PHI (Protected Health Information).",
      affectedWorkflows: ["Patient Intake", "Clinical Notes", "Data Sharing"],
      supportedProducts: ["CerebroSphere™", "HiveMatrix™"]
    },
    { 
      badge: "HITRUST", 
      description: "Common Security Framework",
      whyItMatters: "Provides a certifiable framework for healthcare security.",
      affectedWorkflows: ["Cloud Infrastructure", "API Gateways"]
    },
    { 
      badge: "SOC 2 Type II", 
      description: "Security, Availability, and Confidentiality",
      whyItMatters: "Validates strict security practices via third-party audit." 
    },
    { 
      badge: "GDPR", 
      description: "European Data Privacy Standard" 
    }
  ],
  
  relatedProducts: [
    "CerebroSphere™",
    "HiveMatrix™",
    "AgentForge™"
  ],
  
  relatedSolutions: [
    "Predictive Healthcare",
    "Digital Scribe",
    "Intelligent Triage"
  ],
  
  relatedIndustries: [
    "finance", // For insurance/claims overlap
    "government", // For public health overlapping
    "technology" // For medtech
  ],
  
  resources: [
    { title: "Healthcare AI Architecture Guide", type: "Whitepaper", link: "/research" },
    { title: "Apollo Hospitals Deployment", type: "Case Study", link: "/research" },
    { title: "Securing Medical LLMs", type: "Research Paper", link: "/research" }
  ],
  
  digitalTwin: {
    overview: {
      title: "Patient Care Transformation",
      description: "End-to-end automation of clinical diagnostics and charting, reducing physician burden and accelerating time to treatment.",
      primaryNodes: ["patient", "agent", "dashboard"]
    },
    workflow: {
      nodes: [
        { id: "patient", label: "Patient", type: "entity", icon: "user", purpose: "Patient arrival and symptom presentation" },
        { id: "emr", label: "Medical Records", type: "database", purpose: "Retrieve historical patient data and labs" },
        { id: "knowledge", label: "Knowledge Graph", type: "database", purpose: "Cross-reference symptoms with medical literature" },
        { id: "reasoning", label: "Reasoning Engine", type: "logic", purpose: "Synthesize patient history with medical knowledge", processingTimeMs: 2500 },
        { id: "agent", label: "Medical AI Agent", type: "agent", purpose: "Generate differential diagnosis and treatment plan" },
        { id: "diagnosis", label: "Diagnosis Support", type: "system", purpose: "Present AI findings to attending physician" },
        { id: "treatment", label: "Treatment Plan", type: "system", purpose: "Generate prescriptions and care plan" },
        { id: "dashboard", label: "Hospital Dashboard", type: "system", purpose: "Update hospital metrics and capacity" }
      ],
      connections: [
        { from: "patient", to: "emr", animated: true },
        { from: "emr", to: "knowledge", animated: true },
        { from: "knowledge", to: "reasoning", animated: true },
        { from: "reasoning", to: "agent", animated: true },
        { from: "agent", to: "diagnosis", animated: true },
        { from: "diagnosis", to: "treatment", animated: true },
        { from: "treatment", to: "dashboard", animated: true }
      ]
    },
    architecture: {
      nodes: [
        { id: "fhir", label: "FHIR Gateway", type: "system", techStack: ["Azure APIs"] },
        { id: "lake", label: "Data Lakehouse", type: "database", techStack: ["Databricks"] },
        { id: "vector", label: "Vector Store", type: "database", techStack: ["Pinecone"] },
        { id: "llm", label: "Medical LLM", type: "ai", techStack: ["Med-PaLM 2"] },
        { id: "orchestrator", label: "AgentOS", type: "system", techStack: ["LangChain"] }
      ],
      connections: [
        { from: "fhir", to: "lake" },
        { from: "lake", to: "vector" },
        { from: "vector", to: "llm" },
        { from: "llm", to: "orchestrator" }
      ]
    },
    agents: [
      { id: "diag_agent", name: "Clinical Agent", role: "Diagnostics" },
      { id: "scribe_agent", name: "Scribe Agent", role: "Documentation" }
    ],
    metrics: [
      { id: "patients", label: "Patients Processed", startValue: 248, endValue: 250, format: "number" },
      { id: "confidence", label: "Confidence", startValue: 97, endValue: 98, format: "percentage", suffix: "%" },
      { id: "automation", label: "Automation", startValue: 78, endValue: 79, format: "percentage", suffix: "%" },
      { id: "latency", label: "Latency", startValue: 1200, endValue: 450, format: "time", suffix: "ms" }
    ],
    events: [
      { timeOffset: 0, nodeId: "patient", state: "processing", message: "Patient Registered" },
      { timeOffset: 1500, nodeId: "emr", state: "processing", message: "Records Retrieved" },
      { timeOffset: 3000, nodeId: "knowledge", state: "processing", message: "Literature Searched" },
      { timeOffset: 4500, nodeId: "reasoning", state: "thinking", message: "Synthesizing Context..." },
      { timeOffset: 7000, nodeId: "reasoning", state: "completed", message: "Reasoning Completed" },
      { timeOffset: 7500, nodeId: "agent", state: "executing", message: "Drafting Diagnosis" },
      { timeOffset: 9000, nodeId: "diagnosis", state: "completed", message: "Diagnosis Ready" },
      { timeOffset: 10500, nodeId: "treatment", state: "completed", message: "Plan Generated" },
      { timeOffset: 12000, nodeId: "dashboard", state: "completed", message: "Metrics Updated" }
    ],
    integrations: ["Epic", "Cerner", "Azure", "FHIR"]
  }
};
