"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronRight, Shield, Server, Zap, Database, Network, Globe2, Lock, Activity, Code, Search, Bell, Users, DollarSign, Cpu, Compass, Code2, FlaskConical, BarChart3, TrendingUp, Store, Boxes, LayoutGrid, Archive, MessageSquare, Radio, Route, GitBranch } from "lucide-react";
import { EnterpriseIntegrations } from "@/components/platform/EnterpriseIntegrations";

const archStack = [
  {
    tier: "Applications",
    description: "User-facing intelligence workspace — the unified executive operating system",
    items: ["CerebroSphere™ — Enterprise AI Operating System"],
    color: "border-violet-500/50 bg-violet-500/5",
    labelColor: "text-violet-400",
  },
  {
    tier: "Business Intelligence Modules",
    description: "Domain-specific AI capabilities delivering standalone enterprise value",
    items: ["CerebroArchive™", "CerebroStudio™", "CerebroFlow™", "CerebroInsight™", "CerebroCopilot™"],
    color: "border-emerald-500/40 bg-emerald-500/5",
    labelColor: "text-emerald-400",
  },
  {
    tier: "Orchestration Engine",
    description: "Enterprise agent runtime, multi-agent mesh, and workflow execution",
    items: ["HivePulse™ — Enterprise Agent Orchestration Engine"],
    color: "border-cyan-500/40 bg-cyan-500/5",
    labelColor: "text-cyan-400",
  },
  {
    tier: "Intelligence Layer",
    description: "Shared reasoning, knowledge, embeddings, memory, and evaluation services",
    items: ["Enterprise Knowledge Graph", "Embeddings Engine", "Reasoning & Planning", "Evaluation Framework", "Memory Store", "Recommendations", "AI Forecasting", "Semantic Retrieval"],
    color: "border-indigo-500/40 bg-indigo-500/5",
    labelColor: "text-indigo-400",
  },
  {
    tier: "Enterprise Platform Services",
    description: "Operational and security foundation — the trust and infrastructure layer",
    items: ["HiveOps™ — Operations & MLOps Platform", "HiveShield™ — Security & Governance Platform"],
    color: "border-amber-500/40 bg-amber-500/5",
    labelColor: "text-amber-400",
  },
  {
    tier: "Platform Foundation",
    description: "Shared services consumed by every module — provisioned once, consumed by all",
    items: [
      "Cerebro X™ (AI Gateway)", "Identity & IAM", "Event Bus", "Audit Logging",
      "Search Engine", "Vector Search", "Object Storage", "Billing & Licensing",
      "API Gateway", "Notification Service", "Observability Stack", "Secrets Management",
      "Enterprise Data Fabric", "Plugin Marketplace",
    ],
    color: "border-rose-500/30 bg-rose-500/5",
    labelColor: "text-rose-400",
  },
  {
    tier: "Infrastructure",
    description: "Compute, data, messaging, and storage — cloud, on-premises, or air-gapped",
    items: ["PostgreSQL + pgvector", "Redis", "NATS / Kafka", "OpenSearch", "Object Storage (MinIO / S3)", "Kubernetes", "Docker", "GPU Clusters"],
    color: "border-slate-500/30 bg-slate-500/5",
    labelColor: "text-slate-400",
  },
];

