import { Industry } from "./types";

export const services: Industry = {
  name: "Professional Services",
  slug: "services",
  color: "#10B981", // Emerald
  engineConfig: {
    heroTheme: "services",
    backgroundAnimation: "transaction-network",
    primaryColor: "#10B981", // Emerald
    secondaryColor: "#1E3A8A", // Navy
    accentColor: "#EAB308" // Gold
  },
  hero: {
    title: "AI for Knowledge-Driven Enterprises",
    subtitle: "CONSULTING & LEGAL AI",
    description: "Break down knowledge silos, automate proposal generation, and accelerate project delivery with enterprise AI.",
    primaryCta: "Explore Services AI",
    secondaryCta: "View Architecture",
  },
  overview: {
    maturityScore: 72,
    currentChallengesSummary: "Trapped institutional knowledge and manual document drafting.",
    opportunitySummary: "AI-driven knowledge graphs and automated proposal generation.",
    statistics: [
      { metric: "40%", label: "Faster Proposals" },
      { metric: "25%", label: "Billable Hour Boost" },
      { metric: "100%", label: "Knowledge Search" }
    ]
  },
  segments: ["Management Consulting", "Legal Services", "Accounting", "Architecture", "Engineering", "Marketing Agencies"],
  challenges: [
    {
      title: "Knowledge Silos",
      pain: "Consultants re-inventing the wheel because past work is hidden in disjointed drives.",
      cost: "Wasted billable hours and lower quality deliverables",
      businessImpact: "Margin Compression",
      priority: "Critical",
      category: "Operations",
      problems: ["Trapped Data", "SharePoint Mazes", "High Turnover Loss", "Redundant Work"],
      solutions: ["Enterprise Knowledge Graph", "Semantic Search", "RAG Systems", "AI Research Assistant"],
      outcomes: ["↑ Consultant Efficiency", "↓ Research Time", "↑ IP Reusability"],
      techStack: ["Neo4j", "Pinecone", "LangChain", "Azure OpenAI"],
      aiAgent: "Research Agent",
      readiness: { implementation: "10 Weeks", complexity: "Medium", roi: "Very High" }
    },
    {
      title: "Proposal Creation",
      pain: "Manual drafting of RFPs takes valuable time away from client delivery.",
      cost: "Lost bids and high business development costs",
      businessImpact: "Revenue Leakage",
      priority: "High",
      category: "Operations",
      problems: ["Slow Response Times", "Inconsistent Branding", "Manual Copy-Pasting", "Missed Deadlines"],
      solutions: ["Proposal AI Agent", "Generative Drafting", "Past Performance Matching", "Automated Formatting"],
      outcomes: ["↑ Win Rate", "↓ BD Costs", "↑ Proposal Volume"],
      techStack: ["Anthropic", "ElasticSearch", "React", "Node.js"],
      aiAgent: "Proposal Agent",
      readiness: { implementation: "8 Weeks", complexity: "Low", roi: "High" }
    },
    {
      title: "Decision Support",
      pain: "Partners lack real-time visibility into project health and margins.",
      cost: "Project overruns and poor resource allocation",
      businessImpact: "Operational Friction",
      priority: "High",
      category: "Risk",
      problems: ["Stale Dashboards", "Resource Clashes", "Scope Creep", "Margin Erosion"],
      solutions: ["Executive Intelligence AI", "Predictive Analytics", "Automated Status Reporting", "Resource Optimization"],
      outcomes: ["↑ Project Margins", "↑ Resource Utilization", "↓ Scope Creep"],
      techStack: ["Databricks", "Tableau", "AWS", "Python"],
      aiAgent: "Executive Agent",
      readiness: { implementation: "12 Weeks", complexity: "Medium", roi: "High" }
    }
  ],
  opportunityMatrix: [
    { name: "Consulting Copilot", description: "AI companion assisting in daily client deliverables.", roi: "High" }
  ],
  architecture: {
    nodes: [
      { id: "consultant", position: { x: 0, y: 150 }, data: { label: "Consultant", type: "client" } },
      { id: "portal", position: { x: 200, y: 150 }, data: { label: "Intranet", type: "gateway", status: "Healthy" } },
      { id: "kg", position: { x: 400, y: 150 }, data: { label: "Knowledge Graph", type: "database" } },
      { id: "ai", position: { x: 600, y: 150 }, data: { label: "Services AI", type: "ai", status: "Active" } }
    ],
    edges: []
  },
  agents: [
    { name: "Research Agent", description: "Synthesizes past deliverables.", capabilities: ["Semantic Search"] },
    { name: "Proposal Agent", description: "Drafts client proposals.", capabilities: ["Generation"] }
  ],
  erpIntegration: ["PSA", "Finance", "CRM"],
  techStack: [{ layer: "Knowledge", technologies: ["Vector DB", "Graph DB"] }],
  outcomes: [],
  caseStudy: { client: "Global Consultancy", title: "AI Knowledge Base", timeline: "6 Months", architecture: "Services AI", outcome: "Success", metric: "40%" },
  roadmap: [],
  compliance: [{ badge: "ISO 27001", description: "Information Security Management" }],
  relatedProducts: [],
  relatedSolutions: [],
  resources: []
};
