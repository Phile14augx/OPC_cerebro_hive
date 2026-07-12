"use client";

import React, { useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

const capabilities = [
  { id: 1, title: "Enterprise AI", desc: "Architecting large-scale intelligent systems." },
  { id: 2, title: "AI Agents", desc: "Autonomous digital workers for complex tasks." },
  { id: 3, title: "Software Engineering", desc: "AI-native application development." },
  { id: 4, title: "Cloud Integration", desc: "Scalable infrastructure for AI workloads." },
  { id: 5, title: "Cybersecurity", desc: "Intelligent threat detection and defense." },
  { id: 6, title: "Data & Lakehouse", desc: "Modern data platforms and knowledge graphs." },
  { id: 7, title: "Next-Gen ERP", desc: "Quantiva ERP and enterprise resource optimization." },
  { id: 8, title: "Hyperautomation", desc: "End-to-end business process automation." },
];

export default function AICapabilityGrid() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <section className="section-pad bg-secondary">
      <div className="container-wide">
        <SectionHeading 
          label="Capabilities"
          title="Full-Spectrum Engineering"
          description="We deliver end-to-end intelligence architectures, from foundational data pipelines to autonomous agentic workflows."
          className="mb-16"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {capabilities.map((cap) => (
            <GlassCard
              key={cap.id}
              interactive
              intensity="low"
              className={cn(
                "p-8 h-48 flex flex-col justify-end relative overflow-hidden group",
                hoveredId === cap.id ? "col-span-1 md:col-span-2 lg:col-span-2" : ""
              )}
              onMouseEnter={() => setHoveredId(cap.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                <div className="text-6xl font-space font-bold text-primary-accent">
                  0{cap.id}
                </div>
              </div>
              
              <div className="relative z-10 transition-transform duration-500 ease-out translate-y-4 group-hover:translate-y-0">
                <h3 className="text-xl md:text-2xl font-space font-bold text-white mb-2">
                  {cap.title}
                </h3>
                <p className="text-text-muted font-inter opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 max-w-sm">
                  {cap.desc}
                </p>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
