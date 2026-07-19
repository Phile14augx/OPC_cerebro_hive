"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface ModuleNode {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  layer: "os" | "orchestration" | "business" | "enterprise" | "foundation";
  connections?: string[];
}

const modules: ModuleNode[] = [
  { id: "cerebro-sphere", title: "CerebroSphere™", subtitle: "Enterprise AI OS", href: "/products/cerebro-sphere", layer: "os", connections: ["hivepulse", "cerebro-archive", "cerebro-studio", "cerebro-flow", "cerebro-insight", "cerebro-copilot", "hive-ops", "hive-shield"] },
  { id: "hivepulse", title: "HivePulse™", subtitle: "Orchestration Engine", href: "/products/hivepulse", layer: "orchestration", connections: ["cerebro-flow", "cerebro-studio", "hive-ops"] },
  { id: "cerebro-archive", title: "CerebroArchive™", subtitle: "Knowledge Intelligence", href: "/products/cerebro-archive", layer: "business", connections: ["cerebro-copilot", "cerebro-x"] },
  { id: "cerebro-studio", title: "CerebroStudio™", subtitle: "AI Development", href: "/products/cerebro-studio", layer: "business", connections: ["cerebro-archive", "cerebro-x"] },
  { id: "cerebro-flow", title: "CerebroFlow™", subtitle: "AI Automation", href: "/products/cerebro-flow", layer: "business", connections: ["cerebro-archive", "cerebro-x"] },
  { id: "cerebro-insight", title: "CerebroInsight™", subtitle: "AI Analytics", href: "/products/cerebro-insight", layer: "business", connections: ["cerebro-x"] },
  { id: "cerebro-copilot", title: "CerebroCopilot™", subtitle: "AI Assistant", href: "/products/cerebro-copilot", layer: "business", connections: ["cerebro-archive", "cerebro-x"] },
  { id: "hive-ops", title: "HiveOps™", subtitle: "Operations Platform", href: "/products/hive-ops", layer: "enterprise", connections: ["hive-shield", "cerebro-x"] },
  { id: "hive-shield", title: "HiveShield™", subtitle: "Security & Governance", href: "/products/hive-shield", layer: "enterprise", connections: ["cerebro-x"] },
  { id: "cerebro-x", title: "Cerebro X™", subtitle: "AI Gateway", href: "/products/cerebro-x", layer: "foundation" },
];

const layerConfig = {
  os: {
    label: "Enterprise Operating System",
    color: "from-violet-500/20 to-purple-600/20",
    border: "border-violet-500/40",
    text: "text-violet-300",
    badge: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    dot: "bg-violet-400",
  },
  orchestration: {
    label: "Orchestration Engine",
    color: "from-cyan-500/20 to-blue-600/20",
    border: "border-cyan-500/40",
    text: "text-cyan-300",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    dot: "bg-cyan-400",
  },
  business: {
    label: "Business Intelligence Modules",
    color: "from-emerald-500/20 to-teal-600/20",
    border: "border-emerald-500/40",
    text: "text-emerald-300",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  enterprise: {
    label: "Enterprise Platform Services",
    color: "from-amber-500/20 to-orange-600/20",
    border: "border-amber-500/40",
    text: "text-amber-300",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    dot: "bg-amber-400",
  },
  foundation: {
    label: "Shared Foundation Service",
    color: "from-rose-500/20 to-red-600/20",
    border: "border-rose-500/40",
    text: "text-rose-300",
    badge: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    dot: "bg-rose-400",
  },
};

const layerOrder: Array<"os" | "orchestration" | "business" | "enterprise" | "foundation"> = [
  "os", "orchestration", "business", "enterprise", "foundation"
];

export function EcosystemArchitectureDiagram() {
  const [activeModule, setActiveModule] = useState<string | null>(null);

  const activeNode = activeModule ? modules.find(m => m.id === activeModule) : null;
  const connectedIds = activeNode?.connections ?? [];

  const getModuleStyle = (m: ModuleNode) => {
    if (!activeModule) return "";
    if (m.id === activeModule) return "ring-2 ring-white/60 scale-105";
    if (connectedIds.includes(m.id)) return "ring-2 ring-primary-accent/60 scale-105 opacity-100";
    return "opacity-30 scale-95";
  };

  return (
    <div className="relative w-full">
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-10 justify-center">
        {layerOrder.map(layer => {
          const cfg = layerConfig[layer];
          return (
            <div key={layer} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest ${cfg.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </div>
          );
        })}
      </div>

      {/* Architecture Layers */}
      <div className="flex flex-col gap-4">
        {layerOrder.map(layer => {
          const layerModules = modules.filter(m => m.layer === layer);
          const cfg = layerConfig[layer];
          return (
            <div key={layer} className={`relative rounded-2xl border bg-gradient-to-r ${cfg.color} ${cfg.border} p-5`}>
              <div className={`text-[10px] font-bold uppercase tracking-widest mb-4 ${cfg.text}`}>
                {cfg.label}
              </div>
              <div className={`grid gap-3 ${
                layer === "os" ? "grid-cols-1" :
                layer === "orchestration" ? "grid-cols-1 max-w-xs" :
                layer === "business" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-5" :
                layer === "enterprise" ? "grid-cols-2" :
                "grid-cols-1 max-w-xs"
              }`}>
                {layerModules.map(m => (
                  <Link
                    key={m.id}
                    href={m.href}
                    onMouseEnter={() => setActiveModule(m.id)}
                    onMouseLeave={() => setActiveModule(null)}
                    className={`group relative flex flex-col gap-1 px-4 py-3 rounded-xl bg-background/60 backdrop-blur-sm border border-border hover:border-border-active transition-all duration-300 cursor-pointer ${getModuleStyle(m)}`}
                  >
                    <span className="text-sm font-space font-bold text-text-primary group-hover:text-primary-accent transition-colors">
                      {m.title}
                    </span>
                    <span className="text-[11px] text-text-muted">
                      {m.subtitle}
                    </span>
                    {activeModule === m.id && m.connections && m.connections.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full z-20 bg-surface border border-border rounded-lg px-3 py-2 shadow-elevated text-[10px] text-text-secondary whitespace-nowrap pointer-events-none"
                      >
                        Connected to {m.connections.length} module{m.connections.length > 1 ? 's' : ''}
                      </motion.div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Shared Foundation Bar */}
      <div className="mt-6 p-4 rounded-2xl border border-border bg-surface text-center">
        <p className="text-[11px] font-bold uppercase tracking-widest text-text-muted mb-3">Shared Platform Foundation</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {["Identity & IAM", "Multi-Tenancy", "AI Gateway", "Event Bus", "Vector Search", "Object Storage", "Audit Logging", "API Gateway", "Observability", "Billing"].map(svc => (
            <span key={svc} className="px-2 py-1 text-[10px] font-bold tracking-wider uppercase bg-background border border-border rounded text-text-muted">
              {svc}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
