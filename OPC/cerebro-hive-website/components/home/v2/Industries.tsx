"use client";

import React, { useState, useRef, useEffect } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { 
  Landmark, HeartPulse, Factory, ShoppingBag, Zap, Shield, 
  ArrowRight, ChevronRight, Activity, Database, Network,
  AlertTriangle, CheckCircle2, ShieldCheck, Box, Server, BrainCircuit, LineChart
} from "lucide-react";
import { motion, AnimatePresence, useInView, animate } from "framer-motion";
import { cn } from "@/lib/utils";

// Animated Counter Hook
function useAnimatedCounter(value: number, duration = 1.5, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (start) {
      const controls = animate(0, value, {
        duration,
        ease: "easeOut",
        onUpdate(v) { setCount(v); }
      });
      return () => controls.stop();
    }
  }, [value, duration, start]);
  return count;
}

const NumberCounter = ({ value, format, suffix = "", delay = 0, start = true }: any) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (start) {
      const timeout = setTimeout(() => {
        const controls = animate(0, value, {
          duration: 1.5,
          ease: "easeOut",
          onUpdate(v) { setCount(v); }
        });
        return () => controls.stop();
      }, delay * 1000);
      return () => clearTimeout(timeout);
    }
  }, [value, start, delay]);

  const display = format === "float" ? count.toFixed(1) : Math.round(count).toLocaleString();
  return <span className="tabular-nums">{display}{suffix}</span>;
}

