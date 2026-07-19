"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Globe2, Archive, Code2, Workflow, BarChart2, MessageSquare, Server, Shield, Cpu, Zap, ChevronRight } from "lucide-react";
import { EcosystemArchitectureDiagram } from "./EcosystemArchitectureDiagram";
import { ecosystemTiers } from "@/lib/data/products";

const moduleIcons: Record<string, any> = {
  "cerebro-sphere": Globe2,
  "hivepulse": Cpu,
  "cerebro-archive": Archive,
  "cerebro-studio": Code2,
  "cerebro-flow": Workflow,
  "cerebro-insight": BarChart2,
  "cerebro-copilot": MessageSquare,
  "hive-ops": Server,
  "hive-shield": Shield,
  "cerebro-x": Zap,
};

const layerTabs = [
  { key: "all", label: "Full Ecosystem" },
  { key: "os", label: "OS Layer" },
  { key: "business", label: "Business Modules" },
  { key: "enterprise", label: "Platform Services" },
  { key: "foundation", label: "Foundation" },
] as const;

const networkEffects = [
  {
    from: "CerebroArchive™",
    to: "CerebroCopilot™",
    description: "Knowledge Graph powers grounded, hallucination-free answers",
  },
  {
    from: "CerebroFlow™",
    to: "CerebroInsight™",
    description: "Workflow telemetry feeds operational analytics dashboards",
  },
  {
    from: "CerebroStudio™",
    to: "HivePulse™",
    description: "Built agents are deployed directly to the orchestration engine",
  },
  {
    from: "HiveShield™",
    to: "All Modules",
    description: "Governance policies applied uniformly across the entire platform",
  },
  {
    from: "Cerebro X™",
    to: "Every Module",
    description: "AI Gateway provides shared model access, cost optimization, and observability",
  },
];

const sharedServices = [
  "Enterprise Identity & IAM",
  "Multi-Tenancy",
  "Organization Management",
  "RBAC + ABAC",
  "AI Gateway (Cerebro X™)",
  "Event Bus",
  "Vector Search",
  "PostgreSQL + pgvector",
  "Object Storage",
  "Audit Logging",
  "API Gateway",
  "Notification Service",
  "Observability Stack",
  "Billing & Licensing",
  "Plugin Marketplace",
];

