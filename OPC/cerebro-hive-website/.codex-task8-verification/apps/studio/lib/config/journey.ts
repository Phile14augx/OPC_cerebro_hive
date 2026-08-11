export interface JourneyPhase {
  id: string;
  step: number;
  title: string;
  objective: string;
  deliverables: string[];
  outcomes: string;
}

export const transformationJourney: JourneyPhase[] = [
  {
    id: "readiness",
    step: 1,
    title: "AI Readiness Assessment",
    objective: "Evaluate existing infrastructure and data maturity.",
    deliverables: ["Data Maturity Scorecard", "Gap Analysis Report"],
    outcomes: "Clear understanding of prerequisites for AI adoption."
  },
  {
    id: "discovery",
    step: 2,
    title: "Enterprise Discovery",
    objective: "Identify high-ROI AI opportunities aligned with business goals.",
    deliverables: ["Use Case Backlog", "ROI Projections"],
    outcomes: "Prioritized roadmap of AI initiatives."
  },
  {
    id: "architecture",
    step: 3,
    title: "Strategy & Architecture",
    objective: "Design a secure, scalable AI operating system tailored to your enterprise.",
    deliverables: ["Reference Architecture Diagram", "Security & Compliance Plan"],
    outcomes: "Blueprint for secure, compliant AI deployment."
  },
  {
    id: "data",
    step: 4,
    title: "Data Foundation",
    objective: "Unify siloed enterprise data streams into a cohesive ecosystem.",
    deliverables: ["Data Pipelines (ETL/ELT)", "Vector Embeddings Strategy"],
    outcomes: "High-quality, accessible data ready for LLM consumption."
  },
  {
    id: "knowledge",
    step: 5,
    title: "Knowledge Integration",
    objective: "Connect the AI OS to your proprietary knowledge base.",
    deliverables: ["Knowledge Graph Construction", "RAG Pipeline Setup"],
    outcomes: "AI agents grounded in your enterprise's unique context."
  },
  {
    id: "deployment",
    step: 6,
    title: "AI Platform Deployment",
    objective: "Deploy the core Cerebro OS into your private environment.",
    deliverables: ["Private VPC Deployment", "RBAC Configuration"],
    outcomes: "A secure, centralized hub for all enterprise AI activity."
  },
  {
    id: "enablement",
    step: 7,
    title: "Agent Enablement",
    objective: "Activate autonomous agents for specific enterprise workflows.",
    deliverables: ["Agent Prompts & Tooling", "Workflow Automation Scripts"],
    outcomes: "Reduction in manual tasks and increased operational efficiency."
  },
  {
    id: "governance",
    step: 8,
    title: "Governance & Responsible AI",
    objective: "Implement guardrails, audit logging, and compliance checks.",
    deliverables: ["Audit Logging Framework", "Bias & Toxicity Filters"],
    outcomes: "Safe, predictable, and compliant AI behavior."
  },
  {
    id: "optimization",
    step: 9,
    title: "Continuous Optimization",
    objective: "Monitor agent performance and fine-tune models based on usage data.",
    deliverables: ["Telemetry Dashboards", "Fine-Tuning Pipelines"],
    outcomes: "Increasingly accurate and efficient AI operations over time."
  },
  {
    id: "scale",
    step: 10,
    title: "Scale Across the Enterprise",
    objective: "Expand AI capabilities to new departments and business units.",
    deliverables: ["Center of Excellence (CoE) Setup", "Internal Training Programs"],
    outcomes: "Enterprise-wide AI adoption and compounding ROI."
  }
];
