"use client";

import React, { useState, useEffect, useRef } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { 
  Users, DollarSign, TrendingUp, Megaphone, ShoppingCart, Headset,
  Scale, Database, ShieldCheck, BarChart, Calendar, Settings,
  BrainCircuit, Activity, ChevronRight, Play, Server, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const FLOAT_Y = [0, -8, 0];

// --- Data Models ---
const agents = [
  { id: "hr", name: "HR Agent", icon: Users, angle: 0, dist: 240, industry: ["cross"] },
  { id: "finance", name: "Finance Agent", icon: DollarSign, angle: 36, dist: 300, industry: ["finance", "cross"] },
  { id: "sales", name: "Sales Agent", icon: TrendingUp, angle: 72, dist: 270, industry: ["cross"] },
  { id: "marketing", name: "Marketing Agent", icon: Megaphone, angle: 108, dist: 240, industry: ["cross"] },
  { id: "support", name: "Support Agent", icon: Headset, angle: 144, dist: 310, industry: ["cross", "healthcare"] },
  { id: "legal", name: "Legal Agent", icon: Scale, angle: 180, dist: 280, industry: ["cross", "finance"] },
  { id: "erp", name: "ERP Agent", icon: Database, angle: 216, dist: 250, industry: ["cross", "manufacturing"] },
  { id: "compliance", name: "Compliance Agent", icon: ShieldCheck, angle: 252, dist: 300, industry: ["cross", "finance", "healthcare"] },
  { id: "analytics", name: "Analytics Agent", icon: BarChart, angle: 288, dist: 270, industry: ["cross", "finance", "manufacturing", "healthcare"] },
  { id: "ops", name: "Ops Agent", icon: Settings, angle: 324, dist: 230, industry: ["cross", "manufacturing"] },
];

const workflows = [
  { id: "w1", name: "Payroll Automation", path: ["hr", "finance", "erp"], duration: 6000 },
  { id: "w2", name: "Invoice Processing", path: ["finance", "legal", "erp"], duration: 5000 },
  { id: "w3", name: "Customer Triage", path: ["support", "sales", "analytics"], duration: 7000 },
  { id: "w4", name: "Compliance Audit", path: ["compliance", "legal", "ops"], duration: 8000 }
];

export default function AIAgentShowcase() {
  const [activeIndustry, setActiveIndustry] = useState("cross");
  const [activeWorkflowIdx, setActiveWorkflowIdx] = useState(0);
  const [timelineLogs, setTimelineLogs] = useState<{time: string, msg: string}[]>([]);
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);

  const activeWorkflow = workflows[activeWorkflowIdx];

  // Workflow Cycler & Timeline Log Generator
  useEffect(() => {
    const cycle = setInterval(() => {
      setActiveWorkflowIdx(prev => (prev + 1) % workflows.length);
      
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const currentWF = workflows[activeWorkflowIdx];
      const newLog = { time: timeStr, msg: `Completed: ${currentWF.name}` };
      
      setTimelineLogs(prev => [newLog, ...prev].slice(0, 5));
    }, activeWorkflow.duration);
    
    return () => clearInterval(cycle);
  }, [activeWorkflowIdx]);

  return (
    <section className="section-pad bg-[#02050A] relative overflow-hidden min-h-screen font-inter flex flex-col items-center">
      
      {/* Ambient Neural Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-accent/10 via-transparent to-transparent opacity-50 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03] mix-blend-screen scale-150" style={{ backgroundImage: "url('/images/noise.png')" }} />
      </div>

      <div className="container-wide relative z-10 mb-10">
        <SectionHeading 
          label="The Digital Workforce"
          title="Living Enterprise Digital Twin"
          description="Watch an entire enterprise operate autonomously. Our orchestrator continuously routes data and triggers specialist agents in real-time."
          align="center"
        />
        
        {/* Industry Context Filters */}
        <div className="flex justify-center gap-4 mt-8">
           {["cross", "finance", "manufacturing", "healthcare"].map(ind => (
             <button 
               key={ind}
               onClick={() => setActiveIndustry(ind)}
               className={cn(
                 "px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-widest transition-all",
                 activeIndustry === ind ? "bg-primary-accent/10 border-primary-accent text-primary-accent" : "bg-transparent border-white/10 text-gray-500 hover:text-white"
               )}
             >
               {ind === "cross" ? "All Domains" : ind}
             </button>
           ))}
        </div>
      </div>

      {/* Main Orchestrator Canvas */}
      <div className="relative w-full max-w-[1200px] h-[750px] mx-auto">
        
        {/* 1. Connection Lines (SVG) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <radialGradient id="lineGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00F57A" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#00F57A" stopOpacity="0" />
            </radialGradient>
          </defs>
          
          {agents.map(agent => {
            const isVisible = agent.industry.includes(activeIndustry);
            const rad = (agent.angle * Math.PI) / 180;
            const targetX = 600 + Math.cos(rad) * agent.dist;
            const targetY = 375 + Math.sin(rad) * agent.dist;
            
            // Check if this agent is in the active workflow path
            const isActiveInPath = activeWorkflow.path.includes(agent.id);

            return (
              <g key={`line-${agent.id}`} style={{ opacity: isVisible ? 1 : 0.1, transition: "opacity 1s" }}>
                <line 
                  x1="600" y1="375" x2={targetX} y2={targetY} 
                  stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4"
                />
                {isActiveInPath && (
                  <line 
                    x1="600" y1="375" x2={targetX} y2={targetY} 
                    stroke="rgba(0, 245, 122, 0.4)" strokeWidth="2"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* 2. Flowing Data Packets (Simulated via motion.divs on top of lines) */}
        {agents.map(agent => {
          if (!activeWorkflow.path.includes(agent.id) || !agent.industry.includes(activeIndustry)) return null;
          
          const rad = (agent.angle * Math.PI) / 180;
          const endX = 600 + Math.cos(rad) * agent.dist;
          const endY = 375 + Math.sin(rad) * agent.dist;

          // Determine direction (Core to Agent or Agent to Core) based on index in path
          const idx = activeWorkflow.path.indexOf(agent.id);
          const isOutgoing = idx % 2 === 0; 
          
          const startParams = isOutgoing ? { x: 600, y: 375 } : { x: endX, y: endY };
          const endParams = isOutgoing ? { x: endX, y: endY } : { x: 600, y: 375 };

          return (
            <motion.div
              key={`packet-${activeWorkflowIdx}-${agent.id}`}
              initial={{ x: startParams.x, y: startParams.y, opacity: 0 }}
              animate={{ x: endParams.x, y: endParams.y, opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute w-2 h-2 bg-primary-accent rounded-full shadow-[0_0_15px_#00F57A] z-10 -ml-1 -mt-1 pointer-events-none"
            />
          );
        })}

        {/* 3. The Central AI Core (Fusion Reactor) */}
        <div className="absolute left-[600px] top-[375px] -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none flex items-center justify-center">
           <div className="relative w-48 h-48 flex items-center justify-center">
              {/* Outer rotating ring */}
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border border-dashed border-primary-accent/40" />
              <motion.div animate={{ rotate: -360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="absolute inset-4 rounded-full border border-white/10" />
              
              {/* Pulsing Core */}
              <motion.div 
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.7, 0.3] }} 
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} 
                className="absolute inset-10 rounded-full bg-primary-accent blur-xl" 
              />
              
              <div className="relative z-10 w-24 h-24 rounded-full bg-black border-2 border-primary-accent flex flex-col items-center justify-center shadow-[0_0_50px_rgba(0,245,122,0.5)]">
                <BrainCircuit size={28} className="text-primary-accent mb-1" />
                <span className="text-[10px] font-space font-bold text-white tracking-widest">AI CORE</span>
              </div>
           </div>
        </div>

        {/* 4. Agent Cards */}
        {agents.map(agent => {
          const isVisible = agent.industry.includes(activeIndustry);
          const rad = (agent.angle * Math.PI) / 180;
          const x = 600 + Math.cos(rad) * agent.dist;
          const y = 375 + Math.sin(rad) * agent.dist;
          const isHovered = hoveredAgent === agent.id;
          const isActiveInPath = activeWorkflow.path.includes(agent.id);

          if (!isVisible) return null;

          return (
            <motion.div
              key={`wrapper-${agent.id}`}
              initial={{ opacity: 0, x: x - 100, y: y - 30 }}
              animate={{ opacity: 1, x: x - 100, y: y - 30 }}
              transition={{ duration: 0.5 }}
              className="absolute"
              style={{ left: 0, top: 0, zIndex: isHovered ? 50 : 30 }}
            >
              <motion.div
                animate={{ y: FLOAT_Y }}
                transition={{ y: { repeat: Infinity, duration: 4, ease: "easeInOut", delay: (agent.angle % 3) } }}
                onMouseEnter={() => setHoveredAgent(agent.id)}
                onMouseLeave={() => setHoveredAgent(null)}
                className={cn(
                  "w-[200px] rounded-xl border p-3 flex flex-col gap-2 transition-all duration-300 cursor-crosshair overflow-hidden backdrop-blur-xl shadow-2xl",
                  isActiveInPath ? "bg-primary-accent/10 border-primary-accent/50" : "bg-[#0A121E]/80 border-white/10",
                  isHovered ? "scale-110 w-[240px] border-primary-accent/70 bg-[#050A11]/95" : ""
                )}
              >
                {/* Agent Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className={cn("p-1.5 rounded-lg", isActiveInPath ? "bg-primary-accent text-black" : "bg-white/5 text-gray-400")}>
                     <agent.icon size={14} />
                   </div>
                   <span className={cn("text-xs font-bold font-space", isActiveInPath ? "text-white" : "text-gray-300")}>{agent.name}</span>
                </div>
                {/* Status Dot */}
                <div className="flex items-center gap-1.5">
                   <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isActiveInPath ? "bg-green-500" : isHovered ? "bg-yellow-500" : "bg-gray-500")} />
                </div>
              </div>

              {/* Collapsed Metrics (Only show if not hovered) */}
              {!isHovered && (
                <div className="flex justify-between items-end mt-1">
                  <span className="text-[9px] text-gray-500">{isActiveInPath ? "Processing..." : "Idle"}</span>
                  <span className="text-[10px] font-mono text-white bg-white/5 px-1.5 py-0.5 rounded">{(agent.angle % 50) + 100} Tasks</span>
                </div>
              )}

              {/* Hover Expansion */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="pt-2 mt-1 border-t border-white/10 flex flex-col gap-3">
                     
                     <div className="grid grid-cols-2 gap-2">
                       <div className="flex flex-col bg-black/40 p-1.5 rounded border border-white/5">
                         <span className="text-[8px] uppercase text-gray-500">Latency</span>
                         <span className="text-xs font-mono text-primary-accent">{(agent.angle % 50) + 20}ms</span>
                       </div>
                       <div className="flex flex-col bg-black/40 p-1.5 rounded border border-white/5">
                         <span className="text-[8px] uppercase text-gray-500">Health</span>
                         <span className="text-xs font-mono text-white">99.9%</span>
                       </div>
                     </div>
                     
                     <div>
                       <span className="text-[9px] uppercase tracking-widest text-gray-500 mb-1 block">Active Functions</span>
                       <ul className="text-[10px] text-gray-300 flex flex-col gap-1 pl-2 border-l border-primary-accent/30">
                         <li>Analyze Data Input</li>
                         <li>Query Vector DB</li>
                         <li>Submit Approval</li>
                       </ul>
                     </div>

                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* 5. Live UI Overlays (Timeline & Dashboard) */}
      
      {/* Enterprise Timeline (Left overlay) */}
      <div className="absolute left-8 top-32 w-64 p-5 rounded-2xl bg-[#050A11]/60 border border-white/10 backdrop-blur-md hidden xl:block z-40">
         <span className="text-[10px] uppercase tracking-widest text-primary-accent font-bold mb-4 flex items-center gap-2"><Clock size={12}/> Live Event Log</span>
         <div className="flex flex-col gap-3">
            <AnimatePresence>
              {timelineLogs.map((log, i) => (
                <motion.div key={`${log.time}-${i}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-0.5 border-l border-white/10 pl-2">
                  <span className="text-[9px] font-mono text-gray-500">{log.time}</span>
                  <span className="text-xs text-gray-300 truncate">{log.msg}</span>
                </motion.div>
              ))}
            </AnimatePresence>
         </div>
      </div>

      {/* Running Workflows (Right overlay) */}
      <div className="absolute right-8 top-32 w-64 p-5 rounded-2xl bg-[#050A11]/60 border border-white/10 backdrop-blur-md hidden xl:block z-40">
         <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4 flex items-center gap-2"><Activity size={12}/> Active Workflows</span>
         <div className="flex flex-col gap-4">
            {workflows.slice(0,3).map((wf, i) => (
              <div key={wf.id} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-end">
                   <span className={cn("text-xs font-medium", i === activeWorkflowIdx ? "text-primary-accent" : "text-gray-400")}>{wf.name}</span>
                   {i === activeWorkflowIdx && <Play size={10} className="text-primary-accent animate-pulse" />}
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                   {i === activeWorkflowIdx ? (
                     <motion.div 
                       key={wf.id}
                       initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: wf.duration / 1000, ease: "linear" }}
                       className="h-full bg-primary-accent"
                     />
                   ) : (
                     <div className="h-full w-full bg-transparent" />
                   )}
                </div>
              </div>
            ))}
         </div>
      </div>

      {/* Enterprise KPI Dashboard (Bottom Overlay) */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl p-4 rounded-xl bg-[#0A121E]/80 border border-white/10 backdrop-blur-md flex flex-wrap lg:flex-nowrap items-center justify-between gap-6 z-40">
         <div className="flex items-center gap-3 pr-6 border-r border-white/10">
           <div className="w-8 h-8 rounded-full bg-primary-accent/10 flex items-center justify-center text-primary-accent"><Server size={14}/></div>
           <div>
             <span className="text-[9px] uppercase tracking-widest text-gray-500 block">System Status</span>
             <span className="text-sm font-bold text-white">Fully Autonomous</span>
           </div>
         </div>
         <div className="flex-1 flex justify-around gap-4">
           <div className="flex flex-col">
             <span className="text-[9px] uppercase tracking-widest text-gray-500">Active Agents</span>
             <span className="text-lg font-mono font-bold text-white">12<span className="text-xs text-primary-accent">/12</span></span>
           </div>
           <div className="flex flex-col">
             <span className="text-[9px] uppercase tracking-widest text-gray-500">Tasks Today</span>
             <span className="text-lg font-mono font-bold text-white">18,425</span>
           </div>
           <div className="flex flex-col">
             <span className="text-[9px] uppercase tracking-widest text-gray-500">Automation Rate</span>
             <span className="text-lg font-mono font-bold text-primary-accent">92.4%</span>
           </div>
           <div className="flex flex-col">
             <span className="text-[9px] uppercase tracking-widest text-gray-500">Value Generated</span>
             <span className="text-lg font-mono font-bold text-white">$1.4M</span>
           </div>
         </div>
      </div>

    </section>
  );
}
