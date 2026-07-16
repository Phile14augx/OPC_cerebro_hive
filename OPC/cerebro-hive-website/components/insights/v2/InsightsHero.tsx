"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, TrendingUp, ArrowUpRight, ArrowRight, ShieldCheck, Activity, BarChart3 } from "lucide-react";
import { cn, withBasePath } from "@/lib/utils";

const dashboardMetrics = [
  { label: "AI Adoption", value: "76%", trend: "+23%", icon: TrendingUp, color: "text-accent-primary" },
  { label: "Enterprise Spending", value: "$14B", trend: "+41%", icon: ArrowUpRight, color: "text-accent-secondary" },
];

const trendStatuses = [
  { label: "Agentic AI", status: "Trending", color: "text-accent-secondary", border: "border-[#00E5FF]" },
  { label: "RAG Systems", status: "Stable", color: "text-accent-primary", border: "border-[#00F57A]" },
  { label: "Enterprise Reasoning", status: "Emerging", color: "text-warning", border: "border-[#FFB300]" },
];

export const InsightsHero = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <section className="min-h-[90vh] bg-background" />;

  return (
    <section className="relative min-h-[90vh] pt-32 pb-20 border-b border-border bg-background overflow-hidden flex flex-col justify-center">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-[#00E5FF]/5 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-[#00F57A]/5 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute inset-0 opacity-[0.02] mix-blend-screen" style={{ backgroundImage: `url('${withBasePath('/images/noise.png')}')` }} />
      </div>

      <div className="container-wide relative z-10 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Column: Messaging */}
        <div className="flex flex-col items-start text-left">
          
          <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/5 border border-border mb-8 backdrop-blur-sm">
            <BrainCircuit size={14} className="text-accent-secondary" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">Executive Intelligence Center</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-space font-bold text-text-primary tracking-tight leading-[1.1] mb-6">
            Enterprise <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-text-secondary to-text-muted">AI Intelligence</span>
          </h1>

          <p className="text-lg text-text-secondary font-inter leading-[1.8] mb-10 max-w-[50ch]">
            Strategic analysis, executive briefings, market trends, and technical insights for leaders building AI-first organizations. We don't report the news; we decode what it means for your business.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button className="group px-8 py-4 bg-white text-black font-space font-bold text-sm uppercase tracking-widest rounded-lg flex items-center justify-center gap-3 transition-all hover:bg-primary-accent shadow-lg">
              Read Weekly Brief
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
            <button className="px-8 py-4 bg-transparent border border-border text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-lg hover:border-white/50 hover:bg-white/5 transition-all flex items-center justify-center gap-2">
              <BarChart3 size={16} /> Explore Dashboards
            </button>
          </div>
          
        </div>

        {/* Right Column: Animated Intelligence Dashboard */}
        <div className="relative w-full aspect-square lg:aspect-[4/3] flex flex-col gap-4">
          
          <div className="bg-surface/80 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-2xl">
            <div className="text-xs uppercase tracking-widest text-text-muted font-bold mb-4 flex items-center gap-2">
              <Activity size={14} /> Market Signals
            </div>
            <div className="grid grid-cols-2 gap-4">
              {dashboardMetrics.map((metric, i) => (
                <div key={i} className="p-4 rounded-xl bg-surface-secondary border border-border">
                  <div className="text-[10px] uppercase tracking-widest text-text-muted mb-2">{metric.label}</div>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-space font-bold text-text-primary">{metric.value}</span>
                    <span className={cn("text-xs font-bold mb-1 flex items-center gap-1", metric.color)}>
                      <metric.icon size={12} /> {metric.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface/80 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-2xl flex-1 relative overflow-hidden">
            
            {/* Animated scanning line */}
            <motion.div 
              className="absolute left-0 right-0 h-32 bg-gradient-to-b from-transparent via-[#00E5FF]/10 to-transparent pointer-events-none"
              animate={{ top: ['-20%', '120%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />

            <div className="text-xs uppercase tracking-widest text-text-muted font-bold mb-6 flex items-center gap-2">
              <ShieldCheck size={14} /> Technology Maturity
            </div>

            <div className="space-y-4 relative z-10">
              {trendStatuses.map((trend, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-sm font-bold text-text-primary">{trend.label}</span>
                  <div className={cn("px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border bg-surface-secondary", trend.color, trend.border)}>
                    {trend.status}
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
