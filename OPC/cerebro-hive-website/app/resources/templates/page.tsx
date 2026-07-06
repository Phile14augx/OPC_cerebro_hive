"use client";

import React, { useState } from "react";
import { Sparkles, FileText, CheckSquare, List, Bookmark, Users, HelpCircle, Download } from "lucide-react";
import GatedDownloadModal from "@/components/resources/GatedDownloadModal";

interface TemplateItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  fileContent: string;
  fileName: string;
}

const TEMPLATES: TemplateItem[] = [
  {
    id: "strategy",
    title: "AI Strategy Template",
    description: "A comprehensive Word/PDF structure to map corporate AI objectives, business alignment, and 90-day execution milestones.",
    icon: FileText,
    fileName: "CerebroHive_AI_Strategy_Template.txt",
    fileContent: `
=========================================================
          CEREBROHIVE — CORPORATE AI STRATEGY TEMPLATE
=========================================================

1. EXECUTIVE SUMMARY & BUSINESS CONTEXT
   - Define organizational vision for AI transformation.
   - Map key objectives (efficiency, cost reduction, client satisfaction).

2. OPERATIONAL AUDIT & BOTTLENECK IDENTIFICATION
   - Document manual queues, ticket backlogs, and data entry silos.
   - List key applications to connect (CRM, ERP, DBs).

3. 90-DAY TRANSFORMATION ROADMAP
   - Phase 1 (Days 1-30): Ingest databases, setup n8n orchestrations.
   - Phase 2 (Days 31-60): Deploy custom RAG nodes and Slack routing assistants.
   - Phase 3 (Days 61-90): Team up-skilling bootcamps & certification audits.

4. BUDGET & ROI FORECAST
   - Initial pilot budgets vs projected full-scale operational savings.
=========================================================
    `
  },
  {
    id: "readiness",
    title: "AI Readiness Assessment Worksheet",
    description: "Scoring metrics and audit questions evaluating organizational readiness across infrastructure, data structures, and leadership alignment.",
    icon: HelpCircle,
    fileName: "CerebroHive_AI_Readiness_Worksheet.txt",
    fileContent: `
=========================================================
          CEREBROHIVE — AI READINESS WORKSHEET
=========================================================

Audit your company by scoring 1 (Low) to 5 (High) on:
1. DATA STRUCTURES:
   [ ] Silos only (1)
   [ ] Shared drives (3)
   [ ] central warehouse (5)

2. API GATEWAYS:
   [ ] Manual work (1)
   [ ] Standard endpoints (3)
   [ ] Event webhooks (5)

3. TALENT CAPABILITY:
   [ ] Unaware of AI (1)
   [ ] Basic prompt users (3)
   [ ] Custom agent builders (5)

Total scores below 10 need foundational assessments before building pipelines.
=========================================================
    `
  },
  {
    id: "prompt-lib",
    title: "Executive Business Prompt Library",
    description: "Over 100+ production-vetted system prompts for operations, outbound marketing sequences, ticket parsing, and CRM data mappings.",
    icon: Bookmark,
    fileName: "CerebroHive_Executive_Prompt_Library.txt",
    fileContent: `
=========================================================
          CEREBROHIVE — EXECUTIVE PROMPT LIBRARY
=========================================================

1. REVENUE OUTBOUND PROMPT:
   "You are an expert SDR. Analyze the following lead profile and draft a short, 3-sentence personalized introductory pitch emphasizing their main logistics bottlenecks..."

2. CLASSIFICATION PROMPT:
   "You are a triage model. Categorize the shipping support email below into 'Tracking', 'Invoice Dispute', 'Onboarding', or 'Emergency'..."

3. DATA SYNTHESIS PROMPT:
   "Parse the unstructured ledger lines below, extract transaction date, account name, and total debit amount, and return in a strict JSON array..."
=========================================================
    `
  },
  {
    id: "workflow",
    title: "Automation Workflow Checklist",
    description: "Detailed flowchart mapping steps, API authentications, backup fail-safes, and testing checklists for deploying n8n/LangGraph agents.",
    icon: CheckSquare,
    fileName: "CerebroHive_Automation_Workflow_Checklist.txt",
    fileContent: `
=========================================================
          CEREBROHIVE — AUTOMATION PIPELINE CHECKLIST
=========================================================

[ ] Validate OAuth token rate-limits for CRM applications.
[ ] Define error routing nodes in n8n pipelines (failover triggers).
[ ] Map human-in-the-loop Slack validation nodes for client approvals.
[ ] Enforce API proxy proxies isolating database keys.
[ ] Implement rate-limiting loops for LLM API triggers.
[ ] Deploy backup cache systems to prevent data loss on API disconnects.
=========================================================
    `
  },
  {
    id: "playbook",
    title: "Enterprise AI Playbook (Abbreviated)",
    description: "Operational guidelines for setting up an internal AI Center of Excellence, securing proxy gates, and auditing employee token logs.",
    icon: Users,
    fileName: "CerebroHive_Enterprise_AI_Playbook.txt",
    fileContent: `
=========================================================
          CEREBROHIVE — ENTERPRISE AI PLAYBOOK
=========================================================

1. ESTABLISHING COOPERATIVE SECURITY GATEWAYS
   - Direct all employee LLM calls through a central, PII-sanitized gateway.
   - Maintain active log records auditing API payload content.

2. COHORT-BASED TRAINING PATHS
   - Standardize certificate assessments across development teams.
   - Enforce developer certification standards before project commits.
=========================================================
    `
  },
  {
    id: "matrix",
    title: "AI Vendor Evaluation Matrix",
    description: "A structured spreadsheet checklist assessing vendor compliance, pricing structures, API latencies, and service level agreements (SLAs).",
    icon: List,
    fileName: "CerebroHive_AI_Vendor_Matrix.txt",
    fileContent: `
=========================================================
          CEREBROHIVE — AI VENDOR EVALUATION MATRIX
=========================================================

Checklist criteria to score prospective AI models:
- LATENCY BUDGET: Average response times < 2.5 seconds (Yes/No)
- DATA RETENTION: Zero data training clauses in SLA (Yes/No)
- TOKEN RATINGS: Access to long-context model windows (Yes/No)
- API SECURE GATEWAYS: Compliance with ISO/SOC2 standards (Yes/No)
=========================================================
    `
  }
];

