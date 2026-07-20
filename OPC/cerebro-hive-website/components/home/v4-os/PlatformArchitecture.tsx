"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { typeTokens, spacingTokens, motionTokens } from "@/lib/design-system/tokens";
import { useState } from "react";

const layers = [
  {
    name: "AI Agents",
    color: "from-cyan-500/20 to-blue-400/20",
    border: "border-cyan-500/30",
    glow: "hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]",
    desc: "Autonomous agents with Manager/Worker hierarchy",
    href: "/products/agentos",
  },
  {
    name: "Knowledge Graph",
    color: "from-indigo-500/20 to-blue-500/20",
    border: "border-indigo-500/30",
    glow: "hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]",
    desc: "Temporal, ontology-aware enterprise world model",
    href: "/platform/os",
  },
  {
    name: "Vector Database",
    color: "from-purple-500/20 to-indigo-500/20",
    border: "border-purple-500/30",
    glow: "hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]",
    desc: "Hybrid semantic + keyword retrieval with RRF fusion",
    href: "/developers/architecture",
  },
  {
    name: "Enterprise Memory",
    color: "from-pink-500/20 to-purple-500/20",
    border: "border-pink-500/30",
    glow: "hover:shadow-[0_0_20px_rgba(236,72,153,0.15)]",
    desc: "Episodic, semantic, procedural & strategic memory tiers",
    href: "/platform/os",
  },
  {
    name: "Workflow Engine",
    color: "from-rose-500/20 to-pink-500/20",
    border: "border-rose-500/30",
    glow: "hover:shadow-[0_0_20px_rgba(244,63,94,0.15)]",
    desc: "Temporal-backed durable workflow execution",
    href: "/products/agentos",
  },
  {
    name: "MCP Server",
    color: "from-orange-500/20 to-rose-500/20",
    border: "border-orange-500/30",
    glow: "hover:shadow-[0_0_20px_rgba(249,115,22,0.15)]",
    desc: "Model Context Protocol for tool & plugin federation",
    href: "/developers/api",
  },
  {
    name: "Automation Layer",
    color: "from-amber-500/20 to-orange-500/20",
    border: "border-amber-500/30",
    glow: "hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]",
    desc: "Event-driven capability dispatch via NATS",
    href: "/products/hivepulse",
  },
  {
    name: "Analytics Layer",
    color: "from-yellow-500/20 to-amber-500/20",
    border: "border-yellow-500/30",
    glow: "hover:shadow-[0_0_20px_rgba(234,179,8,0.15)]",
    desc: "Real-time telemetry, traces, and cost analytics",
    href: "/studio/traces",
  },
  {
    name: "Security & Governance",
    color: "from-green-500/20 to-teal-500/20",
    border: "border-green-500/30",
    glow: "hover:shadow-[0_0_20px_rgba(34,197,94,0.15)]",
    desc: "Policy enforcement, RBAC, audit trails & compliance",
    href: "/studio/governance",
  },
];

export function PlatformArchitecture() {
  const [hoveredLayer, setHoveredLayer] = useState<number | null>(null);

  return (
    <section id="architecture" className={`relative ${spacingTokens.sectionGap} ${spacingTokens.pagePadding}`}>
      <div className="max-w-4xl mx-auto text-center mb-16">
        <motion.h2
          className={typeTokens.heading2}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Cerebro OS Architecture
        </motion.h2>
        <motion.p
          className={`mt-4 ${typeTokens.bodyLg}`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Nine integrated layers. One unified enterprise intelligence stack.
          <br />
          <span className="text-slate-500 text-sm mt-1 block">Click any layer to explore its documentation.</span>
        </motion.p>
      </div>

      <div className="max-w-3xl mx-auto flex flex-col gap-2">
        {layers.map((layer, i) => (
          <motion.div
            key={i}
            className={`group relative w-full rounded-xl bg-gradient-to-r ${layer.color} border ${layer.border} ${layer.glow} backdrop-blur-sm cursor-pointer transition-all duration-300`}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            whileHover={{ scaleX: 1.01, x: 4 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: i * 0.07, ease: "easeOut", duration: 0.4 }}
            onMouseEnter={() => setHoveredLayer(i)}
            onMouseLeave={() => setHoveredLayer(null)}
          >
            <Link href={layer.href} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                {/* Layer number */}
                <span className="text-xs font-mono text-slate-500 w-5 text-right flex-shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <span className="font-space font-semibold tracking-wide text-slate-200 block">
                    {layer.name}
                  </span>
                  <motion.span
                    className="text-xs text-slate-400 block"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{
                      opacity: hoveredLayer === i ? 1 : 0,
                      height: hoveredLayer === i ? "auto" : 0,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {layer.desc}
                  </motion.span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0" />
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Architecture CTA */}
      <motion.div
        className="max-w-3xl mx-auto mt-12 p-8 rounded-2xl bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-indigo-500/5 border border-border text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-xl font-bold text-slate-200 mb-3">See the full architecture in action</h3>
        <p className="text-slate-400 text-sm mb-6">
          Run a live cognitive loop — retrieval, reasoning, planning, and execution — against real enterprise data.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/platform/live-runtime" className="btn-primary group inline-flex items-center gap-2">
            Run Live Demo
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/developers/architecture" className="btn-ghost inline-flex items-center gap-2">
            Read Architecture Docs
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
