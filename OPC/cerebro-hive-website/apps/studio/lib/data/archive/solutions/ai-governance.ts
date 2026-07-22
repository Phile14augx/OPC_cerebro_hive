import { Solution } from "./types";

export const ai_governance: Solution = {
  name: "AI Governance & Security",
  slug: "ai-governance",
  category: "Infrastructure",
  color: "#00F57A",
  tagline: "Responsible & Secure AI",
  implementationWeeks: "6-10 Weeks",
  readiness: "Enterprise Ready",
  difficulty: "Medium",
  deploymentModels: ["Cloud", "On-Premises"],
  roiLevel: "High",
  industries: ["Finance", "Healthcare", "Government"],
  
  hero: {
    title: "AI Governance & Security",
    subtitle: "Infrastructure",
    description: "Ensure your AI initiatives are secure, compliant, and free from bias with our enterprise governance frameworks.",
    primaryCta: "Book Strategy Session",
    secondaryCta: "Download Architecture Guide"
  },
  overview: "Scale AI safely. We implement guardrails, auditing, and compliance frameworks to protect your data and brand reputation.",
  businessProblems: [
    { problem: "Compliance Risk", impact: "Regulatory fines and reputational damage.", aiSolution: "Automated compliance guardrails." }
  ],
  pipeline: [
    { id: "input", label: "User Prompt", subLabels: ["Input"] },
    { id: "filter_in", label: "Input Guardrails", subLabels: ["PII Check", "Jailbreak"] },
    { id: "model", label: "AI Model", subLabels: ["LLM"] },
    { id: "filter_out", label: "Output Guardrails", subLabels: ["Toxicity", "Hallucination"] },
    { id: "audit", label: "Audit Log", subLabels: ["Compliance DB"] }
  ],
  workflowSteps: [
    { step: 1, name: "Define", description: "Set enterprise AI policies." },
    { step: 2, name: "Implement", description: "Deploy automated guardrails." },
    { step: 3, name: "Monitor", description: "Continuous auditing." }
  ],
  capabilities: [
    { name: "Prompt Injection Defense", description: "Block malicious attacks.", techUsed: ["NeMo Guardrails"] }
  ],
  architecture: { nodes: [], edges: [] },
  workflows: { nodes: [], edges: [] },
  agents: [],
  techStack: [],
  techStackFlat: [
    { name: "NeMo Guardrails", role: "Security Layer" },
    { name: "MLflow", role: "Model Registry" }
  ],
  roi: [
    { metric: "100%", label: "Compliance", description: "Regulatory adherence." },
    { metric: "0", label: "Data Leaks", description: "Zero sensitive data exposed." },
    { metric: "100%", label: "Visibility", description: "Full auditability." },
    { metric: "6 Wks", label: "Deployment", description: "Time to value." }
  ],
  timeline: [
    { phase: "Audit", week: "Weeks 1-2", description: "Current state risk assessment." },
    { phase: "Implementation", week: "Weeks 3-6", description: "Guardrail deployment." },
    { phase: "Monitoring", week: "Weeks 7-8", description: "Dashboard setup." }
  ],
  deliverables: ["Governance Policy", "Guardrail APIs", "Audit Dashboard"],
  engagementModels: ["Advisory", "Implementation"],
  securityFeatures: ["RBAC", "DLP"],
  integrations: ["Active Directory", "Splunk"],
  featuredCaseStudy: {
    industry: "Healthcare",
    title: "HIPAA Compliant AI",
    timeline: "8 Weeks",
    outcome: "Enabled clinical AI use while ensuring 100% HIPAA compliance.",
    metric: "100% Compliant",
    description: "Implemented rigorous PII redaction and audit logging for medical LLM usage.",
    savings: "Zero Fines"
  },
  caseStudy: { industry: "Enterprise", title: "Transformation", timeline: "12 Weeks", outcome: "Improvement", metric: "40%" },
  resources: []
};
