"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { milestones as timelineEvents } from "@/lib/content/company/timeline";
import { cn } from "@/lib/utils";
import { CheckCircle2, CircleDashed, ArrowRight } from "lucide-react";

export const CompanyStoryTimeline = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section className="section-pad bg-background relative" ref={containerRef}>
      <div className="container-wide max-w-4xl">
        
        <div className="text-center mb-24">
          <h2 className="text-sm font-space font-bold tracking-widest uppercase text-primary-accent mb-4">
            Our Journey
          </h2>
          <h3 className="text-4xl md:text-5xl font-space font-bold text-text-primary tracking-tight">
            Building the Foundation for <br/>
            Intelligent Enterprises.
          </h3>
        </div>

        <div className="relative">
          {/* Timeline Line (Background) */}
          <div className="absolute top-0 bottom-0 left-4 md:left-1/2 w-[2px] bg-border -translate-x-1/2" />
          
          {/* Timeline Line (Active/Animated) */}
          <motion.div 
            className="absolute top-0 left-4 md:left-1/2 w-[2px] bg-gradient-to-b from-primary-accent to-[#00E5FF] -translate-x-1/2 origin-top"
            style={{ height: lineHeight }}
          />

          {/* Events */}
          <div className="flex flex-col gap-12 md:gap-24 relative z-10">
            {timelineEvents.map((event, index) => {
              const isEven = index % 2 === 0;
              const isCompleted = !event.year.includes("+");
              const isCurrent = event.year === "2028"; // Just as an example for animation
              
              return (
                <motion.div 
                  key={event.year}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6 }}
                  className={cn(
                    "flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-16",
                    isEven ? "md:flex-row-reverse text-left" : "text-left md:text-right"
                  )}
                >
                  {/* Year & Marker */}
                  <div className={cn(
                    "flex flex-row items-center gap-6 md:absolute md:left-1/2 md:-translate-x-1/2 md:justify-center z-20",
                    isEven ? "md:flex-row" : "md:flex-row-reverse"
                  )}>
                    {/* Only show year prominently on desktop outside the flow */}
                    <span className="hidden md:block text-2xl font-space font-bold text-text-muted w-24 text-center">
                      {event.year}
                    </span>
                    
                    <div className="relative flex items-center justify-center">
                      <div className="absolute inset-0 bg-background rounded-full blur-sm scale-150" />
                      {isCompleted ? (
                        <div className="w-8 h-8 rounded-full bg-primary-accent/10 border border-primary-accent flex items-center justify-center relative z-10 shadow-[0_0_15px_rgba(0,230,118,0.3)]">
                          <CheckCircle2 size={16} className="text-primary-accent" />
                        </div>
                      ) : isCurrent ? (
                        <div className="w-8 h-8 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF] flex items-center justify-center relative z-10 shadow-[0_0_15px_rgba(0,229,255,0.4)]">
                          <div className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-surface border border-text-muted flex items-center justify-center relative z-10">
                          <CircleDashed size={16} className="text-text-muted" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content Card */}
                  <div className="w-full md:w-[calc(50%-3rem)] pl-12 md:pl-0">
                    <div className="p-8 bg-surface-elevated border border-border rounded-2xl hover:border-primary-accent/30 transition-colors duration-300">
                      <span className="md:hidden text-sm font-space font-bold text-primary-accent mb-2 block">
                        {event.year}
                      </span>
                      <h4 className="text-xl font-space font-bold text-text-primary mb-3">
                        {event.title}
                      </h4>
                      <p className="text-text-secondary font-inter leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
