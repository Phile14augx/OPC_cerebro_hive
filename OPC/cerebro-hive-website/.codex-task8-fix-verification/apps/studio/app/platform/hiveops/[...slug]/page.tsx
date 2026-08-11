"use client";

import React from "react";
import { motion } from "framer-motion";
import { Wrench } from "lucide-react";

export default function HiveOpsPlaceholder({ params }: { params: { slug: string[] } }) {
  const title = params.slug.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" / ");

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6"
      >
        <Wrench className="w-12 h-12 text-emerald-400" />
      </motion.div>
      <h2 className="text-2xl font-bold text-slate-100 mb-2">{title} Workspace</h2>
      <p className="text-slate-400 max-w-md">
        This workspace is part of the HiveOps Enterprise Control Plane. The operational interfaces for this module will be implemented in an upcoming sprint.
      </p>
    </div>
  );
}
