import { Solution } from "./types";

export const cloud_modernization: Solution = {
  name: "Cloud & Application Modernization",
  slug: "cloud-modernization",
  category: "Infrastructure",
  color: "#B300FF",
  tagline: "AI-Ready Infrastructure",
  implementationWeeks: "12-24 Weeks",
  readiness: "Enterprise Ready",
  difficulty: "High",
  deploymentModels: ["Cloud", "Multi-Cloud"],
  roiLevel: "High",
  industries: ["Finance", "Healthcare", "Government"],
  
  hero: {
    title: "Cloud Modernization",
    subtitle: "Infrastructure",
    description: "Re-architect your infrastructure for the AI era. Scalable, secure, and cost-optimized.",
    primaryCta: "Book Strategy Session",
    secondaryCta: "Download Architecture Guide"
  },
  overview: "AI workloads require specialized infrastructure. We modernize your legacy applications and migrate them to an AI-ready cloud environment.",
  businessProblems: [
    { problem: "Legacy Technical Debt", impact: "Inability to deploy modern AI tools.", aiSolution: "Cloud-native microservices." }
  ],
  pipeline: [
    { id: "legacy", label: "Monolith Application", subLabels: ["On-Prem"] },
    { id: "container", label: "Containerization", subLabels: ["Docker"] },
    { id: "orchestrate", label: "Orchestration", subLabels: ["Kubernetes"] },
    { id: "services", label: "Microservices", subLabels: ["APIs"] },
    { id: "ai", label: "AI Services Integration", subLabels: ["GPU Compute"] }
  ],
  workflowSteps: [
    { step: 1, name: "Assess", description: "Cloud readiness assessment." },
    { step: 2, name: "Refactor", description: "Break monoliths into microservices." },
    { step: 3, name: "Deploy", description: "CI/CD automated deployment." }
  ],
  capabilities: [
    { name: "Auto-Scaling", description: "Scale compute dynamically.", techUsed: ["Kubernetes"] }
  ],
  architecture: { nodes: [], edges: [] },
  workflows: { nodes: [], edges: [] },
  agents: [],
  techStack: [],
  techStackFlat: [
    { name: "AWS / Azure / GCP", role: "Cloud Provider" },
    { name: "Kubernetes", role: "Orchestration" }
  ],
  roi: [
    { metric: "40%", label: "Infra Cost", description: "Reduction in hosting costs." },
    { metric: "99.99%", label: "Uptime", description: "High availability." },
    { metric: "10x", label: "Release Speed", description: "Faster deployment." },
    { metric: "16 Wks", label: "Deployment", description: "Time to value." }
  ],
  timeline: [
    { phase: "Assessment", week: "Weeks 1-4", description: "Architecture planning." },
    { phase: "Migration", week: "Weeks 5-12", description: "Application refactoring." },
    { phase: "Optimization", week: "Weeks 13-16", description: "Cost optimization." }
  ],
  deliverables: ["Cloud Architecture", "CI/CD Pipelines", "IaC Scripts"],
  engagementModels: ["Cloud Migration"],
  securityFeatures: ["Zero Trust Network"],
  integrations: ["Datadog", "Splunk"],
  featuredCaseStudy: {
    industry: "Finance",
    title: "Mainframe to Cloud",
    timeline: "24 Weeks",
    outcome: "Migrated core banking app to Kubernetes.",
    metric: "40% Cost Reduction",
    description: "Modernized legacy infrastructure to support real-time AI fraud detection.",
    savings: "$8M Saved"
  },
  caseStudy: { industry: "Enterprise", title: "Transformation", timeline: "12 Weeks", outcome: "Improvement", metric: "40%" },
  resources: []
};
