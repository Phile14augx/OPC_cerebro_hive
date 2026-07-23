import {
  Home, Rocket, BrainCircuit, Box, Server, Database,
  ShieldCheck, Zap, FlaskConical, GraduationCap,
  Briefcase, MessageSquare, Settings,
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
  FlaskConical as Flask, TestTube2, Truck, GitBranch, ScanSearch,
  FileCode2, Cpu, Layers3, TerminalSquare, Webhook, Boxes,
  type LucideIcon
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon?: LucideIcon;
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
    { title: "Dashboard", href: "/app", icon: LayoutDashboard },
    { title: "Organizations", href: "/app/organizations", icon: Building2 },
    { title: "Projects", href: "/app/projects", icon: FolderKanban },
    { title: "Teams", href: "/app/teams", icon: Users },
  ],
};

export const aiNavigation: NavGroup = {
  title: "AI",
  href: "/app/ai",
  icon: BrainCircuit,
  items: [
    { title: "AI Overview", href: "/app/ai", icon: LayoutDashboard },
    { title: "AI Studio", href: "/app/ai/studio", icon: LayoutPanelLeft },
    { title: "AI Agents", href: "/app/ai/agents", icon: Bot },
    { title: "AI Workflows", href: "/app/ai/workflows", icon: GitMerge },
    { title: "AI Playground", href: "/app/ai/playground", icon: Gamepad2 },
    { title: "AI Models", href: "/app/ai/models", icon: Network },
    { title: "Prompt Library", href: "/app/ai/prompts", icon: Library },
    { title: "Knowledge Hub", href: "/app/ai/knowledge", icon: BookOpen },
    { title: "Vector Store", href: "/app/ai/vectors", icon: DatabaseZap },
  ],
};

export const solutionsNavigation: NavGroup = {
  title: "Solutions",
  icon: Box,
  items: [
    { title: "Marketplace", href: "/app/marketplace", icon: ShoppingCart },
    { title: "Templates", href: "/app/templates", icon: LayoutTemplate },
    { title: "Industry Packs", href: "/app/industry", icon: Layers },
    { title: "Quantiva ERP", href: "/app/quantiva", icon: Factory },
    { title: "Custom Solutions", href: "/app/custom", icon: Code2 },
  ],
};

export const infrastructureNavigation: NavGroup = {
  title: "Infrastructure",
  href: "/app/infrastructure",
  icon: Server,
  items: [
    { title: "Infra Overview", href: "/app/infrastructure", icon: LayoutDashboard },
    { title: "Cloud", href: "/app/infrastructure/cloud", icon: Cloud },
    { title: "Deployments", href: "/app/infrastructure/deployments", icon: BoxSelect },
    { title: "Kubernetes", href: "/app/infrastructure/kubernetes", icon: ServerCog },
    { title: "Databases", href: "/app/infrastructure/databases", icon: Database },
    { title: "Storage", href: "/app/infrastructure/storage", icon: HardDrive },
    { title: "Networking", href: "/app/infrastructure/networking", icon: NetworkIcon },
    { title: "Edge", href: "/app/infrastructure/edge", icon: MonitorSmartphone },
    { title: "API Gateway", href: "/app/infrastructure/gateway", icon: Unplug },
  ],
};

export const dataNavigation: NavGroup = {
  title: "Data",
  href: "/app/data",
  icon: Database,
  items: [
    { title: "Data Overview", href: "/app/data", icon: LayoutDashboard },
    { title: "Data Pipelines", href: "/app/data/pipelines", icon: Workflow },
    { title: "ETL", href: "/app/data/etl", icon: GitPullRequest },
    { title: "Data Warehouse", href: "/app/data/warehouse", icon: Database },
    { title: "Lakehouse", href: "/app/data/lakehouse", icon: FileSpreadsheet },
    { title: "Analytics", href: "/app/data/analytics", icon: PieChart },
    { title: "BI", href: "/app/data/bi", icon: LineChart },
  ],
};

export const securityNavigation: NavGroup = {
  title: "Security",
  href: "/app/security",
  icon: ShieldCheck,
  items: [
    { title: "Security Overview", href: "/app/security", icon: LayoutDashboard },
    { title: "IAM", href: "/app/security/iam", icon: KeyRound },
    { title: "Roles", href: "/app/security/roles", icon: UsersRound },
    { title: "Secrets", href: "/app/security/secrets", icon: FileKey2 },
    { title: "Audit Logs", href: "/app/security/audit", icon: ScrollText },
    { title: "Compliance", href: "/app/security/compliance", icon: CheckCircle2 },
    { title: "Policies", href: "/app/security/policies", icon: ShieldAlert },
  ],
};

export const automationNavigation: NavGroup = {
  title: "Automation",
  href: "/app/automation",
  icon: Zap,
  items: [
    { title: "Automation Overview", href: "/app/automation", icon: LayoutDashboard },
    { title: "Workflow Builder", href: "/app/automation/builder", icon: FastForward },
    { title: "Event Bus", href: "/app/automation/events", icon: ArrowRightLeft },
    { title: "Schedulers", href: "/app/automation/schedulers", icon: CalendarClock },
    { title: "Integrations", href: "/app/automation/integrations", icon: Blocks },
    { title: "Connectors", href: "/app/automation/connectors", icon: Cable },
  ],
};

