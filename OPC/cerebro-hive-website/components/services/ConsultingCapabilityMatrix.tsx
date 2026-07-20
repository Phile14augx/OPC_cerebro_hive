"use client";

import React from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { Section } from "@/components/ui/primitives/Section";
import { PageContainer } from "@/components/ui/primitives/PageContainer";
import { Stack } from "@/components/ui/primitives/Stack";

const capabilities = [
  { name: "AI Strategy", phases: [true, false, false, false, false] },
  { name: "Enterprise Architecture", phases: [true, true, false, false, false] },
  { name: "AI Agents & Automation", phases: [false, true, true, true, true] },
  { name: "Data Engineering", phases: [false, true, true, true, false] },
  { name: "Custom LLM Development", phases: [false, true, true, true, true] },
  { name: "AI Governance & Security", phases: [true, true, false, true, true] },
  { name: "Corporate AI Education", phases: [true, false, false, false, true] },
];

const phases = ["Strategy", "Design", "Build", "Operate", "Optimize"];

export function ConsultingCapabilityMatrix() {
  return (
    <Section size="default" className="bg-surface border-y border-border overflow-hidden">
      <PageContainer>
        <div className="max-w-5xl mx-auto">
          <Stack gap="md" className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-space font-bold text-text-primary">
              End-to-End Delivery Capability
            </h2>
            <p className="text-lg text-text-secondary font-inter max-w-2xl mx-auto text-center">
              Unlike point-solution vendors, we provide full-lifecycle enterprise AI transformation—from executive strategy to production operations.
            </p>
          </Stack>

          <motion.div
            initial={{ opacity: 0.4, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-border bg-background overflow-x-auto shadow-sm"
          >
            <div className="min-w-[700px]">
              {/* Header Row */}
              <div className="grid grid-cols-6 border-b border-border bg-surface-elevated">
                <div className="p-5 col-span-1 border-r border-border flex items-center">
                  <span className="text-[11px] font-bold tracking-widest uppercase text-text-muted">Capability</span>
                </div>
                {phases.map((phase, i) => (
                  <div key={phase} className="p-5 text-center flex items-center justify-center">
                    <span className="text-[11px] font-bold tracking-widest uppercase text-text-secondary">{phase}</span>
                  </div>
                ))}
              </div>

              {/* Data Rows */}
              <div className="flex flex-col">
                {capabilities.map((cap, i) => (
                  <div key={cap.name} className="grid grid-cols-6 border-b border-border last:border-0 hover:bg-surface/50 transition-colors">
                    <div className="p-5 col-span-1 border-r border-border flex items-center">
                      <span className="text-sm font-space font-bold text-text-primary">{cap.name}</span>
                    </div>
                    {cap.phases.map((isActive, j) => (
                      <div key={j} className="p-5 flex items-center justify-center relative group">
                        {isActive ? (
                          <div className="w-8 h-8 rounded-full bg-primary-accent/10 text-primary-accent flex items-center justify-center transition-transform group-hover:scale-110">
                            <Check size={16} strokeWidth={2.5} />
                          </div>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-border" />
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </PageContainer>
    </Section>
  );
}
