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
      { label: "Architecture", href: "/platform/architecture" },
      { label: "Capabilities", href: "/platform#capabilities" },
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
    label: "Research",
    href: "/research",
    children: [
      { label: "CerebroHive Labs", href: "/research" },
      { label: "Agent Architectures", href: "/research/agent-architectures" },
      { label: "AI Safety", href: "/research/ai-safety" },
    ]
  },
  {
    label: "Company",
    href: "/company",
    children: [
      { label: "About Us", href: "/company/about" },
      { label: "Careers", href: "/company/careers" },
      { label: "Contact", href: "/company/contact" },
    ]
  }
];

export const footerNavigation = {
  platform: [
    { label: "AgentOS™", href: "/platform/agentos" },
    { label: "Memory Fabric™", href: "/platform/memory-fabric" },
    { label: "Knowledge Fabric™", href: "/platform/knowledge-fabric" },
    { label: "Reasoning Engine™", href: "/platform/reasoning-engine" },
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
    { label: "About", href: "/company/about" },
    { label: "Careers", href: "/company/careers" },
    { label: "Contact", href: "/company/contact" },
  ]
};
