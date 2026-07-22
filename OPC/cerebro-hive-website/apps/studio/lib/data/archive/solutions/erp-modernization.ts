import { Solution } from "./types";

export const erp_modernization: Solution = {
  name: "Quantiva ERP Modernization",
  slug: "erp-modernization",
  category: "Enterprise Platforms",
  color: "#00E5FF",
  tagline: "AI-Native Core Business Systems",
  implementationWeeks: "16-32 Weeks",
  readiness: "Enterprise Ready",
  difficulty: "High",
  deploymentModels: ["Cloud", "Hybrid"],
  roiLevel: "Very High",
  industries: ["Manufacturing", "Wholesale", "Retail"],
  
  hero: {
    title: "ERP Modernization",
    subtitle: "Enterprise Platforms",
    description: "Migrate legacy ERPs to an AI-native core that automates workflows and provides real-time predictive insights.",
    primaryCta: "Book Strategy Session",
    secondaryCta: "Download Architecture Guide"
  },
  overview: "Legacy ERPs are databases of record. We upgrade them to engines of action. Our modernization approach wraps legacy systems with AI capabilities or migrates them entirely.",
  businessProblems: [
    { problem: "Siloed Legacy Systems", impact: "High maintenance costs and data fragmentation.", aiSolution: "Unified Cloud ERP with AI layer." }
  ],
  pipeline: [
    { id: "legacy", label: "Legacy ERP", subLabels: ["On-Premises"] },
    { id: "extract", label: "Data Migration", subLabels: ["ETL"] },
    { id: "cloud", label: "Cloud Core", subLabels: ["Quantiva Engine"] },
    { id: "ai", label: "AI Layer", subLabels: ["Predictive Models"] },
    { id: "ui", label: "Modern UI", subLabels: ["Web, Mobile"] }
  ],
  workflowSteps: [
    { step: 1, name: "Assess", description: "Audit legacy systems and data quality." },
    { step: 2, name: "Migrate", description: "Move data to cloud architecture." },
    { step: 3, name: "Automate", description: "Implement AI workflows." }
  ],
  capabilities: [
    { name: "Predictive Inventory", description: "Forecast stock needs automatically.", techUsed: ["Machine Learning"] }
  ],
  architecture: { nodes: [], edges: [] },
  workflows: { nodes: [], edges: [] },
  agents: [],
  techStack: [],
  techStackFlat: [
    { name: "SAP / Oracle", role: "Core ERP" },
    { name: "Quantiva", role: "AI Layer" }
  ],
  roi: [
    { metric: "30%", label: "TCO Reduction", description: "Lower total cost of ownership." },
    { metric: "50%", label: "Faster Closing", description: "Faster financial close." },
    { metric: "100%", label: "Cloud Ready", description: "Fully modernized architecture." },
    { metric: "24 Wks", label: "Deployment", description: "Time to value." }
  ],
  timeline: [
    { phase: "Assessment", week: "Weeks 1-4", description: "System audit." },
    { phase: "Migration", week: "Weeks 5-16", description: "Data transfer." },
    { phase: "Go-Live", week: "Weeks 17-24", description: "User training." }
  ],
  deliverables: ["Migration Plan", "Cloud ERP", "AI Dashboards"],
  engagementModels: ["System Integration"],
  securityFeatures: ["SOC2 Compliance"],
  integrations: ["CRM", "HRIS"],
  featuredCaseStudy: {
    industry: "Manufacturing",
    title: "Legacy ERP Migration",
    timeline: "24 Weeks",
    outcome: "Migrated 20 years of legacy data to modern cloud ERP.",
    metric: "30% Cost Reduction",
    description: "Replaced 5 disconnected legacy systems with a single AI-native ERP.",
    savings: "$5M Saved"
  },
  caseStudy: { industry: "Enterprise", title: "Transformation", timeline: "12 Weeks", outcome: "Improvement", metric: "40%" },
  resources: []
};
