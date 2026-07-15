const fs = require('fs');
const path = require('path');

const solutions = [
  { slug: "enterprise-ai", name: "Enterprise AI Platform", category: "AI & Generative AI" },
  { slug: "ai-agents", name: "AI Agents & Digital Workforce", category: "AI & Generative AI" },
  { slug: "rag", name: "Retrieval-Augmented Generation (RAG)", category: "AI & Generative AI" },
  { slug: "document-ai", name: "Intelligent Document Processing", category: "Enterprise Automation" },
  { slug: "knowledge-management", name: "Enterprise Knowledge Management", category: "Data & Intelligence" },
  { slug: "hyperautomation", name: "Hyperautomation & Workflow Automation", category: "Enterprise Automation" },
  { slug: "decision-intelligence", name: "Decision Intelligence & Executive Dashboards", category: "Data & Intelligence" },
  { slug: "predictive-analytics", name: "Predictive Analytics & Forecasting", category: "Data & Intelligence" },
  { slug: "customer-experience", name: "AI Customer Experience Platform", category: "Customer Experience" },
  { slug: "erp-modernization", name: "Quantiva ERP Modernization", category: "Enterprise Platforms" },
  { slug: "cloud-modernization", name: "Cloud & Application Modernization", category: "Infrastructure" },
  { slug: "ai-governance", name: "AI Governance, Security & Compliance", category: "Infrastructure" }
];

const dir = path.join(__dirname, 'lib/data/solutions');

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

solutions.forEach(sol => {
    const content = `import { Solution } from "./types";

export const ${sol.slug.replace(/-/g, '_')}: Solution = {
  name: "${sol.name}",
  slug: "${sol.slug}",
  category: "${sol.category}",
  color: "#00F57A",
  hero: {
    title: "${sol.name} for Enterprise Scale",
    subtitle: "${sol.category}",
    description: "Transform your operations and accelerate growth with our outcome-driven platforms.",
    primaryCta: "Book Strategy Session",
    secondaryCta: "Download Architecture Guide"
  },
  overview: "Our ${sol.name} solution replaces manual, fragmented processes with a secure, scalable, and intelligent system designed to deliver measurable business outcomes.",
  businessProblems: [
    { problem: "Manual inefficiencies and high operational costs.", impact: "Reduced profitability." },
    { problem: "Data silos preventing real-time decision making.", impact: "Slow response to market changes." }
  ],
  capabilities: [
    { name: "Automated Workflows", description: "Replace repetitive tasks with autonomous agents." },
    { name: "Real-time Intelligence", description: "Turn raw data into actionable executive insights." }
  ],
  architecture: { nodes: [], edges: [] },
  workflows: { nodes: [], edges: [] },
  agents: [],
  techStack: [],
  roi: [
    { metric: "40%", label: "Cost Reduction", description: "Decrease in operational expenses." }
  ],
  caseStudy: {
    industry: "Enterprise",
    title: "Transformation Initiative",
    timeline: "12 Weeks",
    outcome: "Significant process improvement.",
    metric: "40% Faster"
  },
  resources: []
};
`;
    fs.writeFileSync(path.join(dir, `${sol.slug}.ts`), content);
});

// Generate index.ts
const imports = solutions.map(s => `import { ${s.slug.replace(/-/g, '_')} } from "./${s.slug}";`).join('\\n');
const array = solutions.map(s => s.slug.replace(/-/g, '_')).join(',\\n  ');
const indexContent = `${imports}

export const solutionsData = [
  ${array}
];

export const getSolutionBySlug = (slug: string) => {
  return solutionsData.find((sol) => sol.slug === slug);
};
`;
fs.writeFileSync(path.join(dir, 'index.ts'), indexContent);

console.log("Scaffolded solutions!");
