"use client";

import React from "react";
import { motion } from "framer-motion";
import { Activity, Rocket, Cpu, CloudLightning, ShieldAlert, CheckCircle } from "lucide-react";

interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  type: "success" | "warning" | "error" | "info";
  icon: any;
}

const events: TimelineEvent[] = [
  { id: "1", time: "09:20", title: "Incident Resolved", description: "API latency returned to normal bounds.", type: "success", icon: CheckCircle },
  { id: "2", time: "09:18", title: "Incident Declared", description: "High latency in US-East region.", type: "error", icon: ShieldAlert },
  { id: "3", time: "09:16", title: "Traffic Spike", description: "300% increase in inference requests.", type: "warning", icon: CloudLightning },
  { id: "4", time: "09:14", title: "Model Updated", description: "Llama-3-70B deployed to inference cluster.", type: "info", icon: Activity },
  { id: "5", time: "09:13", title: "GPU Added", description: "Autoscaler provisioned 4x H100 nodes.", type: "success", icon: Cpu },
  { id: "6", time: "09:10", title: "Deployment", description: "v2.14.0 rollout started in EU-West.", type: "info", icon: Rocket },
];

export function Timeline() {
  return (
    <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
      <h3 className="text-sm font-semibold text-slate-200 mb-6 flex items-center gap-2">
        <Activity className="w-4 h-4 text-emerald-400" />
        Operations Timeline
      </h3>

      <div className="relative border-l border-slate-700/50 ml-3 space-y-6">
        {events.map((event, idx) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative pl-6"
          >
            {/* Timeline Dot */}
            <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-[#0B0D14] ${
              event.type === "success" ? "bg-emerald-400" :
              event.type === "error" ? "bg-red-400" :
              event.type === "warning" ? "bg-amber-400" : "bg-cyan-400"
            }`} />

            <div className="flex gap-4 items-start group">
              <div className="flex-shrink-0 w-12 text-xs font-mono text-slate-500 pt-0.5">
                {event.time}
              </div>
              <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-lg p-3 group-hover:border-slate-600 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <event.icon className={`w-3.5 h-3.5 ${
                    event.type === "success" ? "text-emerald-400" :
                    event.type === "error" ? "text-red-400" :
                    event.type === "warning" ? "text-amber-400" : "text-cyan-400"
                  }`} />
                  <span className="text-sm font-medium text-slate-200">{event.title}</span>
                </div>
                <p className="text-xs text-slate-400">{event.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
