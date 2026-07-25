"use client";

import Link from "next/link";
import {
  Shield, Scale, Cpu, Database, Brain, Layers, BarChart2, Bot, Zap,
  Activity, DollarSign, Package, HardDrive, FolderOpen, Globe, ShoppingBag,
  CreditCard, Key, Handshake, Rocket, Cloud, Lock, Network, Waves, Eye,
  Route, Terminal, Cog, Search, Archive, Lightbulb, GraduationCap, MessageSquare,
  Briefcase, Users, Clipboard, FolderKanban, Wrench, CheckSquare, UserCheck,
  BookOpen, Code2, Settings, LayoutDashboard, Building2, UserCog,
} from "lucide-react";

type Product = {
  name: string;
  tagline: string;
  href: string;
  tier: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  live?: boolean;
};

const TIERS: { label: string; description: string; products: Product[] }[] = [
  {
    label: "Tier 0 — Security & Governance",
    description: "Zero-trust identity, policy enforcement, threat detection, and immutable audit trail. Every agent action is authorized and logged.",
    products: [
      { name: "HiveIdentity™", tagline: "Agent principal registry · zero-trust tool grants · capability tokens", href: "/platform/identity", tier: 0, icon: Shield, live: true },
      { name: "HiveShield™", tagline: "Threat detection · anomaly scoring · zero-trust enforcement · incident response", href: "/platform/shield", tier: 0, icon: Lock, live: true },
      { name: "HiveGovern™", tagline: "Policy engine · HMAC audit log · approval workflows · compliance posture", href: "/platform/govern", tier: 0, icon: Scale, live: true },
    ],
  },
  {
    label: "Tier 1 — Infrastructure",
    description: "Elastic compute, semantic storage, unified vector index, service mesh, and persistent memory.",
    products: [
      { name: "HiveNetwork™", tagline: "Service mesh · mTLS topology · Envoy proxy · network policies", href: "/platform/network", tier: 1, icon: Network, live: true },
      { name: "HiveCompute™", tagline: "Elastic LLM inference dispatch · job submission · run history", href: "/platform/compute", tier: 1, icon: Cpu, live: true },
      { name: "HiveStorage™", tagline: "Tool registry · builtin catalog · register & invoke capabilities", href: "/platform/storage", tier: 1, icon: HardDrive, live: true },
      { name: "HiveMemory™", tagline: "Working · episodic · semantic · long-term memory · cortex optimizer", href: "/platform/memory", tier: 1, icon: Brain, live: true },
      { name: "HiveVector™", tagline: "HNSW semantic index · dense+sparse hybrid search · multi-tenant namespaces", href: "/platform/vector", tier: 1, icon: Database, live: true },
    ],
  },
  {
    label: "Tier 2 — Platform & Data",
    description: "Enterprise data lake, analytics, archival pipelines, RAG knowledge, observability, API gateway, and admin console.",
    products: [
      { name: "HiveLake™", tagline: "Apache Iceberg · Bronze/Silver/Gold zones · time-travel snapshots", href: "/platform/lake", tier: 2, icon: Waves, live: true },
      { name: "HiveAnalytics™", tagline: "Trino SQL engine · dbt metrics · data catalog · semantic layer", href: "/platform/analytics", tier: 2, icon: BarChart2, live: true },
      { name: "HiveData™", tagline: "Enterprise archive · document versioning · domain taxonomy · hybrid search", href: "/platform/data", tier: 2, icon: FolderOpen, live: true },
      { name: "HiveObservatory™", tagline: "OpenTelemetry traces · ClickHouse metrics · alert rules · SLO tracking", href: "/platform/observatory", tier: 2, icon: Eye, live: true },
      { name: "HiveGateway™", tagline: "Envoy + OPA · AI firewall · route management · traffic shaping", href: "/platform/gateway", tier: 2, icon: Route, live: true },
      { name: "HiveKnowledge™", tagline: "Document ingestion · semantic search · RAG with inline citations", href: "/platform/knowledge", tier: 2, icon: Layers, live: true },
      { name: "HiveConsole™", tagline: "Unified admin portal · system health · user management · audit log", href: "/platform/console", tier: 2, icon: LayoutDashboard, live: true },
      { name: "HiveAPI™", tagline: "Developer portal · API explorer · key management · usage analytics", href: "/platform/api", tier: 2, icon: Code2, live: true },
    ],
  },
  {
    label: "Tier 3 — AI Runtime",
    description: "Agent orchestration, model registry, durable workflows, planning, reasoning, semantic layer, evaluation, and developer tooling.",
    products: [
      { name: "HiveAgents™", tagline: "LangGraph agent engine · principal registry · human-in-the-loop · MCP servers", href: "/platform/agents", tier: 3, icon: Bot, live: true },
      { name: "HiveModels™", tagline: "Skill registry · template library · model routing · versioned packages", href: "/platform/models", tier: 3, icon: Package, live: true },
      { name: "HiveAutomation™", tagline: "Durable workflows · Temporal checkpoints · JSON graph builder · resume", href: "/platform/automation", tier: 3, icon: Zap, live: true },
      { name: "HivePlanner™", tagline: "Goal decomposition · DAG execution · adaptive re-planning · milestones", href: "/platform/planner", tier: 3, icon: Clipboard, live: true },
      { name: "HiveReasoner™", tagline: "Chain-of-thought · Constitutional AI · multi-agent debate · fact-check", href: "/platform/reasoner", tier: 3, icon: Lightbulb, live: true },
      { name: "HiveSemantic™", tagline: "Business glossary · entity mapping · NL2SQL · semantic layer governance", href: "/platform/semantic", tier: 3, icon: BookOpen, live: true },
      { name: "HiveEvaluation™", tagline: "Distributed traces · token metrics · event stream · platform summary", href: "/platform/evaluation", tier: 3, icon: Activity, live: true },
      { name: "HiveForge™", tagline: "Prompt Studio · sandbox testing · tool binding · agent authoring", href: "/platform/forge", tier: 3, icon: Code2, live: true },
      { name: "HiveOps™", tagline: "Model registry · canary deployments · MLOps · LLMOps · agent SRE", href: "/platform/ops", tier: 3, icon: Settings, live: true },
    ],
  },
  {
    label: "Tier 4 — Business Applications",
    description: "AI-native enterprise applications — every module is agent-powered, built on the shared platform stack.",
    products: [
      { name: "CerebroStudio™", tagline: "Unified command center · cross-product AI copilot · workspaces · activity feed", href: "/platform/studio", tier: 4, icon: LayoutDashboard, live: true },
      { name: "CerebroAgent™", tagline: "Persistent agent fleet · stateful digital workers · long-term memory · event-driven", href: "/platform/agent", tier: 4, icon: Bot, live: true },
      { name: "CerebroFlow™", tagline: "AI Copilot · context assembly · multi-turn reasoning · tool execution", href: "/platform/flow", tier: 4, icon: Zap, live: true },
      { name: "CerebroSearch™", tagline: "Federated semantic search · all data sources · intent ranking · answer synthesis", href: "/platform/search", tier: 4, icon: Search, live: true },
      { name: "CerebroArchive™", tagline: "Institutional memory · auto-taxonomy · knowledge graph · diff intelligence", href: "/platform/archive", tier: 4, icon: Archive, live: true },
      { name: "CerebroInsight™", tagline: "Automated reports · anomaly detection · AI forecasting · conversational BI", href: "/platform/insight", tier: 4, icon: Lightbulb, live: true },
      { name: "CerebroLearn™", tagline: "Adaptive learning paths · skills gap analysis · AI tutor · compliance certification", href: "/platform/learn", tier: 4, icon: GraduationCap, live: true },
      { name: "CerebroAssist™", tagline: "AI copilot embedded in every workflow · email · meetings · documents", href: "/platform/copilot", tier: 4, icon: MessageSquare, live: true },
      { name: "CerebroERP™", tagline: "AI-native ERP · GL · AP/AR · order management · 3-way match · demand sensing", href: "/platform/erp", tier: 4, icon: Building2, live: true },
      { name: "CerebroCRM™", tagline: "Revenue intelligence · deal scoring · pipeline AI · conversation analytics", href: "/platform/crm", tier: 4, icon: Briefcase, live: true },
      { name: "CerebroHR™", tagline: "Flight risk scoring · attrition prediction · ATS · performance AI · GDPR", href: "/platform/hr", tier: 4, icon: Users, live: true },
      { name: "CerebroFinance™", tagline: "Chart of accounts · journal entries · invoices · trial balance · FP&A", href: "/platform/finance", tier: 4, icon: DollarSign, live: true },
      { name: "CerebroProcurement™", tagline: "Supplier risk scoring · contract NLP · spend analytics · maverick detection", href: "/platform/procurement", tier: 4, icon: FolderKanban, live: true },
      { name: "CerebroProjects™", tagline: "Delay prediction · risk register · resource AI · portfolio health", href: "/platform/projects", tier: 4, icon: Clipboard, live: true },
      { name: "CerebroAssets™", tagline: "Asset registry · predictive maintenance · RUL forecast · IoT telemetry", href: "/platform/assets", tier: 4, icon: Wrench, live: true },
      { name: "CerebroQuality™", tagline: "SPC control charts · defect tracking · computer vision inspection · CAPA", href: "/platform/quality", tier: 4, icon: CheckSquare, live: true },
      { name: "CerebroCompliance™", tagline: "Multi-framework posture · SOC 2 · GDPR · ISO 27001 · evidence tracking", href: "/platform/compliance", tier: 4, icon: Scale, live: true },
      { name: "CerebroCustomer360™", tagline: "Unified profiles · identity resolution · Fellegi-Sunter · audience segments", href: "/platform/customer360", tier: 4, icon: UserCheck, live: true },
    ],
  },
  {
    label: "Tier 5 — Ecosystem & Commerce",
    description: "Developer exchange, enterprise marketplace, billing, licensing, partner portal, CI/CD, and multi-cloud.",
    products: [
      { name: "HiveExchange™", tagline: "Developer exchange · artifact publishing · skill marketplace · monetization", href: "/platform/x", tier: 5, icon: Globe, live: true },
      { name: "HiveMarketplace™", tagline: "Enterprise solution marketplace · certified bundles · one-click deploy", href: "/platform/marketplace", tier: 5, icon: ShoppingBag, live: true },
      { name: "HiveBilling™", tagline: "Usage metering · rating engine · revenue recognition · invoicing", href: "/platform/billing", tier: 5, icon: CreditCard, live: true },
      { name: "HiveLicense™", tagline: "Entitlement management · runtime enforcement · seat & token quotas", href: "/platform/license", tier: 5, icon: Key, live: true },
      { name: "HivePartner™", tagline: "Partner portal · deal registration · tiered benefits · co-sell programs", href: "/platform/partner", tier: 5, icon: Handshake, live: true },
      { name: "HiveDeploy™", tagline: "CI/CD pipeline · GitOps ArgoCD · AI quality gates · canary releases", href: "/platform/deploy", tier: 5, icon: Rocket, live: true },
      { name: "HiveCloud™", tagline: "Multi-cloud abstraction · AWS · GCP · Azure · cost management · guardrails", href: "/platform/cloud", tier: 5, icon: Cloud, live: true },
    ],
  },
];

