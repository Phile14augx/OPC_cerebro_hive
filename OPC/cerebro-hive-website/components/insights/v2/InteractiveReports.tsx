"use client";

import React, { useState } from "react";
import { FileText, Download, BarChart3, ChevronRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const reports = [
  {
    title: "State of Enterprise Agentic AI 2026",
    status: "Latest",
    desc: "An analysis of how Fortune 500 companies are transitioning from copilot interfaces to autonomous multi-agent systems.",
    sections: ["Executive Summary", "Market Landscape", "Architecture Shifts", "ROI Benchmarks"]
  },
  {
    title: "AI Governance & Compliance Handbook",
    status: "Updated",
    desc: "A framework for maintaining regulatory compliance (EU AI Act, HIPAA, SOC2) while scaling generative workflows.",
    sections: ["Executive Summary", "Regulatory Map", "Security Architectures", "Audit Protocols"]
  }
];

export const InteractiveReports = () => {
  const [activeReport, setActiveReport] = useState(reports[0]);
  const [activeSection, setActiveSection] = useState(reports[0].sections[0]);

  return (
    <section className="py-24 border-b border-white/5 bg-[#0A0D14]">
      <div className="container-wide">
        
        <div className="mb-12">
          <h2 className="text-3xl md:text-5xl font-space font-bold text-white mb-4">Interactive Reports</h2>
          <p className="text-text-secondary max-w-2xl font-inter">
            Deep-dive strategic research. Interact with the data directly instead of downloading static PDFs.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {reports.map((report, i) => (
              <div 
                key={i} 
                onClick={() => { setActiveReport(report); setActiveSection(report.sections[0]); }}
                className={cn(
                  "p-5 rounded-xl border transition-all cursor-pointer",
                  activeReport.title === report.title 
                    ? "bg-surface border-white/20 shadow-lg" 
                    : "bg-surface/50 border-white/5 hover:border-white/10"
                )}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="w-8 h-8 rounded bg-[#00E5FF]/10 text-[#00E5FF] flex items-center justify-center">
                    <FileText size={16} />
                  </div>
                  <span className="px-2 py-1 rounded bg-white/5 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                    {report.status}
                  </span>
                </div>
                <h3 className={cn("font-space font-bold mb-2", activeReport.title === report.title ? "text-white" : "text-text-secondary")}>
                  {report.title}
                </h3>
              </div>
            ))}
          </div>

          {/* Interactive Viewer */}
          <div className="lg:col-span-8 bg-surface border border-white/10 rounded-2xl flex flex-col overflow-hidden h-[600px]">
            
            {/* Viewer Header */}
            <div className="p-6 border-b border-white/10 bg-black/40 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-space font-bold text-white">{activeReport.title}</h3>
              </div>
              <button className="flex items-center gap-2 text-xs font-bold text-text-muted hover:text-white transition-colors">
                <Download size={14} /> Download PDF
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Viewer Tabs */}
              <div className="w-48 border-r border-white/10 bg-black/20 p-4 space-y-1 overflow-y-auto">
                {activeReport.sections.map((sec, i) => (
                  <button 
                    key={i}
                    onClick={() => setActiveSection(sec)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded text-xs font-bold transition-colors flex justify-between items-center",
                      activeSection === sec 
                        ? "bg-[#00E5FF]/10 text-[#00E5FF]" 
                        : "text-text-muted hover:text-white hover:bg-white/5"
                    )}
                  >
                    {sec}
                    {activeSection === sec && <ChevronRight size={14} />}
                  </button>
                ))}
              </div>

              {/* Viewer Content */}
              <div className="flex-1 p-8 overflow-y-auto relative bg-[#05070A]">
                
                <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-6 flex items-center gap-2">
                  <BarChart3 size={12} /> {activeSection}
                </div>

                {activeSection === "Executive Summary" ? (
                  <div className="space-y-6">
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {activeReport.desc}
                    </p>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      The transition to AI-native operations requires a fundamental architectural shift. Organizations that attempt to bolt LLMs onto legacy data warehouses are seeing 3x higher failure rates than those implementing vector-first knowledge hubs.
                    </p>
                    <div className="p-5 rounded-xl bg-white/5 border border-white/10 mt-6">
                      <h4 className="text-white font-bold text-sm mb-2">Key Finding</h4>
                      <p className="text-sm text-text-secondary">Agentic workflows are outperforming human-in-the-loop copilot systems by 45% in complex ERP routing tasks.</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <Lock size={32} className="text-text-muted mb-4" />
                    <h4 className="text-white font-bold mb-2">Gated Content</h4>
                    <p className="text-sm text-text-secondary max-w-sm mb-6">
                      Sign in to your Executive Intelligence account to interact with the full dataset and architecture diagrams.
                    </p>
                    <button className="px-6 py-3 bg-white text-black font-space font-bold text-xs uppercase tracking-widest rounded flex items-center gap-2">
                      Sign In to Access
                    </button>
                  </div>
                )}
                
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
