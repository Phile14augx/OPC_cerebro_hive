"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Briefcase, Calculator, Shield, Users, ShoppingCart, Truck, Factory, ArrowRight, BrainCircuit, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const functions = [
  {
    id: "finance",
    name: "Finance & Accounting",
    icon: Calculator,
    challenges: ["Manual invoice processing", "Inaccurate cash flow forecasting", "High compliance costs"],
    useCases: ["Autonomous AP/AR Agents", "Predictive Revenue Modeling", "Continuous Audit AI"],
    architecture: "Finance LLM + ERP Integration + Entra ID",
  },
  {
    id: "hr",
    name: "Human Resources",
    icon: Users,
    challenges: ["Slow onboarding", "High query volume", "Retention risks"],
    useCases: ["Employee Success Copilot", "Predictive Attrition Modeling", "Automated Policy Q&A"],
    architecture: "RAG Knowledge Base + Workday/HRIS + Internal Agent",
  },
  {
    id: "sales",
    name: "Sales & RevOps",
    icon: ShoppingCart,
    challenges: ["Inconsistent CRM data", "Slow proposal generation", "Unpredictable pipelines"],
    useCases: ["CRM Data Autonomous Agent", "Generative RFP Response", "Deal Risk Scoring"],
    architecture: "Salesforce/HubSpot + Predictive ML + Generative Agent",
  },
  {
    id: "legal",
    name: "Legal & Compliance",
    icon: Shield,
    challenges: ["Contract review bottlenecks", "Regulatory monitoring", "Document discovery"],
    useCases: ["Contract Analysis AI", "Regulatory Drift Detection", "eDiscovery Copilot"],
    architecture: "Secure Private LLM + Vector Store + High-Compliance Gateway",
  },
  {
    id: "supply-chain",
    name: "Supply Chain",
    icon: Truck,
    challenges: ["Inventory stockouts", "Supplier risk", "Logistics delays"],
    useCases: ["Demand Forecasting ML", "Supplier Risk Agent", "Route Optimization"],
    architecture: "Time-Series ML + ERP + Graph Database",
  },
  {
    id: "operations",
    name: "Operations",
    icon: Factory,
    challenges: ["Downtime", "Process inefficiencies", "Quality control"],
    useCases: ["Predictive Maintenance", "Computer Vision QA", "Workflow Automation"],
    architecture: "IoT Edge AI + Computer Vision + Central Orchestration",
  }
];

export function BusinessFunctionMap() {
  const [activeFunc, setActiveFunc] = useState(functions[0].id);

  return (
    <section className="py-24 border-b border-border bg-background">
      <div className="container-wide">
        
        <div className="text-center mb-16">
          <span className="text-[10px] uppercase tracking-widest text-primary-accent font-bold mb-3 block">Departmental Transformation</span>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-6">Business Function Map</h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Explore how AI transforms specific business units. From automated compliance to predictive sales pipelines, discover the architecture for your department.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
          
          {/* Left: Department List */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            {functions.map(func => {
              const isActive = activeFunc === func.id;
              return (
                <button
                  key={func.id}
                  onClick={() => setActiveFunc(func.id)}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border transition-all duration-300 text-left group",
                    isActive 
                      ? "bg-surface-elevated border-primary-accent shadow-elevated" 
                      : "bg-surface border-border hover:border-primary-accent/50"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                      isActive ? "bg-primary-accent/20 text-primary-accent" : "bg-background text-text-muted group-hover:text-text-primary"
                    )}>
                      <func.icon size={18} />
                    </div>
                    <span className={cn("font-space font-bold text-sm", isActive ? "text-text-primary" : "text-text-secondary group-hover:text-text-primary")}>
                      {func.name}
                    </span>
                  </div>
                  {isActive && <ArrowRight size={16} className="text-primary-accent" />}
                </button>
              );
            })}
          </div>

          {/* Right: Department Details */}
          <div className="lg:col-span-8 bg-surface-elevated border border-border rounded-2xl p-8 md:p-12 min-h-[500px]">
            <AnimatePresence mode="wait">
              {functions.map((func) => func.id === activeFunc && (
                <motion.div
                  key={func.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full flex flex-col"
                >
                  
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border">
                    <div className="w-16 h-16 rounded-2xl bg-primary-accent/10 border border-primary-accent/20 flex items-center justify-center text-primary-accent">
                      <func.icon size={28} />
                    </div>
                    <div>
                      <h3 className="text-2xl md:text-3xl font-space font-bold text-text-primary mb-1">{func.name} Intelligence</h3>
                      <p className="text-sm text-text-muted">Departmental AI Transformation</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 flex-1">
                    {/* Challenges */}
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-4 flex items-center gap-2">
                        <Activity size={12} /> Key Business Challenges
                      </h4>
                      <ul className="space-y-3">
                        {func.challenges.map((challenge, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-text-secondary bg-background border border-border p-3 rounded-lg">
                            <span className="text-text-muted font-mono">{i + 1}.</span> {challenge}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Use Cases */}
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary-accent mb-4 flex items-center gap-2">
                        <BrainCircuit size={12} /> AI Interventions
                      </h4>
                      <ul className="space-y-3">
                        {func.useCases.map((uc, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-text-primary bg-primary-accent/5 border border-primary-accent/20 p-3 rounded-lg font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary-accent mt-1.5 shrink-0" /> {uc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Architecture Bottom Bar */}
                  <div className="bg-background border border-border rounded-xl p-6 mt-auto">
                    <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold block mb-2">Reference Architecture Pattern</span>
                    <p className="font-space font-bold text-text-primary text-sm">{func.architecture}</p>
                  </div>

                </motion.div>
              ))}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}
