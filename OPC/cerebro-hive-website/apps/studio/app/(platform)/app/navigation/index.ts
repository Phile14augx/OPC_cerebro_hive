import {
  Rocket, BrainCircuit, Box, Server, Database,
  ShieldCheck, Zap, FlaskConical, GraduationCap,
  Briefcase, MessageSquare,
  LayoutDashboard, Building2, FolderKanban, Users,
  Bot, GitMerge, Gamepad2, Network, Library, BookOpen, DatabaseZap,
  ShoppingCart, LayoutTemplate, Layers, Factory, Code2,
  Cloud, BoxSelect, ServerCog, HardDrive, Network as NetworkIcon, MonitorSmartphone, Unplug,
  Workflow, GitPullRequest, LayoutPanelLeft, FileSpreadsheet, PieChart, LineChart,
  KeyRound, UsersRound, FileKey2, ScrollText, CheckCircle2, ShieldAlert,
  FastForward, ArrowRightLeft, CalendarClock, Blocks, Cable,
  Newspaper, FileText, Activity, Milestone,
  GraduationCap as GradIcon, Award, Beaker, Map,
  CreditCard, Receipt, FileStack, ReceiptText, Key,
  Sparkles, HelpCircle, Ticket, Users2, ActivitySquare, Target,
  // CerebroForge icons
  Hammer, Brain, PenTool, Smartphone, Globe, Monitor, MessageCircle,
  TestTube2, Truck, GitBranch, ScanSearch,
  FileCode2, Layers3, Webhook,
  // HiveOps
  DollarSign,
  type LucideIcon
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon?: LucideIcon;
  /**
   * Honest-destination status (D-01/D-06/D-09). Required so TypeScript
   * enforces coverage of every registry item.
   *   - "active"   the href has a literal page.tsx that renders data from a
   *                real backend call (fetch / useForge* / forgeApi / /api/).
   *   - "planned"  everything else, including pages whose page.tsx exists
   *                but renders hardcoded/fabricated content (D-15).
   *   - "disabled" reserved for future use (explicitly turned-off features).
   * See .planning/phases/01-schema-navigation-foundation/01-NAV-STATUS.md
   * for the per-item classification rationale.
   */
  implementationStatus: "active" | "planned" | "disabled";
};

export type NavGroup = {
  title: string;
  href?: string;
  icon: LucideIcon;
  items: NavItem[];
};

export const workspaceNavigation: NavGroup = {
  title: "Workspace",
  icon: Rocket,
  items: [
    { title: "Dashboard", href: "/app", icon: LayoutDashboard, implementationStatus: "planned" },
    { title: "Organizations", href: "/app/organizations", icon: Building2, implementationStatus: "planned" },
    { title: "Projects", href: "/app/projects", icon: FolderKanban, implementationStatus: "planned" },
    { title: "Teams", href: "/app/teams", icon: Users, implementationStatus: "planned" },
  ],
};

export const aiNavigation: NavGroup = {
  title: "AI",
  href: "/app/ai",
  icon: BrainCircuit,
  items: [
    { title: "AI Overview", href: "/app/ai", icon: LayoutDashboard, implementationStatus: "planned" },
    { title: "AI Studio", href: "/app/ai/studio", icon: LayoutPanelLeft, implementationStatus: "planned" },
    { title: "AI Agents", href: "/app/agents", icon: Bot, implementationStatus: "planned" },
    { title: "AI Workflows", href: "/app/workflows", icon: GitMerge, implementationStatus: "planned" },
    { title: "AI Playground", href: "/app/playground", icon: Gamepad2, implementationStatus: "planned" },
    { title: "AI Models", href: "/app/ai/models", icon: Network, implementationStatus: "planned" },
    { title: "Prompt Library", href: "/app/ai/prompts", icon: Library, implementationStatus: "planned" },
    { title: "Knowledge Hub", href: "/app/ai/knowledge", icon: BookOpen, implementationStatus: "planned" },
    { title: "Vector Store", href: "/app/ai/vectors", icon: DatabaseZap, implementationStatus: "planned" },
  ],
};