const sharedServiceCards = [
  { icon: Users, title: "Enterprise Identity & IAM", desc: "SSO, SAML 2.0, OIDC, MFA, organizational hierarchy, and fine-grained RBAC + ABAC across every module." },
  { icon: Globe2, title: "Multi-Tenancy", desc: "Complete tenant isolation with dedicated schemas, audit trails, data residency controls, and per-tenant rate limits." },
  { icon: Zap, title: "AI Gateway (Cerebro X™)", desc: "Model routing, multi-provider abstraction, prompt registry, response caching, safety enforcement, embeddings, cost control, rate limiting, and AI observability — the full AI control plane." },
  { icon: Network, title: "Enterprise Data Fabric", desc: "Unified data layer connecting structured data, documents, events, vectors, knowledge graphs, telemetry, trained models, and governance policies across every module." },
  { icon: Search, title: "Semantic Search", desc: "Unified hybrid vector + keyword search across knowledge, workflows, agents, and analytics from a single query interface." },
  { icon: Database, title: "PostgreSQL + pgvector", desc: "Shared relational data store with native vector support — the canonical data layer for all structured and embedded data." },
  { icon: Shield, title: "Audit Logging", desc: "Immutable, cryptographically signed audit trail of every user action, AI decision, data access, and system event." },
  { icon: Lock, title: "Secrets Management", desc: "Centralized vault for API keys, credentials, and certificates with rotation policies and Kubernetes integration." },
  { icon: Activity, title: "Observability Stack", desc: "Distributed tracing, structured logging, metrics aggregation, alerting, and AI-generated incident summaries across the platform." },
  { icon: Code, title: "Developer Platform", desc: "REST API, GraphQL, webhooks, CLI, SDKs (Python, TypeScript, Go), Terraform provider, and Plugin SDK — enterprise extensibility from day one." },
  { icon: Bell, title: "Notification Service", desc: "Cross-module alerting and notification routing via Slack, Teams, email, webhooks, and in-platform activity feeds." },
  { icon: DollarSign, title: "Billing & Licensing", desc: "Capacity-based billing, module licensing, team-level chargeback attribution, and usage analytics across all platform services." },
];

const roadmapPhases = [
  {
    phase: "Phase 1",
    title: "Core Platform",
    status: "complete",
    items: ["Identity & IAM", "Event Bus", "AI Gateway (Cerebro X™)", "Audit Logging", "Multi-Tenancy", "API Gateway", "Enterprise Data Fabric"],
  },
  {
    phase: "Phase 2",
    title: "Knowledge Platform",
    status: "complete",
    items: ["CerebroArchive™", "Enterprise Knowledge Graph", "Semantic Search", "Document Intelligence", "Model & Prompt Registry", "Embeddings Engine"],
  },
  {
    phase: "Phase 3",
    title: "AI Development & Automation",
    status: "in-progress",
    items: ["CerebroStudio™", "CerebroFlow™", "HivePulse™ Orchestration", "Intelligence Layer", "Reasoning & Planning", "Evaluation Framework", "Developer Platform (SDK/CLI)"],
  },
  {
    phase: "Phase 4",
    title: "Intelligence & Analytics",
    status: "planned",
    items: ["CerebroInsight™", "CerebroCopilot™", "AI Forecasting", "Executive Cockpit", "Workforce Analytics", "Memory Store", "Recommendations Engine"],
  },
  {
    phase: "Phase 5",
    title: "Enterprise Operating System",
    status: "planned",
    items: ["CerebroSphere™", "Digital Twin", "Plugin Marketplace", "Terraform Provider", "Industry Verticals", "Talent OS", "ERP / CRM Integration"],
  },
];

