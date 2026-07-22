"use client";

import React, { useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Activity, Bot, FileText, Zap, BarChart3, Clock, DollarSign, Database } from "lucide-react";

const AnimatedCounter = ({ value, prefix = "", suffix = "" }: { value: number, prefix?: string, suffix?: string }) => {
  return (
    <span className="font-space font-bold tracking-tight">
      {prefix}{value.toLocaleString()}{suffix}
    </span>
  );
};

export const PlatformDashboardPreview = () => {
  const [metrics, setMetrics] = useState({
    invoices: 12,
    documents: 450,
    agents: 3,
    savings: 1200,
    tasks: 45
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Simulate live platform activity
    const interval = setInterval(() => {
      setMetrics(prev => ({
        invoices: prev.invoices + Math.floor(Math.random() * 5) + 1,
        documents: prev.documents + Math.floor(Math.random() * 20) + 5,
        agents: prev.agents, // Agents change slower
        savings: prev.savings + Math.floor(Math.random() * 50) + 10,
        tasks: prev.tasks + Math.floor(Math.random() * 10) + 2
      }));
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) return <section className="py-24 border-b border-border bg-background" />;

  return (
    <section className="py-24 border-b border-border bg-background relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-accent/5 rounded-full blur-[100px]" />
      </div>

      <div className="container-wide relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div className="text-left">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary-accent mb-3 block flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-accent"></span>
              </span>
              Live Platform Telemetry
            </span>
            <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary">Actionable Intelligence</h2>
          </div>
          <div className="mt-6 md:mt-0 px-4 py-2 bg-surface border border-border rounded-lg flex items-center gap-3">
            <Activity size={16} className="text-primary-accent" />
            <span className="text-xs font-mono text-text-secondary">SYS_STATUS: OPTIMAL</span>
          </div>
        </div>

        {/* Dashboard Mockup */}
        <div className="w-full bg-background border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          
          {/* Top Bar */}
          <div className="h-12 border-b border-border flex items-center px-4 justify-between bg-surface-elevated">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-text-muted">CerebroOS Admin Console</div>
            <div className="w-16" /> {/* Spacer */}
          </div>

          {/* Grid Layout */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            
            {/* Main Metric: Savings */}
            <div className="md:col-span-2 lg:col-span-2 bg-surface/50 border border-border rounded-xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
                <DollarSign size={120} />
              </div>
              <div className="flex items-center gap-3 text-text-muted mb-4">
                <DollarSign size={16} />
                <span className="text-xs uppercase font-bold tracking-widest">Real-time Cost Savings</span>
              </div>
              <div className="text-5xl md:text-7xl text-text-primary">
                <AnimatedCounter value={metrics.savings} prefix="$" />
              </div>
              <div className="mt-4 flex items-center gap-2 text-primary-accent text-sm">
                <Activity size={14} />
                <span>+12.4% vs last hour</span>
              </div>
            </div>

            {/* Sub Metrics */}
            <div className="bg-surface/50 border border-border rounded-xl p-6 flex flex-col justify-between">
              <div className="flex items-center gap-3 text-text-muted mb-4">
                <FileText size={16} />
                <span className="text-xs uppercase font-bold tracking-widest">Invoices Processed</span>
              </div>
              <div className="text-4xl text-text-primary">
                <AnimatedCounter value={metrics.invoices} />
              </div>
              <div className="mt-4 w-full bg-surface-secondary rounded-full h-1.5 overflow-hidden">
                <motion.div className="bg-[#00E5FF] h-full" animate={{ width: ["40%", "80%", "40%"] }} transition={{ duration: 5, repeat: Infinity }} />
              </div>
            </div>

            <div className="bg-surface/50 border border-border rounded-xl p-6 flex flex-col justify-between">
              <div className="flex items-center gap-3 text-text-muted mb-4">
                <Bot size={16} />
                <span className="text-xs uppercase font-bold tracking-widest">Active Agents</span>
              </div>
              <div className="text-4xl text-accent-primary">
                <AnimatedCounter value={metrics.agents} />
              </div>
              <div className="mt-4 text-xs text-text-secondary">
                Running autonomously
              </div>
            </div>

            <div className="bg-surface/50 border border-border rounded-xl p-6 flex flex-col justify-between">
              <div className="flex items-center gap-3 text-text-muted mb-4">
                <Database size={16} />
                <span className="text-xs uppercase font-bold tracking-widest">Docs Indexed</span>
              </div>
              <div className="text-4xl text-text-primary">
                <AnimatedCounter value={metrics.documents} />
              </div>
              <div className="mt-4 text-xs text-text-secondary flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-accent animate-pulse" />
                Syncing Knowledge Graph
              </div>
            </div>

            {/* Chart Area */}
            <div className="md:col-span-2 lg:col-span-3 bg-surface/50 border border-border rounded-xl p-6 h-48 flex items-end justify-between gap-2 overflow-hidden relative">
              <div className="absolute top-6 left-6 flex items-center gap-3 text-text-muted">
                <BarChart3 size={16} />
                <span className="text-xs uppercase font-bold tracking-widest">Task Throughput (Last 24h)</span>
              </div>
              {/* Simulated bars */}
              {[...Array(24)].map((_, i) => {
                const height = 20 + Math.random() * 60;
                return (
                  <motion.div 
                    key={i}
                    className="w-full bg-primary-accent/20 rounded-t-sm"
                    initial={{ height: `${height}%` }}
                    animate={{ height: [`${height}%`, `${height + (Math.random() * 20 - 10)}%`, `${height}%`] }}
                    transition={{ duration: 3 + Math.random() * 2, repeat: Infinity }}
                  >
                    <div className="w-full bg-primary-accent/80 rounded-t-sm h-1" />
                  </motion.div>
                );
              })}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
