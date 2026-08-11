import { Solution } from "./types";

export const document_ai: Solution = {
  name: "Intelligent Document Processing",
  slug: "document-ai",
  category: "Enterprise Automation",
  color: "#00E5FF",
  tagline: "Automate Unstructured Data Extraction",
  implementationWeeks: "6-8 Weeks",
  readiness: "Enterprise Ready",
  difficulty: "Medium",
  deploymentModels: ["Cloud", "On-Premises"],
  roiLevel: "High",
  industries: ["Insurance", "Banking", "Healthcare", "Legal"],
  
  hero: {
    title: "Intelligent Document Processing",
    subtitle: "Enterprise Automation",
    description: "Transform unstructured documents into structured data with AI.",
    primaryCta: "Book Strategy Session",
    secondaryCta: "Download Architecture Guide"
  },
  overview: "Our Document AI solution extracts, classifies, and validates data from complex documents at scale.",
  businessProblems: [
    { problem: "Manual Data Entry", impact: "High error rates and slow processing times.", aiSolution: "Automated extraction using vision models." }
  ],
  pipeline: [
    { id: "ingest", label: "Ingestion", subLabels: ["Email, API"] },
    { id: "ocr", label: "OCR & Vision", subLabels: ["Text Extraction"] },
    { id: "classify", label: "Classification", subLabels: ["Document Type"] },
    { id: "extract", label: "Extraction", subLabels: ["Key-Value Pairs"] },
    { id: "validate", label: "Validation", subLabels: ["Business Rules"] },
    { id: "export", label: "Export", subLabels: ["ERP, Database"] }
  ],
  workflowSteps: [
    { step: 1, name: "Upload", description: "Receive documents via automated channels." },
    { step: 2, name: "Process", description: "AI reads and understands the document layout." },
    { step: 3, name: "Validate", description: "Flag low-confidence fields for human review." }
  ],
  capabilities: [
    { name: "Layout Understanding", description: "Understand complex tables and forms.", techUsed: ["LayoutLM"] }
  ],
  architecture: { nodes: [], edges: [] },
  workflows: { nodes: [], edges: [] },
  agents: [],
  techStack: [],
  techStackFlat: [
    { name: "Azure Form Recognizer", role: "OCR Engine" },
    { name: "Python", role: "Processing" }
  ],
  roi: [
    { metric: "90%", label: "Automation", description: "Documents processed hands-free." },
    { metric: "99%", label: "Accuracy", description: "Data extraction accuracy." },
    { metric: "5x", label: "Speed", description: "Faster processing times." },
    { metric: "6 Wks", label: "Deployment", description: "Time to first value." }
  ],
  timeline: [
    { phase: "Setup", week: "Weeks 1-2", description: "Infrastructure setup." },
    { phase: "Training", week: "Weeks 3-4", description: "Model training." },
    { phase: "Go-Live", week: "Weeks 5-6", description: "Production deployment." }
  ],
  deliverables: ["Extraction Models", "Validation UI", "API Endpoints"],
  engagementModels: ["PoC", "Full Implementation"],
  securityFeatures: ["PII Redaction", "Encryption"],
  integrations: ["SAP", "Salesforce"],
  featuredCaseStudy: {
    industry: "Insurance",
    title: "Claims Automation",
    timeline: "8 Weeks",
    outcome: "Automated 85% of claims processing.",
    metric: "85% Automated",
    description: "Automated extraction from handwritten medical claims.",
    savings: "$1.2M Saved"
  },
  caseStudy: { industry: "Enterprise", title: "Transformation", timeline: "12 Weeks", outcome: "Improvement", metric: "40%" },
  resources: []
};
