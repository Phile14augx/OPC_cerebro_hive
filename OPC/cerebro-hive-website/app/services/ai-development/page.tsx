"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { Code2, ArrowRight, Target, ShieldCheck, Activity, Users, Clock, Building } from "lucide-react";

export default function AIDevelopmentPage() {
  return (
    <div className="bg-background min-h-screen pt-24 font-inter">
      
      {/* Hero Section */}
      <section className="section-pad relative overflow-hidden border-b border-border">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00F57A]/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container-wide relative z-10">
          <TrackedLink href="/services" analyticsEvent="nav_breadcrumb_click" analyticsCategory="navigation" analyticsLabel="Back to Services — AI Development" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-muted hover:text-primary-accent transition-colors mb-8">
            <ArrowRight size={14} className="rotate-180" /> Back to Services
          </TrackedLink>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-accent-primary/10 text-accent-primary border border-[#00F57A]/20">
              <Code2 size={24} />
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">Enterprise Practice</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-space font-bold text-text-primary leading-tight mb-6 max-w-4xl">
            Custom AI Development
          </h1>
          
          <p className="text-xl text-text-secondary leading-relaxed max-w-3xl mb-10">
            Train domain-specific private models, build high-performance vector retrieval architectures, and deploy secure inference API microservices. This is true engineering-led product delivery — not prototyping.
          </p>

          <TrackedLink href="/contact" analyticsEvent="cta_click" analyticsCategory="conversion" analyticsLabel="Discuss Custom AI Build — AI Development" className="inline-flex items-center gap-3 px-8 py-4 bg-accent-primary text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-lg hover:-translate-y-1 transition-transform shadow-sm">
            Discuss Your Custom AI Build
          </TrackedLink>
        </div>
      </section>

      {/* Deliverables & Outcomes */}
      <section className="section-pad bg-surface-elevated">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h3 className="text-2xl font-space font-bold text-text-primary mb-8 flex items-center gap-3">
                <Target className="text-accent-primary" /> Key Outcomes
              </h3>
              <ul className="space-y-4">
                {["Launch proprietary AI products", "Maintain complete IP ownership and data privacy", "Deploy scalable, production-grade microservices", "Outperform generic models with fine-tuned accuracy"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-text-secondary">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-primary mt-2 shrink-0" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-2xl font-space font-bold text-text-primary mb-8 flex items-center gap-3">
                <ShieldCheck className="text-accent-primary" /> Deliverables
              </h3>
              <ul className="space-y-4">
                {["Fine-tuned LLMs (PEFT/LoRA)", "Enterprise RAG Systems", "Secure Inference APIs", "Agent Frameworks (LangGraph)", "Dockerised AI Microservices"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-text-secondary">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-primary mt-2 shrink-0" />
                    <span className="leading-relaxed font-medium text-text-primary">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="section-pad bg-background border-y border-border">
        <div className="container-wide max-w-4xl mx-auto">
          <h2 className="text-3xl font-space font-bold text-text-primary mb-12 text-center">Engagement Methodology</h2>
          
          <div className="space-y-6">
            {[
              { step: "Scoping", detail: "Architecture design, data requirements, and feasibility review." },
              { step: "Data Prep", detail: "Dataset curation, preprocessing, and expert annotation." },
              { step: "Engineering", detail: "Model training, RAG pipeline construction, and rigorous evaluation." },
              { step: "Deployment", detail: "Kubernetes/Docker deployment, API wrapping, and 90-day SLA." }
            ].map((m, i) => (
              <div key={i} className="p-6 rounded-2xl bg-surface border border-border flex flex-col md:flex-row md:items-center gap-6 hover:border-[#00F57A]/40 transition-colors">
                <div className="w-12 h-12 rounded-full bg-accent-primary/10 text-accent-primary flex items-center justify-center font-bold text-lg shrink-0">
                  {i + 1}
                </div>
                <div>
                  <h4 className="text-lg font-space font-bold text-text-primary mb-1">{m.step}</h4>
                  <p className="text-sm text-text-secondary">{m.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Engagement Model */}
      <section className="section-pad bg-surface-elevated">
        <div className="container-wide max-w-5xl mx-auto">
          <div className="p-10 rounded-3xl bg-background border border-border shadow-elevated relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00F57A]/5 blur-[80px] rounded-full pointer-events-none" />
            
            <h2 className="text-2xl font-space font-bold text-text-primary mb-8 border-b border-border pb-6">Engagement Profile</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-text-muted mb-2 block flex items-center gap-2"><Clock size={12}/> Typical Timeline</span>
                <span className="text-lg font-medium text-text-primary">12 - 24 Weeks</span>
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-text-muted mb-2 block flex items-center gap-2"><Users size={12}/> Team</span>
                <span className="text-lg font-medium text-text-primary">Full-Stack AI Team</span>
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-text-muted mb-2 block flex items-center gap-2"><Building size={12}/> Best For</span>
                <span className="text-sm font-medium text-text-secondary leading-relaxed">Product companies needing proprietary AI features or enterprises requiring absolute data privacy.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
