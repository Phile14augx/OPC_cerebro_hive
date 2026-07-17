"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Network, Database, Settings, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const views = [
  {
    id: "business",
    name: "Business Architecture",
    icon: Layers,
    desc: "Alignment between AI capabilities and enterprise value streams.",
    elements: [
      { title: "Strategic Objectives", items: ["Revenue Growth", "Cost Reduction", "Risk Mitigation"] },
      { title: "Business Capabilities", items: ["Autonomous Operations", "Predictive Forecasting", "Hyper-Personalization"] },
      { title: "Value Realization", items: ["KPI Tracking", "ROI Measurement", "Continuous Tuning"] }
    ]
  },
  {
    id: "technical",
    name: "Technical Architecture",
    icon: Network,
    desc: "The cloud-native stack powering the cognitive enterprise.",
    elements: [
      { title: "Foundation Models", items: ["Private LLMs (Azure/AWS)", "Open Source (Llama/Mistral)", "Multi-Modal Models"] },
      { title: "Orchestration Layer", items: ["LangGraph Agents", "Semantic Kernel", "CrewAI Squads"] },
      { title: "Integration", items: ["Enterprise API Gateway", "Event-Driven Pub/Sub", "Real-Time WebSockets"] }
    ]
  },
  {
    id: "data",
    name: "Data Flow",
    icon: Database,
    desc: "Secure, compliant data ingestion and retrieval pipelines.",
    elements: [
      { title: "Ingestion", items: ["Unstructured (PDF, Email)", "Structured (SQL, ERP)", "Streaming (Kafka)"] },
      { title: "Processing & Storage", items: ["Vector Databases (Pinecone/Milvus)", "Graph Databases (Neo4j)", "Data Lakes"] },
      { title: "Security & Privacy", items: ["PII Redaction", "RBAC / Entra ID", "End-to-End Encryption"] }
    ]
  },
  {
    id: "operational",
    name: "Operational Model",
    icon: Settings,
    desc: "How the organization manages, scales, and governs AI.",
    elements: [
      { title: "AI Governance", items: ["Ethics Committee", "Model Bias Testing", "Regulatory Compliance"] },
      { title: "MLOps", items: ["Continuous Integration", "Model Drift Monitoring", "Automated Retraining"] },
      { title: "Change Management", items: ["User Training", "Adoption Metrics", "Feedback Loops"] }
    ]
  }
];

export function EnterpriseArchitecture() {
  const [activeView, setActiveView] = useState(views[0].id);

  return (
    <section className="py-24 border-b border-border bg-background">
      <div className="container-wide">
        
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="text-[10px] uppercase tracking-widest text-primary-accent font-bold mb-3 block">Full-Stack Implementation</span>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-6">Reference Architecture</h2>
          <p className="text-text-secondary text-lg">
            We bridge the gap between executive strategy and engineering execution. Explore the four pillars of our enterprise AI deployments.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          
          {/* Tabs */}
          <div className="lg:col-span-1 flex flex-row lg:flex-col gap-2 overflow-x-auto no-scrollbar pb-4 lg:pb-0">
            {views.map(view => {
              const isActive = activeView === view.id;
              return (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border transition-all text-left whitespace-nowrap min-w-[200px] lg:min-w-0",
                    isActive 
                      ? "bg-surface-elevated border-primary-accent shadow-elevated" 
                      : "bg-surface border-border hover:border-primary-accent/50 text-text-secondary"
                  )}
                >
                  <view.icon size={18} className={isActive ? "text-primary-accent" : "text-text-muted"} />
                  <span className={cn("font-space font-bold text-sm", isActive ? "text-text-primary" : "")}>{view.name}</span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="lg:col-span-3 bg-surface-elevated border border-border rounded-2xl p-8 min-h-[400px]">
            <AnimatePresence mode="wait">
              {views.map(view => view.id === activeView && (
                <motion.div
                  key={view.id}
                  initial={{ opacity: 0.4, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-10 pb-8 border-b border-border">
                    <h3 className="text-2xl font-space font-bold text-text-primary mb-2 flex items-center gap-3">
                      <view.icon className="text-primary-accent" size={24} /> {view.name}
                    </h3>
                    <p className="text-text-secondary">{view.desc}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {view.elements.map((el, i) => (
                      <div key={i} className="bg-background border border-border rounded-xl p-5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary-accent block mb-4">{el.title}</span>
                        <ul className="space-y-3">
                          {el.items.map((item, j) => (
                            <li key={j} className="text-sm text-text-secondary flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-border mt-1.5 shrink-0" /> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 flex justify-end">
                     <button className="text-xs font-bold uppercase tracking-widest text-text-muted hover:text-primary-accent transition-colors flex items-center gap-2">
                       View Detailed Architecture Diagram <ArrowRight size={14} />
                     </button>
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
