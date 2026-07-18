"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronRight, Play, Database, BrainCircuit, Bot, Network, Lightbulb, Target } from "lucide-react";
import dynamic from 'next/dynamic';
import { TrackedLink } from "@/components/ui/TrackedLink";
import { TrackedButton } from "@/components/ui/TrackedButton";
import { PageContainer } from "@/components/ui/primitives/PageContainer";

const BackgroundEngine = dynamic(
  () => import("@/components/ui/BackgroundEngine").then((mod) => mod.BackgroundEngine),
  { ssr: false }
);

const stages = [
  { id: "disconnected", title: "Disconnected Enterprise", icon: Database, color: "text-warning" },
  { id: "unified", title: "Unified Knowledge", icon: BrainCircuit, color: "text-accent-secondary" },
  { id: "agents", title: "Intelligent Agents", icon: Bot, color: "text-[#7B61FF]" },
  { id: "workflows", title: "Autonomous Workflows", icon: Network, color: "text-accent-primary" },
  { id: "decisions", title: "Better Decisions", icon: Lightbulb, color: "text-warning" },
  { id: "outcomes", title: "Measurable Outcomes", icon: Target, color: "text-accent-secondary" }
];

export default function HomeHero() {
  const [activeStage, setActiveStage] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % stages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-[100svh] flex flex-col justify-center bg-background">

      {/* Immersive Theme-Aware Ambient Background */}
      <BackgroundEngine type="hero" />

      <PageContainer className="relative z-10 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left: Copy */}
          {/* Left: Copy */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0.4 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15, delayChildren: 0.2 }
              }
            }}
          >
            <motion.div
              variants={{
                hidden: { opacity: 0.4, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
              }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-[10px] uppercase tracking-widest text-text-muted font-bold mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
              The Enterprise AI Operating System
            </motion.div>

            <motion.h1
              variants={{
                hidden: { opacity: 0.4, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
              }}
              className="text-5xl md:text-7xl font-space font-bold text-text-primary leading-[1.1] mb-6"
            >
              Engineering the <br />
              <span className="text-accent-secondary dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-[#00E5FF] dark:to-[#00F57A]">AI-Native</span> Enterprise.
            </motion.h1>

            <motion.p
              variants={{
                hidden: { opacity: 0.4, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
              }}
              className="text-lg text-text-secondary max-w-xl font-inter mb-10 leading-relaxed"
            >
              We architect enterprise AI systems, build production software, and deploy intelligent agent swarms that transform disconnected data into autonomous business outcomes.
            </motion.p>

            <motion.div
              variants={{
                hidden: { opacity: 0.4, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
              }}
              className="flex flex-wrap gap-4"
            >
              <TrackedLink href="/products" analyticsEvent="cta_click" analyticsCategory="conversion" analyticsLabel="Explore The Platform — Hero">
                <button className="theme-button-primary px-8 py-4 text-sm tracking-widest uppercase flex items-center gap-2 group">
                  Explore The Platform <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </TrackedLink>
              <TrackedLink href="/research" analyticsEvent="cta_click" analyticsCategory="engagement" analyticsLabel="Read Research — Hero">
                <button className="px-8 py-4 bg-surface border border-border text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-full hover:bg-surface-secondary shadow-sm transition-all duration-250">
                  Read Research
                </button>
              </TrackedLink>
            </motion.div>
          </motion.div>

          {/* Right: The Transformation Animation */}
          <div className="relative h-[500px] flex items-center justify-center">

            <div className="absolute inset-0 border border-border rounded-full animate-[spin_60s_linear_infinite] opacity-50" />
            <div className="absolute inset-8 border border-border rounded-full animate-[spin_40s_linear_infinite_reverse] opacity-50" />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeStage}
                initial={{ opacity: 0.4, scale: 0.8, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                transition={{ duration: 0.5 }}
                className="relative flex flex-col items-center text-center"
              >
                {React.createElement(stages[activeStage].icon, {
                  size: 80,
                  className: `mb-6 ${stages[activeStage].color} drop-shadow-[0_0_30px_currentColor]`
                })}
                <h3 className="text-3xl font-space font-bold text-text-primary tracking-wide">
                  {stages[activeStage].title}
                </h3>
              </motion.div>
            </AnimatePresence>

            {/* Stage Indicators */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {stages.map((stage, i) => (
                <div
                  key={i}
                  className={`h-1 transition-all duration-500 rounded-full ${i === activeStage ? 'w-8 bg-surface' : 'w-2 bg-surface-elevated'}`}
                />
              ))}
            </div>

          </div>

        </div>
      </PageContainer>
    </section>
  );
}
