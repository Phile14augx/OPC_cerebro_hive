const fs = require('fs');
const path = require('path');

const industries = ["finance", "manufacturing", "retail", "government", "insurance", "education", "construction", "energy", "logistics", "telecom", "realestate"];
const dir = path.join(__dirname, 'lib/data/industries');

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

industries.forEach(ind => {
    const name = ind.charAt(0).toUpperCase() + ind.slice(1);
    const content = `import { Industry } from "./types";

export const ${ind}: Industry = {
  name: "${name}",
  slug: "${ind}",
  color: "#3B82F6",
  hero: {
    title: "Enterprise AI for ${name}",
    subtitle: "${name} AI",
    description: "Transform your operations with intelligent, automated systems.",
    primaryCta: "Book Strategy Session",
    secondaryCta: "Download Architecture",
    dynamicBackgroundType: "${ind}" as any
  },
  overview: {
    maturityScore: 50,
    currentChallengesSummary: "Legacy systems and manual processes.",
    opportunitySummary: "Automation and predictive intelligence."
  },
  challenges: [],
  opportunityMatrix: [],
  architecture: { nodes: [], edges: [] },
  agents: [],
  workflows: { nodes: [], edges: [] },
  techStack: [],
  outcomes: [],
  caseStudy: {
    client: "Sample Client",
    title: "AI Transformation",
    timeline: "12 Weeks",
    architecture: "Enterprise AI Pipeline",
    outcome: "Significant Improvement",
    metric: "30%"
  },
  roadmap: [],
  security: [],
  resources: []
};
`;
    fs.writeFileSync(path.join(dir, `${ind}.ts`), content);
});

console.log("Scaffolded industries!");