export const solutionsNavigation: NavGroup = {
  title: "Solutions",
  icon: Box,
  items: [
    { title: "Marketplace", href: "/app/marketplace", icon: ShoppingCart, implementationStatus: "planned" },
    { title: "Templates", href: "/app/templates", icon: LayoutTemplate, implementationStatus: "planned" },
    { title: "Industry Packs", href: "/app/industry", icon: Layers, implementationStatus: "planned" },
    { title: "Quantiva ERP", href: "/app/quantiva", icon: Factory, implementationStatus: "planned" },
    { title: "Custom Solutions", href: "/app/custom", icon: Code2, implementationStatus: "planned" },
  ],
};

export const infrastructureNavigation: NavGroup = {
  title: "Infrastructure",
  href: "/app/infrastructure",
  icon: Server,
  items: [
    { title: "Infra Overview", href: "/app/infrastructure", icon: LayoutDashboard, implementationStatus: "planned" },
    { title: "Cloud", href: "/app/infrastructure/cloud", icon: Cloud, implementationStatus: "planned" },
    { title: "Deployments", href: "/app/infrastructure/deployments", icon: BoxSelect, implementationStatus: "planned" },
    { title: "Kubernetes", href: "/app/infrastructure/kubernetes", icon: ServerCog, implementationStatus: "planned" },
    { title: "Databases", href: "/app/infrastructure/databases", icon: Database, implementationStatus: "planned" },
    { title: "Storage", href: "/app/infrastructure/storage", icon: HardDrive, implementationStatus: "planned" },
    { title: "Networking", href: "/app/infrastructure/networking", icon: NetworkIcon, implementationStatus: "planned" },
    { title: "Edge", href: "/app/infrastructure/edge", icon: MonitorSmartphone, implementationStatus: "planned" },
    { title: "API Gateway", href: "/app/infrastructure/gateway", icon: Unplug, implementationStatus: "planned" },
  ],
};

export const dataNavigation: NavGroup = {
  title: "Data",
  href: "/app/data",
  icon: Database,
  items: [
    { title: "Data Overview", href: "/app/data", icon: LayoutDashboard, implementationStatus: "planned" },
    { title: "Data Pipelines", href: "/app/data/pipelines", icon: Workflow, implementationStatus: "planned" },
    { title: "ETL", href: "/app/data/etl", icon: GitPullRequest, implementationStatus: "planned" },
    { title: "Data Warehouse", href: "/app/data/warehouse", icon: Database, implementationStatus: "planned" },
    { title: "Lakehouse", href: "/app/data/lakehouse", icon: FileSpreadsheet, implementationStatus: "planned" },
    { title: "Analytics", href: "/app/analytics", icon: PieChart, implementationStatus: "planned" },
    { title: "BI", href: "/app/data/bi", icon: LineChart, implementationStatus: "planned" },
  ],
};

export const securityNavigation: NavGroup = {
  title: "Security",
  href: "/app/security",
  icon: ShieldCheck,
  items: [
    { title: "Security Overview", href: "/app/trust/security", icon: LayoutDashboard, implementationStatus: "planned" },
    { title: "IAM", href: "/app/security/iam", icon: KeyRound, implementationStatus: "planned" },
    { title: "Roles", href: "/app/security/roles", icon: UsersRound, implementationStatus: "planned" },
    { title: "Secrets", href: "/app/security/secrets", icon: FileKey2, implementationStatus: "planned" },
    { title: "Audit Logs", href: "/app/trust/audit", icon: ScrollText, implementationStatus: "planned" },
    { title: "Compliance", href: "/app/trust/compliance", icon: CheckCircle2, implementationStatus: "planned" },
    { title: "Policies", href: "/app/trust/policies", icon: ShieldAlert, implementationStatus: "planned" },
  ],
};

