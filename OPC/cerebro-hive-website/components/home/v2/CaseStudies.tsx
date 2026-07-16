"use client";

import React, { useEffect, useState, useRef } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { motion, useInView, animate } from "framer-motion";
import { ArrowUpRight, CheckCircle2, TrendingUp, Clock, ShieldCheck, Activity } from "lucide-react";

// Number Counter Component
function AnimatedCounter({ from = 0, to, duration = 2, delay = 0, suffix = "", prefix = "" }: any) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [displayValue, setDisplayValue] = useState(from);

  useEffect(() => {
    if (inView) {
      const controls = animate(from, to, {
        duration: duration,
        delay: delay,
        ease: "easeOut",
        onUpdate(value) {
          setDisplayValue(Math.round(Number(value)));
        }
      });
      return () => controls.stop();
    }
  }, [inView, from, to, duration, delay]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{displayValue}{suffix}
    </span>
  );
}

export default function CaseStudies() {
  const sectionRef = useRef(null);

  return (
    <section className="section-pad bg-background relative overflow-hidden font-inter" ref={sectionRef}>
      {/* Background Neural Grid */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDEwaDQwTTAgMjBoNDBNMCAzMGg0ME0xMCAwdjQwTTIwIDB2NDBNeTMwIDB2NDAiIHN0cm9rZT0icmdiYSgwLDAsMCwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] dark:opacity-20 opacity-30 pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-background to-transparent opacity-50" />

      <div className="container-wide relative z-10">
        <SectionHeading 
          label="Business Impact"
          title="Proven Outcomes"
          description="We measure our success by the tangible business value we generate. See how our AI agents transform enterprise operations."
          className="mb-16"
        />

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          
          {/* Main Card 1: Compliance (Large) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 bg-surface-elevated rounded-3xl p-8 md:p-10 border border-border hover:border-primary-accent/40 transition-all group relative overflow-hidden cursor-pointer"
          >
            {/* Animated BG Lines */}
            <div className="absolute right-0 top-0 w-64 h-full opacity-10 flex flex-col justify-between py-10 pointer-events-none">
               {[1,2,3,4,5].map(i => (
                 <motion.div key={i} className="w-full h-px bg-primary-accent" 
                    initial={{ x: "100%" }}
                    whileInView={{ x: "-100%" }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.4, ease: "linear" }}
                 />
               ))}
            </div>

            <div className="flex justify-between items-start mb-12 relative z-10">
              <div>
                <div className="flex items-center gap-2 text-primary-accent mb-2">
                  <ShieldCheck size={18} />
                  <span className="text-xs uppercase tracking-widest font-bold font-space">Global FinTech</span>
                </div>
                <h3 className="text-2xl font-bold text-text-primary">Compliance Automation</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center group-hover:bg-primary-accent group-hover:text-text-primary transition-colors">
                <ArrowUpRight size={20} />
              </div>
            </div>

            <div className="mb-12 relative z-10">
              <div className="text-7xl md:text-8xl font-bold font-mono text-text-primary mb-2 group-hover:text-primary-accent transition-colors drop-shadow-lg">
                <AnimatedCounter to={85} suffix="%" duration={2.5} />
              </div>
              <p className="text-lg text-text-secondary">Reduction in manual compliance checks.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-border pt-6 relative z-10">
              <div>
                <span className="block text-[10px] uppercase text-text-muted font-bold tracking-wider mb-1">Savings</span>
                <span className="text-text-primary font-mono text-lg">18.5k hrs</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase text-text-muted font-bold tracking-wider mb-1">Agents</span>
                <span className="text-text-primary font-mono text-lg">12 Active</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase text-text-muted font-bold tracking-wider mb-1">ROI</span>
                <span className="text-primary-accent font-mono text-lg">14x</span>
              </div>
            </div>
          </motion.div>

          {/* Main Card 2: Manufacturing (Large) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="col-span-1 lg:col-span-1 row-span-2 bg-surface-elevated rounded-3xl p-8 border border-border hover:border-primary-accent/40 transition-all group relative overflow-hidden cursor-pointer flex flex-col justify-between"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-primary-accent mb-2">
                <Activity size={18} />
                <span className="text-xs uppercase tracking-widest font-bold font-space">Manufacturing</span>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-10">Predictive Maintenance</h3>
              
              <div className="text-5xl md:text-6xl font-bold font-mono text-text-primary mb-2 group-hover:text-primary-accent transition-colors">
                <AnimatedCounter to={4} prefix="$" suffix="M" duration={2} delay={0.5} />
              </div>
              <p className="text-sm text-text-secondary">Saved annually via knowledge graph.</p>
            </div>

            {/* Mini Chart Animation */}
            <div className="mt-12 h-24 flex items-end gap-2 relative z-10">
              {[30, 45, 25, 60, 40, 80, 100].map((h, i) => (
                <motion.div 
                  key={i}
                  className="w-full bg-primary-accent rounded-t-sm opacity-80 group-hover:opacity-100"
                  initial={{ height: 0 }}
                  whileInView={{ height: `${h}%` }}
                  transition={{ duration: 1, delay: 0.5 + (i * 0.1), ease: "easeOut" }}
                  viewport={{ once: true }}
                />
              ))}
            </div>
          </motion.div>

          {/* Small Card 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-surface-elevated rounded-2xl p-6 border border-border hover:border-primary-accent/30 transition-all flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-2 text-text-muted mb-1">
                <CheckCircle2 size={14} />
                <span className="text-[10px] uppercase font-bold tracking-widest">Healthcare</span>
              </div>
              <h4 className="text-text-primary font-medium mb-1">AI Diagnostic Accuracy</h4>
              <p className="text-xs text-text-muted">Precision across 5M records</p>
            </div>
            <div className="text-3xl font-bold font-mono text-text-primary">
              <AnimatedCounter to={99.8} suffix="%" duration={1.5} delay={0.8} />
            </div>
          </motion.div>

          {/* Small Card 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-surface-elevated rounded-2xl p-6 border border-border hover:border-primary-accent/30 transition-all flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-2 text-text-muted mb-1">
                <TrendingUp size={14} />
                <span className="text-[10px] uppercase font-bold tracking-widest">Retail</span>
              </div>
              <h4 className="text-text-primary font-medium mb-1">ROI on Ad Spend</h4>
              <p className="text-xs text-text-muted">Autonomous campaign ops</p>
            </div>
            <div className="text-3xl font-bold font-mono text-text-primary">
              <AnimatedCounter to={10} suffix="x" duration={1.5} delay={1} />
            </div>
          </motion.div>

          {/* Small Card 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-surface-elevated rounded-2xl p-6 border border-border hover:border-primary-accent/30 transition-all flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-2 text-text-muted mb-1">
                <Clock size={14} />
                <span className="text-[10px] uppercase font-bold tracking-widest">Logistics</span>
              </div>
              <h4 className="text-text-primary font-medium mb-1">Invoice Processing</h4>
              <p className="text-xs text-text-muted">End-to-end automation</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold font-mono text-text-muted line-through decoration-red-500/50 mb-0.5">120s</div>
              <div className="text-3xl font-bold font-mono text-primary-accent">
                <AnimatedCounter to={2} suffix="s" duration={1} delay={1.2} />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
