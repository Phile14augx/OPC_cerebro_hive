import { services } from "@/lib/data/services";
import { industriesData } from "@/lib/data/industries";
import { products } from "@/lib/data/products";
import { researchPrograms } from "@/lib/data/research";
import { platformCapabilities } from "@/lib/data/platform";

export interface SitemapLink {
  label: string;
  href: string;
}

export interface SitemapSection {
  title: string;
  description: string;
  iconName: string;
  links: SitemapLink[];
}

export const sitemapSections: SitemapSection[] = [
  {
    title: "Platform",
    description: "The CerebroHive intelligence platform and its core capabilities.",
    iconName: "Layers",
    links: [
      { label: "Platform Overview", href: "/platform" },
      { label: "Live Runtime", href: "/platform/live-runtime" },
      ...platformCapabilities.map((c) => ({ label: c.title, href: `/platform/${c.slug}` })),
    ],
  },
  {
    title: "Products",
    description: "Packaged products built on the CerebroHive platform.",
    iconName: "Package",
    links: [
      { label: "All Products", href: "/products" },
      { label: "AgentOS", href: "/products/agentos" },
      { label: "AgentOS Live Runtime", href: "/products/agentos/live-runtime" },
      ...products.map((p) => ({ label: p.title, href: `/products/${p.slug}` })),
    ],
  },
  {
    title: "Services",
    description: "Enterprise consulting and delivery services.",
    iconName: "Briefcase",
    links: [
      { label: "Enterprise Services", href: "/services" },
      ...services.map((s) => ({ label: s.title, href: `/services/${s.slug}` })),
    ],
  },
  {
    title: "Industries",
    description: "Vertical solutions across every sector we serve.",
    iconName: "Factory",
    links: [
      { label: "All Industries", href: "/industries" },
      ...industriesData.map((i) => ({ label: i.name, href: `/industries/${i.slug}` })),
    ],
  },
  {
    title: "Research",
    description: "CerebroHive Labs research programs and publications.",
    iconName: "FlaskConical",
    links: [
      { label: "CerebroHive Labs", href: "/research" },
      ...researchPrograms.map((r) => ({ label: r.title, href: `/research/${r.slug}` })),
    ],
  },
  {
    title: "Academy & Learning",
    description: "Courses, learning paths, and corporate AI training.",
    iconName: "GraduationCap",
    links: [
      { label: "Academy", href: "/academy" },
      { label: "Courses", href: "/academy/courses" },
      { label: "Learning Paths", href: "/academy/learning-paths" },
      { label: "Corporate Programs", href: "/academy/corporate-programs" },
      { label: "Referral Program", href: "/academy/referral" },
      { label: "Learn", href: "/learn" },
      { label: "Handbook", href: "/handbook" },
    ],
  },
  {
    title: "Insights & Resources",
    description: "Briefings, case studies, and downloadable resources.",
    iconName: "Newspaper",
    links: [
      { label: "Insights", href: "/insights" },
      { label: "Case Studies", href: "/case-studies" },
      { label: "Sales Pipeline Automation", href: "/case-studies/sales-pipeline-automation" },
      { label: "Logistics Support Automation", href: "/case-studies/logistics-support-automation" },
      { label: "Corporate AI Training", href: "/case-studies/corporate-ai-training" },
      { label: "Resources", href: "/resources" },
      { label: "Blog", href: "/resources/blog" },
      { label: "Whitepapers", href: "/resources/whitepapers" },
      { label: "Templates", href: "/resources/templates" },
      { label: "AI Tools Directory", href: "/resources/ai-tools-directory" },
      { label: "Community", href: "/community" },
    ],
  },
  {
    title: "Developers",
    description: "APIs, architecture docs, changelogs, and system status.",
    iconName: "Code2",
    links: [
      { label: "Developer Hub", href: "/developers" },
      { label: "API Reference", href: "/developers/api" },
      { label: "Architecture", href: "/developers/architecture" },
      { label: "Changelog", href: "/developers/changelog" },
      { label: "Releases", href: "/developers/releases" },
      { label: "Roadmap", href: "/developers/roadmap" },
      { label: "System Status", href: "/status" },
    ],
  },
  {
    title: "Interactive Tools",
    description: "Free assessment and discovery tools.",
    iconName: "Wrench",
    links: [
      { label: "AI Readiness Assessment", href: "/tools/ai-readiness" },
      { label: "Solution Finder", href: "/tools/solution-finder" },
    ],
  },
  {
    title: "Company",
    description: "Who we are, careers, and how to reach us.",
    iconName: "Building2",
    links: [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "Company", href: "/company" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
      { label: "Client Portal", href: "/client-portal" },
    ],
  },
  {
    title: "Legal",
    description: "Policies, terms, and governance commitments.",
    iconName: "Scale",
    links: [
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Terms of Service", href: "/legal/terms" },
      { label: "Security", href: "/legal/security" },
      { label: "AI Ethics", href: "/legal/ai-ethics" },
    ],
  },
];

export const sitemapPageCount = sitemapSections.reduce(
  (sum, s) => sum + s.links.length,
  0
);
