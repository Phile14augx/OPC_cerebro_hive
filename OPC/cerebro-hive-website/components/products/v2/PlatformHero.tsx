"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Calculator, Users, Briefcase, Cog, Package, Scale, Cpu, BrainCircuit, Target, ArrowRight } from "lucide-react";
import { cn, withBasePath } from "@/lib/utils";

// Nodes configuration
const departments = [
  { id: "finance", label: "Finance", icon: Calculator, desc: "Automated reconciliation, invoice processing, and predictive forecasting." },
  { id: "hr", label: "HR", icon: Users, desc: "Intelligent onboarding, automated policy queries, and talent analytics." },
  { id: "sales", label: "Sales", icon: Briefcase, desc: "Real-time deal scoring, autonomous outreach, and contract generation." },
  { id: "operations", label: "Operations", icon: Cog, desc: "Process mining, continuous workflow optimization, and autonomous SLAs." },
  { id: "supply-chain", label: "Supply Chain", icon: Package, desc: "Demand forecasting, dynamic routing, and automated vendor communications." },
  { id: "legal", label: "Legal", icon: Scale, desc: "Contract analysis, automated compliance checking, and risk monitoring." },
];

const platformNodes = [
  { id: "knowledge", label: "Knowledge Hub", icon: BrainCircuit, color: "text-accent-primary" },
  { id: "agents", label: "AgentOS", icon: Cpu, color: "text-accent-secondary" },
  { id: "automation", label: "Automation Studio", icon: Cog, color: "text-primary-accent" },
  { id: "erp", label: "Quantiva ERP", icon: Database, color: "text-warning" },
];

import { Database } from "lucide-react";

export const PlatformHero = () => {
  const [activeDept, setActiveDept] = useState<string>("finance");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setActiveDept((prev) => {
        const currentIndex = departments.findIndex((d) => d.id === prev);
        const nextIndex = (currentIndex + 1) % departments.length;
        return departments[nextIndex].id;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const activeDeptData = departments.find(d => d.id === activeDept) || departments[0];

  if (!mounted) return <section className="min-h-screen pt-32 pb-20 border-b border-border bg-background" />;

  return (
    <section className="relative min-h-[90vh] pt-32 pb-20 border-b border-border bg-background overflow-hidden flex flex-col justify-center">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <motion.div 
          className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-accent/5 rounded-full blur-[150px] mix-blend-screen"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 opacity-[0.03] mix-blend-screen" style={{ backgroundImage: `url('${withBasePath('/images/noise.png')}')` }} />
      </div>

      <div className="container-wide relative z-10 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Column: Messaging */}
        <div className="flex flex-col items-start text-left max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border mb-8 shadow-sm">
            <Building2 size={12} className="text-primary-accent" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">Enterprise Digital Twin</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-space font-bold text-text-primary tracking-tight leading-[1.05] mb-6 drop-shadow-2xl">
            One Enterprise Platform. <br/>
            Multiple AI Products. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-accent via-[#00E5FF] to-primary-accent bg-[length:200%_auto] animate-gradient-shift">
              Infinite Workflows.
            </span>
          </h1>

          <p className="text-lg text-text-secondary font-inter leading-[1.8] mb-10 max-w-[50ch]">
            CerebroHive is not a collection of disconnected AI tools. It is a unified Enterprise AI Operating System that transforms how every department operates.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button className="group px-8 py-4 bg-primary-accent text-black font-space font-bold text-sm uppercase tracking-widest rounded-lg flex items-center justify-center gap-3 transition-all hover:bg-white shadow-[0_0_20px_rgba(0,245,122,0.2)]">
              Build My AI Platform
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
            <button className="px-8 py-4 bg-surface border border-border text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-lg hover:border-primary-accent/40 hover:bg-surface-elevated transition-all flex items-center justify-center">
              Generate Architecture
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Enterprise Visualizer */}
        <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square bg-surface-elevated border border-border rounded-2xl p-6 lg:p-8 flex flex-col shadow-2xl overflow-hidden">
          {/* Internal Grid Background */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            
            {/* Top Row: Departments */}
            <div>
              <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-4">1. Organization</div>
              <div className="grid grid-cols-3 gap-2">
                {departments.map((dept) => {
                  const isActive = activeDept === dept.id;
                  return (
                    <button 
                      key={dept.id}
                      onClick={() => setActiveDept(dept.id)}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300",
                        isActive 
                          ? "bg-primary-accent/10 border-primary-accent/50 text-primary-accent shadow-[0_0_15px_rgba(0,245,122,0.1)]" 
                          : "bg-surface border-border text-text-muted hover:border-border-highlight hover:text-text-secondary"
                      )}
                    >
                      <dept.icon size={18} className="mb-2" />
                      <span className="text-[9px] font-space font-bold uppercase tracking-wider">{dept.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Connecting Flow (Simulated Data Packets) */}
            <div className="relative flex-1 flex items-center justify-center py-8">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-primary-accent/30 to-transparent" />
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-primary-accent/10 via-primary-accent/50 to-primary-accent/10" />
              
              <motion.div 
                key={activeDept}
                initial={{ opacity: 0, y: -20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                className="relative z-10 px-6 py-4 bg-surface border border-primary-accent/30 rounded-xl backdrop-blur-md text-center max-w-[280px] shadow-[0_0_30px_rgba(0,245,122,0.15)]"
              >
                <div className="text-primary-accent mb-2 flex justify-center"><BrainCircuit size={24} /></div>
                <div className="text-xs font-bold text-text-primary mb-1">Cerebro AI Platform</div>
                <div className="text-[11px] text-text-secondary leading-relaxed">{activeDeptData.desc}</div>
              </motion.div>

              {/* Data Packets flowing down */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 bg-primary-accent rounded-full shadow-[0_0_8px_#00F57A]"
                  initial={{ top: "10%", left: "50%", opacity: 0 }}
                  animate={{ top: "90%", opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5, ease: "linear" }}
                />
              ))}
            </div>

            {/* Bottom Row: Outcomes */}
            <div>
              <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-4 text-center">2. Measurable Outcomes</div>
              <div className="flex justify-between items-center bg-surface border border-border rounded-xl p-4">
                <div className="flex flex-col items-center">
                  <span className="text-primary-accent font-space font-bold text-lg mb-1">-40%</span>
                  <span className="text-[9px] uppercase tracking-wider text-text-muted">OpEx</span>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="flex flex-col items-center">
                  <span className="text-accent-secondary font-space font-bold text-lg mb-1">10x</span>
                  <span className="text-[9px] uppercase tracking-wider text-text-muted">Speed</span>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="flex flex-col items-center">
                  <span className="text-text-primary font-space font-bold text-lg mb-1">99.9%</span>
                  <span className="text-[9px] uppercase tracking-wider text-text-muted">Accuracy</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
