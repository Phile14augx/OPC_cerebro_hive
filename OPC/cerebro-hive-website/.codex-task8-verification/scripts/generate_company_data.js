const fs = require('fs');
const path = require('path');
const dir = 'lib/content/company';

const files = {
  'company.ts': `export const companyOverview = { 
  vision: "To be the definitive AI-native enterprise transformation partner by 2030.", 
  mission: "To make AI-native transformation accessible, predictable, and measurably profitable for ambitious enterprises.", 
  purpose: "We close the execution gap between an executive's AI vision and a working AI system in production.", 
  pillars: ["Outcome Obsession", "Engineering Excellence", "Responsible AI", "Continuous Innovation"] 
};`,
  
  'leadership.ts': `export const executiveLeadership = [
  { name: "Dr. Sarah Chen", role: "Chief Executive Officer", category: "Executive", bio: "Former Head of AI Transformation at global consultancy...", image: "/images/placeholders/ceo.jpg" },
  { name: "Marcus Thorne", role: "Chief Technology Officer", category: "Engineering", bio: "Ex-hyperscaler lead engineer...", image: "/images/placeholders/cto.jpg" },
  { name: "Elena Rodriguez", role: "VP of Research & Labs", category: "Research", bio: "Leads CerebroHive Labs...", image: "/images/placeholders/vp-research.jpg" }
];`,
  
  'timeline.ts': `export const milestones = [
  { title: "Foundation", year: "2024", description: "CerebroHive is established with a counter-positioning against strategy firms that cannot build and tech firms that cannot connect AI to business outcomes." },
  { title: "Research", year: "2024", description: "Established CerebroHive Labs to bridge academic research with enterprise deployment." },
  { title: "Enterprise Consulting", year: "2025", description: "Scaled delivery capabilities across 16 industries." },
  { title: "AI Platforms", year: "2026", description: "Launch of Quantiva ERP and AgentOS. Expansion of CerebroHive Labs." },
  { title: "Global Expansion", year: "2028", description: "Expansion across North America, UK, Australia, and the Middle East." },
  { title: "Future", year: "2030+", description: "The definitive AI-native transformation partner." }
];`,
  
  'values.ts': `import { Target, Zap, ShieldCheck, Handshake, Lightbulb, Scale } from "lucide-react";
export const coreValues = [
  { id: "outcome-obsession", title: "Outcome Obsession", description: "We measure success by business value delivered—revenue gained, cost removed, or risk reduced. Technology is just the lever.", icon: Target, color: "#00E5FF" },
  { id: "engineering-excellence", title: "Engineering Excellence", description: "We build for production, not for pilot. Our code is secure, scalable, and built to survive enterprise reality.", icon: Zap, color: "#00F57A" },
  { id: "intellectual-honesty", title: "Intellectual Honesty", description: "We tell the truth about AI limitations. No hype, no vaporware. If a rule-based system is better, we will build that.", icon: ShieldCheck, color: "#FF3366" },
  { id: "client-partnership", title: "Client Partnership", description: "We don't throw models over the wall. We embed with our clients, transfer knowledge, and build internal capability.", icon: Handshake, color: "#FFB000" },
  { id: "continuous-innovation", title: "Continuous Innovation", description: "Our dedicated Labs division ensures we are always testing the edge, filtering signal from noise for our clients.", icon: Lightbulb, color: "#9D00FF" },
  { id: "responsible-ai", title: "Responsible AI", description: "We embed governance, auditability, and bias mitigation into every architecture by default, not as an afterthought.", icon: Scale, color: "#00E5FF" }
];`,
  
  'culture.ts': `export const engineeringCulture = {
  tagline: "Engineering First, Research Driven",
  principles: ["Secure by default", "Scalable architectures", "Data privacy absolute"]
};`,
  
  'metrics.ts': `export const companyMetrics = [
  { label: "Founded", value: "2024", icon: "clock" },
  { label: "Headquarters", value: "India", icon: "globe" },
  { label: "Research Frameworks", value: "10", icon: "book" },
  { label: "Industry Focus", value: "16+", icon: "building" },
  { label: "Delivery Model", value: "Global", icon: "network" },
  { label: "Engagement Models", value: "Multiple", icon: "handshake" }
];`,
  
  'partners.ts': `export const partners = {
  technology: ["Azure AI (Used)", "AWS (Used)", "Google Cloud (Used)", "Snowflake (Used)", "Databricks (Used)"],
  strategic: [],
  research: ["OpenAI (API Provider)", "Anthropic (API Provider)"]
};`,
  
  'certifications.ts': `export const certifications = {
  achieved: [],
  roadmap: ["ISO 27001", "SOC 2 Type I & II", "HIPAA Compliance", "FedRAMP"]
};`,
  
  'offices.ts': `export const globalPresence = [
  { region: "India", status: "Operational", type: "Current Headquarters" },
  { region: "UK", status: "Expansion Target", type: "Delivery Capability" },
  { region: "North America", status: "Expansion Target", type: "Delivery Capability" },
  { region: "Middle East", status: "Expansion Target", type: "Delivery Capability" }
];`,
  
  'careers.ts': `export const careers = [
  { department: "AI", status: "Always Looking" },
  { department: "Cloud", status: "Always Looking" },
  { department: "Engineering", status: "Always Looking" },
  { department: "Research", status: "Always Looking" },
  { department: "Design", status: "Always Looking" }
];`,
  
  'news.ts': `export const newsCategories = ["Press Releases", "Blogs", "Research", "Announcements", "Media Coverage", "Events"];`
};

for (const [filename, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(dir, filename), content);
}
if (fs.existsSync(path.join(dir, 'data.ts'))) {
  fs.unlinkSync(path.join(dir, 'data.ts'));
}
console.log('Files generated successfully.');