export default function TemplatesPage() {
  const [activeTemplate, setActiveTemplate] = useState<TemplateItem | null>(null);

  const handleDownloadSuccess = () => {
    if (!activeTemplate) return;

    const blob = new Blob([activeTemplate.fileContent.trim()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = activeTemplate.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setActiveTemplate(null);
  };

  return (
    <>
      {/* Hero Section */}
      <section style={{ paddingTop: "140px", paddingBottom: "50px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(0,229,255,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="container-wide" style={{ position: "relative" }}>
          
          <div className="section-label" style={{ display: "inline-flex", marginBottom: "20px" }}>
            <Sparkles size={11} style={{ marginRight: "4px" }} /> Reusable Assets
          </div>
          
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", marginBottom: "20px" }}>
            Resource <span className="gradient-text-full">Templates</span>
          </h1>
          
          <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "1.1rem", color: "var(--text-muted)", maxWidth: "600px", lineHeight: 1.7 }}>
            Download free checklists, worksheets, and strategic playbooks to streamline your team&apos;s AI initiatives.
          </p>
        </div>
      </section>

      {/* Templates Grid Section */}
      <section style={{ paddingBottom: "100px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
            {TEMPLATES.map((tmpl) => {
              const Icon = tmpl.icon;
              return (
                <div key={tmpl.id} className="card-glass" style={{ padding: "36px 30px", display: "flex", flexDirection: "column", height: "100%" }}>
                  <div>
                    {/* Icon Box */}
                    <div style={{ width: 44, height: 44, borderRadius: "10px", background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--neural-blue)", marginBottom: "24px" }}>
                      <Icon size={20} />
                    </div>

                    {/* Title */}
                    <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px", lineHeight: 1.4 }}>
                      {tmpl.title}
                    </h3>

                    {/* Description */}
                    <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "28px" }}>
                      {tmpl.description}
                    </p>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => setActiveTemplate(tmpl)}
                    className="btn-primary"
                    style={{ width: "100%", justifyContent: "center", display: "inline-flex", gap: "6px", cursor: "pointer", marginTop: "auto" }}
                  >
                    <Download size={14} /> Download Template
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gated Modal Trigger */}
      {activeTemplate && (
        <GatedDownloadModal
          title={activeTemplate.title}
          onClose={() => setActiveTemplate(null)}
          onSuccess={handleDownloadSuccess}
        />
      )}
    </>
  );
}
