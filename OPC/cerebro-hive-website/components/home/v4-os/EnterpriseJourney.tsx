"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { transformationJourney } from "@/lib/config/journey";

export function EnterpriseJourney() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  // Calculate the height of the glowing line based on scroll progress
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={containerRef} className="py-32 relative bg-background text-text-primary">
      <div className="container mx-auto px-6 relative z-10 max-w-5xl">
        
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Enterprise AI Transformation Journey
          </h2>
          <p className="text-xl text-text-muted max-w-3xl mx-auto text-center">
            A comprehensive, 10-step lifecycle to evolve your organization into an autonomous enterprise.
          </p>
        </div>

        <div className="relative">
          {/* Central Track (Dim) */}
          <div className="absolute left-[27px] md:left-1/2 top-0 bottom-0 w-1 bg-surface -translate-x-1/2" />
          
          {/* Central Track (Glowing/Active) */}
          <motion.div 
            className="absolute left-[27px] md:left-1/2 top-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 -translate-x-1/2 origin-top"
            style={{ height: lineHeight }}
          />

          <div className="flex flex-col gap-12 md:gap-24">
            {transformationJourney.map((phase, index) => {
              const isEven = index % 2 === 0;
              
              return (
                <div key={phase.id} className={`relative flex items-center ${isEven ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  
                  {/* Timeline Node */}
                  <div className="absolute left-[27px] md:left-1/2 w-6 h-6 rounded-full bg-background border-4 border-border -translate-x-1/2 z-10 flex items-center justify-center">
                    <motion.div 
                      className="w-2 h-2 rounded-full bg-primary-accent"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: false, margin: "-50% 0px -50% 0px" }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>

                  {/* Spacer for alternating layout on desktop */}
                  <div className="hidden md:block w-1/2" />

                  {/* Content Card */}
                  <div className={`w-full pl-16 md:pl-0 md:w-1/2 ${isEven ? "md:pr-16" : "md:pl-16"}`}>
                    <motion.div 
                      initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-20%" }}
                      className="bg-surface border border-border rounded-2xl p-8 backdrop-blur-sm hover:bg-surface-elevated transition-colors"
                    >
                      <span className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2 block">
                        Phase {phase.step}
                      </span>
                      <h3 className="text-2xl font-bold mb-4">{phase.title}</h3>
                      <p className="text-text-secondary mb-6">{phase.objective}</p>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold text-text-muted mb-2 uppercase tracking-wider">Deliverables</h4>
                          <ul className="space-y-1">
                            {phase.deliverables.map((item, i) => (
                              <li key={i} className="text-sm text-text-muted flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-purple-500" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-text-muted mb-1 uppercase tracking-wider">Business Outcome</h4>
                          <p className="text-sm text-emerald-400">{phase.outcomes}</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
