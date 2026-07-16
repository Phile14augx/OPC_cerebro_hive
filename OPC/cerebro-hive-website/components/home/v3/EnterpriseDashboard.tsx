"use client";

import React from "react";
import { Activity, Database, Bot, DollarSign } from "lucide-react";

const metrics = [
  {
    theme: "Operational Excellence",
    icon: Activity,
    value: "42%",
    label: "Process Automation",
    color: "text-accent-primary"
  },
  {
    theme: "Knowledge Intelligence",
    icon: Database,
    value: "3.2M",
    label: "Documents Indexed",
    color: "text-accent-secondary"
  },
  {
    theme: "AI Workforce",
    icon: Bot,
    value: "27",
    label: "Active Agents",
    color: "text-[#7B61FF]"
  },
  {
    theme: "Business Impact",
    icon: DollarSign,
    value: "$4.2M",
    label: "Annual Savings",
    color: "text-warning"
  }
];

export default function EnterpriseDashboard() {
  return (
    <section className="py-12 border-b border-border bg-background relative z-20 -mt-8">
      <div className="container-wide">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((metric, i) => (
            <div key={i} className="bg-surface border border-border rounded-2xl p-6 flex flex-col items-center text-center group hover:border-white/30 transition-colors shadow-2xl relative overflow-hidden">
              
              <div className="absolute top-0 left-0 w-full h-1 bg-white/5 group-hover:bg-white/10 transition-colors" />

              <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-4 flex items-center gap-1">
                <metric.icon size={12} className={metric.color} /> {metric.theme}
              </div>
              
              <div className="text-4xl md:text-5xl font-space font-bold text-text-primary mb-2">
                {metric.value}
              </div>
              
              <div className="text-sm font-bold text-text-secondary">
                {metric.label}
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
