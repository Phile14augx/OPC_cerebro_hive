"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserCircle, Briefcase, Calculator, Scale, FileText, Globe, Search, BrainCircuit, Activity, Wrench, Network, LayoutTemplate } from "lucide-react";
import { cn } from "@/lib/utils";

const agents = [
  {
    id: "finance",
    name: "Finance Agent",
    icon: Calculator,
    workflow: "Reconciliation -> Variance Analysis -> Reporting",
    memory: "Historical General Ledger, Vendor Contracts",
    tools: ["NetSuite API", "Stripe API", "Excel Processing"],
    reasoning: "Chain of thought: 'Identify discrepancy -> Retrieve contract terms -> Apply rules -> Flag for review'",
    roi: "$450k/yr saved in auditing costs"
  },
  {
    id: "hr",
    name: "HR Agent",
    icon: UserCircle,
    workflow: "Candidate Screening -> Policy Q&A -> Onboarding",
    memory: "Employee Handbook, Benefits DB, Org Chart",
    tools: ["Workday API", "Greenhouse", "Slack Bot"],
    reasoning: "Chain of thought: 'Parse query -> Check role tier -> Extract policy clause -> Generate localized response'",
    roi: "85% reduction in L1 HR tickets"
  },
  {
    id: "sales",
    name: "Sales Agent",
    icon: Briefcase,
    workflow: "Lead Scoring -> Research -> Outreach Gen",
    memory: "CRM History, Competitor Matrix",
    tools: ["Salesforce", "LinkedIn API", "Apollo"],
    reasoning: "Chain of thought: 'Analyze intent -> Map to product -> Personalize value prop -> Draft email'",
    roi: "3.2x increase in pipeline velocity"
  },
  {
    id: "legal",
    name: "Legal Agent",
    icon: Scale,
    workflow: "Contract Ingestion -> Clause Extraction -> Risk Flagging",
    memory: "Past MSAs, State Precedents, Playbooks",
    tools: ["DocuSign", "Ironclad", "OCR Engine"],
    reasoning: "Chain of thought: 'Scan liability cap -> Compare to standard -> Flag deviations -> Suggest redlines'",
    roi: "Contract turnaround from 14 days to 2 hours"
  }
];

export const AgentGallery = () => {
  const [activeAgent, setActiveAgent] = useState(agents[0].id);
  const activeData = agents.find(a => a.id === activeAgent) || agents[0];

  return (
    <section className="py-24 border-b border-border bg-background">
      <div className="container-wide">
        
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold uppercase tracking-widest text-accent-secondary mb-3 block">AgentOS Fleet</span>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-4">Autonomous Digital Workers</h2>
          <p className="text-text-secondary max-w-2xl mx-auto font-inter text-center">
            Deploy specialized AI agents that possess domain expertise, utilize enterprise tools, and execute end-to-end workflows autonomously.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left: Agent Selection Menu */}
          <div className="lg:col-span-4 flex flex-col gap-2">
            {agents.map((agent) => {
              const isActive = activeAgent === agent.id;
              return (
                <button
                  key={agent.id}
                  onClick={() => setActiveAgent(agent.id)}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border transition-all text-left group",
                    isActive 
                      ? "bg-[#00E5FF]/10 border-[#00E5FF]/50 shadow-[0_0_20px_rgba(0,229,255,0.1)]" 
                      : "bg-surface border-border hover:border-border-strong"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("p-2 rounded-lg", isActive ? "bg-[#00E5FF]/20 text-accent-secondary" : "bg-surface-elevated text-text-muted group-hover:text-text-primary")}>
                      <agent.icon size={20} />
                    </div>
                    <span className={cn("font-space font-bold", isActive ? "text-text-primary" : "text-text-muted group-hover:text-text-primary")}>{agent.name}</span>
                  </div>
                  {isActive && (
                    <motion.div layoutId="agent-active" className="w-2 h-2 rounded-full bg-[#00E5FF]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right: Agent Anatomy */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeAgent}
                initial={{ opacity: 0.4, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-surface border border-border rounded-2xl p-6 md:p-8"
              >
                
                {/* Header */}
                <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border">
                  <div className="w-16 h-16 rounded-2xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-accent-secondary shadow-[0_0_30px_rgba(0,229,255,0.2)]">
                    <activeData.icon size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-space font-bold text-text-primary mb-1">{activeData.name}</h3>
                    <div className="text-xs uppercase tracking-widest text-accent-secondary font-bold">Status: Online • Idle</div>
                  </div>
                </div>

                {/* Anatomy Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  
                  {/* Workflow */}
                  <div className="bg-surface-elevated border border-border rounded-xl p-5">
                    <div className="flex items-center gap-2 text-text-muted mb-3 text-xs uppercase tracking-widest font-bold">
                      <Network size={14} /> Standard Workflow
                    </div>
                    <div className="text-sm text-text-primary font-mono">{activeData.workflow}</div>
                  </div>

                  {/* Memory */}
                  <div className="bg-surface-elevated border border-border rounded-xl p-5">
                    <div className="flex items-center gap-2 text-text-muted mb-3 text-xs uppercase tracking-widest font-bold">
                      <BrainCircuit size={14} /> Contextual Memory
                    </div>
                    <div className="text-sm text-text-primary">{activeData.memory}</div>
                  </div>

                  {/* Tools */}
                  <div className="bg-surface-elevated border border-border rounded-xl p-5">
                    <div className="flex items-center gap-2 text-text-muted mb-3 text-xs uppercase tracking-widest font-bold">
                      <Wrench size={14} /> Equipped Tools
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {activeData.tools.map((tool, i) => (
                        <span key={i} className="px-2.5 py-1 bg-surface-elevated border border-border rounded text-xs text-text-primary">{tool}</span>
                      ))}
                    </div>
                  </div>

                  {/* ROI */}
                  <div className="bg-[#00E5FF]/5 border border-[#00E5FF]/20 rounded-xl p-5 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-text-muted mb-2 text-xs uppercase tracking-widest font-bold">
                      <Activity size={14} /> Expected ROI
                    </div>
                    <div className="text-xl font-space font-bold text-accent-secondary">{activeData.roi}</div>
                  </div>

                </div>

                {/* Reasoning Block */}
                <div className="bg-background border border-border rounded-xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#00E5FF]/50" />
                  <div className="flex items-center gap-2 text-text-muted mb-3 text-xs uppercase tracking-widest font-bold">
                    <LayoutTemplate size={14} /> Reasoning Trace
                  </div>
                  <div className="text-sm text-primary-accent font-mono italic">
                    {activeData.reasoning}
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
};
