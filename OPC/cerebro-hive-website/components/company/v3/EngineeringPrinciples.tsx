"use client";

import React from "react";
import { PenTool, Target, Layers, Globe, ShieldCheck, Activity } from "lucide-react";

const principles = [
  {
    icon: PenTool,
    title: "Build Long-Term",
    desc: "We don't optimize for next quarter. We build systems designed to run reliably for a decade.",
    color: "text-[#00E5FF]",
    borderColor: "border-[#00E5FF]/20"
  },
  {
    icon: Target,
    title: "Research First",
    desc: "We test limits in our lab before writing a single line of production code. Discovery precedes development.",
    color: "text-[#7B61FF]",
    borderColor: "border-[#7B61FF]/20"
  },
  {
    icon: Layers,
    title: "Architecture Before Implementation",
    desc: "A broken system scaled with AI is still a broken system. We fix the data architecture first.",
    color: "text-[#FFB300]",
    borderColor: "border-[#FFB300]/20"
  },
  {
    icon: Globe,
    title: "Open Standards",
    desc: "We build on open protocols. Your data is yours. No vendor lock-in, just superior execution.",
    color: "text-[#00F57A]",
    borderColor: "border-[#00F57A]/20"
  },
  {
    icon: ShieldCheck,
    title: "Security by Design",
    desc: "Compliance isn't a checklist; it's the foundation. Every system is built to pass SOC2 and HIPAA Day 1.",
    color: "text-[#00E5FF]",
    borderColor: "border-[#00E5FF]/20"
  },
  {
    icon: Activity,
    title: "Measure Everything",
    desc: "If it can't be quantified, it isn't complete. We tie every agentic action directly to business ROI.",
    color: "text-[#FFB300]",
    borderColor: "border-[#FFB300]/20"
  }
];

export default function EngineeringPrinciples() {
  return (
    <section className="py-24 border-b border-white/5 bg-[#05070A]">
      <div className="container-wide">
        
        <div className="mb-16">
          <h2 className="text-3xl md:text-5xl font-space font-bold text-white mb-6">Engineering Principles</h2>
          <p className="text-lg text-text-secondary max-w-2xl font-inter">
            These are the strict technical standards every engineer, researcher, and architect at CerebroHive follows.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {principles.map((p, i) => (
            <div key={i} className={`p-8 rounded-2xl bg-surface border ${p.borderColor} hover:bg-white/5 transition-colors relative overflow-hidden group`}>
              
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <p.icon size={64} className={p.color} />
              </div>

              <div className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 relative z-10 ${p.color}`}>
                <p.icon size={20} />
              </div>

              <h3 className="text-xl font-space font-bold text-white mb-3 relative z-10">{p.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed relative z-10">{p.desc}</p>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
