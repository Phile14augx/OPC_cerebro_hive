"use client";

import React, { useEffect, useRef } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import gsap from "gsap";

const agents = [
  "HR Agent", "Finance Agent", "Sales Agent", "Marketing Agent", 
  "Procurement Agent", "Customer Support Agent", "Legal Agent", 
  "ERP Agent", "Compliance Agent", "Analytics Agent", 
  "Executive Assistant", "Operations Agent"
];

export default function AIAgentShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Simple continuous floating animation
    itemsRef.current.forEach((item, i) => {
      if (item) {
        gsap.to(item, {
          y: "random(-20, 20)",
          x: "random(-10, 10)",
          rotation: "random(-4, 4)",
          duration: "random(3, 5)",
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.1,
        });
      }
    });
  }, []);

  return (
    <section className="section-pad bg-secondary relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxjaXJjbGUgY3g9IjEiIGN5PSIxIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+Cjwvc3ZnPg==')] opacity-30 pointer-events-none" />

      <div className="container-wide text-center" ref={containerRef}>
        <SectionHeading 
          label="Agentic AI"
          title="The Digital Workforce"
          description="Deploy specialized, autonomous agents that orchestrate complex tasks across your enterprise."
          className="mb-16 relative z-10"
        />

        <div className="h-16 md:h-24 w-full" />

        <div className="flex flex-wrap justify-center gap-4 relative z-10 max-w-5xl mx-auto">
          {agents.map((agent, idx) => (
            <div
              key={idx}
              ref={el => { itemsRef.current[idx] = el; }}
              className="px-6 py-3 rounded-full bg-card border border-white/10 text-white font-space font-medium text-sm md:text-base whitespace-nowrap shadow-lg shadow-black/20 hover:border-primary-accent hover:text-primary-accent transition-colors cursor-default"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary-accent animate-pulse" />
                {agent}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
