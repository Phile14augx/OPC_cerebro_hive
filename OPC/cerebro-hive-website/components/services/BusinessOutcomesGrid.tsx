"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingDown, Bot, Rocket, Settings2, ShieldCheck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const outcomes = [
  {
    icon: TrendingDown,
    title: "Reduce Operational Costs",
    description: "Automate manual knowledge-work, eliminate redundant processes, and reduce error rates across the enterprise.",
    color: "#00E5FF"
  },
  {
    icon: Bot,
    title: "Deploy Autonomous Agents",
    description: "Orchestrate multi-agent systems that reason, plan, and execute complex workflows without human intervention.",
    color: "#00F57A"
  },
  {
    icon: Rocket,
    title: "Accelerate Software Delivery",
    description: "Integrate generative AI into development lifecycles to increase engineering velocity and code quality.",
    color: "#FF8A00"
  },
  {
    icon: Settings2,
    title: "Modernize Legacy Systems",
    description: "Connect isolated data silos and legacy architectures to modern AI inference engines via secure APIs.",
    color: "#7B61FF"
  },
  {
    icon: Zap,
    title: "Improve Customer Experience",
    description: "Deploy contextual, RAG-enabled interfaces that provide immediate, accurate resolutions to complex queries.",
    color: "#FF2ED1"
  },
  {
    icon: ShieldCheck,
    title: "Enterprise AI Governance",
    description: "Establish robust risk management frameworks, compliance checks, and security guardrails for AI adoption.",
    color: "#00C8FF"
  }
];

export function BusinessOutcomesGrid() {
  return (
    <section className="section-pad bg-surface relative z-10 overflow-hidden">
      <div className="container-wide">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-space font-bold text-text-primary leading-tight mb-6">
              Driving Strategic <br /> Business Outcomes
            </h2>
            <p className="text-lg text-text-secondary font-inter">
              Executives invest in outcomes, not technologies. We architect AI solutions that deliver measurable impact across the enterprise value chain.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {outcomes.map((outcome, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-8 rounded-2xl bg-background border border-border hover:border-border-strong transition-all duration-300 group"
            >
              <div 
                className="w-12 h-12 rounded-xl mb-6 flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: `${outcome.color}15`, color: outcome.color }}
              >
                <outcome.icon size={24} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-space font-bold text-text-primary mb-3">
                {outcome.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {outcome.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
