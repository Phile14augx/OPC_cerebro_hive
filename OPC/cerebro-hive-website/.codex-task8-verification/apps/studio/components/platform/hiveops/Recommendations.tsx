"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingDown, Clock, ArrowRight } from "lucide-react";

interface Recommendation {
  id: string;
  title: string;
  value: string;
  description: string;
  type: "savings" | "capacity" | "anomaly";
  icon: any;
}

const recommendations: Recommendation[] = [
  {
    id: "1",
    type: "savings",
    title: "Savings Opportunity",
    value: "$18,400/month",
    description: "Reduce 4x idle H100 instances in US-East cluster.",
    icon: TrendingDown,
  },
  {
    id: "2",
    type: "capacity",
    title: "Capacity Prediction",
    value: "in 12 days",
    description: "GPU pool reaches 95% utilization at current growth rate.",
    icon: Clock,
  },
  {
    id: "3",
    type: "anomaly",
    title: "Anomaly Detected",
    value: "+35% Latency",
    description: "Inference latency spike on embedding service.",
    icon: Sparkles,
  },
];

export function Recommendations() {
  return (
    <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6 relative overflow-hidden h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          Intelligent Insights
        </h3>
        <button className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
          View All <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, idx) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.15 }}
            className="group p-4 bg-slate-900/50 border border-slate-700/50 hover:border-purple-500/50 rounded-lg transition-colors cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg ${
                rec.type === "savings" ? "bg-emerald-500/10 text-emerald-400" :
                rec.type === "capacity" ? "bg-amber-500/10 text-amber-400" :
                "bg-purple-500/10 text-purple-400"
              }`}>
                <rec.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs font-semibold text-slate-400">{rec.title}</span>
                  <span className={`text-sm font-bold ${
                    rec.type === "savings" ? "text-emerald-400" :
                    rec.type === "capacity" ? "text-amber-400" :
                    "text-purple-400"
                  }`}>{rec.value}</span>
                </div>
                <p className="text-sm text-slate-300 group-hover:text-slate-200 transition-colors">{rec.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