export const automationNavigation: NavGroup = {
  title: "Automation",
  href: "/app/automation",
  icon: Zap,
  items: [
    { title: "Automation Overview", href: "/app/automation", icon: LayoutDashboard, implementationStatus: "planned" },
    { title: "Workflow Builder", href: "/app/automation/builder", icon: FastForward, implementationStatus: "planned" },
    { title: "Event Bus", href: "/app/automation/events", icon: ArrowRightLeft, implementationStatus: "planned" },
    { title: "Schedulers", href: "/app/automation/schedulers", icon: CalendarClock, implementationStatus: "planned" },
    { title: "Integrations", href: "/app/automation/integrations", icon: Blocks, implementationStatus: "planned" },
    { title: "Connectors", href: "/app/automation/connectors", icon: Cable, implementationStatus: "planned" },
  ],
};

export const researchNavigation: NavGroup = {
  title: "Research",
  href: "/app/research",
  icon: FlaskConical,
  items: [
    { title: "Research Overview", href: "/app/research", icon: LayoutDashboard, implementationStatus: "planned" },
    { title: "AI News", href: "/app/research/news", icon: Newspaper, implementationStatus: "planned" },
    { title: "Whitepapers", href: "/app/research/whitepapers", icon: FileText, implementationStatus: "planned" },
    { title: "Benchmarks", href: "/app/research/benchmarks", icon: Activity, implementationStatus: "planned" },
    { title: "Architecture", href: "/app/research/architecture", icon: Milestone, implementationStatus: "planned" },
  ],
};

export const academyNavigation: NavGroup = {
  title: "Academy",
  href: "/app/academy",
  icon: GraduationCap,
  items: [
    { title: "Academy Overview", href: "/app/academy", icon: LayoutDashboard, implementationStatus: "planned" },
    { title: "Courses", href: "/app/academy/courses", icon: GradIcon, implementationStatus: "planned" },
    { title: "Certifications", href: "/app/academy/certifications", icon: Award, implementationStatus: "planned" },
    { title: "Labs", href: "/app/academy/labs", icon: Beaker, implementationStatus: "planned" },
    { title: "Learning Paths", href: "/app/academy/paths", icon: Map, implementationStatus: "planned" },
  ],
};

export const businessNavigation: NavGroup = {
  title: "Business",
  href: "/app/business",
  icon: Briefcase,
  items: [
    { title: "Business Overview", href: "/app/business", icon: LayoutDashboard, implementationStatus: "planned" },
    { title: "Billing", href: "/app/business/billing", icon: CreditCard, implementationStatus: "planned" },
    { title: "Subscription", href: "/app/business/subscription", icon: Receipt, implementationStatus: "planned" },
    { title: "Usage", href: "/app/business/usage", icon: FileStack, implementationStatus: "planned" },
    { title: "Invoices", href: "/app/business/invoices", icon: ReceiptText, implementationStatus: "planned" },
    { title: "Licenses", href: "/app/business/licenses", icon: Key, implementationStatus: "planned" },
  ],
};

export const supportNavigation: NavGroup = {
  title: "Support",
  href: "/app/support",
  icon: MessageSquare,
  items: [
    { title: "AI Assistant", href: "/app/support/assistant", icon: Sparkles, implementationStatus: "planned" },
    { title: "Help Center", href: "/app/support/help", icon: HelpCircle, implementationStatus: "planned" },
    { title: "Tickets", href: "/app/support/tickets", icon: Ticket, implementationStatus: "planned" },
    { title: "Community", href: "/app/support/community", icon: Users2, implementationStatus: "planned" },
    { title: "Status", href: "/app/support/status", icon: ActivitySquare, implementationStatus: "planned" },
  ],
};

export const talentNavigation: NavGroup = {
  title: "Talent OS",
  href: "/app/talent",
  icon: Target,
  items: [
    { title: "Hiring Pipeline", href: "/app/talent", icon: LayoutDashboard, implementationStatus: "planned" },
    { title: "Candidates", href: "/app/talent/candidates", icon: Users, implementationStatus: "planned" },
    { title: "Assessments", href: "/app/talent/assessments", icon: BookOpen, implementationStatus: "planned" },
    { title: "Assessment Builder", href: "/app/talent/builder", icon: LayoutPanelLeft, implementationStatus: "planned" },
    { title: "Question Bank", href: "/app/talent/questions", icon: Library, implementationStatus: "planned" },
  ],
};

