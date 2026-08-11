import { Solution } from "./types";

export const hyperautomation: Solution = {
  name: "Hyperautomation",
  slug: "hyperautomation",
  category: "Enterprise Automation",
  color: "#00F57A",
  tagline: "End-to-End Process Automation",
  implementationWeeks: "12-24 Weeks",
  readiness: "Enterprise Ready",
  difficulty: "High",
  deploymentModels: ["Cloud", "On-Premises"],
  roiLevel: "Very High",
  industries: ["Manufacturing", "Supply Chain", "Retail"],
  
  hero: {
    title: "Hyperautomation & Workflow",
    subtitle: "Enterprise Automation",
    description: "Orchestrate RPA, AI, and APIs to automate complex end-to-end business processes.",
    primaryCta: "Book Strategy Session",
    secondaryCta: "Download Architecture Guide"
  },
  overview: "Combine traditional RPA with Generative AI to automate processes that previously required human decision-making.",
  businessProblems: [
    { problem: "Process Bottlenecks", impact: "Slow fulfillment and operations.", aiSolution: "Intelligent orchestration." }
  ],
  pipeline: [
    { id: "event", label: "System Event", subLabels: ["Webhooks"] },
    { id: "orchestrator", label: "BPM Engine", subLabels: ["Workflow Logic"] },
    { id: "ai", label: "AI Decision Node", subLabels: ["Classification"] },
    { id: "rpa", label: "RPA Bot", subLabels: ["Legacy Systems"] },
    { id: "api", label: "API Action", subLabels: ["Modern Systems"] }
  ],
  workflowSteps: [
    { step: 1, name: "Trigger", description: "Workflow starts via event." },
    { step: 2, name: "Decide", description: "AI evaluates the unstructured data." },
    { step: 3, name: "Execute", description: "Bots and APIs update systems." }
  ],
  capabilities: [
    { name: "Intelligent Routing", description: "AI makes decisions mid-workflow.", techUsed: ["LLMs", "Rules Engine"] }
  ],
  architecture: { nodes: [], edges: [] },
  workflows: { nodes: [], edges: [] },
  agents: [],
  techStack: [],
  techStackFlat: [
    { name: "UiPath / Automation Anywhere", role: "RPA" },
    { name: "Camunda", role: "Orchestration" }
  ],
  roi: [
    { metric: "60%", label: "Cost Reduction", description: "Operational savings." },
    { metric: "99%", label: "Accuracy", description: "Error reduction." },
    { metric: "24/7", label: "Uptime", description: "Continuous operations." },
    { metric: "16 Wks", label: "Deployment", description: "Time to value." }
  ],
  timeline: [
    { phase: "Process Mining", week: "Weeks 1-4", description: "Identifying bottlenecks." },
    { phase: "Development", week: "Weeks 5-12", description: "Building automations." },
    { phase: "Rollout", week: "Weeks 13-16", description: "Production scaling." }
  ],
  deliverables: ["Process Definitions", "RPA Bots", "Dashboards"],
  engagementModels: ["CoE Setup", "Implementation"],
  securityFeatures: ["Credential Vaulting", "Audit Trails"],
  integrations: ["SAP", "Oracle", "Legacy Mainframes"],
  featuredCaseStudy: {
    industry: "Supply Chain",
    title: "Order-to-Cash Automation",
    timeline: "16 Weeks",
    outcome: "Fully automated the order processing pipeline.",
    metric: "75% Faster",
    description: "Combined OCR, RPA, and AI to read POs and enter them into SAP.",
    savings: "$3.5M Saved"
  },
  caseStudy: { industry: "Enterprise", title: "Transformation", timeline: "12 Weeks", outcome: "Improvement", metric: "40%" },
  resources: []
};
