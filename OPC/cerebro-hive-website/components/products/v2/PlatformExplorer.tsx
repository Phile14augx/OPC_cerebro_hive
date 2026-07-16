"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Search, Cog, Database, CheckCircle2, Server, Layers, Building2, TrendingUp, Code2, Network, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const products = [
  { 
    id: "agentos", 
    name: "AgentOS", 
    icon: Cpu, 
    color: "text-accent-secondary", 
    bg: "bg-[#00E5FF]",
    business: {
      headline: "Autonomous Digital Workforce",
      problems: ["Manual repetitive tasks", "High response times", "Siloed decision making"],
      roi: "2.5x Increase in throughput per employee",
      departments: ["Customer Support", "Sales", "HR"],
      kpis: ["Response Time", "Task Resolution Rate", "Cost per Action"]
    },
    technical: {
      architecture: "Multi-agent LLM orchestration layer",
      apis: ["REST", "GraphQL", "gRPC Agent Protocol"],
      models: ["GPT-4o", "Claude 3.5 Sonnet", "Llama 3"],
      integrations: ["Slack", "Salesforce", "Zendesk", "ServiceNow"],
      deployment: "Docker, Kubernetes, AWS Fargate"
    }
  },
  { 
    id: "knowledge", 
    name: "Knowledge Hub", 
    icon: Search, 
    color: "text-accent-primary", 
    bg: "bg-accent-primary",
    business: {
      headline: "Enterprise Intelligence Foundation",
      problems: ["Lost organizational knowledge", "Time spent searching", "Inconsistent answers"],
      roi: "Save 8 hours per employee per week",
      departments: ["Legal", "Engineering", "Operations"],
      kpis: ["Search Accuracy", "Time to Find", "Document Utility"]
    },
    technical: {
      architecture: "Vector DB + Graph DB Hybrid RAG",
      apis: ["Semantic Search API", "Document Ingestion Webhooks"],
      models: ["Pinecone", "Neo4j", "Cohere Embeddings"],
      integrations: ["SharePoint", "Confluence", "Google Drive", "Jira"],
      deployment: "Managed SaaS, VPC Peering, On-Premise"
    }
  },
  { 
    id: "automation", 
    name: "Automation Studio", 
    icon: Cog, 
    color: "text-primary-accent", 
    bg: "bg-primary-accent",
    business: {
      headline: "AI-Powered Workflow Engine",
      problems: ["Broken processes", "Legacy system limitations", "Human bottlenecking"],
      roi: "Automate 70% of standard operating procedures",
      departments: ["IT", "Finance", "Supply Chain"],
      kpis: ["Process Velocity", "Error Reduction", "SLA Adherence"]
    },
    technical: {
      architecture: "Event-driven microservices pipeline",
      apis: ["Webhook Triggers", "Custom Connectors SDK"],
      models: ["Temporal.io", "Kafka", "Redis"],
      integrations: ["SAP", "Workday", "Stripe", "HubSpot"],
      deployment: "AWS Step Functions, Azure Logic Apps equivalent"
    }
  },
  { 
    id: "erp", 
    name: "Quantiva ERP", 
    icon: Database, 
    color: "text-warning", 
    bg: "bg-[#FFB300]",
    business: {
      headline: "Next-Gen System of Record",
      problems: ["Outdated legacy ERPs", "Data fragmentation", "Poor forecasting"],
      roi: "Real-time global financial visibility",
      departments: ["Finance", "Procurement", "C-Suite"],
      kpis: ["Close Time", "Inventory Turnover", "Cash Flow Predictability"]
    },
    technical: {
      architecture: "Distributed AC/ID compliant ledger with AI overlay",
      apis: ["Financial Reporting API", "Supply Chain EDI"],
      models: ["PostgreSQL", "ClickHouse", "TimescaleDB"],
      integrations: ["Banks", "Logistics Providers", "Tax Authorities"],
      deployment: "Multi-region Active-Active, Dedicated Cloud"
    }
  }
];

