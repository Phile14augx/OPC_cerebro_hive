import type { Metadata } from "next";
import Link from "next/link";
import {
  Shield, Network, Database, Cpu, Brain, Building2,
  ArrowRight, CheckCircle, Zap, Globe, Lock, TrendingUp,
} from "lucide-react";

export const metadata: Metadata = {
  title: "CerebroHive — Enterprise AI Systems & Transformation",
  description:
    "CerebroHive architects enterprise AI systems — 50 products across 6 tiers, 50 professional services, and deep industry expertise across 15 verticals.",
};

const TIERS = [
  {
    id: "tier-0",
    label: "Tier 0",
    name: "Security & Governance",
    color: "text-red-400",
    border: "border-red-500/30",
    bg: "bg-red-500/5",
    icon: Shield,
    products: ["HiveIdentity™", "HiveShield™", "HiveGovern™"],
    desc: "Zero-trust identity, threat defense, and enterprise AI governance.",
  },
  {
    id: "tier-1",
    label: "Tier 1",
    name: "Infrastructure",
    color: "text-orange-400",
    border: "border-orange-500/30",
    bg: "bg-orange-500/5",
    icon: Network,
    products: ["HiveNetwork™", "HiveCompute™", "HiveStorage™", "HiveMemory™", "HiveVector™"],
    desc: "High-performance compute, distributed storage, vector databases, and AI memory systems.",
  },
  {
    id: "tier-2",
    label: "Tier 2",
    name: "Platform & Data",
    color: "text-yellow-400",
    border: "border-yellow-500/30",
    bg: "bg-yellow-500/5",
    icon: Database,
    products: ["HiveLake™", "HiveAnalytics™", "HiveData™", "HiveObservatory™", "HiveGateway™", "HiveKnowledge™", "HiveConsole™", "HiveMonitor™", "HiveAPI™", "Cerebro X™"],
    desc: "Enterprise data lake, analytics, observability, and API orchestration.",
  },
  {
    id: "tier-3",
    label: "Tier 3",
    name: "AI Runtime",
    color: "text-primary-accent",
    border: "border-primary-accent/30",
    bg: "bg-primary-accent/5",
    icon: Cpu,
    products: ["HiveAgents™", "HiveModels™", "HiveAutomation™", "HivePlanner™", "HiveReasoner™", "HiveSemantic™", "HiveEvaluation™", "HiveForge™", "HiveOps™", "HiveWorkspace™"],
    desc: "Multi-agent orchestration, model registry, automated reasoning, and MLOps.",
  },
  {
    id: "tier-4",
    label: "Tier 4",
    name: "Business Applications",
    color: "text-purple-400",
    border: "border-purple-500/30",
    bg: "bg-purple-500/5",
    icon: Brain,
    products: ["CerebroAgent™", "CerebroStudio™", "CerebroERP™", "CerebroFlow™", "CerebroCRM™", "CerebroHR™", "CerebroFinance™", "CerebroLearn™", "CerebroSearch™", "CerebroInsight™", "CerebroAnalytics™", "CerebroPredict™", "CerebroGrowth™", "CerebroResearch™", "CerebroArchitect™", "+ 8 more"],
    desc: "18 purpose-built AI business applications for every enterprise function.",
  },
  {
    id: "tier-5",
    label: "Tier 5",
    name: "Ecosystem & Commerce",
    color: "text-blue-400",
    border: "border-blue-500/30",
    bg: "bg-blue-500/5",
    icon: Building2,
    products: ["HiveExchange™", "HiveMarketplace™", "HiveBilling™", "HiveLicense™", "HivePartner™", "HiveDeploy™", "HiveCloud™"],
    desc: "Multi-cloud deployment, marketplace, billing, licensing, and partner ecosystem.",
  },
];

const SERVICES = [
  { code: "A", label: "Strategy & Advisory", href: "/services/strategy", color: "text-purple-400", border: "border-purple-500/30", count: 10, desc: "AI strategy, readiness assessments, governance frameworks." },
  { code: "B", label: "Engineering & Implementation", href: "/services/engineering", color: "text-primary-accent", border: "border-primary-accent/30", count: 10, desc: "RAG, knowledge graphs, agents, platform deployment." },
  { code: "C", label: "AI Operations", href: "/services/operations", color: "text-yellow-400", border: "border-yellow-500/30", count: 10, desc: "AgentOps, MLOps, LLMOps, fine-tuning, observability." },
  { code: "D", label: "Security & Governance", href: "/services/security", color: "text-red-400", border: "border-red-500/30", count: 10, desc: "Red teaming, compliance automation, zero trust, risk." },
  { code: "E", label: "Industry Solutions", href: "/services/industry", color: "text-orange-400", border: "border-orange-500/30", count: 10, desc: "Healthcare, banking, manufacturing, government, and 6 more." },
];

