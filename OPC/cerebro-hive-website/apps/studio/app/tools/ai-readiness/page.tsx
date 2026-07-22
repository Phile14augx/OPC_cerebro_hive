"use client";

import React, { useState } from "react";
import { ArrowRight, ArrowLeft, Download, Brain, Sparkles, RefreshCw, BarChart2 } from "lucide-react";
import { generateAIReadinessPDF } from "../../../lib/pdfReport";

interface DimensionScore {
  name: string;
  score: number;
}

interface Question {
  id: number;
  dimension: "data" | "tech" | "talent" | "process" | "leadership";
  text: string;
  options: { text: string; score: number }[];
}

const QUESTIONS: Question[] = [
  // Data Readiness
  {
    id: 1,
    dimension: "data",
    text: "How is your company's operational data currently stored?",
    options: [
      { text: "Segmented silos (spreadsheets, emails, personal hard drives).", score: 2 },
      { text: "Shared server drives or localized databases.", score: 5 },
      { text: "Modern Data Warehouse (Snowflake, BigQuery) with centralized schemas.", score: 8 },
      { text: "Clean, fully vectorized storage (Pinecone, pgvector) with real-time sync.", score: 10 }
    ]
  },
  {
    id: 2,
    dimension: "data",
    text: "How do you handle unstructured data (PDFs, call logs, customer emails)?",
    options: [
      { text: "We don't process it, or we do it completely manually.", score: 2 },
      { text: "Basic keyword searches or OCR scanner systems.", score: 5 },
      { text: "Automated parsing pipelines into structured tables.", score: 8 },
      { text: "LLM-powered ingestion pipelines feeding semantic directories.", score: 10 }
    ]
  },
  {
    id: 3,
    dimension: "data",
    text: "What is the quality and cataloging status of your organizational metadata?",
    options: [
      { text: "Completely unmapped / non-existent.", score: 2 },
      { text: "Documented on scattered, manually updated spreadsheets.", score: 5 },
      { text: "Centralized data catalog with basic lineage tracking.", score: 8 },
      { text: "Proactive cataloging with automated lineage and quality tooling.", score: 10 }
    ]
  },
  // Technology Infrastructure
  {
    id: 4,
    dimension: "tech",
    text: "What is your primary mode of legacy system integration?",
    options: [
      { text: "Manual copy-paste workflows.", score: 2 },
      { text: "Periodic batch script uploads (FTP/CSV transfers).", score: 5 },
      { text: "Standard REST API endpoints between major applications.", score: 8 },
      { text: "Real-time event streams orchestrated by webhooks (n8n, make).", score: 10 }
    ]
  },
  {
    id: 5,
    dimension: "tech",
    text: "How easily can your team deploy new cloud compute resources?",
    options: [
      { text: "Relies on external contractors and takes several weeks.", score: 2 },
      { text: "Internal IT handles requests manually over a few days.", score: 5 },
      { text: "Automated provisioning in staging/dev environments.", score: 8 },
      { text: "Full CI/CD pipelines with containerized instances.", score: 10 }
    ]
  },
  {
    id: 6,
    dimension: "tech",
    text: "What security safeguards govern external LLM API access?",
    options: [
      { text: "Employees paste sensitive client data into public web-UIs.", score: 2 },
      { text: "Standard software filters but no active audit logging.", score: 5 },
      { text: "API gateways enforcing token rate-limits and static filters.", score: 8 },
      { text: "Private enterprise proxies, PII sanitization, and compliance auditing.", score: 10 }
    ]
  },
  // Talent & Skills
  {
    id: 7,
    dimension: "talent",
    text: "What is the general level of AI literacy among non-technical personnel?",
    options: [
      { text: "Skeptical, confused, or unaware of AI productivity tools.", score: 2 },
      { text: "Occasional usage of basic prompt tools for writing tasks.", score: 5 },
      { text: "Systematic prompt engineering practices and standard assistants.", score: 8 },
      { text: "Department-level champions actively designing prompt workflows.", score: 10 }
    ]
  },
  {
    id: 8,
    dimension: "talent",
    text: "How familiar are your developers with LLM orchestration (LangChain, LangGraph)?",
    options: [
      { text: "No exposure to LLM API programming or AI architectures.", score: 2 },
      { text: "Built basic chatbot scripts using direct model calls.", score: 5 },
      { text: "Deployed RAG systems using vector databases.", score: 8 },
      { text: "Actively building multi-agent graph pipelines.", score: 10 }
    ]
  },
  {
    id: 9,
    dimension: "talent",
    text: "How structured is your onboarding and technical training for new systems?",
    options: [
      { text: "No formal training (learn-on-the-job approach).", score: 2 },
      { text: "Scattered documentation and wiki links.", score: 5 },
      { text: "Internal academy catalog with basic certifications.", score: 8 },
      { text: "Tailored learning paths synchronized with company operations.", score: 10 }
    ]
  },
  // Process Maturity
  {
    id: 10,
    dimension: "process",
    text: "How are business Standard Operating Procedures (SOPs) documented?",
    options: [
      { text: "Undocumented, passed down verbally or through screen shares.", score: 2 },
      { text: "Documented on scattered documents in local storage.", score: 5 },
      { text: "Maintained on a centralized wiki (Notion, Confluence).", score: 8 },
      { text: "Flowcharted processes with step metrics tracking.", score: 10 }
    ]
  },
  {
    id: 11,
    dimension: "process",
    text: "What level of process automation exists in day-to-day operations?",
    options: [
      { text: "Hand-operated tasks for almost all data entry and communication.", score: 2 },
      { text: "Basic spreadsheet macros and isolated cron jobs.", score: 5 },
      { text: "Dedicated RPA software or basic integration triggers.", score: 8 },
      { text: "Autonomous agents handling branching decision paths.", score: 10 }
    ]
  },
  {
    id: 12,
    dimension: "process",
    text: "How do you identify bottlenecks in operational workflows?",
    options: [
      { text: "Guesswork, reactive complaints, or wait-and-see.", score: 2 },
      { text: "Periodic manager reviews and self-reporting.", score: 5 },
      { text: "Automated ticketing queues with monthly reporting.", score: 8 },
      { text: "Continuous event stream mapping and predictive diagnostics.", score: 10 }
    ]
  },
  // Leadership Alignment
  {
    id: 13,
    dimension: "leadership",
    text: "What level of executive sponsorship is backing AI initiatives?",
    options: [
      { text: "Passive awareness or active skepticism.", score: 2 },
      { text: "Dedicated department managers testing minor use cases.", score: 5 },
      { text: "C-Suite budget allocated with specific ROI goals.", score: 8 },
      { text: "AI-First mandate driving operational blueprints.", score: 10 }
    ]
  },
  {
    id: 14,
    dimension: "leadership",
    text: "How does your organization address AI ethics, data compliance, and IP protection?",
    options: [
      { text: "No policy or regulatory roadmap defined.", score: 2 },
      { text: "Standard legal review but no operational policy guidelines.", score: 5 },
      { text: "Written code-of-conduct policy for employees using AI.", score: 8 },
      { text: "Integrated checks, model safety monitors, and compliance board reviews.", score: 10 }
    ]
  },
  {
    id: 15,
    dimension: "leadership",
    text: "How are budget allocations for AI ROI assessed?",
    options: [
      { text: "Viewed purely as a cost, no dedicated budget.", score: 2 },
      { text: "Short-term trial budgets with fuzzy metrics.", score: 5 },
      { text: "Structured pilots with clear cost-saving targets.", score: 8 },
      { text: "Dynamic ROI modeling measuring human-capital velocity.", score: 10 }
    ]
  }
];