const industries = [
  {
    id: "government",
    icon: Shield,
    name: "Government",
    desc: "AI for Secure Public Infrastructure",
    idleMetric: { value: 100, suffix: "%", label: "Data Sovereignty" },
    capabilityBadges: ["Digital Identity", "Citizen Services", "Compliance", "Fraud Detection"],
    challenges: ["Legacy Infrastructure", "Data Residency", "Manual Processing"],
    solutions: [
      { name: "Document AI", stat: "98%", label: "Accuracy" },
      { name: "Citizen Agent", stat: "<1s", label: "Response" },
      { name: "Policy Intel", stat: "100%", label: "Coverage" },
      { name: "Fraud AI", stat: "$45M", label: "Prevented" }
    ],
    architecture: ["Citizen Data", "Secure Platform", "Knowledge Graph", "Gov LLM", "Policy Agent", "Analytics"],
    businessOutcomes: [
      { value: "85%", desc: "Reduction in manual review" },
      { value: "100%", desc: "Data residency compliance" },
      { value: "3x", desc: "Faster citizen response" },
      { value: "$12M", desc: "Annual operational savings" }
    ],
    dashboardMetrics: [
      { label: "Policy Requests", value: 2421, format: "int" },
      { label: "Citizen Queries", value: 18451, format: "int" },
      { label: "Fraud Alerts", value: 23, format: "int" },
      { label: "AI Confidence", value: 99.8, format: "float", suffix: "%" }
    ],
    techStack: [
      { category: "AI Models", items: ["Llama 3", "Claude", "GPT"] },
      { category: "Infrastructure", items: ["GovCloud", "Air-Gapped", "Zero Trust"] },
      { category: "Data", items: ["Milvus", "Neo4j", "Kafka"] }
    ],
    cta: "Explore Government AI"
  },
  {
    id: "finance",
    icon: Landmark,
    name: "Finance",
    desc: "AI-Powered Regulatory Intelligence",
    idleMetric: { value: 3.2, suffix: "x", label: "Audit Speed" },
    capabilityBadges: ["Algorithmic Trading", "Risk Management", "Fraud Prevention"],
    challenges: ["Regulatory Complexity", "Real-Time Fraud", "Market Volatility"],
    solutions: [
      { name: "Risk AI", stat: "99%", label: "Precision" },
      { name: "Fraud Net", stat: "<50ms", label: "Latency" },
      { name: "Compliance", stat: "100%", label: "Audit Trailed" },
      { name: "Quant Agent", stat: "+12%", label: "Alpha" }
    ],
    architecture: ["Market Data", "Feature Store", "Graph DB", "Quant LLM", "Trading Agent", "Risk Dashboard"],
    businessOutcomes: [
      { value: "3.2x", desc: "Faster compliance audits" },
      { value: "99.8%", desc: "Fraud detection accuracy" },
      { value: "14x", desc: "ROI on deployment" },
      { value: "85%", desc: "Manual review reduction" }
    ],
    dashboardMetrics: [
      { label: "Transactions", value: 142051, format: "int" },
      { label: "Risk Score", value: 12.4, format: "float" },
      { label: "Anomalies", value: 8, format: "int" },
      { label: "Latency", value: 45, format: "int", suffix: "ms" }
    ],
    techStack: [
      { category: "AI Models", items: ["GPT-4", "Claude 3", "Proprietary Quant"] },
      { category: "Infrastructure", items: ["AWS Fargate", "Kubernetes", "Low-Latency"] },
      { category: "Data", items: ["Snowflake", "Kafka", "Neo4j"] }
    ],
    cta: "View Financial Architecture"
  },
  {
    id: "manufacturing",
    icon: Factory,
    name: "Manufacturing",
    desc: "Predictive Maintenance & Robotics",
    idleMetric: { value: 99.9, suffix: "%", label: "Uptime" },
    capabilityBadges: ["Industry 4.0", "Supply Chain", "Quality Assurance"],
    challenges: ["Unplanned Downtime", "Supply Chain Shocks", "QA Consistency"],
    solutions: [
      { name: "Predictive", stat: "99%", label: "Uptime" },
      { name: "Vision QA", stat: "99.9%", label: "Accuracy" },
      { name: "Routing AI", stat: "-20%", label: "Logistics Cost" },
      { name: "IoT Agent", stat: "10K", label: "Sensors" }
    ],
    architecture: ["IoT Sensors", "Edge Gateway", "Time-Series DB", "Predictive Model", "Maintenance Agent", "Quantiva ERP"],
    businessOutcomes: [
      { value: "99.9%", desc: "Equipment uptime" },
      { value: "98.5%", desc: "QA accuracy via Computer Vision" },
      { value: "-35%", desc: "Maintenance cost reduction" },
      { value: "+12%", desc: "Yield increase" }
    ],
    dashboardMetrics: [
      { label: "Active Sensors", value: 10402, format: "int" },
      { label: "Edge Latency", value: 12, format: "int", suffix: "ms" },
      { label: "Predictions", value: 450, format: "int" },
      { label: "OEE Score", value: 94.2, format: "float", suffix: "%" }
    ],
    techStack: [
      { category: "AI Models", items: ["Edge AI", "PyTorch", "Vision Transformers"] },
      { category: "Infrastructure", items: ["Azure IoT", "Edge Nodes", "5G"] },
      { category: "Data", items: ["Databricks", "InfluxDB", "Kafka"] }
    ],
    cta: "Explore Manufacturing AI"
  },
  {
    id: "healthcare",
    icon: HeartPulse,
    name: "Healthcare",
    desc: "Autonomous Clinical Workflows",
    idleMetric: { value: 40, suffix: "%", label: "Admin Reduction" },
    capabilityBadges: ["Clinical Decision", "Patient Triaging", "HIPAA Compliance"],
    challenges: ["Data Silos", "Clinical Burnout", "Regulatory Overhead"],
    solutions: [
      { name: "Chart AI", stat: "-40%", label: "Admin Time" },
      { name: "Diagnostic", stat: "2.1x", label: "Speed" },
      { name: "Claims AI", stat: "-65%", label: "Errors" },
      { name: "Triage Bot", stat: "24/7", label: "Active" }
    ],
    architecture: ["EHR System", "FHIR API", "Vector DB", "Medical LLM", "Clinical Agent", "Provider Portal"],
    businessOutcomes: [
      { value: "40%", desc: "Reduction in admin workload" },
      { value: "2.1x", desc: "Faster diagnostic support" },
      { value: "-65%", desc: "Claim processing errors" },
      { value: "+28%", desc: "Patient satisfaction score" }
    ],
    dashboardMetrics: [
      { label: "Charts Processed", value: 840, format: "int" },
      { label: "Triage Accuracy", value: 99.1, format: "float", suffix: "%" },
      { label: "Claim Approvals", value: 94, format: "int", suffix: "%" },
      { label: "HIPAA Audits", value: 100, format: "int", suffix: "%" }
    ],
    techStack: [
      { category: "AI Models", items: ["Gemini 1.5 Pro", "Med-PaLM", "Claude"] },
      { category: "Infrastructure", items: ["AWS HealthLake", "HIPAA Secure", "Zero Trust"] },
      { category: "Data", items: ["Pinecone", "FHIR Store", "PostgreSQL"] }
    ],
    cta: "See Healthcare Case Study"
  }
];

