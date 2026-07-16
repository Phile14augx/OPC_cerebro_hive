"use client";

import React from "react";
import { ShieldCheck, Lock, Eye, Building2, UserCheck, Scale, FileCheck, ShieldAlert, Cpu, Workflow } from "lucide-react";
import { cn } from "@/lib/utils";

const technicalTrust = [
  { label: "Role-Based Access (RBAC)", icon: UserCheck },
  { label: "Single Sign-On (SSO)", icon: Lock },
  { label: "Immutable Audit Logs", icon: FileCheck },
  { label: "End-to-End Encryption", icon: ShieldCheck },
  { label: "API Rate Limiting", icon: Cpu },
  { label: "Real-time Monitoring", icon: Activity }
];

const businessTrust = [
  { label: "Enterprise AI Governance", icon: Building2 },
  { label: "Model Explainability", icon: Eye },
  { label: "Human-in-the-Loop Approval", icon: UserCheck },
  { label: "Regulatory Compliance", icon: Scale },
  { label: "Responsible AI Guardrails", icon: ShieldAlert },
  { label: "Change Management Tools", icon: Workflow }
];

import { Activity } from "lucide-react";

export const EnterpriseTrust = () => {
  return (
    <section className="py-24 border-b border-border bg-surface relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg"><path d="M0 40L40 0H20L0 20M40 40V20L20 40" fill="%2300F57A" fill-opacity="0.05" fill-rule="evenodd"/></svg>')` }} />

      <div className="container-wide relative z-10">
        
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold uppercase tracking-widest text-accent-primary mb-3 block flex justify-center items-center gap-2">
            <ShieldCheck size={14} /> Security First
          </span>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-4">Enterprise Grade by Default</h2>
          <p className="text-text-secondary max-w-2xl mx-auto font-inter">
            We don't compromise on security. CerebroOS provides dual-layer trust, ensuring both technical infrastructure and business processes meet the highest regulatory standards.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Technical Trust */}
          <div className="bg-background border border-[#00E5FF]/20 rounded-2xl p-8 relative overflow-hidden group hover:border-[#00E5FF]/50 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF]/10 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
            
            <h3 className="text-2xl font-space font-bold text-text-primary mb-2">Technical Trust</h3>
            <p className="text-text-secondary text-sm mb-8">Infrastructure security designed for zero-trust environments.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {technicalTrust.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-surface/50 border border-border rounded-xl hover:bg-surface transition-colors">
                  <div className="p-1.5 rounded bg-[#00E5FF]/10 text-accent-secondary">
                    <item.icon size={16} />
                  </div>
                  <span className="text-sm font-medium text-text-primary">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Business Trust */}
          <div className="bg-background border border-[#00F57A]/20 rounded-2xl p-8 relative overflow-hidden group hover:border-[#00F57A]/50 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/10 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
            
            <h3 className="text-2xl font-space font-bold text-text-primary mb-2">Business Trust</h3>
            <p className="text-text-secondary text-sm mb-8">Governance and controls to ensure AI aligns with corporate policy.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {businessTrust.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-surface/50 border border-border rounded-xl hover:bg-surface transition-colors">
                  <div className="p-1.5 rounded bg-accent-primary/10 text-accent-primary">
                    <item.icon size={16} />
                  </div>
                  <span className="text-sm font-medium text-text-primary">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
        
        {/* Deployment Options */}
        <div className="mt-16 text-center border-t border-border pt-16 max-w-4xl mx-auto">
          <h3 className="text-xl font-space font-bold text-text-primary mb-8">Deploy Wherever Your Data Lives</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {["AWS", "Google Cloud", "Microsoft Azure", "Private Cloud", "On-Premise Air-Gapped"].map((env, i) => (
              <span key={i} className="px-5 py-2.5 bg-surface-elevated border border-border rounded-full text-sm font-bold text-text-primary shadow-sm flex items-center gap-2">
                <Cloud size={16} className="text-text-muted" /> {env}
              </span>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

import { Cloud } from "lucide-react";