export function ProductsEcosystemPage() {
  const allFeatured = [
    ...ecosystemTiers.os,
    ...(ecosystemTiers as any).business?.filter ? [ecosystemTiers.business.find((p: any) => p.id === "hivepulse")].filter(Boolean) : [],
    ...ecosystemTiers.business,
    ...ecosystemTiers.enterprise,
    ...ecosystemTiers.foundation,
  ].filter((p, i, arr) => p && arr.findIndex((x: any) => x?.id === p.id) === i);

  return (
    <div className="bg-background min-h-screen selection:bg-primary-accent/30 selection:text-text-primary font-inter">

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border pt-28 pb-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-accent/5 via-transparent to-violet-600/5 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-accent/8 blur-[120px] rounded-full pointer-events-none" />
        <div className="container-wide relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border mb-8 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-primary-accent animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">Enterprise AI Operating System</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-space font-bold text-text-primary leading-[1.05] tracking-tight mb-8 max-w-5xl mx-auto">
              One Platform.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-accent to-violet-400">
                Eight Intelligent Modules.
              </span>
            </h1>
            <p className="text-xl text-text-secondary leading-relaxed max-w-3xl mx-auto mb-10">
              CerebroHive is a modular Enterprise AI Operating System. Each module delivers standalone value while sharing a common identity layer, AI gateway, event bus, and data fabric — creating powerful intelligence network effects across the entire platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="px-8 py-4 bg-primary-accent text-background font-space font-bold text-sm uppercase tracking-widest rounded-xl transition-all hover:-translate-y-1 shadow-elevated flex items-center gap-3">
                Book an Architecture Workshop <ArrowRight size={16} />
              </Link>
              <Link href="/platform" className="px-8 py-4 bg-surface border border-border text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-xl transition-all hover:border-primary-accent/50 hover:-translate-y-1">
                View Platform Architecture
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* WHY AN AI OPERATING SYSTEM */}
      <section className="section-pad bg-surface-elevated border-b border-border">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-[10px] font-bold tracking-widest uppercase text-primary-accent mb-4">Strategic Positioning</div>
              <h2 className="text-4xl font-space font-bold text-text-primary leading-tight mb-6">
                Why an AI Operating System?
              </h2>
              <p className="text-text-secondary leading-relaxed mb-6">
                Enterprises that deploy AI as a collection of disconnected tools accumulate technical debt, data silos, duplicate infrastructure, and fragmented governance. Each point solution creates its own identity layer, its own data model, and its own security posture.
              </p>
              <p className="text-text-secondary leading-relaxed mb-8">
                CerebroHive takes a different architectural stance: a modular platform where every product shares a common foundation — identity, data fabric, AI gateway, event bus, and compliance layer — while delivering specialized intelligence capabilities through purpose-built modules.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  "Knowledge from Archive enriches Copilot's answers",
                  "Workflows from Flow automate actions across every module",
                  "Insight analyzes activity generated by the entire platform",
                  "HiveShield governs AI behavior across all products uniformly",
                ].map((point, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary-accent/20 border border-primary-accent/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-accent" />
                    </div>
                    <p className="text-sm text-text-secondary">{point}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Isolated AI Tools", desc: "Fragmented data, duplicate infra, no shared governance", icon: "✗", bad: true },
                { label: "CerebroHive Platform", desc: "Shared foundation, network effects, unified governance", icon: "✓", bad: false },
                { label: "Point Solutions", desc: "8 different identity systems, 8 cost centers, 8 security postures", icon: "✗", bad: true },
                { label: "Modular OS", desc: "One identity layer, one AI gateway, one compliance framework", icon: "✓", bad: false },
              ].map((item, i) => (
                <div key={i} className={`p-5 rounded-xl border ${item.bad ? "border-red-500/20 bg-red-500/5" : "border-emerald-500/20 bg-emerald-500/5"}`}>
                  <div className={`text-2xl mb-3 ${item.bad ? "text-red-400" : "text-emerald-400"}`}>{item.icon}</div>
                  <div className={`text-sm font-bold mb-2 ${item.bad ? "text-red-300" : "text-emerald-300"}`}>{item.label}</div>
                  <div className="text-xs text-text-muted leading-relaxed">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ARCHITECTURE DIAGRAM */}
      <section className="section-pad border-b border-border">
        <div className="container-wide">
          <div className="text-center mb-16">
            <div className="text-[10px] font-bold tracking-widest uppercase text-primary-accent mb-4">Platform Architecture</div>
            <h2 className="text-4xl font-space font-bold text-text-primary mb-6">
              The Ecosystem at a Glance
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Hover any module to see its connections. Every module integrates natively with every other — no API glue required.
            </p>
          </div>
          <EcosystemArchitectureDiagram />
        </div>
      </section>

      {/* MODULE EXPLORER */}
      <section className="section-pad bg-surface-elevated border-b border-border">
        <div className="container-wide">
          <div className="text-center mb-16">
            <div className="text-[10px] font-bold tracking-widest uppercase text-primary-accent mb-4">Product Modules</div>
            <h2 className="text-4xl font-space font-bold text-text-primary mb-6">
              Explore the Modules
            </h2>
          </div>

          <div className="flex flex-col gap-16">
            {/* OS Layer */}
            {ecosystemTiers.os.map(product => {
              const Icon = moduleIcons[product.id] || Globe2;
              return (
                <div key={product.id} className="relative p-8 rounded-2xl border-2 border-violet-500/40 bg-gradient-to-br from-violet-500/10 to-purple-600/5">
                  <div className="text-[10px] font-bold tracking-widest uppercase text-violet-400 mb-6">Enterprise Operating System — OS Layer</div>
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center">
                          <Icon size={24} className="text-violet-300" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-space font-bold text-text-primary">{product.title}</h3>
                          <p className="text-text-muted text-sm">{product.hero.subtitle}</p>
                        </div>
                      </div>
                      <p className="text-text-secondary leading-relaxed mb-6 max-w-2xl">{product.summary}</p>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {product.coreCapabilities.slice(0, 4).map(cap => (
                          <span key={cap.title} className="px-3 py-1 text-xs font-bold tracking-wide uppercase bg-background border border-border rounded-full text-text-muted">{cap.title}</span>
                        ))}
                        {product.coreCapabilities.length > 4 && (
                          <span className="px-3 py-1 text-xs font-bold tracking-wide uppercase bg-background border border-border rounded-full text-primary-accent">+{product.coreCapabilities.length - 4} more</span>
                        )}
                      </div>
                    </div>
                    <Link href={`/products/${product.slug}`} className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-violet-500/20 border border-violet-500/40 text-violet-300 font-bold text-sm rounded-xl hover:bg-violet-500/30 transition-colors">
                      Explore {product.title} <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              );
            })}

            {/* Business Modules */}
            <div>
              <div className="text-[10px] font-bold tracking-widest uppercase text-emerald-400 mb-6">Business Intelligence Modules</div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ecosystemTiers.business.map(product => {
                  const Icon = moduleIcons[product.id] || Code2;
                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className="group p-6 rounded-2xl border border-border bg-background hover:border-emerald-500/40 hover:shadow-elevated transition-all"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-5 group-hover:bg-emerald-500/25 transition-colors">
                        <Icon size={20} className="text-emerald-300" />
                      </div>
                      <h3 className="font-space font-bold text-text-primary mb-1 group-hover:text-emerald-300 transition-colors">{product.title}</h3>
                      <p className="text-xs text-text-muted mb-3">{product.hero.subtitle}</p>
                      <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">{product.summary}</p>
                      <div className="flex items-center gap-1 mt-4 text-xs text-primary-accent font-bold">
                        Explore module <ChevronRight size={12} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Enterprise Platform */}
            <div>
              <div className="text-[10px] font-bold tracking-widest uppercase text-amber-400 mb-6">Enterprise Platform Services</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ecosystemTiers.enterprise.map(product => {
                  const Icon = moduleIcons[product.id] || Shield;
                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className="group p-6 rounded-2xl border border-border bg-background hover:border-amber-500/40 hover:shadow-elevated transition-all flex gap-5"
                    >
                      <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/25 transition-colors">
                        <Icon size={22} className="text-amber-300" />
                      </div>
                      <div>
                        <h3 className="font-space font-bold text-text-primary mb-1 group-hover:text-amber-300 transition-colors">{product.title}</h3>
                        <p className="text-xs text-text-muted mb-3">{product.hero.subtitle}</p>
                        <p className="text-sm text-text-secondary leading-relaxed">{product.summary.substring(0, 160)}…</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Foundation */}
            <div>
              <div className="text-[10px] font-bold tracking-widest uppercase text-rose-400 mb-6">Shared Foundation Service</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ecosystemTiers.foundation.map(product => {
                  const Icon = moduleIcons[product.id] || Zap;
                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className="group p-6 rounded-2xl border border-border bg-background hover:border-rose-500/40 hover:shadow-elevated transition-all flex gap-5"
                    >
                      <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center flex-shrink-0 group-hover:bg-rose-500/25 transition-colors">
                        <Icon size={22} className="text-rose-300" />
                      </div>
                      <div>
                        <h3 className="font-space font-bold text-text-primary mb-1 group-hover:text-rose-300 transition-colors">{product.title}</h3>
                        <p className="text-xs text-text-muted mb-3">{product.hero.subtitle}</p>
                        <p className="text-sm text-text-secondary leading-relaxed">{product.summary.substring(0, 200)}…</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NETWORK EFFECTS */}
      <section className="section-pad border-b border-border">
        <div className="container-wide">
          <div className="text-center mb-16">
            <div className="text-[10px] font-bold tracking-widest uppercase text-primary-accent mb-4">Cross-Module Intelligence</div>
            <h2 className="text-4xl font-space font-bold text-text-primary mb-6">
              Modules That Reinforce Each Other
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Every module is more powerful because of the others. This is the network effect of an AI Operating System.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {networkEffects.map((effect, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-border bg-surface hover:border-primary-accent/30 transition-all"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-bold text-primary-accent bg-primary-accent/10 border border-primary-accent/20 px-2 py-0.5 rounded">{effect.from}</span>
                  <ArrowRight size={12} className="text-text-muted flex-shrink-0" />
                  <span className="text-xs font-bold text-violet-300 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded">{effect.to}</span>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{effect.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SHARED FOUNDATION */}
      <section className="section-pad bg-surface-elevated border-b border-border">
        <div className="container-wide">
          <div className="text-center mb-12">
            <div className="text-[10px] font-bold tracking-widest uppercase text-primary-accent mb-4">Platform Foundation</div>
            <h2 className="text-4xl font-space font-bold text-text-primary mb-6">
              One Foundation. Every Module.
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Every CerebroHive module shares the same enterprise-grade foundation — eliminating the integration overhead, data silos, and governance gaps of multi-vendor AI stacks.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center max-w-4xl mx-auto">
            {sharedServices.map(svc => (
              <div key={svc} className="px-4 py-2 rounded-xl border border-border bg-background text-sm font-bold text-text-secondary hover:border-primary-accent/40 hover:text-text-primary transition-colors">
                {svc}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEPLOYMENT */}
      <section className="section-pad border-b border-border">
        <div className="container-wide">
          <div className="text-center mb-16">
            <div className="text-[10px] font-bold tracking-widest uppercase text-primary-accent mb-4">Deployment Models</div>
            <h2 className="text-4xl font-space font-bold text-text-primary mb-6">
              Deploy Where Your Data Lives
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "SaaS Cloud", desc: "Fully managed on AWS, GCP, or Azure. Fastest time to value.", icon: "☁️" },
              { title: "Private Cloud", desc: "Dedicated VPC deployment within your cloud account. Full data isolation.", icon: "🔐" },
              { title: "On-Premises", desc: "Self-hosted Kubernetes deployment in your data center.", icon: "🏢" },
              { title: "Air-Gapped", desc: "Fully disconnected deployment for regulated and defense environments.", icon: "🛡️" },
            ].map((model, i) => (
              <div key={i} className="p-6 rounded-2xl border border-border bg-surface text-center hover:border-primary-accent/40 transition-colors">
                <div className="text-3xl mb-4">{model.icon}</div>
                <h3 className="font-space font-bold text-text-primary mb-3">{model.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{model.desc}</p>
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
              Ready for an Architecture Briefing?
            </h2>
            <p className="text-text-secondary leading-relaxed mb-8">
              Our enterprise architects work with you to map the CerebroHive platform to your organization's specific needs, data architecture, and compliance requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="px-8 py-4 bg-primary-accent text-background font-space font-bold text-sm uppercase tracking-widest rounded-xl transition-all hover:-translate-y-1 shadow-elevated flex items-center gap-3 justify-center">
                Book an Architecture Workshop <ArrowRight size={16} />
              </Link>
              <Link href="/platform" className="px-8 py-4 bg-surface border border-border text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-xl transition-all hover:border-primary-accent/50 hover:-translate-y-1">
                View Full Platform Docs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
