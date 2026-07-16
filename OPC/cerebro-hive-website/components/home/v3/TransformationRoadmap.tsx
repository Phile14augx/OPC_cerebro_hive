"use client";

import React, { useState } from "react";
import { ArrowRight, FileSearch, PenTool, FlaskConical, Rocket, Network } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const roadmap = [
  {
    id: "assess",
    icon: FileSearch,
    title: "1. Assess",
    duration: "Weeks 1-2",
    desc: "Evaluate current ERP limitations and map high-value manual workflows.",
    deliverable: "AI Maturity Matrix",
    color: "text-accent-secondary",
    bgColor: "bg-[#00E5FF]"
  },
  {
    id: "design",
    icon: PenTool,
    title: "2. Design",
    duration: "Weeks 3-4",
    desc: "Architect the Knowledge Hub and design deterministic guardrails.",
    deliverable: "Platform Architecture Blueprint",
    color: "text-warning",
    bgColor: "bg-[#FFB300]"
  },
  {
    id: "pilot",
    icon: FlaskConical,
    title: "3. Pilot",
    duration: "Months 2-3",
    desc: "Deploy AgentOS against a single, high-volume operational bottleneck.",
    deliverable: "Production Agent Swarm",
    color: "text-[#7B61FF]",
    bgColor: "bg-[#7B61FF]"
  },
  {
    id: "deploy",
    icon: Rocket,
    title: "4. Deploy",
    duration: "Months 4-6",
    desc: "Integrate Quantiva ERP and shift employees to overseer roles.",
    deliverable: "Enterprise Go-Live",
    color: "text-accent-primary",
    bgColor: "bg-accent-primary"
  },
  {
    id: "scale",
    icon: Network,
    title: "5. Scale",
    duration: "Month 6+",
    desc: "Expand agent swarms across adjacent business units automatically.",
    deliverable: "Autonomous Enterprise",
    color: "text-text-primary",
    bgColor: "bg-white"
  }
];

export default function TransformationRoadmap() {
  const [activePhase, setActivePhase] = useState(roadmap[0]);

  return (
    <section className="py-24 border-b border-border bg-background relative">
      <div className="container-wide">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-6">The Transformation Roadmap</h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto font-inter">
            How we guide organizations from manual operations to an AI-native architecture in six months.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          
          {/* Timeline Tracker */}
          <div className="flex flex-col md:flex-row justify-between mb-12 relative">
            <div className="hidden md:block absolute top-6 left-0 right-0 h-px bg-white/10 z-0" />
            {roadmap.map((phase, i) => {
              const isActive = activePhase.id === phase.id;
              const isPast = roadmap.findIndex(r => r.id === activePhase.id) > i;
              
              return (
                <div key={phase.id} className="relative z-10 flex flex-row md:flex-col items-center gap-4 md:gap-4 mb-6 md:mb-0 cursor-pointer group" onClick={() => setActivePhase(phase)}>
                  <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-colors ${
                    isActive ? `border-[#0A0D14] ${phase.bgColor} text-black` :
                    isPast ? `border-[#0A0D14] bg-white/20 text-text-primary` :
                    "border-border bg-background text-text-muted group-hover:text-white group-hover:border-white/30"
                  }`}>
                    <phase.icon size={20} />
                  </div>
                  <div className="text-left md:text-center">
                    <div className={`font-space font-bold text-sm transition-colors ${isActive ? "text-text-primary" : "text-text-secondary"}`}>{phase.title}</div>
                    <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold">{phase.duration}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Phase Details */}
          <div className="bg-surface border border-border rounded-2xl p-8 md:p-12 relative overflow-hidden text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePhase.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-2xl mx-auto"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6">
                  <activePhase.icon size={32} className={activePhase.color} />
                </div>
                <h3 className="text-3xl font-space font-bold text-text-primary mb-4">{activePhase.title}</h3>
                <p className="text-lg text-text-secondary leading-relaxed mb-8">
                  {activePhase.desc}
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border">
                  <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Key Deliverable:</span>
                  <span className="text-sm font-bold text-text-primary">{activePhase.deliverable}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-space font-bold text-text-primary mb-6">Ready to build the AI-Native Enterprise?</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-black font-space font-bold text-sm uppercase tracking-widest rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                Book Strategy Session <ArrowRight size={16} />
              </button>
              <button className="px-8 py-4 bg-transparent border border-border text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-lg hover:bg-white/5 transition-colors">
                Explore Services
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