const TIER_ACCENT: Record<number, string> = {
  0: "border-red-500/30 bg-red-500/5 hover:border-red-500/60",
  1: "border-orange-500/30 bg-orange-500/5 hover:border-orange-500/60",
  2: "border-yellow-500/30 bg-yellow-500/5 hover:border-yellow-500/60",
  3: "border-primary-accent/30 bg-primary-accent/5 hover:border-primary-accent/60",
  4: "border-purple-500/30 bg-purple-500/5 hover:border-purple-500/60",
  5: "border-blue-500/30 bg-blue-500/5 hover:border-blue-500/60",
};

const TIER_ICON_COLOR: Record<number, string> = {
  0: "text-red-400",
  1: "text-orange-400",
  2: "text-yellow-400",
  3: "text-primary-accent",
  4: "text-purple-400",
  5: "text-blue-400",
};

const TIER_BADGE: Record<number, string> = {
  0: "border-red-500/40 text-red-400",
  1: "border-orange-500/40 text-orange-400",
  2: "border-yellow-500/40 text-yellow-400",
  3: "border-primary-accent/40 text-primary-accent",
  4: "border-purple-500/40 text-purple-400",
  5: "border-blue-500/40 text-blue-400",
};

export default function PlatformIndexPage() {
  const allProducts = TIERS.flatMap(t => t.products);
  const totalLive = allProducts.filter(p => p.live).length;
  const totalProducts = allProducts.length;

  return (
    <main className="mx-auto max-w-6xl px-6 pb-32 pt-12">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary-accent">
        CerebroHive Intelligence Mesh
      </p>
      <h1 className="mt-3 text-4xl font-bold text-text-primary md:text-5xl">Platform</h1>
      <p className="mt-4 max-w-2xl text-lg text-text-secondary">
        AI-native products across 6 tiers — from zero-trust infrastructure to ecosystem commerce. Every product connects to the shared AgentOS runtime, vector index, and audit trail.
      </p>
      <div className="mt-4 flex items-center gap-6 text-xs text-text-secondary">
        <span><span className="font-bold text-primary-accent">{totalLive}</span> live</span>
        <span><span className="font-bold text-text-primary">{totalProducts}</span> total</span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-primary-accent" /> live</span>
          <span className="inline-flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-border" /> roadmap</span>
        </span>
      </div>

      <div className="mt-12 space-y-14">
        {TIERS.map(tier => (
          <section key={tier.label}>
            <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-text-secondary">
              {tier.label}
            </h2>
            <p className="mt-1 max-w-xl text-sm text-text-secondary">{tier.description}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tier.products.map(p => {
                const Icon = p.icon;
                const inner = (
                  <div
                    className={`group rounded-2xl border p-5 transition-all duration-200 ${TIER_ACCENT[p.tier]} ${!p.live ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <Icon size={22} className={TIER_ICON_COLOR[p.tier]} />
                      <div className="flex items-center gap-1.5">
                        {p.live && <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary-accent" />}
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${TIER_BADGE[p.tier]}`}>
                          Tier {p.tier}
                        </span>
                      </div>
                    </div>
                    <h3 className="mt-3 text-base font-bold text-text-primary group-hover:text-primary-accent transition-colors">
                      {p.name}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-text-secondary">{p.tagline}</p>
                  </div>
                );

                return p.live
                  ? <Link key={`${p.name}-${p.tier}`} href={p.href}>{inner}</Link>
                  : <div key={`${p.name}-${p.tier}`}>{inner}</div>;
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