function generateReadinessReport(
  leadInfo: { name: string; email: string; company: string },
  overallScore: number,
  maturityDetails: { tier: string; desc: string },
  dimScores: DimensionScore[],
  getRecommendation: (dimName: string, score: number) => string
) {
  return `
=========================================================
          CEREBROHIVE — AI READINESS AUDIT REPORT
=========================================================
Prepared For: ${leadInfo.name}
Company: ${leadInfo.company}
Contact: ${leadInfo.email}
Audit Date: ${new Date().toLocaleDateString()}
Report ID: CH-AUDIT-${Math.floor(100000 + Math.random() * 900000)}

---------------------------------------------------------
OVERALL MATURITY SCORE: ${overallScore}/100
TIER CLASSIFICATION: ${maturityDetails.tier.toUpperCase()}
Description: ${maturityDetails.desc}
---------------------------------------------------------

DIMENSION SCORES:
${dimScores.map((dim) => `* ${dim.name}: ${dim.score}/100`).join("\n")}

---------------------------------------------------------
ACTIONABLE ROADMAP RECOMMENDATIONS:

${dimScores
  .map((dim) => {
    return `[${dim.name.toUpperCase()} - ${dim.score}/100]
Recommendation: ${getRecommendation(dim.name, dim.score)}`;
  })
  .join("\n\n")}

---------------------------------------------------------
TECHNICAL ARCHITECTURE DIRECTIVES:
- Initial focus: Address core bottlenecks in the lowest-scoring categories.
- Target setup: Connect fragmented REST endpoints to n8n workflows.
- Security mandate: Enable private proxies to isolate sensitive corporate intellectual property.

Authorized signature: CerebroHive Technical Audit Team
Verify Authenticity: https://cerebro-hive.com/verify/readiness-${Math.random().toString(36).substring(2, 9)}
=========================================================
  `;
}

