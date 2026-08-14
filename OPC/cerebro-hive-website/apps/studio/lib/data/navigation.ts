export interface NavLink {
  label: string;
  href: string;
}

export interface NavColumn {
  heading?: string;
  items: NavLink[];
}

export interface NavEntry {
  label: string;
  href: string;
  columns: NavColumn[];
}

export const mainNavigation: NavEntry[] = [
  {
    label: "Platform",
    href: "/platform",
    columns: [
      {
        items: [
          { label: "Overview", href: "/platform" },
          { label: "Architecture", href: "/developers/architecture" },
          { label: "Capabilities", href: "/platform#capabilities" },
          { label: "Live Runtime", href: "/platform/live-runtime" },
          { label: "Enterprise AI OS Console", href: "/platform/os" },
          { label: "HiveForge™ — AI Cloud Marketplace", href: "/platform/hiveforge" },
        ]
      },
      {
        items: [
          { label: "CerebroStudio™ — AI Development Workspace", href: "/platform/studio" },
          { label: "CerebroSwarm™ — Enterprise Cognitive Workforce", href: "/platform/swarm" },
          { label: "CerebroInsight™ — Executive Intelligence Platform", href: "/platform/insight" },
          { label: "CerebroGrowth™ — Enterprise AI Growth Engine", href: "/platform/growth" },
          { label: "CerebroForge™ — AI Innovation Factory", href: "/platform/forge" },
          { label: "Hive Infrastructure Suite", href: "/platform/cloud" },
        ]
      },
    ]
  },
  {
    label: "Solutions",
    href: "/industries",
    columns: [
      {
        heading: "Industries",
        items: [
          { label: "All Industries", href: "/industries" },
          { label: "Healthcare", href: "/industries/healthcare" },
          { label: "Financial Services", href: "/industries/finance" },
          { label: "Manufacturing", href: "/industries/manufacturing" },
          { label: "Retail", href: "/industries/retail" },
        ]
      },
      {
        heading: "Services",
        items: [
          { label: "Enterprise Services", href: "/services" },
          { label: "AI Strategy", href: "/services/ai-strategy" },
          { label: "Intelligence Modernization", href: "/services/intelligence-modernization" },
          { label: "AI Factory", href: "/services/ai-factory" },
        ]
      },
    ]
  },
  {
    label: "Products",
    href: "/products",
    columns: [
      {
        items: [
          { label: "All Products", href: "/products" },
          { label: "CerebroArchive", href: "/products/cerebro-archive" },
          { label: "CerebroStudio", href: "/products/cerebro-studio" },
          { label: "CerebroFlow", href: "/products/cerebro-flow" },
          { label: "CerebroCopilot", href: "/products/cerebro-copilot" },
        ]
      },
    ]
  },
  {
    label: "Resources",
    href: "/insights",
    columns: [
      {
        heading: "Resources",
        items: [
          { label: "CerebroLabs™", href: "/research" },
          { label: "Insights", href: "/insights" },
          { label: "Documentation", href: "/developers" },
          { label: "Whitepapers", href: "/resources/whitepapers" },
          { label: "Case Studies", href: "/case-studies" },
        ]
      },
    ]
  },
  {
    label: "Company",
    href: "/company",
    columns: [
      {
        items: [
          { label: "About Us", href: "/about" },
          { label: "Careers", href: "/careers" },
          { label: "Contact", href: "/contact" },
        ]
      },
    ]
  },
];

export const footerNavigation = {
  platform: [
    { label: "Enterprise AI OS Console", href: "/platform/os" },
    { label: "HiveForge — AI Cloud Marketplace", href: "/platform/hiveforge" },
    { label: "CerebroStudio™", href: "/platform/studio" },
    { label: "CerebroGrowth™", href: "/platform/growth" },
    { label: "CerebroForge™", href: "/platform/forge" },
    { label: "Hive Infrastructure Suite", href: "/platform/cloud" },
    { label: "View All Products →", href: "/platform" },
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