export const PlatformExplorer = () => {
  const [activeTab, setActiveTab] = useState(products[0].id);
  const [viewMode, setViewMode] = useState<"business" | "technical">("business");

  const activeProduct = products.find(p => p.id === activeTab) || products[0];

  return (
    <section className="py-24 border-b border-border bg-background relative">
      <div className="container-wide">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary-accent mb-3 block">Product Explorer</span>
            <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-4">Deep Dive Capabilities</h2>
            <p className="text-text-secondary max-w-xl font-inter">
              Explore the individual products that power the CerebroOS ecosystem. Switch views to see business value or technical implementation.
            </p>
          </div>
          
          {/* View Toggle */}
          <div className="flex bg-surface-elevated border border-border rounded-lg p-1">
            <button 
              onClick={() => setViewMode("business")}
              className={cn("px-4 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2", viewMode === "business" ? "bg-primary-accent text-black" : "text-text-muted hover:text-white")}
            >
              <Building2 size={14} /> Business View
            </button>
            <button 
              onClick={() => setViewMode("technical")}
              className={cn("px-4 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2", viewMode === "technical" ? "bg-white text-black" : "text-text-muted hover:text-white")}
            >
              <Code2 size={14} /> Technical View
            </button>
          </div>
        </div>

        {/* Product Navigation */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 mb-10 pb-2">
          {products.map((p) => {
            const isActive = activeTab === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActiveTab(p.id)}
                className={cn(
                  "px-6 py-4 rounded-xl flex items-center gap-3 transition-all border whitespace-nowrap",
                  isActive ? "bg-surface-elevated border-border shadow-lg" : "bg-transparent border-transparent text-text-muted hover:bg-surface hover:text-white"
                )}
              >
                <p.icon size={18} className={isActive ? p.color : "text-text-muted"} />
                <span className={cn("font-space font-bold", isActive ? "text-text-primary" : "")}>{p.name}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Content Area */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden min-h-[500px] relative flex flex-col md:flex-row">
          
          <AnimatePresence mode="wait">
            <motion.div 
              key={`${activeTab}-${viewMode}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 p-8 md:p-12"
            >
              {viewMode === "business" ? (
                // Business View
                <div className="h-full flex flex-col">
                  <div className="mb-10">
                    <h3 className="text-3xl font-space font-bold text-text-primary mb-2">{activeProduct.business.headline}</h3>
                    <p className="text-primary-accent font-space font-bold text-lg">{activeProduct.business.roi}</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-10 flex-1">
                    <div>
                      <h4 className="text-xs uppercase tracking-widest text-text-muted font-bold mb-4 flex items-center gap-2"><TrendingUp size={14} /> Problems Solved</h4>
                      <ul className="space-y-3">
                        {activeProduct.business.problems.map((prob, i) => (
                          <li key={i} className="flex items-start gap-3 text-text-secondary text-sm">
                            <CheckCircle2 size={16} className="text-accent-primary mt-0.5 shrink-0" /> {prob}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs uppercase tracking-widest text-text-muted font-bold mb-4 flex items-center gap-2"><Building2 size={14} /> Key Departments</h4>
                      <div className="flex flex-wrap gap-2 mb-8">
                        {activeProduct.business.departments.map((dept, i) => (
                          <span key={i} className="px-3 py-1 bg-white/5 border border-border rounded-full text-xs font-bold text-text-primary">{dept}</span>
                        ))}
                      </div>
                      
                      <h4 className="text-xs uppercase tracking-widest text-text-muted font-bold mb-4">Core KPIs</h4>
                      <div className="space-y-2">
                        {activeProduct.business.kpis.map((kpi, i) => (
                          <div key={i} className="w-full bg-black/30 rounded-lg p-3 border border-border text-sm font-space font-medium text-text-primary flex justify-between items-center">
                            {kpi} <TrendingUp size={14} className="text-primary-accent" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Technical View
                <div className="h-full flex flex-col">
                  <div className="mb-10">
                    <h3 className="text-2xl font-space font-bold text-text-primary mb-2 font-mono flex items-center gap-3">
                      <Server className={activeProduct.color} /> {activeProduct.technical.architecture}
                    </h3>
                    <p className="text-text-secondary text-sm">Enterprise-grade architecture built for massive scale and compliance.</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-10 flex-1">
                    <div>
                      <h4 className="text-xs uppercase tracking-widest text-text-muted font-bold mb-4 flex items-center gap-2"><Code2 size={14} /> API & Interfaces</h4>
                      <div className="flex flex-wrap gap-2 mb-8">
                        {activeProduct.technical.apis.map((api, i) => (
                          <span key={i} className="px-3 py-1 bg-surface-elevated border border-border rounded text-xs font-mono text-primary-accent">{api}</span>
                        ))}
                      </div>

                      <h4 className="text-xs uppercase tracking-widest text-text-muted font-bold mb-4 flex items-center gap-2"><Network size={14} /> Integrations</h4>
                      <div className="flex flex-wrap gap-2">
                        {activeProduct.technical.integrations.map((int, i) => (
                          <span key={i} className="px-3 py-1 bg-white/5 border border-border rounded text-xs font-bold text-text-primary">{int}</span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-xs uppercase tracking-widest text-text-muted font-bold mb-4 flex items-center gap-2"><Layers size={14} /> Supported Models / Tech</h4>
                      <ul className="space-y-2 mb-8">
                        {activeProduct.technical.models.map((model, i) => (
                          <li key={i} className="flex items-center gap-3 text-text-primary text-sm bg-black/20 p-2 rounded border border-border font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-accent" /> {model}
                          </li>
                        ))}
                      </ul>

                      <h4 className="text-xs uppercase tracking-widest text-text-muted font-bold mb-4 flex items-center gap-2"><ShieldCheck size={14} /> Deployment Options</h4>
                      <div className="p-4 bg-primary-accent/5 border border-primary-accent/20 rounded-lg text-sm text-primary-accent font-medium">
                        {activeProduct.technical.deployment}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Right side visual (abstract representation of the product) */}
          <div className="w-full md:w-1/3 bg-background border-t md:border-t-0 md:border-l border-border relative overflow-hidden flex items-center justify-center min-h-[250px]">
            <motion.div 
              key={activeTab}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative w-48 h-48"
            >
              {/* Product specific abstract animation */}
              <div className={cn("absolute inset-0 rounded-full blur-[60px] opacity-20", activeProduct.bg)} />
              
              <div className="absolute inset-0 flex items-center justify-center">
                <activeProduct.icon size={64} className={activeProduct.color} />
              </div>
              
              <motion.div 
                className={cn("absolute inset-0 rounded-full border border-dashed", activeProduct.color.replace("text-", "border-"))}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              <motion.div 
                className={cn("absolute -inset-4 rounded-full border border-dotted opacity-50", activeProduct.color.replace("text-", "border-"))}
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>

        </div>

      </div>
    </section>
  );
};
