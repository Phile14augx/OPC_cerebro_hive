"use client";

import React, { useState } from "react";
import { Database, BrainCircuit, Bot, Building2, Server, ArrowDown, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Section } from "@/components/ui/primitives/Section";
import { PageContainer } from "@/components/ui/primitives/PageContainer";
import { Stack } from "@/components/ui/primitives/Stack";

const layers = [
  {
    id: "data",
    label: "1. Enterprise Data",
    icon: Database,
    desc: "Ingests raw, unstructured, and structured data from legacy systems in real-time.",
    why: "LLMs are useless without context. This layer grounds the AI in your specific reality.",
    problem: "Siloed data prevents cross-departmental automation.",
    products: "Cerebro Knowledge Hub",
    color: "bg-[#FFB300]"
  },
  {
    id: "reasoning",
    label: "2. The Reasoning Layer",
    icon: BrainCircuit,
    desc: "Transforms raw data into semantic vectors and knowledge graphs.",
    why: "Allows the system to understand the relationships between an invoice, a vendor, and a contract.",
    problem: "Keyword search fails when complex reasoning is required.",
    products: "Enterprise Vector Engine",
    color: "bg-[#00E5FF]"
  },
  {
    id: "agents",
    label: "3. Agent Network",
    icon: Bot,
    desc: "Specialized, autonomous agents that pull from the reasoning layer to execute specific tasks.",
    why: "Replaces monolithic software with modular, easily updatable skill nodes.",
    problem: "Manual workflows scale linearly. Agent networks scale exponentially.",
    products: "Cerebro AgentOS",
    color: "bg-[#7B61FF]"
  },
  {
    id: "decision",
    label: "4. Business Applications",
    icon: Building2,
    desc: "The UI where humans oversee the automated execution and handle extreme edge cases.",
    why: "Maintains human-in-the-loop governance for high-risk decisions.",
    problem: "Total black-box automation fails regulatory compliance.",
    products: "Quantiva AI ERP",
    color: "bg-accent-primary"
  }
];

export default function LivingArchitecture() {
  const [activeLayer, setActiveLayer] = useState(layers[2].id);

  return (
    <Section size="default" className="border-b border-border bg-background relative overflow-hidden">
      <PageContainer>

        <Stack gap="md" className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-[10px] uppercase tracking-widest text-text-muted font-bold w-fit mx-auto">
            <Server size={12} /> Living Architecture
          </div>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary">How AI-Native Systems Work</h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto font-inter">
            Explore the architecture required to transition from legacy silos to autonomous agent swarms.
          </p>
        </Stack>

        <div className="grid lg:grid-cols-12 gap-12 max-w-6xl mx-auto items-start">

          {/* Architecture Diagram */}
          <div className="lg:col-span-5 flex flex-col gap-2 relative">

            {/* Animated Data Flow line */}
            <div className="absolute left-[39px] top-8 bottom-8 w-[2px] bg-surface-elevated z-0">
              <motion.div
                className="w-full h-1/4 bg-gradient-to-b from-transparent via-[#00E5FF] to-transparent"
                animate={{ top: ["-20%", "120%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                style={{ position: "absolute" }}
              />
            </div>

            {layers.map((layer) => (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`flex items-center gap-6 p-4 rounded-xl transition-all relative z-10 ${
                  activeLayer === layer.id ? "bg-surface-elevated border border-border" : "hover:bg-surface border border-transparent"
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border ${
                  activeLayer === layer.id ? `${layer.color} border-border text-text-primary shadow-[0_0_15px_currentColor]` : 'bg-surface border-border text-text-primary'
                }`}>
                  <layer.icon size={20} />
                </div>
                <div className="text-left">
                  <div className={`font-space font-bold text-lg transition-colors ${activeLayer === layer.id ? 'text-text-primary' : 'text-text-secondary'}`}>
                    {layer.label}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-7 theme-panel p-8 relative min-h-[400px]">
            {/* Blueprint Grid for Light Mode */}
            <div className="block dark:hidden absolute inset-0 pointer-events-none opacity-5 rounded-2xl overflow-hidden"
                 style={{ backgroundImage: 'linear-gradient(to right, #64748B 1px, transparent 1px), linear-gradient(to bottom, #64748B 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            />

            <AnimatePresence mode="wait">
              {layers.map(layer => layer.id === activeLayer && (
                <motion.div
                  key={layer.id}
                  initial={{ opacity: 0.4, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="relative z-10"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-text-primary ${layer.color}`}>
                      <layer.icon size={20} />
                    </div>
                    <h3 className="text-2xl font-space font-bold text-text-primary">{layer.label}</h3>
                  </div>

                  <p className="text-lg text-text-primary mb-8 leading-relaxed">
                    {layer.desc}
                  </p>

                  <div className="grid sm:grid-cols-2 gap-6 mb-8">
                    <div className="theme-card p-5 relative">
                      <div className="absolute top-4 right-4 text-text-muted"><Info size={14} /></div>
                      <div className="text-[10px] uppercase tracking-widest text-warning font-bold mb-2">Why does this exist?</div>
                      <p className="text-sm text-text-secondary leading-relaxed">{layer.why}</p>
                    </div>
                    <div className="theme-card p-5 relative">
                      <div className="absolute top-4 right-4 text-text-muted"><Info size={14} /></div>
                      <div className="text-[10px] uppercase tracking-widest text-accent-primary font-bold mb-2">Problem Solved</div>
                      <p className="text-sm text-text-secondary leading-relaxed">{layer.problem}</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-1">CerebroHive Implementation</div>
                      <div className="font-bold text-accent-secondary">{layer.products}</div>
                    </div>
                    <button className="px-4 py-2 border border-border rounded text-xs font-bold uppercase tracking-widest text-text-primary hover:bg-surface-elevated dark:hover:bg-surface-elevated transition-colors">
                      View Documentation
                    </button>
                  </div>

                </motion.div>
              ))}
            </AnimatePresence>
          </div>

        </div>

      </PageContainer>
    </Section>
  );
}
