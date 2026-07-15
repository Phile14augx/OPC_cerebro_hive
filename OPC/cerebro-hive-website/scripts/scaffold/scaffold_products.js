const fs = require('fs');
const path = require('path');

const softwarePlatforms = [
  { slug: "quantiva-erp", name: "Quantiva ERP", tagline: "AI-Native Enterprise Platform", color: "#00F57A" },
  { slug: "cerebro-ai-enterprise", name: "Cerebro AI Enterprise", tagline: "Enterprise AI Assistant", color: "#00F57A" },
  { slug: "agentos", name: "AgentOS", tagline: "Multi-Agent Orchestration Platform", color: "#00F57A" },
  { slug: "automation-studio", name: "Automation Studio", tagline: "Workflow and Process Automation", color: "#00F57A" },
  { slug: "knowledge-hub", name: "Knowledge Hub", tagline: "Enterprise Knowledge Management", color: "#00F57A" },
  { slug: "cerebro-analytics", name: "Cerebro Analytics", tagline: "Executive Dashboards", color: "#00F57A" },
];

const frameworks = [
  { slug: "cerebrosphere", name: "CerebroSphere™", tagline: "Enterprise AI Transformation Framework", color: "#00F57A" },
  { slug: "hivematrix", name: "HiveMatrix™", tagline: "AI Opportunity Assessment", color: "#00F57A" },
  { slug: "neuroflow", name: "NeuroFlow™", tagline: "AI Delivery Lifecycle", color: "#00F57A" },
  { slug: "synapsex", name: "SynapseX™", tagline: "Enterprise AI Architecture Framework", color: "#00F57A" },
  { slug: "agentforge", name: "AgentForge™", tagline: "Multi-Agent Design Methodology", color: "#00F57A" },
  { slug: "quantiva-integration-framework", name: "Quantiva Integration Framework™", tagline: "ERP + AI Integration Blueprint", color: "#00F57A" },
  { slug: "cortexops", name: "CortexOps™", tagline: "AI Operations & Governance", color: "#00F57A" },
  { slug: "hivescore", name: "HiveScore™", tagline: "Interactive Maturity Assessment", color: "#00F57A" },
  { slug: "decisiondna", name: "DecisionDNA™", tagline: "Executive Decision Intelligence", color: "#00F57A" },
  { slug: "ai-value-canvas", name: "AI Value Canvas™", tagline: "Investment & Implementation Canvas", color: "#00F57A" },
];

const dir = path.join(__dirname, 'lib/data/products');

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

// Generate Software
softwarePlatforms.forEach(p => {
    const content = `import { SoftwarePlatform } from "./types";

export const ${p.slug.replace(/-/g, '_')}: SoftwarePlatform = {
  type: "software",
  slug: "${p.slug}",
  name: "${p.name}",
  tagline: "${p.tagline}",
  description: "CerebroHive's ${p.name} transforms operations by integrating AI directly into core enterprise workflows.",
  color: "${p.color}",
  modules: ["Finance", "HR", "CRM", "Inventory", "Manufacturing"],
  features: ["Enterprise Copilot", "Workflow Automation", "AI Agents", "Knowledge Graph"],
  deploymentOptions: [
    { name: "Cloud", icon: "Cloud", description: "AWS, Azure, GCP" },
    { name: "Hybrid", icon: "CloudSnow", description: "Edge + Cloud" }
  ],
  comparisons: {
    featuresList: ["AI Copilot", "Multi-Agent Workflows", "API First", "Cloud Deployment", "On-Premise"],
    cerebro: { "AI Copilot": "yes", "Multi-Agent Workflows": "yes", "API First": "yes", "Cloud Deployment": "yes", "On-Premise": "yes" },
    competitors: [
      {
        competitor: "SAP",
        features: { "AI Copilot": "yes", "Multi-Agent Workflows": "limited", "API First": "yes", "Cloud Deployment": "yes", "On-Premise": "yes" }
      },
      {
        competitor: "Oracle",
        features: { "AI Copilot": "yes", "Multi-Agent Workflows": "limited", "API First": "yes", "Cloud Deployment": "yes", "On-Premise": "limited" }
      }
    ]
  },
  integrations: ["Microsoft", "SAP", "Oracle", "Salesforce", "AWS", "Stripe"],
  architecture: { nodes: [], edges: [] }
};
`;
    fs.writeFileSync(path.join(dir, `${p.slug}.ts`), content);
});

// Generate Frameworks
frameworks.forEach(f => {
    const content = `import { ProprietaryFramework } from "./types";

export const ${f.slug.replace(/-/g, '_')}: ProprietaryFramework = {
  type: "framework",
  slug: "${f.slug}",
  name: "${f.name}",
  tagline: "${f.tagline}",
  description: "A proprietary methodology designed to accelerate enterprise AI adoption and govern scalable architectures.",
  color: "${f.color}",
  phases: ["Discover", "Assess", "Prioritize", "Architect", "Build", "Operate"],
  components: ["Strategy", "Data", "Technology", "People", "Governance"],
  deliverables: ["Executive Presentation", "Architecture Blueprint", "Assessment Report", "AI Roadmap"],
  industries: ["Finance", "Healthcare", "Manufacturing", "Retail", "Government"],
  architecture: { nodes: [], edges: [] }
};
`;
    fs.writeFileSync(path.join(dir, `${f.slug}.ts`), content);
});

// Generate index.ts
const all = [...softwarePlatforms, ...frameworks];
const imports = all.map(s => `import { ${s.slug.replace(/-/g, '_')} } from "./${s.slug}";`).join('\\n');
const softwareArray = softwarePlatforms.map(s => s.slug.replace(/-/g, '_')).join(',\\n  ');
const frameworkArray = frameworks.map(s => s.slug.replace(/-/g, '_')).join(',\\n  ');

const indexContent = `${imports}

export const softwarePlatformsData = [
  ${softwareArray}
];

export const proprietaryFrameworksData = [
  ${frameworkArray}
];

export const allProductsData = [...softwarePlatformsData, ...proprietaryFrameworksData];

export const getProductBySlug = (slug: string) => {
  return allProductsData.find((p) => p.slug === slug);
};
`;
fs.writeFileSync(path.join(dir, 'index.ts'), indexContent);

console.log("Scaffolded products and frameworks!");
