"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { typeTokens, spacingTokens } from "@/lib/design-system/tokens";

export function EnterprisePlatformCTA() {
  return (
    <section className={`relative overflow-hidden bg-background text-center ${spacingTokens.sectionGap} ${spacingTokens.pagePadding}`}>
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-accent/10 via-background to-background pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        <motion.h2
          className={`${typeTokens.hero} mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary-accent to-accent-secondary`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Enterprise AI Platform
        </motion.h2>

        <motion.p
          className={`${typeTokens.bodyLg} mb-10 max-w-2xl mx-auto`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          The foundation of our enterprise offering. A unified architecture tying together
          multi-agent execution, enterprise memory, governance, knowledge, and observability
          into one coherent operating system.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <TrackedLink
            href="/platform/live-runtime"
            analyticsEvent="cta_click"
            analyticsCategory="enterprise_platform_cta"
            analyticsLabel="Explore Interactive Architecture"
            className="btn-primary group"
          >
            Explore Interactive Architecture
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </TrackedLink>
        </motion.div>
      </div>
    </section>
  );
}
