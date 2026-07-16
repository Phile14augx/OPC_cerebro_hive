"use client";

import React from "react";
import { Download, FileText, CheckCircle2 } from "lucide-react";

const resources = [
  {
    title: "The CIO's Enterprise AI Playbook",
    desc: "A 40-page guide to navigating vendor selection, data strategy, and AI governance.",
    features: ["Vendor Selection Matrix", "Budgeting Templates", "Risk Assessment Framework"]
  },
  {
    title: "AI Governance & Compliance Framework",
    desc: "How to deploy generative AI while maintaining SOC2, HIPAA, and GDPR compliance.",
    features: ["Audit Trail Design", "PII Redaction Patterns", "Ethics Board Structure"]
  }
];

export function ExecutiveResources() {
  return (
    <section className="py-24 border-b border-border bg-surface-elevated">
      <div className="container-wide">
        
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="text-[10px] uppercase tracking-widest text-primary-accent font-bold mb-3 block">Executive Resources</span>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-6">Strategic Downloads</h2>
          <p className="text-text-secondary text-lg">
            Arm your executive team with the frameworks and methodologies we use to transform the world's leading enterprises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {resources.map((res, i) => (
            <div key={i} className="bg-background border border-border rounded-2xl p-8 flex flex-col hover:border-primary-accent/40 transition-colors shadow-sm group">
              <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center text-primary-accent mb-6">
                <FileText size={24} />
              </div>
              <h3 className="text-2xl font-space font-bold text-text-primary mb-3">{res.title}</h3>
              <p className="text-sm text-text-secondary mb-8 leading-relaxed flex-1">{res.desc}</p>
              
              <div className="bg-surface-elevated rounded-xl p-5 mb-8">
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-4">Inside the Report</span>
                <ul className="space-y-3">
                  {res.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm text-text-primary">
                      <CheckCircle2 size={16} className="text-primary-accent shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
              </div>

              <button className="w-full py-4 bg-surface border border-border text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-xl hover:border-primary-accent/50 hover:bg-surface-elevated transition-all flex items-center justify-center gap-2 group-hover:bg-primary-accent group-hover:text-black group-hover:border-primary-accent">
                Download Now <Download size={16} />
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