const statusConfig = {
  complete: { label: "Complete", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
  "in-progress": { label: "In Progress", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/30" },
  planned: { label: "Planned", color: "text-slate-400", bg: "bg-slate-500/10 border-slate-500/30" },
};

type LauncherCategory = "all" | "build" | "operate" | "analyze" | "grow" | "marketplace";

const LAUNCHER_CATEGORIES: { id: LauncherCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "build", label: "Build" },
  { id: "operate", label: "Operate" },
  { id: "analyze", label: "Analyze" },
  { id: "grow", label: "Grow" },
  { id: "marketplace", label: "Marketplace" },
];

interface WorkspaceTile {
  title: string; subtitle: string; href: string; category: Exclude<LauncherCategory, "all">;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  border: string; iconColor: string; glow: string; featured?: boolean;
}

const WORKSPACE_TILES: WorkspaceTile[] = [
  {
    title: "Enterprise AI OS Console", subtitle: "Operate the live enterprise AI operating system in real time.",
    href: "/platform/os", category: "operate", icon: Cpu, featured: true,
    border: "border-t-primary-accent", iconColor: "text-primary-accent", glow: "hover:shadow-[0_0_32px_-8px_rgba(16,185,129,0.35)]",
  },
  {
    title: "CerebroArchitect™", subtitle: "Request an AI enterprise architect for blueprints, roadmaps, and implementation plans.",
    href: "/contact", category: "build", icon: Compass,
    border: "border-t-cyan-400", iconColor: "text-cyan-400", glow: "hover:shadow-[0_0_32px_-8px_rgba(34,211,238,0.35)]",
  },
  {
    title: "CerebroStudio™", subtitle: "Build, prompt, and ship AI agents in a governed IDE.",
    href: "/platform/studio", category: "build", icon: Code2,
    border: "border-t-violet-400", iconColor: "text-violet-400", glow: "hover:shadow-[0_0_32px_-8px_rgba(167,139,250,0.35)]",
  },
  {
    title: "CerebroForge™", subtitle: "Turn research signals into scored product opportunities.",
    href: "/platform/forge", category: "build", icon: FlaskConical,
    border: "border-t-teal-400", iconColor: "text-teal-400", glow: "hover:shadow-[0_0_32px_-8px_rgba(45,212,191,0.35)]",
  },
  {
    title: "CerebroSwarm™", subtitle: "Coordinate your enterprise cognitive workforce of AI agents.",
    href: "/platform/swarm", category: "operate", icon: Users,
    border: "border-t-orange-400", iconColor: "text-orange-400", glow: "hover:shadow-[0_0_32px_-8px_rgba(251,146,60,0.35)]",
  },
  {
    title: "CerebroInsight™", subtitle: "Executive intelligence, metrics, and alerting platform.",
    href: "/platform/insight", category: "analyze", icon: BarChart3,
    border: "border-t-emerald-400", iconColor: "text-emerald-400", glow: "hover:shadow-[0_0_32px_-8px_rgba(52,211,153,0.35)]",
  },
  {
    title: "CerebroGrowth™", subtitle: "Content studio, CRM pipeline, and AI sales copilot.",
    href: "/platform/growth", category: "grow", icon: TrendingUp,
    border: "border-t-blue-400", iconColor: "text-blue-400", glow: "hover:shadow-[0_0_32px_-8px_rgba(96,165,250,0.35)]",
  },
  {
    title: "Hive Infrastructure Suite", subtitle: "Provision cloud, storage, compute, network, identity, monitoring, and API infrastructure.",
    href: "/platform/cloud", category: "operate", icon: Server,
    border: "border-t-sky-400", iconColor: "text-sky-400", glow: "hover:shadow-[0_0_32px_-8px_rgba(56,189,248,0.35)]",
  },
  {
    title: "HiveForge Marketplace", subtitle: "Provision AI cloud resources across 24 catalog categories.",
    href: "/platform/hiveforge", category: "marketplace", icon: Store,
    border: "border-t-amber-400", iconColor: "text-amber-400", glow: "hover:shadow-[0_0_32px_-8px_rgba(251,191,36,0.35)]",
  },
  {
    title: "HiveShield™", subtitle: "Governance approvals, compliance mappings, and Zero Trust agent security.",
    href: "/platform/shield", category: "operate", icon: Shield,
    border: "border-t-rose-400", iconColor: "text-rose-400", glow: "hover:shadow-[0_0_32px_-8px_rgba(251,113,133,0.35)]",
  },
  {
    title: "CerebroArchive™", subtitle: "Ingest, search, and reason over your organization's knowledge.",
    href: "/platform/archive", category: "analyze", icon: Archive,
    border: "border-t-indigo-400", iconColor: "text-indigo-400", glow: "hover:shadow-[0_0_32px_-8px_rgba(129,140,248,0.35)]",
  },
  {
    title: "CerebroCopilot™", subtitle: "A conversational assistant grounded in your platform's live state.",
    href: "/platform/copilot", category: "operate", icon: MessageSquare,
    border: "border-t-fuchsia-400", iconColor: "text-fuchsia-400", glow: "hover:shadow-[0_0_32px_-8px_rgba(232,121,249,0.35)]",
  },
  {
    title: "HivePulse™", subtitle: "The unified control plane for your agent mesh and execution runtime.",
    href: "/platform/pulse", category: "operate", icon: Radio,
    border: "border-t-lime-400", iconColor: "text-lime-400", glow: "hover:shadow-[0_0_32px_-8px_rgba(163,230,53,0.35)]",
  },
  {
    title: "Cerebro X™", subtitle: "The AI gateway: model routing, cost, and observability in one place.",
    href: "/platform/x", category: "analyze", icon: Route,
    border: "border-t-cyan-300", iconColor: "text-cyan-300", glow: "hover:shadow-[0_0_32px_-8px_rgba(103,232,249,0.35)]",
  },
  {
    title: "CerebroFlow™", subtitle: "Event-driven workflow orchestration with human-in-the-loop approvals.",
    href: "/platform/flow", category: "build", icon: GitBranch,
    border: "border-t-orange-300", iconColor: "text-orange-300", glow: "hover:shadow-[0_0_32px_-8px_rgba(253,186,116,0.35)]",
  },
  {
    title: "Product Hub™", subtitle: "Browse the full CerebroHive product catalog.",
    href: "/products", category: "marketplace", icon: Boxes,
    border: "border-t-slate-300", iconColor: "text-slate-300", glow: "hover:shadow-[0_0_32px_-8px_rgba(203,213,225,0.3)]",
  },
];

function WorkspaceLauncher() {
  const [category, setCategory] = useState<LauncherCategory>("all");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const searching = q.length > 0;

  // While searching, ignore the active workspace and match across everything —
  // otherwise scope to the selected workspace so the panel height stays fixed
  // regardless of how many products CerebroHive ships.
  const filtered = WORKSPACE_TILES.filter(t => {
    const matchesCategory = searching || category === "all" || t.category === category;
    const matchesQuery = !q || t.title.toLowerCase().includes(q) || t.subtitle.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  const countFor = (id: LauncherCategory) => (id === "all" ? WORKSPACE_TILES.length : WORKSPACE_TILES.filter(t => t.category === id).length);

  return (
    <div className="mt-4">
      <div className="mx-auto max-w-2xl">
        <div className="relative">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search all workspaces and products…"
            className="w-full rounded-xl border border-border bg-surface py-4 pl-12 pr-4 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary-accent/50 focus:outline-none"
          />
        </div>
      </div>

      {/* Workspace tabs — a fixed row of categories, not a growing wall of tiles.
          Selecting a workspace scopes the panel below; searching overrides it. */}
      <div className="mt-6 flex items-center justify-center gap-1 overflow-x-auto border-b border-border pb-px">
        {LAUNCHER_CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            disabled={searching}
            className={`inline-flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-all disabled:cursor-default disabled:opacity-40 ${
              !searching && category === c.id
                ? "border-primary-accent text-primary-accent"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            {c.id === "all" && <LayoutGrid size={12} />}
            {c.label}
            <span className="text-[10px] font-normal normal-case text-text-secondary/70">{countFor(c.id)}</span>
          </button>
        ))}
      </div>

      {/* Fixed-height, internally-scrolling workspace panel: the page never grows
          taller as more products ship — only this panel scrolls. */}
      <div className="mt-6 max-h-[640px] overflow-y-auto rounded-2xl border border-border bg-surface/20 p-6 sm:p-8">
        {searching && (
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-text-secondary">
            {filtered.length} result{filtered.length === 1 ? "" : "s"} across all workspaces
          </p>
        )}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map(tile => {
            const Icon = tile.icon;
            return (
              <Link
                key={tile.href}
                href={tile.href}
                className={`group flex min-h-[200px] flex-col justify-between rounded-2xl border border-border border-t-4 ${tile.border} bg-surface/60 p-7 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] ${tile.glow} ${
                  tile.featured ? "sm:col-span-2 xl:col-span-1" : ""
                }`}
              >
                <div>
                  <Icon size={26} className={`${tile.iconColor} transition-transform duration-300 group-hover:scale-110`} />
                  <h3 className="mt-4 font-space text-base font-bold text-text-primary">{tile.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">{tile.subtitle}</p>
                </div>
                <div className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-text-secondary transition-all group-hover:gap-2.5 group-hover:text-primary-accent">
                  Open <ArrowRight size={14} />
                </div>
              </Link>
            );
          })}
          {filtered.length === 0 && (
            <p className="col-span-full py-12 text-center text-sm text-text-secondary">No workspaces match "{query}".</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PlatformPage() {
  const [activeStack, setActiveStack] = useState<number | null>(null);

  return (
    <div className="bg-background min-h-screen font-inter">

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border pt-8 pb-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-accent/5 via-transparent to-violet-500/5 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-primary-accent/6 blur-[100px] rounded-full pointer-events-none" />
        <div className="container-wide relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border mb-8">
              <span className="w-2 h-2 rounded-full bg-primary-accent animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">Platform Architecture</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-space font-bold text-text-primary leading-[1.05] tracking-tight mb-8 max-w-5xl mx-auto">
              The Enterprise AI{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-accent to-violet-400">
                Operating System
              </span>
            </h1>
            <p className="text-xl text-text-secondary leading-relaxed max-w-3xl mx-auto mb-10 text-center">
              A 5-layer modular architecture built for enterprise scale — from shared platform services and a unified AI gateway to specialized intelligence modules and an executive operating system.
            </p>
          </motion.div>
        </div>
        <div className="container-wide relative z-10 mt-2">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-space text-2xl font-bold text-text-primary">Start Your Work</h2>
            <p className="mt-2 text-sm text-text-secondary">Access products, AI workspaces, and marketplaces from one launcher.</p>
          </div>
          <WorkspaceLauncher />
        </div>
      </section>

      {/* VISION */}
      <section className="section-pad bg-surface-elevated border-b border-border">
        <div className="container-wide max-w-4xl mx-auto text-center">
          <div className="text-[10px] font-bold tracking-widest uppercase text-primary-accent mb-4">Platform Vision</div>
          <h2 className="text-4xl font-space font-bold text-text-primary mb-8">One Platform, Infinite Enterprise Intelligence</h2>
          <p className="text-lg text-text-secondary leading-relaxed mb-8">
            CerebroHive is built on a single architectural conviction: <strong className="text-text-primary">enterprise AI compounds in value when every system shares the same foundation</strong>. Knowledge from one module enriches every other. Governance policies applied to one surface protect every surface. Infrastructure provisioned for one workload scales for all.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Rather than marketing eight separate SaaS tools, we position CerebroHive as a <strong className="text-text-primary">modular Enterprise AI Operating System</strong> — each module delivers standalone value while creating powerful network effects through shared identity, data, intelligence, and experience.
          </p>
        </div>
      </section>

      {/* ARCHITECTURE STACK */}
      <section className="section-pad border-b border-border">
        <div className="container-wide">
          <div className="text-center mb-16">
            <div className="text-[10px] font-bold tracking-widest uppercase text-primary-accent mb-4">Architecture Stack</div>
            <h2 className="text-4xl font-space font-bold text-text-primary mb-6">5-Layer Platform Architecture</h2>
            <p className="text-text-secondary max-w-2xl mx-auto text-center">
              Click any layer to see its composition. Every layer depends on the layers below it.
            </p>
          </div>
          <div className="max-w-4xl mx-auto flex flex-col gap-3">
            {archStack.map((layer, i) => (
              <motion.div
                key={layer.tier}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                onClick={() => setActiveStack(activeStack === i ? null : i)}
                className={`rounded-2xl border p-6 cursor-pointer transition-all ${layer.color} ${activeStack === i ? "shadow-elevated" : "hover:shadow-sm"}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${layer.labelColor}`}>{layer.tier}</div>
                    <div className="text-text-secondary text-sm">{layer.description}</div>
                  </div>
                  <ChevronRight size={18} className={`text-text-muted transition-transform ${activeStack === i ? "rotate-90" : ""}`} />
                </div>
                {activeStack === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-5 flex flex-wrap gap-2"
                  >
                    {layer.items.map(item => (
                      <span key={item} className="px-3 py-1.5 text-xs font-bold bg-background border border-border rounded-lg text-text-primary">
                        {item}
                      </span>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SHARED SERVICES */}
      <section className="section-pad bg-surface-elevated border-b border-border">
        <div className="container-wide">
          <div className="text-center mb-16">
            <div className="text-[10px] font-bold tracking-widest uppercase text-primary-accent mb-4">Shared Services</div>
            <h2 className="text-4xl font-space font-bold text-text-primary mb-6">The Platform Foundation Every Module Shares</h2>
            <p className="text-text-secondary max-w-2xl mx-auto text-center">
              These platform services are provisioned once and consumed by all modules — eliminating the duplication, drift, and governance gaps of multi-vendor AI stacks.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {sharedServiceCards.map((svc, i) => {
              const Icon = svc.icon;
              return (
                <motion.div
                  key={svc.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="p-5 rounded-2xl border border-border bg-background hover:border-primary-accent/30 hover:shadow-sm transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary-accent/10 border border-primary-accent/20 flex items-center justify-center mb-4">
                    <Icon size={18} className="text-primary-accent" />
                  </div>
                  <h3 className="font-space font-bold text-text-primary text-sm mb-2">{svc.title}</h3>
                  <p className="text-xs text-text-muted leading-relaxed">{svc.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* NETWORK EFFECTS */}
      <section className="section-pad border-b border-border">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-[10px] font-bold tracking-widest uppercase text-primary-accent mb-4">Intelligence Network Effects</div>
              <h2 className="text-4xl font-space font-bold text-text-primary leading-tight mb-6">
                The Whole Is Greater Than the Sum of Its Modules
              </h2>
              <p className="text-text-secondary leading-relaxed mb-6">
                The CerebroHive platform generates compounding intelligence value because every module enriches every other. This is fundamentally different from a collection of disconnected AI tools.
              </p>
              <div className="flex flex-col gap-4">
                {[
                  { from: "CerebroArchive™", to: "CerebroCopilot™", detail: "Knowledge Graph provides grounded, hallucination-free enterprise answers" },
                  { from: "CerebroFlow™", to: "CerebroInsight™", detail: "Workflow execution telemetry feeds operational analytics in real time" },
                  { from: "CerebroStudio™", to: "HivePulse™", detail: "Agents built in Studio deploy directly to the orchestration engine" },
                  { from: "HiveShield™", to: "Platform", detail: "Governance policies enforced uniformly across every module boundary" },
                ].map((effect, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-border bg-surface">
                    <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-primary-accent bg-primary-accent/10 border border-primary-accent/20 px-2 py-0.5 rounded whitespace-nowrap">{effect.from}</span>
                      <ArrowRight size={10} className="text-text-muted" />
                      <span className="text-[10px] font-bold text-violet-300 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded whitespace-nowrap">{effect.to}</span>
                    </div>
                    <p className="text-sm text-text-secondary">{effect.detail}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Intelligence Modules", value: "8", desc: "Specialized AI capabilities" },
                { label: "Shared Services", value: "15", desc: "Platform foundation services" },
                { label: "Deployment Models", value: "4", desc: "Cloud, private, on-prem, air-gapped" },
                { label: "Enterprise Integrations", value: "50+", desc: "Native connectors" },
              ].map((stat, i) => (
                <div key={i} className="p-6 rounded-2xl border border-border bg-surface text-center">
                  <div className="text-4xl font-space font-bold text-primary-accent mb-2">{stat.value}</div>
                  <div className="text-sm font-bold text-text-primary mb-1">{stat.label}</div>
                  <div className="text-xs text-text-muted">{stat.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DEPLOYMENT */}
      <section className="section-pad bg-surface-elevated border-b border-border">
        <div className="container-wide">
          <div className="text-center mb-16">
            <div className="text-[10px] font-bold tracking-widest uppercase text-primary-accent mb-4">Deployment Models</div>
            <h2 className="text-4xl font-space font-bold text-text-primary mb-6">Enterprise-Grade Deployment Flexibility</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "SaaS Cloud", emoji: "☁️", providers: ["AWS", "GCP", "Azure"], desc: "Fully managed. Automatic upgrades, scaling, and SLA guarantees. Fastest time to value." },
              { title: "Private Cloud (VPC)", emoji: "🔐", providers: ["AWS VPC", "Azure VNet", "GCP VPC"], desc: "Dedicated deployment in your cloud account. Complete data isolation, your security controls." },
              { title: "On-Premises", emoji: "🏢", providers: ["Kubernetes", "OpenShift", "Bare Metal"], desc: "Self-hosted in your data center. Full control over compute, networking, and data." },
              { title: "Air-Gapped", emoji: "🛡️", providers: ["Classified Networks", "Defense", "Critical Infrastructure"], desc: "No external connectivity. Designed for the most sensitive regulated environments." },
            ].map((model, i) => (
              <div key={i} className="p-6 rounded-2xl border border-border bg-background hover:border-primary-accent/30 transition-all">
                <div className="text-3xl mb-4">{model.emoji}</div>
                <h3 className="font-space font-bold text-text-primary text-lg mb-3">{model.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-4">{model.desc}</p>
                <div className="flex flex-wrap gap-1">
                  {model.providers.map(p => (
                    <span key={p} className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-surface border border-border rounded text-text-muted">{p}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROADMAP */}
      <section className="section-pad border-b border-border">
        <div className="container-wide">
          <div className="text-center mb-16">
            <div className="text-[10px] font-bold tracking-widest uppercase text-primary-accent mb-4">Product Roadmap</div>
            <h2 className="text-4xl font-space font-bold text-text-primary mb-6">Platform Evolution — 5 Phases</h2>
          </div>
          <div className="max-w-4xl mx-auto flex flex-col gap-4">
            {roadmapPhases.map((phase, i) => {
              const cfg = statusConfig[phase.status as keyof typeof statusConfig];
              return (
                <motion.div
                  key={phase.phase}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-2xl border border-border bg-surface flex gap-6"
                >
                  <div className="flex-shrink-0 text-center w-20">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">{phase.phase}</div>
                    <div className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>{cfg.label}</div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-space font-bold text-text-primary mb-3">{phase.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      {phase.items.map(item => (
                        <span key={item} className="px-2 py-1 text-[11px] font-bold bg-background border border-border rounded text-text-secondary">{item}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ENTERPRISE INTEGRATIONS */}
      <section className="section-pad bg-surface-elevated border-b border-border">
        <div className="container-wide text-center">
          <div className="text-[10px] font-bold tracking-widest uppercase text-primary-accent mb-4">Enterprise Integrations</div>
          <h2 className="text-4xl font-space font-bold text-text-primary mb-6">Connects to Your Existing Stack</h2>
          <p className="text-text-secondary max-w-2xl mx-auto mb-12 text-center">
            CerebroHive integrates natively with the enterprise systems your teams already use.
          </p>
          <div className="w-full mt-12">
            <EnterpriseIntegrations />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-pad">
        <div className="container-wide text-center">
          <div className="max-w-3xl mx-auto p-12 rounded-3xl border border-border bg-gradient-to-br from-primary-accent/10 to-violet-600/10">
            <h2 className="text-4xl font-space font-bold text-text-primary mb-6">
              Ready to Build on the Platform?
            </h2>
            <p className="text-text-secondary leading-relaxed mb-8">
              Our enterprise architects will walk you through the platform architecture, map it to your specific environment, and design a deployment plan aligned with your data residency, compliance, and infrastructure requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="px-8 py-4 bg-primary-accent text-background font-space font-bold text-sm uppercase tracking-widest rounded-xl transition-all hover:-translate-y-1 shadow-elevated flex items-center gap-3 justify-center">
                Request a Technical Briefing <ArrowRight size={16} />
              </Link>
              <Link href="/developers" className="px-8 py-4 bg-surface border border-border text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-xl transition-all hover:border-primary-accent/50 hover:-translate-y-1">
                Developer Documentation
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
