import {
  Home,
  MessageSquare,
  Share2,
  Clapperboard,
  Users,
  ListChecks,
  Sparkles,
  Network,
  Brain,
  Wallet,
  Filter,
  Workflow,
  Map,
  Plug,
  BarChart3,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

export const NAV_OPERATE: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/comms", label: "Comms", icon: MessageSquare },
  { href: "/funnel", label: "Funnel", icon: Filter },
  { href: "/workflows", label: "Workflows", icon: Workflow },
  { href: "/social", label: "Social", icon: Share2 },
  { href: "/content", label: "Content", icon: Clapperboard },
  { href: "/finances", label: "Finances", icon: Wallet },
];

export const NAV_AGENTS: NavItem[] = [
  { href: "/agents", label: "Agents", icon: Users },
  { href: "/tasks", label: "Tasks", icon: ListChecks },
  { href: "/skills", label: "Skills", icon: Sparkles },
  { href: "/org", label: "Org Chart", icon: Network },
];

export const NAV_INTELLIGENCE: NavItem[] = [{ href: "/brain", label: "Brain", icon: Brain }];

export const NAV_SYSTEM: NavItem[] = [
  { href: "/integrations", label: "Connections", icon: Plug },
  { href: "/roadmap", label: "Roadmap", icon: Map },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/reference", label: "Reference", icon: LayoutGrid },
];

export const NAV_GROUPS: { id: string; label: string; items: NavItem[] }[] = [
  { id: "operate", label: "Operate", items: NAV_OPERATE },
  { id: "agents", label: "Agents", items: NAV_AGENTS },
  { id: "intelligence", label: "Intelligence", items: NAV_INTELLIGENCE },
  { id: "system", label: "System", items: NAV_SYSTEM },
];

export const NAV_ORDER: string[] = NAV_GROUPS.flatMap((g) => g.items.map((i) => i.href));
export const DIGIT_VIEWS: string[] = NAV_ORDER.slice(0, 9);
