"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Workflow,
  ListOrdered,
  Database,
  Activity,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  LucideIcon,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { controlCenterWidgets } from "@/lib/data/products/agentos-pyramid";

const iconMap: Record<string, LucideIcon> = {
  Bot,
  Workflow,
  ListOrdered,
  Database,
  Activity,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
};

const formatValue = (value: number, unit: string) => {
  const rounded = Number.isInteger(value) ? value : Math.round(value * 100) / 100;
  return `${rounded.toLocaleString()}${unit}`;
};

export const AgentOSControlCenter = () => {
  const [mounted, setMounted] = useState(false);
  const [values, setValues] = useState(controlCenterWidgets.map((w) => w.value));

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setValues((prev) =>
        prev.map((v, i) => {
          const w = controlCenterWidgets[i];
          const jitter = (Math.random() - 0.5) * 2 * w.variance;
          const next = w.value + jitter;
          return w.unit === "%" ? Math.min(100, Math.max(0, next)) : Math.max(0, next);
        })
      );
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="section-pad border-b border-border bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-secondary/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="container-wide relative z-10">
        <SectionHeading
          label="AI Control Center"
          title="Mission control for the whole runtime"
          description="One cockpit for platform and SRE teams — active agents, workflows, spend, and health, live."
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
          {controlCenterWidgets.map((widget, i) => {
            const Icon = iconMap[widget.icon] || Activity;
            return (
              <div key={widget.id} className="p-5 rounded-xl bg-surface border border-border shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center text-primary-accent">
                    <Icon size={16} />
                  </div>
                  <Radio size={12} className="text-primary-accent animate-pulse" />
                </div>
                <div>
                  <motion.div key={mounted ? Math.round(values[i]) : "static"} className="text-2xl font-space font-bold text-text-primary tabular-nums">
                    {formatValue(mounted ? values[i] : widget.value, widget.unit)}
                  </motion.div>
                  <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mt-1">{widget.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
