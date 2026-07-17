"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, Network, Server, Cloud, Boxes, ArrowRight, ShieldCheck, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const integrations = [
  {
    id: "sap",
    name: "SAP S/4HANA",
    icon: Database,
    sync: "Real-time Bi-directional",
    connectors: 15,
    modules: ["ERP", "Finance", "Inventory", "Procurement", "HR"],
    status: "Native Support"
  },
  {
    id: "salesforce",
    name: "Salesforce",
    icon: Cloud,
    sync: "Event-driven (Webhooks)",
    connectors: 8,
    modules: ["Sales Cloud", "Service Cloud", "CPQ", "Marketing"],
    status: "Native Support"
  },
  {
    id: "snowflake",
    name: "Snowflake",
    icon: Server,
    sync: "Batch & Streaming",
    connectors: 4,
    modules: ["Data Warehouse", "Data Lake", "Snowpark"],
    status: "Native Support"
  },
  {
    id: "oracle",
    name: "Oracle NetSuite",
    icon: Network,
    sync: "Scheduled Sync",
    connectors: 12,
    modules: ["Financials", "CRM", "SuiteCommerce"],
    status: "Native Support"
  }
];

export const EnterpriseIntegrations = () => {
  const [activeIntegration, setActiveIntegration] = useState(integrations[0].id);
  const activeData = integrations.find(i => i.id === activeIntegration) || integrations[0];

  return (
    <section className="py-24 border-b border-border bg-surface relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute left-0 bottom-0 w-[600px] h-[600px] bg-primary-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container-wide relative z-10">
        
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary-accent mb-3 block">Universal Compatibility</span>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-4">Enterprise Integrations</h2>
          <p className="text-text-secondary max-w-2xl mx-auto font-inter">
            CerebroOS connects directly to your existing systems of record. No ripping and replacing required.
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-8 max-w-6xl mx-auto">
          
          {/* Left: Integration List */}
          <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-3">
            {integrations.map((integration) => {
              const isActive = activeIntegration === integration.id;
              return (
                <button
                  key={integration.id}
                  onClick={() => setActiveIntegration(integration.id)}
                  className={cn(
                    "p-4 rounded-xl border flex items-center justify-between transition-all duration-300 text-left",
                    isActive 
                      ? "bg-surface-elevated border-primary-accent/50 shadow-[0_0_15px_rgba(0,245,122,0.1)]" 
                      : "bg-surface border-border hover:border-border-strong hover:bg-surface-elevated/50"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("p-2 rounded-lg", isActive ? "bg-primary-accent/20 text-primary-accent" : "bg-surface-elevated text-text-muted")}>
                      <integration.icon size={20} />
                    </div>
                    <div>
                      <div className={cn("font-space font-bold", isActive ? "text-text-primary" : "text-text-secondary")}>
                        {integration.name}
                      </div>
                    </div>
                  </div>
                  {isActive && <ArrowRight size={16} className="text-primary-accent" />}
                </button>
              );
            })}
          </div>

          {/* Right: Integration Details Panel */}
          <div className="md:col-span-7 lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIntegration}
                initial={{ opacity: 0.4, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="bg-background border border-border rounded-2xl p-8 h-full shadow-2xl relative overflow-hidden"
              >
                {/* Circuit board accent */}
                <div className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 100% 0%, #00F57A 0%, transparent 70%)` }} />

                <div className="flex flex-col h-full">
                  
                  {/* Header */}
                  <div className="flex items-start justify-between mb-10 pb-6 border-b border-border">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-primary-accent/10 flex items-center justify-center text-primary-accent border border-primary-accent/20">
                        <activeData.icon size={32} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-space font-bold text-text-primary mb-1">{activeData.name} Connector</h3>
                        <div className="flex items-center gap-2 text-xs font-bold text-accent-primary uppercase tracking-widest">
                          <ShieldCheck size={14} /> {activeData.status}
                        </div>
                      </div>
                    </div>
                    
                    <div className="hidden md:flex flex-col items-end">
                      <div className="text-3xl font-space font-bold text-text-primary">{activeData.connectors}</div>
                      <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold">API Endpoints</div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="grid md:grid-cols-2 gap-8 flex-1">
                    
                    <div>
                      <h4 className="text-xs uppercase tracking-widest text-text-muted font-bold mb-4 flex items-center gap-2">
                        <Boxes size={14} /> Supported Modules
                      </h4>
                      <ul className="space-y-3">
                        {activeData.modules.map((mod, i) => (
                          <li key={i} className="flex items-center gap-3 text-sm text-text-primary">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary-accent" /> {mod}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xs uppercase tracking-widest text-text-muted font-bold mb-4 flex items-center gap-2">
                        <Activity size={14} /> Sync Capabilities
                      </h4>
                      <div className="p-4 bg-surface-elevated border border-border rounded-xl mb-6">
                        <div className="text-sm font-space font-bold text-text-primary">{activeData.sync}</div>
                        <div className="text-xs text-text-secondary mt-1">Automatic schema detection and data mapping.</div>
                      </div>

                      <h4 className="text-xs uppercase tracking-widest text-text-muted font-bold mb-4 flex items-center gap-2">
                        <ShieldCheck size={14} /> Security
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-surface-secondary border border-border rounded text-[10px] uppercase font-bold text-text-secondary">OAuth 2.0</span>
                        <span className="px-2 py-1 bg-surface-secondary border border-border rounded text-[10px] uppercase font-bold text-text-secondary">TLS 1.3</span>
                        <span className="px-2 py-1 bg-surface-secondary border border-border rounded text-[10px] uppercase font-bold text-text-secondary">VPC Peering</span>
                      </div>
                    </div>

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