export const researchNavigation: NavGroup = {
  title: "Research",
  href: "/app/research",
  icon: FlaskConical,
  items: [
    { title: "Research Overview", href: "/app/research", icon: LayoutDashboard },
    { title: "AI News", href: "/app/research/news", icon: Newspaper },
    { title: "Whitepapers", href: "/app/research/whitepapers", icon: FileText },
    { title: "Benchmarks", href: "/app/research/benchmarks", icon: Activity },
    { title: "Architecture", href: "/app/research/architecture", icon: Milestone },
  ],
};

export const academyNavigation: NavGroup = {
  title: "Academy",
  href: "/app/academy",
  icon: GraduationCap,
  items: [
    { title: "Academy Overview", href: "/app/academy", icon: LayoutDashboard },
    { title: "Courses", href: "/app/academy/courses", icon: GradIcon },
    { title: "Certifications", href: "/app/academy/certifications", icon: Award },
    { title: "Labs", href: "/app/academy/labs", icon: Beaker },
    { title: "Learning Paths", href: "/app/academy/paths", icon: Map },
  ],
};

export const businessNavigation: NavGroup = {
  title: "Business",
  href: "/app/business",
  icon: Briefcase,
  items: [
    { title: "Business Overview", href: "/app/business", icon: LayoutDashboard },
    { title: "Billing", href: "/app/business/billing", icon: CreditCard },
    { title: "Subscription", href: "/app/business/subscription", icon: Receipt },
    { title: "Usage", href: "/app/business/usage", icon: FileStack },
    { title: "Invoices", href: "/app/business/invoices", icon: ReceiptText },
    { title: "Licenses", href: "/app/business/licenses", icon: Key },
  ],
};

export const supportNavigation: NavGroup = {
  title: "Support",
  href: "/app/support",
  icon: MessageSquare,
  items: [
    { title: "AI Assistant", href: "/app/support/assistant", icon: Sparkles },
    { title: "Help Center", href: "/app/support/help", icon: HelpCircle },
    { title: "Tickets", href: "/app/support/tickets", icon: Ticket },
    { title: "Community", href: "/app/support/community", icon: Users2 },
    { title: "Status", href: "/app/support/status", icon: ActivitySquare },
  ],
};

export const talentNavigation: NavGroup = {
  title: "Talent OS",
  href: "/app/talent",
  icon: Target,
  items: [
    { title: "Hiring Pipeline", href: "/app/talent", icon: LayoutDashboard },
    { title: "Candidates", href: "/app/talent/candidates", icon: Users },
    { title: "Assessments", href: "/app/talent/assessments", icon: BookOpen },
    { title: "Assessment Builder", href: "/app/talent/builder", icon: LayoutPanelLeft },
    { title: "Question Bank", href: "/app/talent/questions", icon: Library },
  ],
};

export const forgeNavigation: NavGroup = {
  title: "CerebroForge",
  href: "/app/forge",
  icon: Hammer,
  items: [
    { title: "Forge Overview",        href: "/app/forge",              icon: LayoutDashboard },
    { title: "AI Planner",            href: "/app/forge/planner",      icon: Brain },
    { title: "Requirements Studio",   href: "/app/forge/requirements", icon: FileText },
    { title: "Architecture Studio",   href: "/app/forge/architect",    icon: Layers3 },
    { title: "UI/UX Studio",          href: "/app/forge/ui-studio",    icon: PenTool },
    { title: "Code Generation",       href: "/app/forge/codegen",      icon: FileCode2 },
    { title: "Backend Studio",        href: "/app/forge/backend",      icon: ServerCog },
    { title: "Database Studio",       href: "/app/forge/database",     icon: Database },
    { title: "API Studio",            href: "/app/forge/api",          icon: Webhook },
    { title: "Mobile Studio",         href: "/app/forge/mobile",       icon: Smartphone },
    { title: "Web Studio",            href: "/app/forge/web",          icon: Globe },
    { title: "Desktop Studio",        href: "/app/forge/desktop",      icon: Monitor },
    { title: "CerebroBots",           href: "/app/forge/bots",         icon: MessageCircle },
    { title: "Testing Intelligence",  href: "/app/forge/testing",      icon: TestTube2 },
    { title: "AI Code Review",        href: "/app/forge/review",       icon: ScanSearch },
    { title: "Deployment Studio",     href: "/app/forge/deploy",       icon: Truck },
    { title: "Repository Manager",    href: "/app/forge/repos",        icon: GitBranch },
    { title: "AI Documentation",      href: "/app/forge/docs",         icon: BookOpen },
    { title: "Monitoring & Ops",      href: "/app/forge/monitoring",   icon: Activity },
  ],
};

export const platformNavigation: NavGroup[] = [
  workspaceNavigation,
  forgeNavigation,
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
