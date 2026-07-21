export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export const mainNavigation: NavItem[] = [
  {
    label: "Platform",
    href: "/platform",
    children: [
      { label: "Overview", href: "/platform" },
      { label: "Architecture", href: "/developers/architecture" },
      { label: "Capabilities", href: "/platform#capabilities" },
      { label: "Live Runtime", href: "/platform/live-runtime" },
      { label: "Enterprise AI OS Console", href: "/platform/os" },
      { label: "HiveForge — AI Cloud Marketplace", href: "/platform/hiveforge" },
      { label: "CerebroStudio™ — AI Development Workspace", href: "/platform/studio" },
      { label: "CerebroSwarm™ — Enterprise Cognitive Workforce", href: "/platform/swarm" },
      { label: "CerebroInsight™ — Executive Intelligence Platform", href: "/platform/insight" },
      { label: "CerebroGrowth™ — Enterprise AI Growth Engine", href: "/platform/growth" },
      { label: "CerebroForge™ — AI Innovation Factory", href: "/platform/forge" },
    ]
  },
  {
    label: "Products",
    href: "/products",
    children: [
      { label: "All Products", href: "/products" },
      { label: "CerebroArchive", href: "/products/cerebro-archive" },
      { label: "CerebroStudio", href: "/products/cerebro-studio" },
      { label: "CerebroFlow", href: "/products/cerebro-flow" },
      { label: "CerebroCopilot", href: "/products/cerebro-copilot" },
    ]
  },
  {
    label: "Services",
    href: "/services",
    children: [
      { label: "Enterprise Services", href: "/services" },
      { label: "AI Strategy", href: "/services/ai-strategy" },
      { label: "Intelligence Modernization", href: "/services/intelligence-modernization" },
      { label: "AI Factory", href: "/services/ai-factory" },
    ]
  },
  {
    label: "Industries",
    href: "/industries",
    children: [
      { label: "All Industries", href: "/industries" },
      { label: "Healthcare", href: "/industries/healthcare" },
      { label: "Financial Services", href: "/industries/finance" },
      { label: "Manufacturing", href: "/industries/manufacturing" },
      { label: "Retail", href: "/industries/retail" },
    ]
  },
  {
    label: "CerebroLabs™",
    href: "/research",
    children: [
      { label: "CerebroHive Labs", href: "/research" },
      { label: "Agent Architectures", href: "/research/agent-architectures" },
      { label: "AI Safety", href: "/research/ai-safety" },
    ]
  },
  {
    label: "Insights",
    href: "/insights",
    children: [
      { label: "All Insights", href: "/insights" },
      { label: "Executive Briefings", href: "/insights#briefings" },
      { label: "Market Trends", href: "/insights#trends" },
      { label: "Technical Deep Dives", href: "/insights#technical" },
    ]
  },
  {
    label: "Company",
    href: "/company",
    children: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ]
  }
];

export const footerNavigation = {
  platform: [
    { label: "AgentOS™", href: "/platform/agentos" },
    { label: "Memory Fabric™", href: "/platform/memory-fabric" },
    { label: "Knowledge Fabric™", href: "/platform/knowledge-fabric" },
    { label: "Reasoning Engine™", href: "/platform/reasoning-engine" },
    { label: "Live Runtime →", href: "/platform/live-runtime" },
    { label: "Enterprise AI OS Console →", href: "/platform/os" },
    { label: "HiveForge — AI Cloud Marketplace →", href: "/platform/hiveforge" },
    { label: "CerebroStudio™ — AI Development Workspace →", href: "/platform/studio" },
    { label: "CerebroSwarm™ — Enterprise Cognitive Workforce →", href: "/platform/swarm" },
    { label: "CerebroInsight™ — Executive Intelligence Platform →", href: "/platform/insight" },
    { label: "CerebroGrowth™ — Enterprise AI Growth Engine →", href: "/platform/growth" },
    { label: "CerebroForge™ — AI Innovation Factory →", href: "/platform/forge" },
  ],
  products: [
    { label: "CerebroArchive™", href: "/products/cerebro-archive" },
    { label: "CerebroStudio™", href: "/products/cerebro-studio" },
    { label: "CerebroFlow™", href: "/products/cerebro-flow" },
    { label: "HiveShield™", href: "/products/hive-shield" },
  ],
  services: [
    { label: "Enterprise AI Strategy", href: "/services/ai-strategy" },
    { label: "Intelligence Modernization", href: "/services/intelligence-modernization" },
    { label: "AI Platform Engineering", href: "/services/ai-platform-engineering" },
    { label: "AI Governance & Trust", href: "/services/ai-governance" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ]
};
