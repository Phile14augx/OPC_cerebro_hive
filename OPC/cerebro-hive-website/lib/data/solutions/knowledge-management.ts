import { Solution } from "./types";

export const knowledge_management: Solution = {
  name: "Enterprise Knowledge Management",
  slug: "knowledge-management",
  category: "Data & Intelligence",
  color: "#B300FF",
  tagline: "Unified Enterprise Search",
  implementationWeeks: "10-14 Weeks",
  readiness: "Enterprise Ready",
  difficulty: "High",
  deploymentModels: ["Cloud", "Hybrid"],
  roiLevel: "Medium",
  industries: ["Technology", "Consulting", "Pharma"],
  
  hero: {
    title: "Enterprise Knowledge Management",
    subtitle: "Data & Intelligence",
    description: "Connect your entire organization's data into a single, intelligent knowledge graph.",
    primaryCta: "Book Strategy Session",
    secondaryCta: "Download Architecture Guide"
  },
  overview: "Break down data silos by creating a unified knowledge graph that powers semantic search and AI applications.",
  businessProblems: [
    { problem: "Data Fragmentation", impact: "Information spread across dozens of tools.", aiSolution: "Unified Knowledge Graph." }
  ],
  pipeline: [
    { id: "connect", label: "Connectors", subLabels: ["SaaS, DBs"] },
    { id: "extract", label: "ETL", subLabels: ["Data Unification"] },
    { id: "graph", label: "Knowledge Graph", subLabels: ["Relationships"] },
    { id: "search", label: "Semantic Search", subLabels: ["Vector + Graph"] },
    { id: "ui", label: "Enterprise Portal", subLabels: ["Discovery"] }
  ],
  workflowSteps: [
    { step: 1, name: "Index", description: "Crawl enterprise data sources." },
    { step: 2, name: "Link", description: "Discover relationships between entities." },
    { step: 3, name: "Search", description: "Provide unified search experience." }
  ],
  capabilities: [
    { name: "Graph DB", description: "Map relationships between data.", techUsed: ["Neo4j"] }
  ],
  architecture: { nodes: [], edges: [] },
  workflows: { nodes: [], edges: [] },
  agents: [],
  techStack: [],
  techStackFlat: [
    { name: "Neo4j", role: "Graph Database" },
    { name: "Elasticsearch", role: "Search Engine" }
  ],
  roi: [
    { metric: "40%", label: "Time Saved", description: "Less time searching." },
    { metric: "100%", label: "Visibility", description: "Unified view of data." },
    { metric: "3x", label: "Discovery", description: "Faster insight generation." },
    { metric: "12 Wks", label: "Deployment", description: "Time to first value." }
  ],
  timeline: [
    { phase: "Mapping", week: "Weeks 1-4", description: "Data ontology mapping." },
    { phase: "Ingestion", week: "Weeks 5-8", description: "Building connectors." },
    { phase: "Go-Live", week: "Weeks 9-12", description: "Portal rollout." }
  ],
  deliverables: ["Data Ontology", "Graph Database", "Search Portal"],
  engagementModels: ["Full Implementation", "Managed Service"],
  securityFeatures: ["Row-level Security", "SSO"],
  integrations: ["SharePoint", "Jira", "Confluence"],
  featuredCaseStudy: {
    industry: "Pharma",
    title: "R&D Discovery Portal",
    timeline: "14 Weeks",
    outcome: "Unified research data across 5 global labs.",
    metric: "3x Faster",
    description: "Built a knowledge graph connecting clinical trials, research papers, and internal notes.",
    savings: "$4M Saved"
  },
  caseStudy: { industry: "Enterprise", title: "Transformation", timeline: "12 Weeks", outcome: "Improvement", metric: "40%" },
  resources: []
};