export default function Industries() {
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const BackgroundIllustration = ({ type, isFocused }: any) => {
    return (
      <div className={cn("absolute inset-0 pointer-events-none overflow-hidden transition-opacity duration-1000", isFocused ? "opacity-100" : "opacity-0")}>
        <div className="absolute inset-0 bg-black/50 z-10" />
        {/* Industry specific SVG background silhouettes */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-screen scale-150 transform-gpu z-0">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#fff" strokeWidth="0.5"/></pattern></defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-accent/5 blur-[120px] rounded-full mix-blend-screen z-10" />
      </div>
    );
  };

  const MiniArchitecture = ({ nodes, isFocused }: { nodes: string[], isFocused: boolean }) => (
    <div className="flex flex-col gap-2 relative mt-4">
      {/* Animated Data Packet */}
      {isFocused && (
        <motion.div 
          initial={{ top: 0, opacity: 0 }}
          animate={{ top: "100%", opacity: [0, 1, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute left-3 w-1.5 h-6 bg-primary-accent rounded-full shadow-[0_0_10px_#00F57A] z-20"
        />
      )}
      {nodes.map((node, i) => (
        <motion.div 
          key={node} 
          initial={{ opacity: 0, x: -20 }}
          animate={isFocused ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.5 + (i * 0.1) }}
          className="flex items-center gap-4 relative z-10"
        >
          <div className="w-6 h-6 rounded bg-[#0A1018] border border-white/20 flex items-center justify-center relative shrink-0">
            <div className="w-1.5 h-1.5 bg-primary-accent rounded-full" />
            {i < nodes.length - 1 && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-px h-2 bg-white/20" />
            )}
          </div>
          <span className="text-xs font-mono font-bold text-gray-300">{node}</span>
        </motion.div>
      ))}
    </div>
  );

  return (
    <section className="section-pad bg-[#03060A] relative overflow-hidden font-inter min-h-screen">
      <div className="container-wide relative z-10">
        <SectionHeading 
          label="Industries"
          title="Sector-Specific Intelligence"
          description="We build AI systems that understand the unique data, regulations, and workflows of your industry."
          className="mb-16"
        />

        <div className="flex flex-col gap-6">
          {industries.map((ind) => {
            const isFocused = focusedId === ind.id;
            const isHovered = hoveredId === ind.id;

            return (
              <motion.div 
                layout
                key={ind.id}
                onClick={() => !isFocused && setFocusedId(ind.id)}
                onMouseEnter={() => setHoveredId(ind.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={cn(
                  "relative rounded-3xl border transition-colors duration-500 w-full",
                  isFocused 
                    ? "bg-[#050B14] border-primary-accent/40 shadow-[0_0_80px_rgba(0,245,122,0.05)] cursor-default overflow-visible" 
                    : "bg-[#090D14] border-white/5 hover:border-white/15 cursor-pointer overflow-hidden"
                )}
                style={{ height: isFocused ? "auto" : "120px" }}
              >
                
                {/* IDLE STATE HEADER (Only visible when NOT focused) */}
                <AnimatePresence>
                  {!isFocused && (
                    <motion.div 
                      initial={{ opacity: 1 }} exit={{ opacity: 0 }} 
                      className="absolute inset-0 flex items-center justify-between z-20"
                      style={{ padding: '0 40px' }}
                    >
                      <div className="flex items-center gap-6">
                        <div className={cn("p-4 rounded-2xl transition-colors duration-500 shrink-0", isHovered ? "bg-primary-accent/10 text-primary-accent" : "bg-white/5 text-gray-400")}>
                          <ind.icon size={32} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold font-space text-white mb-1">{ind.name}</h3>
                          <p className="text-sm text-gray-400">{ind.desc}</p>
                        </div>
                      </div>
                      <div className="hidden md:block text-right shrink-0">
                        <div className="flex items-baseline gap-1 justify-end">
                          <span className={cn("text-3xl font-mono font-bold transition-colors", isHovered ? "text-white" : "text-gray-300")}>{ind.idleMetric.value}</span>
                          <span className="text-xl text-primary-accent font-bold font-mono">{ind.idleMetric.suffix}</span>
                        </div>
                        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{ind.idleMetric.label}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* FOCUSED EXPANDED STATE */}
                <BackgroundIllustration type={ind.id} isFocused={isFocused} />
                
                <AnimatePresence>
                  {isFocused && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="relative z-20 w-full"
                    >
                      <div className="industries-expanded-content flex flex-col gap-10 md:gap-14 w-full min-w-0">
                        {/* Close Button - Absolute Positioned */}
                        <button onClick={(e) => { e.stopPropagation(); setFocusedId(null); }} style={{ position: 'absolute', top: '24px', right: '24px' }} className="p-2 rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors z-30">
                           <X size={20} />
                        </button>

                      {/* Top Header Row */}
                      <div className="flex items-start min-w-0">
                        <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6 pr-12 min-w-0">
                           <div className="p-3 md:p-4 rounded-2xl bg-primary-accent/10 text-primary-accent shrink-0 border border-primary-accent/20">
                              <ind.icon size={28} className="md:w-8 md:h-8" />
                           </div>
                           <div className="min-w-0 flex-1">
                              <h3 className="text-2xl md:text-3xl font-bold font-space text-white mb-2 truncate">{ind.name}</h3>
                              <p className="text-sm md:text-base text-gray-400 font-medium mb-4 truncate">{ind.desc}</p>
                              <div className="flex flex-wrap gap-2">
                                {ind.capabilityBadges.map((badge, i) => (
                                  <motion.span 
                                    key={badge} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + (i * 0.05) }}
                                    className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase tracking-widest text-gray-300 font-bold whitespace-nowrap"
                                  >
                                    {badge}
                                  </motion.span>
                                ))}
                              </div>
                           </div>
                        </div>
                      </div>

                      {/* Main Grid Content */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 border-y border-white/10 py-12 min-w-0">
                        
                        {/* Left Context Column */}
                        <div className="lg:col-span-8 flex flex-col gap-12 min-w-0">
                          
                          {/* Challenges & Solutions */}
                          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 min-w-0">
                            <div className="min-w-0">
                              <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4 flex items-center gap-2"><AlertTriangle size={14}/> Critical Challenges</span>
                              <div className="flex flex-col gap-3 min-w-0">
                                {ind.challenges.map((c, i) => (
                                  <motion.div key={c} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + (i*0.1) }} className="flex items-center gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10 min-w-0">
                                    <AlertTriangle size={14} className="text-red-400 shrink-0" />
                                    <span className="text-sm font-medium text-red-200/70 truncate">{c}</span>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                            
                            <div className="min-w-0">
                              <span className="text-[10px] uppercase tracking-widest text-primary-accent font-bold mb-4 flex items-center gap-2"><CheckCircle2 size={14}/> AI Solutions</span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                                {ind.solutions.map((s, i) => (
                                  <motion.div key={s.name} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + (i*0.1) }} className="p-3 rounded-lg bg-[#0A131C] border border-primary-accent/20 flex flex-col justify-between group hover:bg-primary-accent/5 transition-colors overflow-hidden min-w-0">
                                    <span className="text-[10px] font-bold text-gray-400 mb-3 truncate">{s.name}</span>
                                    <div className="flex items-baseline gap-1 truncate">
                                      <span className="text-lg font-mono font-bold text-white">{s.stat}</span>
                                      <span className="text-[9px] uppercase tracking-widest text-primary-accent">{s.label}</span>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Architecture Visualizer */}
                          <div className="min-w-0">
                            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-6 flex items-center gap-2"><Network size={14}/> Reference Architecture</span>
                            <div className="p-6 rounded-2xl bg-black/40 border border-white/5 relative overflow-hidden min-w-0">
                              <MiniArchitecture nodes={ind.architecture} isFocused={isFocused} />
                            </div>
                          </div>

                        </div>

                        {/* Right Dashboard Column */}
                        <div className="lg:col-span-4 flex flex-col gap-12 min-w-0">
                          
                          {/* Live Operational Metrics */}
                          <div className="min-w-0">
                            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4 flex items-center gap-2"><Activity size={14}/> Live Operational Dashboard</span>
                            <div className="flex flex-col border border-white/10 rounded-2xl bg-black/40 overflow-hidden shadow-2xl min-w-0">
                              <div className="bg-white/5 px-4 py-2 text-[9px] font-mono text-gray-500 flex justify-between min-w-0">
                                <span className="truncate pr-2">{ind.name.toUpperCase()}_OPS</span>
                                <span className="text-primary-accent flex items-center gap-1 shrink-0"><div className="w-1.5 h-1.5 bg-primary-accent rounded-full animate-pulse"/> LIVE</span>
                              </div>
                              <div className="p-4 flex flex-col gap-4 min-w-0">
                                {ind.dashboardMetrics.map((metric, i) => (
                                  <div key={metric.label} className="flex items-center justify-between gap-2 min-w-0">
                                    <span className="text-xs text-gray-400 truncate">{metric.label}</span>
                                    <span className="text-sm font-mono font-bold text-white bg-white/5 px-2 py-1 rounded shrink-0">
                                      <NumberCounter value={metric.value} format={metric.format} suffix={metric.suffix} delay={0.6 + (i * 0.1)} start={isFocused} />
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Business Outcomes KPIs */}
                          <div className="min-w-0">
                            <span className="text-[10px] uppercase tracking-widest text-secondary-accent font-bold mb-4 flex items-center gap-2"><LineChart size={14}/> Business Outcomes</span>
                            <div className="flex flex-col gap-6 min-w-0">
                              {ind.businessOutcomes.map((out, i) => (
                                <motion.div key={out.desc} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 + (i*0.1) }} className="flex gap-4 items-start min-w-0">
                                  <span className="text-2xl font-mono font-bold text-white shrink-0">{out.value}</span>
                                  <span className="text-xs text-gray-400 mt-1 leading-relaxed truncate">{out.desc}</span>
                                </motion.div>
                              ))}
                            </div>
                          </div>

                        </div>

                      </div>

                      {/* Bottom Footer Area */}
                      <div className="flex flex-col xl:flex-row items-start xl:items-end justify-between gap-8 min-w-0">
                        
                        {/* Tech Stack Groups */}
                        <div className="flex-1 min-w-0 w-full">
                           <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-6 block">Core Technology Stack</span>
                           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 xl:gap-6 min-w-0">
                             {ind.techStack.map((group, i) => (
                               <motion.div key={group.category} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 + (i*0.1) }} className="min-w-0">
                                 <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2 min-w-0">
                                   {group.category === "AI Models" ? <BrainCircuit size={12} className="text-gray-400 shrink-0"/> : group.category === "Infrastructure" ? <Server size={12} className="text-gray-400 shrink-0"/> : <Database size={12} className="text-gray-400 shrink-0"/>}
                                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{group.category}</span>
                                 </div>
                                 <div className="flex flex-wrap gap-2 min-w-0">
                                   {group.items.map(item => (
                                     <span key={item} className="px-3 py-1 bg-white/5 border border-white/5 rounded text-[11px] text-gray-300 font-medium truncate max-w-full">
                                       {item}
                                     </span>
                                   ))}
                                 </div>
                               </motion.div>
                             ))}
                           </div>
                        </div>

                        {/* CTA */}
                        <motion.button 
                          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.4 }}
                          className="shrink-0 px-8 py-4 lg:px-12 lg:py-5 bg-white text-black font-bold font-space text-sm flex items-center justify-center gap-3 hover:bg-primary-accent transition-colors rounded-xl group max-w-full"
                        >
                          <span className="truncate">{ind.cta}</span>
                          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform shrink-0" />
                        </motion.button>
                        
                      </div>

                    </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const X = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);