const METRICS = [
  { value: "50", label: "Products Across 6 Tiers", icon: Zap },
  { value: "50", label: "Professional Services", icon: CheckCircle },
  { value: "15", label: "Industries Served", icon: Globe },
  { value: "99.99%", label: "Platform Uptime SLA", icon: TrendingUp },
];

const OUTCOMES = [
  "AI Maturity Assessment → 3-year roadmap in 4 weeks",
  "Enterprise RAG system production-ready in 8–12 weeks",
  "AgentOps retainer: >95% task completion, <5% human intervention",
  "Compliance automation: >80% controls covered automatically",
  "Zero-trust architecture validated by external pen test",
];

export default function HomePage() {
  return (
    <main>
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-accent/5 via-transparent to-purple-500/5 pointer-events-none" />
        <div className="container-wide py-24 md:py-32 relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-accent/30 bg-primary-accent/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-primary-accent mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-accent animate-pulse" />
            Intelligence Mesh — 50 Products · 50 Services · 15 Industries
          </div>
          <h1 className="font-space text-4xl md:text-6xl font-bold text-text-primary max-w-4xl leading-tight">
            The Enterprise AI Operating System
          </h1>
          <p className="mt-6 text-lg md:text-xl text-text-secondary max-w-2xl leading-relaxed">
            CerebroHive architects the full stack of enterprise AI — from zero-trust
            infrastructure to autonomous agents, business applications, and
            professional services that make transformation real.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/platform"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary-accent text-background font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Explore the Platform <ArrowRight size={16} />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border text-text-primary font-bold text-sm hover:border-primary-accent/50 transition-colors"
            >
              View Services <ArrowRight size={16} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border text-text-secondary font-semibold text-sm hover:text-text-primary transition-colors"
            >
              Book Strategy Session
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Metrics ─── */}
      <section className="border-b border-border bg-surface/40">
        <div className="container-wide py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {METRICS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center text-center gap-2">
                <Icon size={24} className="text-primary-accent" />
                <span className="font-space text-3xl font-bold text-text-primary">{value}</span>
                <span className="text-xs text-text-secondary">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Platform Tiers ─── */}
      <section className="border-b border-border">
        <div className="container-wide py-20">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-accent mb-3">The Intelligence Mesh</p>
            <h2 className="font-space text-3xl md:text-4xl font-bold text-text-primary">
              50 Products. 6 Tiers. One Coherent Stack.
            </h2>
            <p className="mt-4 text-text-secondary max-w-2xl mx-auto">
              From infrastructure to applications, every layer purpose-built for enterprise AI — composable, governed, and production-ready from day one.
            </p>
          </div>

          <div className="space-y-4">
            {TIERS.map(({ id, label, name, color, border, bg, icon: Icon, products, desc }) => (
              <Link
                key={id}
                href={`/platform#${id}`}
                className={`group flex flex-col md:flex-row md:items-center gap-4 rounded-2xl border ${border} ${bg} px-6 py-5 hover:border-opacity-60 transition-all`}
              >
                <div className="flex items-center gap-3 md:w-56 shrink-0">
                  <div className={`p-2 rounded-lg border ${border} ${bg}`}>
                    <Icon size={20} className={color} />
                  </div>
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${color}`}>{label}</span>
                    <p className="text-sm font-bold text-text-primary">{name}</p>
                  </div>
                </div>
                <p className="text-xs text-text-secondary md:w-56 shrink-0">{desc}</p>
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {products.map((p) => (
                    <span key={p} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${border} ${color}`}>{p}</span>
                  ))}
                </div>
                <ArrowRight size={16} className={`${color} opacity-0 group-hover:opacity-100 shrink-0 transition-opacity`} />
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/platform"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border text-text-primary font-bold text-sm hover:border-primary-accent/50 transition-colors"
            >
              View All 50 Products <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Services ─── */}
      <section className="border-b border-border bg-surface/40">
        <div className="container-wide py-20">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-accent mb-3">Professional Services</p>
            <h2 className="font-space text-3xl md:text-4xl font-bold text-text-primary">
              50 Services. From Strategy to Production.
            </h2>
            <p className="mt-4 text-text-secondary max-w-2xl mx-auto">
              Every engagement produces board-ready deliverables, production-grade systems, and documented handoffs your team can own.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((svc) => (
              <Link
                key={svc.code}
                href={svc.href}
                className={`group rounded-2xl border ${svc.border} bg-surface/40 p-6 hover:bg-surface-elevated/40 transition-colors`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${svc.color}`}>
                    Category {svc.code} · {svc.count} Services
                  </span>
                  <ArrowRight size={14} className={`${svc.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>
                <h3 className="text-sm font-bold text-text-primary mb-1">{svc.label}</h3>
                <p className="text-xs text-text-secondary">{svc.desc}</p>
              </Link>
            ))}

            <Link
              href="/services"
              className="group rounded-2xl border border-border bg-surface/40 p-6 hover:border-primary-accent/50 transition-colors flex flex-col items-center justify-center text-center gap-2"
            >
              <span className="text-2xl font-bold text-primary-accent">50</span>
              <span className="text-sm font-bold text-text-primary">Services Overview</span>
              <span className="text-xs text-text-secondary">Engagement models, pricing & packages</span>
              <ArrowRight size={14} className="text-primary-accent mt-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Outcomes ─── */}
      <section className="border-b border-border">
        <div className="container-wide py-20">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-accent mb-3">Proven Results</p>
              <h2 className="font-space text-3xl md:text-4xl font-bold text-text-primary mb-6">
                Defined timelines. Quantified outcomes.
              </h2>
              <p className="text-text-secondary leading-relaxed">
                Every CerebroHive engagement has a defined scope, timeline, deliverables, and success metrics — agreed upfront, measured continuously, and reported to your board.
              </p>
              <Link
                href="/contact"
                className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary-accent text-background font-bold text-sm hover:opacity-90 transition-opacity"
              >
                Start with a Strategy Session <ArrowRight size={16} />
              </Link>
            </div>
            <div className="space-y-3">
              {OUTCOMES.map((outcome) => (
                <div key={outcome} className="flex items-start gap-3 rounded-xl border border-border bg-surface/40 px-4 py-3">
                  <CheckCircle size={16} className="text-primary-accent mt-0.5 shrink-0" />
                  <span className="text-sm text-text-secondary">{outcome}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Security callout ─── */}
      <section className="border-b border-border bg-surface/40">
        <div className="container-wide py-16">
          <div className="max-w-3xl mx-auto text-center">
            <Lock size={32} className="text-primary-accent mx-auto mb-4" />
            <h2 className="font-space text-2xl md:text-3xl font-bold text-text-primary mb-4">
              Security and governance built into every tier.
            </h2>
            <p className="text-text-secondary leading-relaxed mb-8">
              NIST AI RMF · ISO 42001 · SOC 2 · HIPAA · FedRAMP · EU AI Act. Zero-trust architecture from Tier 0. Continuous compliance evidence collection. Board-ready risk reporting.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/platform/identity" className="px-4 py-2 rounded-full border border-border text-xs font-semibold text-text-secondary hover:text-primary-accent hover:border-primary-accent/50 transition-colors">HiveIdentity™</Link>
              <Link href="/platform/shield" className="px-4 py-2 rounded-full border border-border text-xs font-semibold text-text-secondary hover:text-primary-accent hover:border-primary-accent/50 transition-colors">HiveShield™</Link>
              <Link href="/platform/govern" className="px-4 py-2 rounded-full border border-border text-xs font-semibold text-text-secondary hover:text-primary-accent hover:border-primary-accent/50 transition-colors">HiveGovern™</Link>
              <Link href="/services/security" className="px-4 py-2 rounded-full border border-border text-xs font-semibold text-text-secondary hover:text-primary-accent hover:border-primary-accent/50 transition-colors">Security Services</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section>
        <div className="container-wide py-24 text-center">
          <h2 className="font-space text-3xl md:text-5xl font-bold text-text-primary mb-6">
            Ready to architect your enterprise AI?
          </h2>
          <p className="text-text-secondary text-lg max-w-xl mx-auto mb-10">
            Start with a 2-week AI readiness assessment or a 4–6 week strategy engagement. Board-ready deliverables guaranteed.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary-accent text-background font-bold hover:opacity-90 transition-opacity"
            >
              Book Strategy Session <ArrowRight size={18} />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-border text-text-primary font-bold hover:border-primary-accent/50 transition-colors"
            >
              Browse 50 Services <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
