"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronRight, Shield, Server, Zap, Database, Network, Globe2, Lock, Activity, Code, Search, Bell, Users, DollarSign } from "lucide-react";

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

export default function PlatformPage() {
  const [activeStack, setActiveStack] = useState<number | null>(null);

  return (
    <div className="bg-background min-h-screen font-inter">

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border pt-28 pb-24">
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
            <p className="text-xl text-text-secondary leading-relaxed max-w-3xl mx-auto mb-10">
              A 5-layer modular architecture built for enterprise scale — from shared platform services and a unified AI gateway to specialized intelligence modules and an executive operating system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="px-8 py-4 bg-primary-accent text-background font-space font-bold text-sm uppercase tracking-widest rounded-xl transition-all hover:-translate-y-1 shadow-elevated flex items-center gap-3">
                Request Architecture Briefing <ArrowRight size={16} />
              </Link>
              <Link href="/products" className="px-8 py-4 bg-surface border border-border text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-xl transition-all hover:border-primary-accent/50 hover:-translate-y-1">
                Explore Products
              </Link>
            </div>
          </motion.div>
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
            <p className="text-text-secondary max-w-2xl mx-auto">
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
            <p className="text-text-secondary max-w-2xl mx-auto">
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
          <p className="text-text-secondary max-w-2xl mx-auto mb-12">
            CerebroHive integrates natively with the enterprise systems your teams already use.
          </p>
          <div className="flex flex-wrap gap-3 justify-center max-w-4xl mx-auto">
            {["SAP", "Salesforce", "ServiceNow", "Microsoft 365", "Google Workspace", "Slack", "Jira", "Confluence", "GitHub", "GitLab", "AWS", "GCP", "Azure", "Snowflake", "BigQuery", "Redshift", "Okta", "Azure AD", "Terraform", "Kubernetes", "Docker", "Prometheus", "Grafana", "Splunk", "HashiCorp Vault"].map(sys => (
              <div key={sys} className="px-4 py-2 rounded-xl border border-border bg-background text-sm font-bold text-text-secondary hover:border-primary-accent/40 hover:text-text-primary transition-colors">
                {sys}
              </div>
            ))}
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