export default function AIReadinessPage() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [leadInfo, setLeadInfo] = useState({ name: "", email: "", company: "" });
  const [showGate, setShowGate] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleSelectOption = (qId: number, score: number) => {
    setAnswers(prev => ({ ...prev, [qId]: score }));
    setTimeout(() => {
      if (currentIdx < QUESTIONS.length - 1) {
        setCurrentIdx(currentIdx + 1);
      } else {
        setShowGate(true);
      }
    }, 250);
  };

  const handleBack = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadInfo.name || !leadInfo.email || !leadInfo.company) return;

    setIsSubmitting(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: leadInfo.name,
          email: leadInfo.email,
          company: leadInfo.company,
          type: "ai-readiness",
          score: overallScore,
          inputs: { answers, dimScores }
        })
      });
    } catch (err) {
      console.error("Failed to log AI Readiness lead:", err);
    }
    setIsSubmitting(false);
    setShowGate(false);
    setShowResult(true);
  };

  // Calculate Scores
  const calculateDimensionScores = (): DimensionScore[] => {
    const dimensions: Record<string, { total: number; count: number }> = {
      "Data Readiness": { total: 0, count: 0 },
      "Technology Infra": { total: 0, count: 0 },
      "Talent & Skills": { total: 0, count: 0 },
      "Process Maturity": { total: 0, count: 0 },
      "Leadership Alignment": { total: 0, count: 0 }
    };

    QUESTIONS.forEach((q) => {
      const score = answers[q.id] || 0;
      let dimName = "";
      if (q.dimension === "data") dimName = "Data Readiness";
      else if (q.dimension === "tech") dimName = "Technology Infra";
      else if (q.dimension === "talent") dimName = "Talent & Skills";
      else if (q.dimension === "process") dimName = "Process Maturity";
      else if (q.dimension === "leadership") dimName = "Leadership Alignment";

      if (dimName) {
        dimensions[dimName].total += score;
        dimensions[dimName].count += 1;
      }
    });

    return Object.keys(dimensions).map((key) => {
      const avg = dimensions[key].total / dimensions[key].count;
      // Convert to score out of 100
      return {
        name: key,
        score: Math.round(avg * 10)
      };
    });
  };

  const dimScores = calculateDimensionScores();
  const overallScore = Math.round(dimScores.reduce((acc, curr) => acc + curr.score, 0) / dimScores.length);

  const getMaturityTier = (score: number) => {
    if (score < 40) return { tier: "Ad-Hoc", desc: "Operations are mostly manual. AI is not integrated.", color: "var(--hive-orange)" };
    if (score < 65) return { tier: "Exploring", desc: "Individual tools are used, but no systematic pipeline exists.", color: "var(--amber)" };
    if (score < 85) return { tier: "Systematic", desc: "Centralized data pipelines and basic models deployed.", color: "var(--violet)" };
    return { tier: "AI-Native", desc: "Autonomous workflows and agent models drive daily value.", color: "var(--neural-blue)" };
  };

  const maturityDetails = getMaturityTier(overallScore);

  // SVG Radar Coordinates Calculation
  // Center is (150, 150), Max radius is 90
  const generateRadarPoints = (scores: DimensionScore[]) => {
    const radius = 90;
    const center = 150;
    return scores.map((dim, idx) => {
      const angle = (idx * 2 * Math.PI) / 5 - Math.PI / 2; // Start from top
      const r = (dim.score / 100) * radius;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return { x, y };
    });
  };

  const radarPoints = generateRadarPoints(dimScores);
  const polygonPointsStr = radarPoints.map((p) => `${p.x},${p.y}`).join(" ");

  const getRecommendation = (dimName: string, score: number) => {
    if (score < 50) {
      if (dimName === "Data Readiness") return "Consolidate databases into a unified BigQuery warehouse and implement an n8n ingestion pipeline for documents.";
      if (dimName === "Technology Infra") return "Upgrade API pathways using private proxies and deploy unified workflow triggers (Make or n8n).";
      if (dimName === "Talent & Skills") return "Initiate customized AI literacy bootcamps and prompt engineering courses for team members.";
      if (dimName === "Process Maturity") return "SOP mapping: document manual queues and deploy custom LangGraph routers to automate support or data entries.";
      return "Define corporate compliance frameworks for LLMs and structure budget pilot ROI sheets.";
    }
    if (score < 80) {
      if (dimName === "Data Readiness") return "Introduce vector storage (Pinecone or pgvector) and deploy basic semantic search queries.";
      if (dimName === "Technology Infra") return "Enforce gateway logging filters, automate staging compute deployment, and integrate core CRM webhooks.";
      if (dimName === "Talent & Skills") return "Train developers in advanced RAG frameworks and train department heads to identify automation opportunities.";
      if (dimName === "Process Maturity") return "Deploy semi-autonomous workflows incorporating human-in-the-loop validation nodes.";
      return "Scale C-Suite budgets based on successful RAG pilots and refine compliance guidelines.";
    }
    return "Optimize latency, integrate multiple agent groups, and run continuous cost-efficiency reviews.";
  };

  const handleDownloadReport = () => {
    generateAIReadinessPDF(
      leadInfo,
      overallScore,
      maturityDetails,
      dimScores,
      getRecommendation
    );

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const currentQuestion = QUESTIONS[currentIdx];

  return (
    <>
      {/* Hero Header */}
      <section style={{ paddingTop: "60px", paddingBottom: "50px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(123,97,255,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="container-wide" style={{ position: "relative" }}>
          
          <div className="section-label" style={{ display: "inline-flex", marginBottom: "20px", color: "var(--violet)", background: "rgba(123,97,255,0.06)", borderColor: "rgba(123,97,255,0.2)" }}>
            <Sparkles size={11} style={{ marginRight: "4px" }} /> Diagnostic Assessment
          </div>

          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", marginBottom: "20px" }}>
            AI Readiness <span className="gradient-text-full">Assessment</span>
          </h1>

          <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "1.1rem", color: "var(--text-muted)", maxWidth: "600px", lineHeight: 1.7 }}>
            Measure your organization&apos;s capability across 5 critical dimensions: Data, Infrastructure, Talent, Process, and Leadership.
          </p>
        </div>
      </section>

      {/* Main Diagnostic Body */}
      <section style={{ paddingBottom: "100px" }}>
        <div className="container-wide">
          
          {/* Wizard Assessment Panel */}
          {!showResult && !showGate && (
            <div className="card-glass" style={{ padding: "48px 40px", border: "1px solid rgba(123, 97, 255, 0.15)" }}>
              {/* Progress Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Dimension: <span style={{ color: "var(--text-primary)" }}>{currentQuestion.dimension}</span>
                </span>
                <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Question {currentQuestion.id} of {QUESTIONS.length}
                </span>
              </div>

              {/* Progress Bar */}
              <div style={{ height: "6px", width: "100%", background: "rgba(255,255,255,0.05)", borderRadius: "100px", marginBottom: "40px", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    background: "linear-gradient(90deg, var(--violet), var(--neural-blue))",
                    transition: "width 0.3s ease",
                    width: `${(currentQuestion.id / QUESTIONS.length) * 100}%`
                  }}
                />
              </div>

              {/* Question Text */}
              <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.3rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.4 }}>
                  {currentQuestion.text}
                </h2>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
                  {currentQuestion.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(currentQuestion.id, opt.score)}
                      style={{
                        textAlign: "left",
                        padding: "20px 24px",
                        borderRadius: "12px",
                        border: "1px solid rgba(255,255,255,0.06)",
                        background: "rgba(255,255,255,0.03)",
                        color: "var(--text-muted)",
                        fontFamily: "Exo 2, sans-serif",
                        fontSize: "0.95rem",
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                        e.currentTarget.style.borderColor = "rgba(0, 229, 255, 0.2)";
                        e.currentTarget.style.color = "var(--text-primary)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                        e.currentTarget.style.color = "var(--text-muted)";
                      }}
                    >
                      <span style={{ lineHeight: 1.5 }}>{opt.text}</span>
                      <ArrowRight size={16} style={{ flexShrink: 0, marginLeft: "16px", transition: "transform 0.2s" }} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation Footer */}
              <div style={{ marginTop: "40px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button
                  onClick={handleBack}
                  disabled={currentIdx === 0}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    fontSize: "0.8rem",
                    fontFamily: "Orbitron, sans-serif",
                    fontWeight: 700,
                    cursor: currentIdx === 0 ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: currentIdx === 0 ? "rgba(255,255,255,0.15)" : "var(--text-primary)",
                  }}
                  onMouseEnter={(e) => {
                    if (currentIdx !== 0) e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <ArrowLeft size={14} /> Previous Question
                </button>
                <span style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Progress saved automatically
                </span>
              </div>
            </div>
          )}

          {/* Lead Gate Section */}
          {showGate && (
            <div className="card-glass" style={{ padding: "40px", border: "1px solid rgba(123,97,255,0.15)", maxWidth: "500px", margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: "32px" }}>
                <Brain size={44} color="var(--violet)" style={{ margin: "0 auto 16px auto" }} />
                <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  Unlock Audit Analytics
                </h2>
                <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "12px", lineHeight: 1.6 }}>
                  Your readiness score has been calculated. Enter your details below to unlock the custom diagnostics and visual radar chart metrics dashboard.
                </p>
              </div>

              <form onSubmit={handleLeadSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", fontFamily: "Orbitron, sans-serif", fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Smith"
                    value={leadInfo.name}
                    onChange={(e) => setLeadInfo({ ...leadInfo, name: e.target.value })}
                    style={{
                      padding: "12px 16px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "var(--text-primary)",
                      fontFamily: "Exo 2, sans-serif",
                      fontSize: "0.9rem",
                      outline: "none",
                      width: "100%"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "var(--violet)"}
                    onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontFamily: "Orbitron, sans-serif", fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Work Email</label>
                  <input
                    type="email"
                    required
                    placeholder="jane@company.com"
                    value={leadInfo.email}
                    onChange={(e) => setLeadInfo({ ...leadInfo, email: e.target.value })}
                    style={{
                      padding: "12px 16px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "var(--text-primary)",
                      fontFamily: "Exo 2, sans-serif",
                      fontSize: "0.9rem",
                      outline: "none",
                      width: "100%"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "var(--violet)"}
                    onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontFamily: "Orbitron, sans-serif", fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Vanguard Systems"
                    value={leadInfo.company}
                    onChange={(e) => setLeadInfo({ ...leadInfo, company: e.target.value })}
                    style={{
                      padding: "12px 16px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "var(--text-primary)",
                      fontFamily: "Exo 2, sans-serif",
                      fontSize: "0.9rem",
                      outline: "none",
                      width: "100%"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "var(--violet)"}
                    onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    display: "inline-flex",
                    gap: "6px",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    background: "var(--violet)",
                    borderColor: "var(--violet)",
                    marginTop: "12px"
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.opacity = "0.9";
                      e.currentTarget.style.boxShadow = "0 0 15px rgba(123, 97, 255, 0.4)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {isSubmitting ? "Synthesizing Metrics..." : "View Readiness Dashboard"}
                </button>
              </form>
            </div>
          )}

          {/* Diagnostic Results Dashboard */}
          {showResult && (
            <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
              
              {/* Scorecard Box */}
              <div className="card-glass" style={{ padding: "40px", border: "1px solid rgba(255,255,255,0.08)", position: "relative" }}>
                <div style={{ position: "absolute", top: 0, right: 0, width: "128px", height: "128px", background: "rgba(123,97,255,0.05)", borderRadius: "50%", filter: "blur(40px)", pointerEvents: "none" }} />

                {/* Scorecard Header */}
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "24px", marginBottom: "32px" }}>
                  <div>
                    <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.7rem", fontWeight: 700, color: "var(--violet)", textTransform: "uppercase", letterSpacing: "0.15em" }}>Audit Diagnostics</span>
                    <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>Readiness Scorecard</h2>
                  </div>
                  <button
                    onClick={handleDownloadReport}
                    className="btn-primary"
                    style={{ display: "inline-flex", gap: "6px", cursor: "pointer", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-primary)" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                  >
                    <Download size={14} color="var(--violet)" /> {downloadSuccess ? "Report Downloaded!" : "Download Report"}
                  </button>
                </div>

                {/* Dashboard layout */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "40px", alignItems: "center" }}>
                  
                  {/* Radar Chart */}
                  <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
                    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle, rgba(123,97,255,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />
                    <svg viewBox="0 0 300 300" style={{ width: "100%", maxWidth: "280px", height: "auto", filter: "drop-shadow(0 0 15px rgba(123,97,255,0.15))" }}>
                      
                      {/* Grid concentric rings */}
                      {[20, 40, 60, 80, 100].map((ring, idx) => {
                        const radius = 90;
                        const r = (ring / 100) * radius;
                        const center = 150;
                        const points = Array.from({ length: 5 }).map((_, i) => {
                          const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                          const x = center + r * Math.cos(angle);
                          const y = center + r * Math.sin(angle);
                          return `${x},${y}`;
                        }).join(" ");
                        return (
                          <polygon
                            key={idx}
                            points={points}
                            fill="none"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="1"
                          />
                        );
                      })}

                      {/* Axis lines */}
                      {Array.from({ length: 5 }).map((_, i) => {
                        const radius = 90;
                        const center = 150;
                        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                        const x = center + radius * Math.cos(angle);
                        const y = center + radius * Math.sin(angle);
                        return (
                          <line
                            key={i}
                            x1={center}
                            y1={center}
                            x2={x}
                            y2={y}
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="1"
                          />
                        );
                      })}

                      {/* Labels */}
                      {dimScores.map((dim, i) => {
                        const center = 150;
                        const radius = 108;
                        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                        const x = center + radius * Math.cos(angle);
                        const y = center + radius * Math.sin(angle);
                        
                        let textAnchor: "middle" | "start" | "end" = "middle";
                        if (Math.cos(angle) > 0.1) textAnchor = "start";
                        else if (Math.cos(angle) < -0.1) textAnchor = "end";

                        return (
                          <text
                            key={i}
                            x={x}
                            y={y + 3}
                            fill="var(--text-muted)"
                            fontSize="7"
                            fontWeight="bold"
                            textAnchor={textAnchor}
                            fontFamily="Orbitron"
                            letterSpacing="0.08em"
                          >
                            {dim.name.split(" ")[0]} ({dim.score})
                          </text>
                        );
                      })}

                      {/* Active score area polygon */}
                      <polygon
                        points={polygonPointsStr}
                        fill="rgba(123, 97, 255, 0.15)"
                        stroke="url(#radarGrad)"
                        strokeWidth="2.5"
                      />

                      {/* Nodes vertices */}
                      {radarPoints.map((p, i) => (
                        <g key={i}>
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r="5"
                            fill="var(--neural-blue)"
                            opacity="0.8"
                          />
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r="2"
                            fill="#FFFFFF"
                          />
                        </g>
                      ))}

                      <defs>
                        <linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="var(--violet)" />
                          <stop offset="100%" stopColor="var(--neural-blue)" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  {/* Summary details */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    
                    {/* Score header */}
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,0.02)", border: "2px solid var(--violet)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(123,97,255,0.15)" }}>
                        <span style={{ fontFamily: "var(--font-mono), JetBrains Mono, monospace", fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)" }}>{overallScore}</span>
                      </div>
                      <div>
                        <span style={{ display: "block", fontFamily: "Exo 2, sans-serif", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Overall Maturity</span>
                        <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.15rem", fontWeight: 700, color: maturityDetails.color, marginTop: "2px" }}>
                          {maturityDetails.tier} Tier
                        </h3>
                      </div>
                    </div>

                    <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                      {maturityDetails.desc} Your company is positioned in the <strong style={{ color: "var(--text-primary)" }}>&quot;{maturityDetails.tier}&quot;</strong> tier. Review the customized roadmap breakdown below for operational automation recommendations.
                    </p>

                    {/* Progress details */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {dimScores.map((dim, idx) => (
                        <div key={idx} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "8px", padding: "12px 16px" }}>
                          <span style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>{dim.name}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px" }}>
                            <div style={{ height: "6px", flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: "100px", overflow: "hidden" }}>
                              <div style={{ height: "100%", background: "var(--violet)", width: `${dim.score}%` }} />
                            </div>
                            <span style={{ fontFamily: "var(--font-mono), JetBrains Mono, monospace", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-primary)" }}>{dim.score}%</span>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>

                </div>
              </div>

              {/* Actionable Directives list */}
              <div className="card-glass" style={{ padding: "36px 30px" }}>
                <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <BarChart2 size={18} color="var(--violet)" /> Actionable Strategic Directives
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {dimScores.map((dim, idx) => (
                    <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.02)" }}>
                      <div style={{
                        alignSelf: "flex-start",
                        fontFamily: "Orbitron, sans-serif",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        color: "var(--neural-blue)",
                        background: "rgba(0,229,255,0.08)",
                        border: "1px solid rgba(0,229,255,0.2)",
                        padding: "4px 10px",
                        borderRadius: "4px",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}>
                        {dim.name}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          Maturity Score: {dim.score}/100
                        </span>
                        <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.875rem", color: "var(--text-primary)", lineHeight: 1.6 }}>
                          {getRecommendation(dim.name, dim.score)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Restart Button */}
              <div style={{ textAlign: "center" }}>
                <button
                  onClick={() => {
                    setCurrentIdx(0);
                    setAnswers({});
                    setShowResult(false);
                  }}
                  style={{
                    fontFamily: "Orbitron, sans-serif",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    background: "transparent",
                    border: "none",
                    textDecoration: "underline",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "color 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "var(--violet)"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
                >
                  <RefreshCw size={12} /> Retake Readiness Audit
                </button>
              </div>

            </div>
          )}

        </div>
      </section>
    </>
  );
}
