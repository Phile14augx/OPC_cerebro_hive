"use client";

import React from "react";
import { AlertCircle, ArrowRight, XCircle, CheckCircle2 } from "lucide-react";

export default function BusinessChallenges() {
  return (
    <section className="py-24 border-b border-white/5 bg-[#0A0D14]">
      <div className="container-wide">
        
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-text-muted font-bold mb-6">
            The Enterprise Reality
          </div>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-white mb-6 leading-tight">
            Data is abundant. <br />
            <span className="text-text-muted">Execution is paralyzed.</span>
          </h2>
          <p className="text-lg text-text-secondary font-inter">
            Enterprises don't need more dashboards or chat interfaces. They need autonomous systems that can reason over private data and execute complex workflows.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* The Problem */}
          <div className="bg-surface border border-white/10 rounded-2xl p-8 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#FFB300]" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#FFB300]/10 flex items-center justify-center text-[#FFB300]">
                <XCircle size={20} />
              </div>
              <h3 className="text-2xl font-space font-bold text-white">Legacy Operations</h3>
            </div>
            
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <AlertCircle size={16} className="text-[#FFB300] mt-0.5 shrink-0" />
                <p className="text-sm text-text-secondary">Knowledge is trapped in disconnected silos (SharePoint, Jira, ERPs).</p>
              </li>
              <li className="flex items-start gap-3">
                <AlertCircle size={16} className="text-[#FFB300] mt-0.5 shrink-0" />
                <p className="text-sm text-text-secondary">Process execution relies entirely on human routing and manual approvals.</p>
              </li>
              <li className="flex items-start gap-3">
                <AlertCircle size={16} className="text-[#FFB300] mt-0.5 shrink-0" />
                <p className="text-sm text-text-secondary">AI initiatives are limited to standalone "copilots" that still require human operation.</p>
              </li>
            </ul>
          </div>

          {/* The Opportunity */}
          <div className="bg-surface border border-white/10 rounded-2xl p-8 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#00E5FF]" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#00E5FF]/10 flex items-center justify-center text-[#00E5FF]">
                <CheckCircle2 size={20} />
              </div>
              <h3 className="text-2xl font-space font-bold text-white">AI-Native Enterprise</h3>
            </div>
            
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <ArrowRight size={16} className="text-[#00E5FF] mt-0.5 shrink-0" />
                <p className="text-sm text-text-secondary">Data is continuously vectorized into a central Enterprise Knowledge Graph.</p>
              </li>
              <li className="flex items-start gap-3">
                <ArrowRight size={16} className="text-[#00E5FF] mt-0.5 shrink-0" />
                <p className="text-sm text-text-secondary">Intelligent agents autonomously plan and execute multi-step ERP workflows.</p>
              </li>
              <li className="flex items-start gap-3">
                <ArrowRight size={16} className="text-[#00E5FF] mt-0.5 shrink-0" />
                <p className="text-sm text-text-secondary">Employees transition from operators to overseers of autonomous systems.</p>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}
