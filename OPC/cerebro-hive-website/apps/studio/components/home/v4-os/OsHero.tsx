"use client";

import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BrainCircuit, Zap, Shield, Network, Play } from "lucide-react";
import { typeTokens, spacingTokens, motionTokens } from "@/lib/design-system/tokens";
import { useState } from "react";

const cognitiveSteps = [
  { label: "Observe", icon: "👁", color: "text-cyan-400", desc: "Ingest & contextualize enterprise signals" },
  { label: "Retrieve", icon: "🔍", color: "text-blue-400", desc: "Hybrid Graph + Vector + Memory retrieval" },
  { label: "Reason", icon: "🧠", color: "text-indigo-400", desc: "Ontology-aware inference engine" },
  { label: "Plan", icon: "📋", color: "text-purple-400", desc: "DAG task graph with policy enforcement" },
  { label: "Execute", icon: "⚡", color: "text-violet-400", desc: "Multi-agent autonomous execution" },
  { label: "Reflect", icon: "🔄", color: "text-fuchsia-400", desc: "Self-evaluation & memory consolidation" },
];

const stats = [
  { value: "16+", label: "Industries Served" },
  { value: "10ms", label: "Avg Retrieval Latency" },
  { value: "99.9%", label: "Runtime Uptime" },
  { value: "∞", label: "Workflow Scale" },
];

export function OsHero() {
  const [activeStep, setActiveStep] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      className={`relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background ${spacingTokens.pagePadding} pb-16`}
    >
      {/* Ambient grid background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(0,229,255,0.08),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,229,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: motionTokens.duration.normal }}
          className="flex justify-center mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-accent/10 border border-primary-accent/20 text-primary-accent text-sm font-medium tracking-wide">
            <span className="w-2 h-2 rounded-full bg-primary-accent animate-pulse shadow-[0_0_8px_var(--color-primary-accent)]" />
            Enterprise AI Platform — Now Live
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className={`${typeTokens.hero} mb-6 text-center text-transparent bg-clip-text bg-gradient-to-b dark:from-white dark:via-slate-200 dark:to-slate-500 from-slate-900 via-slate-700 to-slate-500`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: motionTokens.duration.slow, delay: 0.15, ease: motionTokens.easing.decelerate }}
        >
          The Enterprise AI
          <br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500 bg-clip-text text-transparent">
            Operating System
          </span>
        </motion.h1>

        <motion.p
          className={`${typeTokens.bodyLg} text-center mb-12 max-w-2xl mx-auto`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: motionTokens.duration.slow, delay: 0.3 }}
        >
          A full cognitive runtime — from Knowledge Retrieval to Autonomous Execution —
          built to power enterprise workflows at scale.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: motionTokens.duration.slow, delay: 0.45 }}
        >
          <Link
            href="/platform/live-runtime"
            className="btn-primary group inline-flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Run Live Demo
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/platform/os" className="btn-ghost inline-flex items-center gap-2">
            <Network className="w-4 h-4" />
            Explore Architecture
          </Link>
          <Link href="/contact" className="btn-ghost inline-flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Book AI Strategy Session
          </Link>
        </motion.div>

        {/* Interactive Cognitive Loop */}
        <motion.div
          className="w-full max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: motionTokens.duration.slow, delay: 0.6 }}
        >
          <p className="text-center text-xs font-mono text-slate-500 uppercase tracking-widest mb-6">
            Cognitive Runtime Loop — Click to Explore
          </p>

          {/* Step pills */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
            {cognitiveSteps.map((step, i) => (
              <button
                key={i}
                onClick={() => setActiveStep(i)}
                className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-300 cursor-pointer ${
                  activeStep === i
                    ? "bg-surface-elevated border-border shadow-lg"
                    : "bg-surface/50 border-border hover:bg-surface hover:border-border/50"
                }`}
              >
                {/* Active connector line */}
                {i < cognitiveSteps.length - 1 && (
                  <div className={`hidden md:block absolute -right-[5px] top-1/2 -translate-y-1/2 w-2 h-0.5 z-10 transition-colors duration-300 ${
                    activeStep > i ? "bg-primary-accent/60" : "bg-surface-elevated"
                  }`} />
                )}
                <span className="text-xl">{step.icon}</span>
                <span className={`text-xs font-semibold ${activeStep === i ? step.color : "text-slate-400"}`}>
                  {step.label}
                </span>
                {activeStep === i && (
                  <motion.div
                    layoutId="stepIndicator"
                    className="absolute inset-0 rounded-xl ring-1 ring-primary-accent/40"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Step detail card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="bg-surface border border-border rounded-2xl px-6 py-4 text-center backdrop-blur-sm"
            >
              <span className={`text-2xl mr-3`}>{cognitiveSteps[activeStep].icon}</span>
              <span className={`font-semibold ${cognitiveSteps[activeStep].color}`}>
                {cognitiveSteps[activeStep].label}:
              </span>{" "}
              <span className="text-slate-300 text-sm">{cognitiveSteps[activeStep].desc}</span>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-px mt-20 bg-surface rounded-2xl overflow-hidden border border-border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: motionTokens.duration.slow, delay: 0.9 }}
        >
          {stats.map((stat, i) => (
            <div key={i} className="bg-background px-6 py-5 text-center">
              <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                {stat.value}
              </div>
              <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
