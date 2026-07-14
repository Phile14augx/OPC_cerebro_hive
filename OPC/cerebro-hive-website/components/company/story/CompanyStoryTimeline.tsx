"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { milestones as timelineEvents } from "@/lib/content/company/timeline";
import { cn } from "@/lib/utils";
import { CheckCircle2, CircleDashed } from "lucide-react";
import { NeuralOrb } from "@/components/ui/NeuralOrb";

export const CompanyStoryTimeline = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="timeline" className="section-pad bg-background relative" ref={containerRef}>
      <div className="container-wide max-w-5xl">
        
        <div className="text-center mb-24">
          <h2 className="text-sm font-space font-bold tracking-widest uppercase text-primary-accent mb-4">
            Our Journey
          </h2>
          <h3 className="text-4xl md:text-5xl font-space font-bold text-text-primary tracking-tight">
            Building the Foundation for <br/>
            Intelligent Enterprises.
          </h3>
        </div>

        <div className="relative w-full">
          {/* Timeline Line (Background) */}
          <div className="absolute top-0 bottom-0 left-7 md:left-1/2 w-[2px] bg-border -translate-x-1/2" />
          
          {/* Timeline Line (Active/Animated) */}
          <motion.div 
            className="absolute top-0 left-7 md:left-1/2 w-[2px] bg-gradient-to-b from-primary-accent to-[#00E5FF] -translate-x-1/2 origin-top"
            style={{ height: lineHeight }}
          />

          {/* Events */}
          <div className="flex flex-col gap-12 md:gap-24 relative z-10 w-full">
            {timelineEvents.map((event, index) => {
              const isEven = index % 2 === 0;
              const isCompleted = !event.year.includes("+");
              const isCurrent = event.year === "2028"; // For animation effect
              
              return (
                <motion.div 
                  key={event.year}
                  id={`timeline-${event.year.replace('+', '')}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6 }}
                  className="relative flex flex-row md:grid md:grid-cols-[1fr_auto_1fr] gap-6 md:gap-0 items-start md:items-center w-full"
                >
                  {/* Left Column (Desktop Only) */}
                  <div className="hidden md:flex w-full justify-end items-center">
                    {isEven ? (
                      <span className="text-3xl font-space font-bold text-text-muted pr-16 text-right">
                        {event.year}
                      </span>
                    ) : (
                      <div className="w-full max-w-md pr-16 text-right">
                        <div className="p-8 bg-[#0a0d14] border border-white/8 rounded-2xl hover:border-primary-accent/30 transition-colors duration-300">
                          <h4 className="text-xl font-space font-bold text-text-primary mb-3">
                            {event.title}
                          </h4>
                          <p className="text-text-secondary font-inter leading-relaxed">
                            {event.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Center Column (Marker) */}
                  <div className="flex-none relative z-20 flex justify-center mt-6 md:mt-0">
                    <div className="bg-background rounded-full p-2">
                      <NeuralOrb 
                        size="md" 
                        color={isCompleted ? "green" : isCurrent ? "cyan" : "white"} 
                        state={isCompleted ? "completed" : isCurrent ? "active" : "upcoming"}
                      >
                        {isCompleted && <CheckCircle2 size={20} className="text-primary-accent" />}
                        {!isCompleted && !isCurrent && <CircleDashed size={20} className="text-text-muted" />}
                      </NeuralOrb>
                    </div>
                  </div>

                  {/* Right Column / Mobile Content */}
                  <div className="flex-1 md:w-full md:flex md:justify-start items-center">
                    {isEven ? (
                      <div className="w-full max-w-md md:pl-16 text-left">
                        <div className="p-6 md:p-8 bg-[#0a0d14] border border-white/8 rounded-2xl hover:border-primary-accent/30 transition-colors duration-300">
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
                    ) : (
                      <>
                        {/* Desktop Year */}
                        <span className="hidden md:block text-3xl font-space font-bold text-text-muted pl-16 text-left">
                          {event.year}
                        </span>
                        {/* Mobile Card */}
                        <div className="md:hidden w-full text-left">
                          <div className="p-6 md:p-8 bg-[#0a0d14] border border-white/8 rounded-2xl hover:border-primary-accent/30 transition-colors duration-300">
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
                      </>
                    )}
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
