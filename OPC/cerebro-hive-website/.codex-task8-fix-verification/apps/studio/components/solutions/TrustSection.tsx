"use client";

import React from "react";
import { ShieldCheck, Lock, ServerCog, FileKey2 } from "lucide-react";

const principles = [
  {
    title: "Security-First Architecture",
    icon: Lock,
    desc: "We deploy private, dedicated LLM gateways within your virtual private cloud (VPC), ensuring your data never trains public models."
  },
  {
    title: "Vendor Agnostic",
    icon: ServerCog,
    desc: "We aren't tied to a single provider. We orchestrate the best combination of OpenAI, Anthropic, Meta, and open-source models for your specific use case."
  },
  {
    title: "Compliance Ready",
    icon: ShieldCheck,
    desc: "Our reference architectures are designed to meet SOC2, HIPAA, GDPR, and ISO 27001 requirements from day one."
  },
  {
    title: "Knowledge Transfer",
    icon: FileKey2,
    desc: "We don't just build black boxes. Every engagement includes rigorous documentation, training, and handover to your internal engineering teams."
  }
];

export function TrustSection() {
  return (
    <section className="py-24 border-b border-border bg-background">
      <div className="container-wide">
        
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="text-[10px] uppercase tracking-widest text-primary-accent font-bold mb-3 block">Enterprise Trust</span>
          <h2 className="text-3xl md:text-4xl font-space font-bold text-text-primary mb-6">Built for the Enterprise Reality</h2>
          <p className="text-text-secondary text-lg">
            Experimentation is easy. Production is hard. We engineer AI solutions that satisfy the Chief Information Security Officer as much as the Chief Executive Officer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {principles.map((p, i) => (
            <div key={i} className="bg-surface-elevated border border-border rounded-2xl p-8 hover:border-primary-accent/30 transition-colors shadow-sm flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary-accent/10 border border-primary-accent/20 flex items-center justify-center text-primary-accent mb-6">
                <p.icon size={28} strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-space font-bold text-text-primary mb-3">{p.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
