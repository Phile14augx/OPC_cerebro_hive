"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  User,
  Server,
  Waypoints,
  BrainCircuit,
  Database,
  Wrench,
  Cpu,
  CheckCircle2,
  Send,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { digitalTwinSteps } from "@/lib/data/products/agentos-pyramid";

const iconMap: Record<string, LucideIcon> = {
  User,
  Server,
  Waypoints,
  BrainCircuit,
  Database,
  Wrench,
  Cpu,
  CheckCircle2,
  Send,
};

export const AgentOSDigitalTwin = () => {
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % (digitalTwinSteps.length + 1));
    }, 1400);
    return () => clearInterval(interval);
  }, [isInView]);

  const progress = Math.min(100, (Math.max(activeStep, 0) / (digitalTwinSteps.length - 1)) * 100);

  return (
    <section className="section-pad border-b border-border bg-background" ref={containerRef}>
      <div className="container-wide">
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary-accent mb-3 block">Digital Twin</span>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-4">Every packet, visible in real time</h2>
          <p className="text-text-secondary max-w-2xl mx-auto font-inter text-center">
            Distributed tracing, built for agents instead of microservices. Watch a single request move through the runtime end to end.
          </p>
        </div>

        <div className="max-w-6xl mx-auto bg-surface-elevated border border-border rounded-2xl p-8 md:p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute top-1/2 left-12 right-12 h-1 bg-border -translate-y-1/2 hidden md:block" />
          <div
            className="absolute top-1/2 left-12 h-1 bg-primary-accent -translate-y-1/2 hidden md:block transition-all duration-500 ease-linear shadow-[0_0_10px_#00F57A]"
            style={{ width: `calc(${progress}% - 3rem)` }}
          />

          <div className="flex flex-col md:flex-row justify-between relative z-10 gap-8 md:gap-0">
            {digitalTwinSteps.map((step, index) => {
              const Icon = iconMap[step.icon] || Cpu;
              const isPast = activeStep > index;
              const isCurrent = activeStep === index;
              return (
                <div key={step.id} className="flex flex-col items-center relative">
                  <div
                    className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 z-10",
                      isCurrent
                        ? "bg-primary-accent/20 border-2 border-primary-accent shadow-[0_0_20px_rgba(0,245,122,0.3)] scale-110"
                        : isPast
                        ? "bg-surface border-2 border-primary-accent/50"
                        : "bg-surface-secondary border-2 border-border"
                    )}
                  >
                    {isPast && !isCurrent ? (
                      <CheckCircle2 size={20} className="text-primary-accent" />
                    ) : (
                      <Icon size={20} className={isCurrent ? "text-accent-secondary" : "text-text-muted"} />
                    )}
                  </div>
                  <div className="mt-4 text-center">
                    <div className={cn("text-xs font-space font-bold mb-1", isCurrent ? "text-text-primary" : "text-text-secondary")}>{step.label}</div>
                    <div className={cn("text-[9px] uppercase tracking-widest", isCurrent ? "text-accent-secondary" : "text-text-muted")}>
                      {isCurrent ? step.detail : "..."}
                    </div>
                  </div>
                  {isCurrent && (
                    <motion.div
                      className="absolute top-7 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl border-2 border-primary-accent"
                      initial={{ scale: 1, opacity: 0.8 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <AnimatePresence>
            {activeStep >= digitalTwinSteps.length && (
              <motion.div
                initial={{ opacity: 0.4, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-surface/90 backdrop-blur-sm flex flex-col items-center justify-center z-20"
              >
                <div className="w-16 h-16 bg-primary-accent/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} className="text-primary-accent" />
                </div>
                <h3 className="text-2xl font-space font-bold text-text-primary mb-1">Trace Complete</h3>
                <p className="text-text-secondary text-sm">Full execution recorded and queryable.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
