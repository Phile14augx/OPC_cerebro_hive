"use client";

import React, { useEffect, useRef } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const eras = [
  "Traditional IT",
  "Digital Transformation",
  "Cloud Native",
  "Predictive AI",
  "Agentic AI",
  "Autonomous Enterprise",
];

export default function WhyCerebroHive() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate line
      gsap.to(lineRef.current, {
        height: "100%",
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top center",
          end: "bottom center",
          scrub: true,
        },
      });

      // Animate items
      itemsRef.current.forEach((item, index) => {
        gsap.fromTo(
          item,
          { opacity: 0.2, x: -20, scale: 0.9 },
          {
            opacity: index === eras.length - 1 ? 1 : 0.6,
            x: 0,
            scale: index === eras.length - 1 ? 1.1 : 1,
            color: index >= eras.length - 2 ? "#00F57A" : "#FFFFFF",
            duration: 0.5,
            scrollTrigger: {
              trigger: item,
              start: "top 60%",
              toggleActions: "play reverse play reverse",
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="section-pad bg-primary relative" ref={containerRef}>
      <div className="container-wide grid md:grid-cols-2 gap-16 items-center">
        <div>
          <SectionHeading 
            label="The Evolution"
            title="Why CerebroHive?"
            description="The era of software is ending. The era of intelligent agents is here. We are the bridge to the autonomous enterprise."
            align="left"
          />
        </div>
        <div className="relative pl-12 py-10">
          {/* Base static Line */}
          <div className="absolute top-0 bottom-0 left-[24px] w-[2px] bg-white/10 z-0 -translate-x-1/2" />

          <div className="flex flex-col gap-12 relative z-10">
            {eras.map((era, idx) => (
              <div 
                key={idx} 
                className="relative"
                ref={(el) => { itemsRef.current[idx] = el; }}
              >
                {/* Node */}
                <div className="absolute left-[-24px] top-1/2 -translate-y-1/2 -translate-x-1/2 w-[26px] h-[26px] rounded-full bg-card border-2 border-white/20 z-10 flex items-center justify-center">
                  <div className="w-[10px] h-[10px] rounded-full bg-current transition-colors" />
                </div>
                
                <h3 className="text-2xl md:text-3xl font-space font-medium tracking-tight">
                  {era}
                </h3>
              </div>
            ))}
          </div>

          {/* Animated Line ON TOP of the nodes */}
          <div 
            ref={lineRef} 
            className="absolute top-0 left-[24px] w-[2px] h-0 bg-gradient-to-b from-primary-accent via-secondary-accent to-primary-accent shadow-[0_0_15px_rgba(0,245,122,0.5)] z-20 -translate-x-1/2 pointer-events-none" 
          />
        </div>
      </div>
    </section>
  );
}
