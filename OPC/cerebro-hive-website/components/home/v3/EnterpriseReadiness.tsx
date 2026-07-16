"use client";

import React from "react";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

const features = [
  "Multi-Region Deployment",
  "Private Cloud & On-Premises",
  "SSO & Directory Sync",
  "Role-Based Access Control (RBAC)",
  "Full Audit Logging",
  "EU AI Act Governance",
  "SOC2 Type II & HIPAA",
  "Deterministic Guardrails"
];

export default function EnterpriseReadiness() {
  return (
    <section className="py-24 border-b border-border bg-background">
      <div className="container-wide">
        <div className="bg-background border border-border rounded-3xl p-12 md:p-16 relative overflow-hidden flex flex-col md:flex-row gap-12 items-center justify-between shadow-2xl">
          
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#00F57A]/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-xl relative z-10 text-center md:text-left">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 mx-auto md:mx-0 border border-border">
              <ShieldCheck size={32} className="text-accent-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-space font-bold text-text-primary mb-4">Enterprise Grade by Default.</h2>
            <p className="text-text-secondary font-inter">
              Consumer AI tools operate in a black box. CerebroHive is built for the Fortune 500, with compliance, security, and governance baked into every layer of the architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10 w-full max-w-2xl">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-border">
                <CheckCircle2 size={16} className="text-accent-primary shrink-0" />
                <span className="text-sm font-bold text-text-primary">{feature}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
