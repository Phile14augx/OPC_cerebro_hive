"use client";

import React from "react";
import { FileText, Beaker, BarChart2, BookOpen, Layers, Users } from "lucide-react";

const stats = [
  { label: "Active Projects", value: "42", icon: Beaker },
  { label: "Publications", value: "352", icon: FileText },
  { label: "Benchmarks", value: "126", icon: BarChart2 },
  { label: "Open Source", value: "18", icon: BookOpen },
  { label: "Research Domains", value: "7", icon: Layers },
  { label: "Research Team", value: "14", icon: Users }
];

export const ResearchStats = () => {
  return (
    <section className="py-12 border-b border-border bg-background">
      <div className="container-wide">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center justify-center p-6 rounded-2xl bg-surface border border-border text-center hover:bg-surface-elevated transition-colors group">
              <stat.icon size={20} className="text-text-muted group-hover:text-text-primary transition-colors mb-4" />
              <div className="text-3xl font-space font-bold text-text-primary mb-1 group-hover:text-[#00E5FF] transition-colors">{stat.value}</div>
              <div className="text-[9px] uppercase tracking-widest font-bold text-text-muted">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
