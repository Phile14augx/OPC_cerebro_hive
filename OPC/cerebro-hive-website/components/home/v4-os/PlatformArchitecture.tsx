"use client";

import { motion } from "framer-motion";
import { typeTokens, spacingTokens } from "@/lib/design-system/tokens";

const layers = [
  { name: "AI Agents", color: "from-blue-500/20 to-cyan-400/20", border: "border-cyan-500/30" },
  { name: "Knowledge Graph", color: "from-indigo-500/20 to-blue-500/20", border: "border-indigo-500/30" },
  { name: "Vector Database", color: "from-purple-500/20 to-indigo-500/20", border: "border-purple-500/30" },
  { name: "Enterprise Memory", color: "from-pink-500/20 to-purple-500/20", border: "border-pink-500/30" },
  { name: "Workflow Engine", color: "from-rose-500/20 to-pink-500/20", border: "border-rose-500/30" },
  { name: "MCP Server", color: "from-orange-500/20 to-rose-500/20", border: "border-orange-500/30" },
  { name: "Automation Layer", color: "from-amber-500/20 to-orange-500/20", border: "border-amber-500/30" },
  { name: "Analytics Layer", color: "from-yellow-500/20 to-amber-500/20", border: "border-yellow-500/30" },
  { name: "Security Layer", color: "from-green-500/20 to-teal-500/20", border: "border-green-500/30" },
];

export function PlatformArchitecture() {
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
          A unified stack powering your autonomous enterprise.
        </motion.p>
      </div>

      <div className="max-w-3xl mx-auto flex flex-col gap-2 perspective-1000">
        {layers.map((layer, i) => (
          <motion.div
            key={i}
            className={`w-full py-4 text-center rounded-xl bg-gradient-to-r ${layer.color} border ${layer.border} backdrop-blur-sm cursor-pointer`}
            initial={{ opacity: 0, rotateX: 20, y: 30 }}
            whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
            whileHover={{ scale: 1.02, rotateX: 0, zIndex: 10 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: i * 0.1, ease: "easeOut" }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <span className="font-space font-semibold tracking-wide text-slate-200">
              {layer.name}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
