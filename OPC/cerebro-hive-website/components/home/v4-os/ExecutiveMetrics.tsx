"use client";

import { motion } from "framer-motion";
import { typeTokens, spacingTokens } from "@/lib/design-system/tokens";

const metrics = [
  { value: "85%", label: "Reduction in manual work" },
  { value: "92%", label: "AI Accuracy (Avg)" },
  { value: "4x", label: "Faster Decision Making" },
  { value: "65%", label: "Operational Cost Reduction" },
  { value: "24/7", label: "AI Workforce Uptime" },
  { value: "99.99%", label: "Availability SLA" },
];

export function ExecutiveMetrics() {
  return (
    <section className={`relative border-y border-white/5 bg-background/50 ${spacingTokens.sectionGap} ${spacingTokens.pagePadding}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2 
            className={typeTokens.heading2}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Measurable Enterprise Outcomes
          </motion.h2>
          <motion.p 
            className={`mt-4 ${typeTokens.bodyMd}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            * Illustrative metrics based on typical enterprise AI deployments.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
          {metrics.map((metric, i) => (
            <motion.div
              key={i}
              className="flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-white/5 dark:bg-black/20 border border-white/5 hover:border-primary-accent/30 transition-colors"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, ease: "easeOut" }}
            >
              <div className="text-4xl md:text-5xl font-space font-bold text-transparent bg-clip-text bg-gradient-to-br dark:from-white from-slate-800 to-primary-accent mb-2">
                {metric.value}
              </div>
              <div className={typeTokens.bodySm}>
                {metric.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
