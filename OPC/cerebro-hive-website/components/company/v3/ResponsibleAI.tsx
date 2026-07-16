"use client";

import React from "react";
import { ShieldAlert, Eye, Lock, FileSignature } from "lucide-react";

export default function ResponsibleAI() {
  return (
    <section className="py-24 border-b border-border bg-background">
      <div className="container-wide">
        
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          <div className="flex-1">
            <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-6">Trust is not a feature. It is the foundation.</h2>
            <p className="text-lg text-text-secondary leading-relaxed font-inter mb-8">
              Enterprise buyers don't just need AI to be smart—they need it to be accountable. Our Responsible AI framework ensures that every deployment adheres to strict security, privacy, and governance protocols.
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-surface">
                <span className="font-bold text-text-primary text-sm">EU AI Act Compliant Architecture</span>
                <span className="text-[10px] uppercase tracking-widest text-accent-primary font-bold px-2 py-1 bg-accent-primary/10 rounded-full">Standard</span>
              </div>
              <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-surface">
                <span className="font-bold text-text-primary text-sm">SOC2 Type II & HIPAA</span>
                <span className="text-[10px] uppercase tracking-widest text-accent-primary font-bold px-2 py-1 bg-accent-primary/10 rounded-full">Standard</span>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full grid sm:grid-cols-2 gap-4">
            
            <div className="p-6 bg-surface border border-border rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 text-white/5"><Eye size={64} /></div>
              <Eye size={20} className="text-accent-secondary mb-4 relative z-10" />
              <h3 className="font-space font-bold text-text-primary mb-2 relative z-10">Human Oversight</h3>
              <p className="text-xs text-text-secondary relative z-10">High-stakes workflows always route to human decision-makers. AI recommends, humans approve.</p>
            </div>

            <div className="p-6 bg-surface border border-border rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 text-white/5"><Lock size={64} /></div>
              <Lock size={20} className="text-warning mb-4 relative z-10" />
              <h3 className="font-space font-bold text-text-primary mb-2 relative z-10">Data Privacy</h3>
              <p className="text-xs text-text-secondary relative z-10">Zero data retention by LLMs. Your private data never leaves your secure tenant environment.</p>
            </div>

            <div className="p-6 bg-surface border border-border rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 text-white/5"><ShieldAlert size={64} /></div>
              <ShieldAlert size={20} className="text-red-400 mb-4 relative z-10" />
              <h3 className="font-space font-bold text-text-primary mb-2 relative z-10">Security</h3>
              <p className="text-xs text-text-secondary relative z-10">Multi-layered security controls, RBAC, and deterministic guardrails prevent prompt injection.</p>
            </div>

            <div className="p-6 bg-surface border border-border rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 text-white/5"><FileSignature size={64} /></div>
              <FileSignature size={20} className="text-[#7B61FF] mb-4 relative z-10" />
              <h3 className="font-space font-bold text-text-primary mb-2 relative z-10">Transparency</h3>
              <p className="text-xs text-text-secondary relative z-10">Full audit trails. Every agentic action is logged, explainable, and compliant with enterprise reporting.</p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
