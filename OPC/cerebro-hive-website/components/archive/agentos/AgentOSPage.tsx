"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Cloud, Server, Terminal, Cpu } from "lucide-react";
import { agentos } from "@/lib/data/products/agentos";
import { ProductComparisonCard } from "@/components/products/ProductComparisonCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AgentOSHero } from "./AgentOSHero";
import { AgentOSPyramid } from "./AgentOSPyramid";
import { AgentOSKernelFlow } from "./AgentOSKernelFlow";
import { AgentOSDigitalTwin } from "./AgentOSDigitalTwin";
import { AgentOSControlCenter } from "./AgentOSControlCenter";
import { AgentOSIndustryLayer } from "./AgentOSIndustryLayer";
import { AgentOSArchitectureStack } from "./AgentOSArchitectureStack";

export const AgentOSPage = () => {
  return (
    <div className="bg-background min-h-screen selection:bg-primary-accent/30 selection:text-text-primary">
      <AgentOSHero />

      {/* Overview */}
      <section className="section-pad border-b border-border bg-surface-elevated">
        <div className="container-wide max-w-4xl text-center mx-auto">
          <h2 className="text-3xl font-space font-bold text-text-primary mb-6">Overview</h2>
          <p className="text-lg text-text-secondary leading-relaxed">{agentos.description}</p>
          <Link
            href="/products/agentos/live-runtime"
            className="mt-8 inline-flex items-center gap-2 px-6 py-3.5 bg-primary-accent text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-lg transition-transform hover:-translate-y-0.5 shadow-elevated"
          >
            <Cpu size={16} /> Run the Real Kernel — Live
          </Link>
          <p className="mt-3 text-xs text-text-muted">
            Not a mockup — this launches the actual Guard, Reasoning Engine, Planner, Scheduler, Memory Fabric and Eval modules running in this app.
          </p>
        </div>
      </section>

      <AgentOSPyramid />
      <AgentOSKernelFlow />
      <AgentOSDigitalTwin />
      <AgentOSControlCenter />

      {/* Competitive comparison */}
      <section className="section-pad border-b border-border bg-surface-elevated">
        <div className="container-wide">
          <SectionHeading
            label="Category"
            title="Not another agent framework"
            description="AgentOS is built to be compared against enterprise platforms, not single-purpose orchestration libraries."
          />
          <div className="mt-16">
            <ProductComparisonCard platform={agentos} />
          </div>
        </div>
      </section>

      <AgentOSIndustryLayer />
      <AgentOSArchitectureStack />

      {/* Deployment + Integrations */}
      <section className="section-pad border-b border-border bg-surface-elevated">
        <div className="container-wide grid lg:grid-cols-2 gap-16">
          <div>
            <h3 className="text-2xl font-space font-bold text-text-primary mb-8 border-b border-border pb-4">Deployment Models</h3>
            <div className="grid grid-cols-2 gap-4">
              {agentos.deploymentOptions.map((opt) => (
                <div key={opt.name} className="p-5 rounded-xl bg-surface border border-border shadow-sm flex flex-col gap-3 group hover:border-primary-accent/50 transition-colors">
                  <div className="w-10 h-10 bg-background border border-border rounded-lg flex items-center justify-center text-primary-accent">
                    {opt.name === "Cloud" ? <Cloud size={18} /> : <Server size={18} />}
                  </div>
                  <div className="text-sm font-bold text-text-primary">{opt.name}</div>
                  <div className="text-xs text-text-secondary leading-relaxed">{opt.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-space font-bold text-text-primary mb-8 border-b border-border pb-4">Enterprise Integrations</h3>
            <div className="flex flex-wrap gap-3">
              {agentos.integrations.map((name) => (
                <span key={name} className="px-4 py-2 bg-surface border border-border rounded-lg text-sm font-bold text-text-secondary hover:border-primary-accent/50 hover:text-text-primary transition-colors">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-32 border-b border-border bg-background overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-accent/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
        </div>
        <div className="container-wide relative z-10">
          <div className="max-w-4xl mx-auto bg-surface-elevated/80 backdrop-blur-xl border border-border rounded-3xl p-12 md:p-20 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-primary-accent to-transparent opacity-50" />
            <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-primary-accent/10 text-primary-accent mb-8 shadow-inner border border-primary-accent/20">
              <Terminal size={32} />
            </div>
            <h2 className="text-4xl md:text-6xl font-space font-bold text-text-primary tracking-tight mb-6 leading-tight">
              Ready to boot up <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-accent via-[#00E5FF] to-primary-accent bg-[length:200%_auto] animate-gradient-shift">
                your agentic OS?
              </span>
            </h2>
            <p className="text-lg md:text-xl text-text-secondary font-inter mb-10 max-w-2xl mx-auto text-center">
              Stop stitching together agent frameworks, vector DBs, and workflow tools. Run every autonomous workflow on one governed kernel.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="w-full sm:w-auto group px-8 py-4 bg-primary-accent text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-lg flex items-center justify-center gap-3 transition-all hover:bg-surface shadow-[0_0_20px_rgba(0,245,122,0.2)]">
                Request Demo
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
              <button className="w-full sm:w-auto px-8 py-4 bg-transparent border border-border text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-lg hover:border-border-default hover:bg-surface transition-all flex items-center justify-center">
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
