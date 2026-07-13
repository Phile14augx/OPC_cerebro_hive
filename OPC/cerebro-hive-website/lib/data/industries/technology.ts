import { Industry } from "./types";

export const technology: Industry = {
  name: "Technology & SaaS",
  slug: "technology",
  color: "#0EA5E9", // Electric Blue
  engineConfig: {
    heroTheme: "technology",
    backgroundAnimation: "transaction-network",
    primaryColor: "#0EA5E9", // Electric Blue
    secondaryColor: "#A855F7", // Purple
    accentColor: "#06B6D4" // Cyan
  },
  hero: {
    title: "Building Intelligent Digital Enterprises",
    subtitle: "SAAS & TECH AI",
    description: "Accelerate software delivery, optimize cloud infrastructure, and embed AI natively into your SaaS products.",
    primaryCta: "Explore Tech AI",
    secondaryCta: "View Architecture",
  },
  overview: {
    maturityScore: 95,
    currentChallengesSummary: "Slow engineering velocity and rising cloud costs.",
    opportunitySummary: "AI-augmented DevOps and intelligent cloud orchestration.",
    statistics: [
      { metric: "50%", label: "Faster Ship Times" },
      { metric: "30%", label: "Cloud Cost Savings" },
      { metric: "90%", label: "Code Coverage" }
    ]
  },
  segments: ["SaaS", "PaaS", "IaaS", "Consumer Tech", "Enterprise Software", "Cybersecurity"],
  challenges: [
    {
      title: "Software Delivery",
      pain: "Slow engineering velocity and technical debt.",
      cost: "Lost market opportunities and high R&D spend",
      businessImpact: "Revenue Leakage",
      priority: "Critical",
      category: "Operations",
      problems: ["Slow Code Reviews", "Technical Debt", "Manual Testing", "Developer Burnout"],
      solutions: ["Coding Agent", "Automated PR Reviews", "Generative Testing", "Legacy Refactoring"],
      outcomes: ["↑ Engineering Velocity", "↓ Bug Rates", "↑ Developer Happiness"],
      techStack: ["GitHub Copilot", "LangChain", "OpenAI", "Jest"],
      aiAgent: "DevOps Agent",
      readiness: { implementation: "4 Weeks", complexity: "Low", roi: "Very High" }
    },
    {
      title: "Cloud Cost",
      pain: "Spiraling infrastructure costs due to poor orchestration.",
      cost: "Margin compression",
      businessImpact: "Margin Compression",
      priority: "High",
      category: "Operations",
      problems: ["Over-provisioning", "Zombie Resources", "Inefficient Scaling", "Multi-cloud Complexity"],
      solutions: ["Cloud Agent", "Predictive Scaling", "Spot Instance AI", "FinOps Analytics"],
      outcomes: ["↓ Cloud Bill", "↑ Resource Utilization", "↓ Carbon Footprint"],
      techStack: ["Kubernetes", "AWS Cost Explorer", "Datadog", "TensorFlow"],
      aiAgent: "Cloud Agent",
      readiness: { implementation: "8 Weeks", complexity: "Medium", roi: "High" }
    },
    {
      title: "AI Integration",
      pain: "Struggling to build native AI features into existing SaaS products.",
      cost: "Losing competitive edge to AI-first startups",
      businessImpact: "Lost Market Share",
      priority: "Critical",
      category: "Customer",
      problems: ["RAG Complexity", "LLM Hallucinations", "Latency", "Data Privacy"],
      solutions: ["Architecture Agent", "Enterprise RAG", "Model Routing", "Knowledge Graphs"],
      outcomes: ["↑ Product Stickiness", "↑ Net Revenue Retention", "↓ Time to Market"],
      techStack: ["Pinecone", "Anthropic", "Neo4j", "FastAPI"],
      aiAgent: "Architecture Agent",
      readiness: { implementation: "12 Weeks", complexity: "High", roi: "Very High" }
    }
  ],
  opportunityMatrix: [
    { name: "DevOps Intelligence", description: "AI-driven CI/CD pipelines and automated rollbacks.", roi: "High" }
  ],
  architecture: {
    nodes: [
      { id: "dev", position: { x: 0, y: 150 }, data: { label: "Developer", type: "client" } },
      { id: "cicd", position: { x: 200, y: 150 }, data: { label: "CI/CD Pipeline", type: "system", status: "Healthy" } },
      { id: "ai", position: { x: 400, y: 150 }, data: { label: "AI Engineering Platform", type: "ai", status: "Active" } },
      { id: "cloud", position: { x: 600, y: 150 }, data: { label: "Cloud Infrastructure", type: "cloud" } }
    ],
    edges: []
  },
  agents: [
    { name: "Coding Agent", description: "Writes and reviews code.", capabilities: ["Generation"] },
    { name: "Cloud Agent", description: "Optimizes infrastructure spend.", capabilities: ["FinOps"] }
  ],
  erpIntegration: ["Jira", "GitHub", "Billing"],
  techStack: [{ layer: "Infrastructure", technologies: ["Kubernetes", "Terraform"] }],
  outcomes: [],
  caseStudy: { client: "Global SaaS", title: "AI Product Suite", timeline: "3 Months", architecture: "Tech AI", outcome: "Success", metric: "300%" },
  roadmap: [],
  compliance: [{ badge: "SOC 2 Type II", description: "Security and Availability" }],
  relatedProducts: [],
  relatedSolutions: [],
  resources: []
};
