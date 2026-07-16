"use client";

import React from "react";
import { Cpu, Database, Microscope, Terminal, Building2, Paintbrush } from "lucide-react";

const capabilities = [
  {
    icon: Microscope,
    title: "Applied AI Research",
    desc: "Bridging the gap between theoretical ML models and production-ready enterprise reasoning engines.",
  },
  {
    icon: Building2,
    title: "Enterprise Architecture",
    desc: "Designing the infrastructure required to scale agentic workflows securely across thousands of employees.",
  },
  {
    icon: Cpu,
    title: "AI Systems Engineering",
    desc: "Optimizing inference, managing state, and orchestrating complex multi-agent interactions.",
  },
  {
    icon: Database,
    title: "Data Engineering",
    desc: "Building the high-throughput pipelines that feed unstructured enterprise data into intelligent graphs.",
  },
  {
    icon: Terminal,
    title: "Platform Engineering",
    desc: "Hardening the core OS with SOC2 compliance, RBAC, and zero-trust security models.",
  },
  {
    icon: Paintbrush,
    title: "Product Design",
    desc: "Translating extreme technical complexity into intuitive, consumer-grade enterprise interfaces.",
  }
];

export default function TeamExpertise() {
  return (
    <section className="py-24 border-b border-white/5 bg-[#0A0D14]">
      <div className="container-wide">
        
        <div className="mb-16">
          <h2 className="text-3xl md:text-5xl font-space font-bold text-white mb-6">Our Capabilities</h2>
          <p className="text-lg text-text-secondary max-w-2xl font-inter">
            We are not organized by traditional hierarchies. We are organized by the core disciplines required to build the AI-native enterprise.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((cap, i) => (
            <div key={i} className="p-8 rounded-2xl bg-surface border border-white/10 group hover:border-white/30 transition-colors">
              
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-white">
                <cap.icon size={20} />
              </div>

              <h3 className="text-xl font-space font-bold text-white mb-3">{cap.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{cap.desc}</p>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