export const forgeNavigation: NavGroup = {
  title: "CerebroForge",
  href: "/app/forge",
  icon: Hammer,
  items: [
    { title: "Forge Overview",        href: "/app/forge",              icon: LayoutDashboard, implementationStatus: "active" },
    { title: "AI Planner",            href: "/app/forge/planner",      icon: Brain, implementationStatus: "active" },
    { title: "Requirements Studio",   href: "/app/forge/requirements", icon: FileText, implementationStatus: "active" },
    { title: "Architecture Studio",   href: "/app/forge/architect",    icon: Layers3, implementationStatus: "active" },
    { title: "UI/UX Studio",          href: "/app/forge/ui-studio",    icon: PenTool, implementationStatus: "planned" },
    { title: "Code Generation",       href: "/app/forge/codegen",      icon: FileCode2, implementationStatus: "active" },
    { title: "Backend Studio",        href: "/app/forge/backend",      icon: ServerCog, implementationStatus: "planned" },
    { title: "Database Studio",       href: "/app/forge/database",     icon: Database, implementationStatus: "planned" },
    { title: "API Studio",            href: "/app/forge/api",          icon: Webhook, implementationStatus: "planned" },
    { title: "Mobile Studio",         href: "/app/forge/mobile",       icon: Smartphone, implementationStatus: "planned" },
    { title: "Web Studio",            href: "/app/forge/web",          icon: Globe, implementationStatus: "planned" },
    { title: "Desktop Studio",        href: "/app/forge/desktop",      icon: Monitor, implementationStatus: "planned" },
    { title: "CerebroBots",           href: "/app/forge/bots",         icon: MessageCircle, implementationStatus: "planned" },
    { title: "Testing Intelligence",  href: "/app/forge/testing",      icon: TestTube2, implementationStatus: "active" },
    { title: "AI Code Review",        href: "/app/forge/review",       icon: ScanSearch, implementationStatus: "active" },
    { title: "Deployment Studio",     href: "/app/forge/deploy",       icon: Truck, implementationStatus: "active" },
    { title: "Repository Manager",    href: "/app/forge/repos",        icon: GitBranch, implementationStatus: "planned" },
    { title: "AI Documentation",      href: "/app/forge/docs",         icon: BookOpen, implementationStatus: "active" },
    { title: "Monitoring & Ops",      href: "/app/forge/monitoring",   icon: Activity, implementationStatus: "planned" },
  ],
};

export const hiveopsNavigation: NavGroup = {
  title: "HiveOps",
  href: "/app/hiveops",
  icon: Activity,
  items: [
    { title: "Overview",         href: "/app/hiveops",             icon: LayoutDashboard, implementationStatus: "planned" },
    { title: "Pipelines",        href: "/app/hiveops/pipelines",   icon: GitBranch, implementationStatus: "planned" },
    { title: "Deployments",      href: "/app/hiveops/deployments", icon: Rocket, implementationStatus: "planned" },
    { title: "Security",         href: "/app/hiveops/security",    icon: ShieldCheck, implementationStatus: "planned" },
    { title: "AI Costs",         href: "/app/hiveops/costs",       icon: DollarSign, implementationStatus: "planned" },
    { title: "Clusters",         href: "/app/hiveops/clusters",    icon: Server, implementationStatus: "planned" },
    { title: "GitOps",           href: "/app/hiveops/gitops",      icon: GitMerge, implementationStatus: "planned" },
  ],
};

export const platformNavigation: NavGroup[] = [
  workspaceNavigation,
  forgeNavigation,
  hiveopsNavigation,
  aiNavigation,
  solutionsNavigation,
  infrastructureNavigation,
  dataNavigation,
  securityNavigation,
  automationNavigation,
  researchNavigation,
  academyNavigation,
  businessNavigation,
  talentNavigation,
  supportNavigation,
];
