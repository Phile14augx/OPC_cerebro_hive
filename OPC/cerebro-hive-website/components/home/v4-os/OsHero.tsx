"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BrainCircuit } from "lucide-react";
import { typeTokens, spacingTokens } from "@/lib/design-system/tokens";

export function OsHero() {
  return (
    <section className={`relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background ${spacingTokens.pagePadding}`}>
      {/* Background visualizer (will be replaced by LivingEnterpriseBrain or integrated with it) */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-accent/10 via-background to-background" />

      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.175, 0.885, 0.32, 1.275] }}
          className="mb-8 p-4 rounded-full bg-primary-accent/10 border border-primary-accent/20"
        >
          <BrainCircuit className="w-12 h-12 text-primary-accent" />
        </motion.div>

        <motion.h1
          className={`${typeTokens.hero} mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Building Enterprise Intelligence.
        </motion.h1>

        <motion.p
          className={`${typeTokens.bodyLg} mb-12 max-w-2xl mx-auto`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Enterprise AI. Knowledge Systems. Agentic Automation. <br/>
          One Intelligence Platform. Infinite Enterprise Workflows.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-6 justify-center w-full sm:w-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Link href="#architecture" className="btn-primary group">
            Explore Platform
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/contact" className="btn-ghost">
            Book AI Strategy Session
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
