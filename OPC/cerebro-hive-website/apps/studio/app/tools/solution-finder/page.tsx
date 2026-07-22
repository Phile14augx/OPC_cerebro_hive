"use client";

import React, { useState } from "react";
import { ArrowRight, ArrowLeft, Download, Calendar, CheckCircle, Brain, Sparkles, Network, Settings, BookOpen } from "lucide-react";
import { generateSolutionFinderPDF } from "../../../lib/pdfReport";

interface LeadData {
  name: string;
  email: string;
  company: string;
}

function generateRoadmapReport(
  leadInfo: { name: string; email: string; company: string },
  industry: string,
  teamSize: string,
  goals: string[],
  maturity: string,
  budget: string
) {
  return `
=========================================================
      CEREBROHIVE — CUSTOM AI TRANSFORMATION ROADMAP
=========================================================
Prepared For: ${leadInfo.name}
Company: ${leadInfo.company}
Contact: ${leadInfo.email}
Date: ${new Date().toLocaleDateString()}
Report ID: CH-ROADMAP-${Math.floor(100000 + Math.random() * 900000)}

---------------------------------------------------------
BUSINESS DIAGNOSTIC INPUTS:
- Industry: ${industry}
- Team Size: ${teamSize}
- Primary AI Goals: ${goals.join(", ")}
- Current AI Maturity: ${maturity}
- Target Budget: ${budget}
---------------------------------------------------------

STRATEGIC RECOMMENDATIONS:

1. PRIMARY ENGAGEMENT MODEL:
   ${budget === "$50,000+/mo" || budget === "$20,000-$50,000/mo" 
     ? "👉 Enterprise AI Consulting & Governance Program" 
     : "👉 Specialized AI Automation & Integration Sprint"}
   Based on your budget of ${budget} and maturity level ("${maturity}"), we recommend initiating a phased transformation path focusing on governance before deploying custom autonomous agent systems.

2. TARGET SOLUTIONS TO IMPLEMENT:
   ${goals.map(g => `   - [Solution] ${g} Agent (Core Engine)`).join("\n")}
   We will deploy customized, LLM-powered nodes communicating via LangGraph to address these operational focus areas.

3. ACADEMY UP-SKILLING PATHWAY:
   - Recommended Path: ${
     goals.includes("Customer Support") || goals.includes("Knowledge Synthesis")
       ? "AI Solutions Architect"
       : "AI Engineer"
   } Program
   - Key Cohort Course: Building AI Agents with LangChain & Multi-Agent Frameworks.

---------------------------------------------------------
NEXT ACTION STEP:
Book your 1-on-1 Executive Strategy session with CerebroHive Solutions Architects to map these technical parameters to a deployment contract.
Verification Code: CH-VERIFIED-HASH-${Math.random().toString(36).substring(2, 9).toUpperCase()}
=========================================================
  `;
}

export default function SolutionFinderPage() {
  const [step, setStep] = useState(1);
  const [industry, setIndustry] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [maturity, setMaturity] = useState("");
  const [budget, setBudget] = useState("");
  const [leadInfo, setLeadInfo] = useState<LeadData>({ name: "", email: "", company: "" });
  const [showGate, setShowGate] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [bookedMeeting, setBookedMeeting] = useState(false);

  const toggleGoal = (goal: string) => {
    if (goals.includes(goal)) {
      setGoals(goals.filter((g) => g !== goal));
    } else if (goals.length < 3) {
      setGoals([...goals, goal]);
    }
  };

  const nextStep = () => {
    if (step === 1 && !industry) return;
    if (step === 2 && !teamSize) return;
    if (step === 3 && goals.length === 0) return;
    if (step === 4 && !maturity) return;
    if (step === 5 && !budget) return;

    if (step < 5) {
      setStep(step + 1);
    } else {
      setShowGate(true);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
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
          type: "solution-finder",
          inputs: { industry, teamSize, goals, maturity, budget }
        })
      });
    } catch (err) {
      console.error("Failed to log Solution Finder lead:", err);
    }
    setIsSubmitting(false);
    setShowGate(false);
    setShowReport(true);
  };

  const handleDownloadReport = () => {
    generateSolutionFinderPDF(
      leadInfo,
      industry,
      teamSize,
      goals,
      maturity,
      budget
    );
    
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleBookMeeting = () => {
    setBookedMeeting(true);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)", paddingTop: "40px", paddingBottom: "100px", position: "relative", overflow: "hidden" }}>
      {/* Decorative Grid Layer */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "25%", left: "25%", width: "400px", height: "400px", backgroundColor: "rgba(0, 229, 255, 0.04)", borderRadius: "50%", filter: "blur(120px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "25%", right: "25%", width: "400px", height: "400px", backgroundColor: "rgba(123, 97, 255, 0.04)", borderRadius: "50%", filter: "blur(120px)", pointerEvents: "none" }} />

      <div className="container-wide" style={{ maxWidth: "800px", position: "relative", zIndex: 10 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div className="section-label" style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
            <Sparkles size={11} /> Interactive AI Diagnostician
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, marginBottom: "16px" }}>
            AI Solution <span className="gradient-text-full">Recommender</span>
          </h1>
          <p style={{ fontSize: "1.05rem", color: "var(--text-muted)", lineHeight: 1.6, maxWidth: "600px", margin: "0 auto", fontFamily: "var(--font-exo), sans-serif" }}>
            Answer a few quick questions to receive a tailored AI integration roadmap and training program for your business.
          </p>
        </div>

        {/* Wizard Panel */}
        {!showReport && !showGate && (
          <div className="card-glass" style={{ padding: "40px", borderRadius: "16px" }}>
            {/* Progress Bar */}
            <div style={{ marginBottom: "36px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
                <span>Step {step} of 5</span>
                <span>{Math.round(((step - 1) / 4) * 100)}% Complete</span>
              </div>
              <div style={{ height: "6px", width: "100%", backgroundColor: "rgba(255, 255, 255, 0.05)", borderRadius: "100px", overflow: "hidden" }}>
                <div
                  style={{ height: "100%", background: "linear-gradient(90deg, var(--neural-blue), var(--violet))", width: `${(step / 5) * 100}%`, transition: "width 0.3s ease" }}
                />
              </div>
            </div>

            {/* Step 1: Industry */}
            {step === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <h2 style={{ fontSize: "1.25rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700, color: "var(--text-primary)" }}>What is your primary industry vertical?</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                  {["Technology & SaaS", "Healthcare & Biotech", "Finance & Insurance", "Retail & E-commerce", "Logistics & Supply Chain", "Professional Services", "Manufacturing", "Other"].map((ind) => {
                    const isSelected = industry === ind;
                    return (
                      <button
                        key={ind}
                        onClick={() => setIndustry(ind)}
                        style={{
                          textAlign: "left",
                          padding: "16px 20px",
                          borderRadius: "10px",
                          cursor: "pointer",
                          fontFamily: "var(--font-exo), sans-serif",
                          fontWeight: 600,
                          fontSize: "0.95rem",
                          transition: "all 0.2s ease",
                          background: isSelected ? "rgba(0, 229, 255, 0.08)" : "rgba(255, 255, 255, 0.03)",
                          border: isSelected ? "1px solid var(--neural-blue)" : "1px solid rgba(255, 255, 255, 0.06)",
                          boxShadow: isSelected ? "0 0 15px rgba(0, 229, 255, 0.15)" : "none",
                          color: isSelected ? "var(--text-primary)" : "var(--text-muted)"
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.06)";
                            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.03)";
                          }
                        }}
                      >
                        {ind}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Team Size */}
            {step === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <h2 style={{ fontSize: "1.25rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700, color: "var(--text-primary)" }}>How many employees are in your organization?</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                  {["1 - 10 employees", "11 - 50 employees", "51 - 200 employees", "201 - 1,000 employees", "1,000+ employees"].map((size) => {
                    const isSelected = teamSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => setTeamSize(size)}
                        style={{
                          textAlign: "left",
                          padding: "16px 20px",
                          borderRadius: "10px",
                          cursor: "pointer",
                          fontFamily: "var(--font-exo), sans-serif",
                          fontWeight: 600,
                          fontSize: "0.95rem",
                          transition: "all 0.2s ease",
                          background: isSelected ? "rgba(0, 229, 255, 0.08)" : "rgba(255, 255, 255, 0.03)",
                          border: isSelected ? "1px solid var(--neural-blue)" : "1px solid rgba(255, 255, 255, 0.06)",
                          boxShadow: isSelected ? "0 0 15px rgba(0, 229, 255, 0.15)" : "none",
                          color: isSelected ? "var(--text-primary)" : "var(--text-muted)"
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.06)";
                            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.03)";
                          }
                        }}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Goals */}
            {step === 3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h2 style={{ fontSize: "1.25rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700, color: "var(--text-primary)" }}>What are your primary goals?</h2>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 600 }}>Select up to 3</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                  {[
                    "Customer Support Automation",
                    "Sales Outbound & CRM Enrichment",
                    "Marketing Content Generation",
                    "Knowledge Synthesis & Retrieval",
                    "HR Recruitment & Onboarding",
                    "Invoice Auditing & Ledger Matching",
                    "ERP Supply Chain & Operations"
                  ].map((goal) => {
                    const isSelected = goals.includes(goal);
                    const isMax = goals.length >= 3;
                    return (
                      <button
                        key={goal}
                        disabled={!isSelected && isMax}
                        onClick={() => toggleGoal(goal)}
                        style={{
                          textAlign: "left",
                          padding: "16px 20px",
                          borderRadius: "10px",
                          fontFamily: "var(--font-exo), sans-serif",
                          fontWeight: 600,
                          fontSize: "0.95rem",
                          transition: "all 0.2s ease",
                          cursor: !isSelected && isMax ? "not-allowed" : "pointer",
                          opacity: !isSelected && isMax ? 0.3 : 1,
                          background: isSelected ? "rgba(123, 97, 255, 0.08)" : "rgba(255, 255, 255, 0.03)",
                          border: isSelected ? "1px solid var(--violet)" : "1px solid rgba(255, 255, 255, 0.06)",
                          boxShadow: isSelected ? "0 0 15px rgba(123, 97, 255, 0.15)" : "none",
                          color: isSelected ? "var(--text-primary)" : "var(--text-muted)"
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected && !isMax) {
                            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected && !isMax) {
                            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.06)";
                            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.03)";
                          }
                        }}
                      >
                        {goal}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 4: AI Maturity */}
            {step === 4 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <h2 style={{ fontSize: "1.25rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700, color: "var(--text-primary)" }}>Describe your current AI maturity level</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
                  {[
                    { title: "Ad-Hoc (None)", desc: "We have not yet rolled out any core AI tools or custom systems." },
                    { title: "Exploring", desc: "Our employees use tools like ChatGPT, but no centralized integrations exist." },
                    { title: "Systematic", desc: "We have built initial custom scripts or RAG tools in specific operations." },
                    { title: "AI-Native / Scaling", desc: "AI is embedded into key operations and we are building custom agent pipelines." }
                  ].map((item) => {
                    const isSelected = maturity === item.title;
                    return (
                      <button
                        key={item.title}
                        onClick={() => setMaturity(item.title)}
                        style={{
                          textAlign: "left",
                          padding: "20px",
                          borderRadius: "10px",
                          cursor: "pointer",
                          fontFamily: "var(--font-exo), sans-serif",
                          transition: "all 0.2s ease",
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                          background: isSelected ? "rgba(0, 229, 255, 0.08)" : "rgba(255, 255, 255, 0.03)",
                          border: isSelected ? "1px solid var(--neural-blue)" : "1px solid rgba(255, 255, 255, 0.06)",
                          boxShadow: isSelected ? "0 0 15px rgba(0, 229, 255, 0.15)" : "none"
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.06)";
                            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.03)";
                          }
                        }}
                      >
                        <span style={{ fontWeight: 700, fontSize: "1rem", color: isSelected ? "var(--neural-blue)" : "var(--text-primary)" }}>{item.title}</span>
                        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.4 }}>{item.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 5: Budget */}
            {step === 5 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <h2 style={{ fontSize: "1.25rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700, color: "var(--text-primary)" }}>What is your monthly allocation/budget target for AI?</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                  {["<$5,000/mo", "$5,000 - $20,000/mo", "$20,000 - $50,000/mo", "$50,000+/mo"].map((range) => {
                    const isSelected = budget === range;
                    return (
                      <button
                        key={range}
                        onClick={() => setBudget(range)}
                        style={{
                          textAlign: "left",
                          padding: "16px 20px",
                          borderRadius: "10px",
                          cursor: "pointer",
                          fontFamily: "var(--font-exo), sans-serif",
                          fontWeight: 600,
                          fontSize: "0.95rem",
                          transition: "all 0.2s ease",
                          background: isSelected ? "rgba(0, 229, 255, 0.08)" : "rgba(255, 255, 255, 0.03)",
                          border: isSelected ? "1px solid var(--neural-blue)" : "1px solid rgba(255, 255, 255, 0.06)",
                          boxShadow: isSelected ? "0 0 15px rgba(0, 229, 255, 0.15)" : "none",
                          color: isSelected ? "var(--text-primary)" : "var(--text-muted)"
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.06)";
                            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.03)";
                          }
                        }}
                      >
                        {range}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Wizard Navigation Footer */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "24px", marginTop: "40px" }}>
              <button
                onClick={prevStep}
                disabled={step === 1}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontFamily: "var(--font-orbitron), sans-serif",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  transition: "all 0.2s ease",
                  cursor: step === 1 ? "not-allowed" : "pointer",
                  opacity: step === 1 ? 0.25 : 1,
                  background: "transparent",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "var(--text-primary)"
                }}
                onMouseEnter={(e) => {
                  if (step > 1) {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (step > 1) {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <ArrowLeft size={14} /> Back
              </button>

              <button
                onClick={nextStep}
                className="btn-primary"
                style={{
                  padding: "10px 24px",
                  fontSize: "0.85rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                {step === 5 ? "Generate Report" : "Continue"} <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Lead Gate Modal/View */}
        {showGate && (
          <div className="card-glass" style={{ padding: "40px", borderRadius: "16px", maxWidth: "500px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <Brain size={44} color="var(--neural-blue)" className="animate-pulse" style={{ margin: "0 auto 16px" }} />
              <h2 style={{ fontSize: "1.5rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700, color: "var(--text-primary)" }}>Unlock Your AI Roadmap</h2>
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "12px", lineHeight: 1.5, fontFamily: "var(--font-exo), sans-serif" }}>
                We&apos;ve compiled your customized AI transformation plan. Enter your details to view and download your full diagnostic report.
              </p>
            </div>

            <form onSubmit={handleLeadSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.7rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "8px" }}>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={leadInfo.name}
                  onChange={(e) => setLeadInfo({ ...leadInfo, name: e.target.value })}
                  style={{
                    width: "100%",
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    fontSize: "0.9rem",
                    color: "var(--text-primary)",
                    outline: "none",
                    transition: "all 0.2s"
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "var(--neural-blue)"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)"}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.7rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "8px" }}>Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="john@company.com"
                  value={leadInfo.email}
                  onChange={(e) => setLeadInfo({ ...leadInfo, email: e.target.value })}
                  style={{
                    width: "100%",
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    fontSize: "0.9rem",
                    color: "var(--text-primary)",
                    outline: "none",
                    transition: "all 0.2s"
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "var(--neural-blue)"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)"}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.7rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "8px" }}>Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="Acme Corp"
                  value={leadInfo.company}
                  onChange={(e) => setLeadInfo({ ...leadInfo, company: e.target.value })}
                  style={{
                    width: "100%",
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    fontSize: "0.9rem",
                    color: "var(--text-primary)",
                    outline: "none",
                    transition: "all 0.2s"
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "var(--neural-blue)"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)"}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
                style={{
                  width: "100%",
                  padding: "14px",
                  marginTop: "16px",
                  fontSize: "0.9rem"
                }}
              >
                {isSubmitting ? "Generating Blueprint..." : "View Diagnostics"}
              </button>
            </form>
          </div>
        )}

        {/* Diagnostic Report Panel */}
        {showReport && (
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            {/* Top Overview Panel */}
            <div className="card-glass" style={{ padding: "40px", borderRadius: "16px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, right: 0, width: "120px", height: "120px", backgroundColor: "rgba(0, 229, 255, 0.04)", borderRadius: "50%", filter: "blur(40px)", pointerEvents: "none" }} />
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "24px", marginBottom: "32px", gap: "20px", flexWrap: "wrap" }}>
                <div>
                  <span style={{ fontSize: "0.7rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700, color: "var(--neural-blue)", textTransform: "uppercase", letterSpacing: "0.15em" }}>Tailored Transformation Plan</span>
                  <h2 style={{ fontSize: "1.6rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700, color: "var(--text-primary)", marginTop: "6px" }}>AI Integration Roadmap</h2>
                </div>
                <div>
                  <button
                    onClick={handleDownloadReport}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 20px",
                      borderRadius: "8px",
                      fontFamily: "var(--font-orbitron), sans-serif",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "var(--text-primary)"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "rgba(0, 229, 255, 0.3)";
                      e.currentTarget.style.backgroundColor = "rgba(0, 229, 255, 0.06)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                      e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
                    }}
                  >
                    <Download size={14} color="var(--neural-blue)" /> {downloadSuccess ? "Downloaded!" : "Download Report"}
                  </button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px" }}>
                {/* Panel 1: Primary Model */}
                <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "12px", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "rgba(0, 229, 255, 0.1)", border: "1px solid rgba(0, 229, 255, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--neural-blue)", marginBottom: "16px" }}>
                      <Network size={20} />
                    </div>
                    <h3 style={{ fontSize: "1rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700, color: "var(--text-primary)" }}>Recommended Model</h3>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "10px", lineHeight: 1.5, fontFamily: "var(--font-exo), sans-serif" }}>
                      {budget === "$50,000+/mo" || budget === "$20,000-$50,000/mo"
                        ? "Centralized AI Consulting Transformation blueprint with custom governance framework integrations."
                        : "Focused AI Automation sprint mapping key operational bottlenecks to autonomous n8n workflows."}
                    </p>
                  </div>
                  <div style={{ marginTop: "20px", paddingTop: "12px", borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
                    <span style={{ fontSize: "0.65rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700, color: "var(--neural-blue)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Model: {budget === "$50,000+/mo" ? "Enterprise" : "Sprint"}</span>
                  </div>
                </div>

                {/* Panel 2: Agent Solutions */}
                <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "12px", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "rgba(123, 97, 255, 0.1)", border: "1px solid rgba(123, 97, 255, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--violet)", marginBottom: "16px" }}>
                      <Settings size={20} />
                    </div>
                    <h3 style={{ fontSize: "1rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700, color: "var(--text-primary)" }}>Required AI Agents</h3>
                    <ul style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "12px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", fontFamily: "var(--font-exo), sans-serif" }}>
                      {goals.map((goal, idx) => (
                        <li key={idx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <CheckCircle size={14} color="var(--neural-blue)" style={{ flexShrink: 0 }} />
                          <span>{goal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ marginTop: "20px", paddingTop: "12px", borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
                    <span style={{ fontSize: "0.65rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700, color: "var(--violet)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{goals.length} Specialized Nodes</span>
                  </div>
                </div>

                {/* Panel 3: Academy Courses */}
                <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "12px", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "rgba(255, 186, 0, 0.1)", border: "1px solid rgba(255, 186, 0, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--amber)", marginBottom: "16px" }}>
                      <BookOpen size={20} />
                    </div>
                    <h3 style={{ fontSize: "1rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700, color: "var(--text-primary)" }}>L&D Up-skilling</h3>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "10px", lineHeight: 1.5, fontFamily: "var(--font-exo), sans-serif" }}>
                      We suggest enrolling your team in the <strong style={{ color: "var(--text-primary)" }}>
                        {goals.includes("Customer Support Automation") ? "AI Solutions Architect" : "AI Engineer"}
                      </strong> track at CerebroHive Academy to ensure post-deploy system maintenance.
                    </p>
                  </div>
                  <div style={{ marginTop: "20px", paddingTop: "12px", borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
                    <span style={{ fontSize: "0.65rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700, color: "var(--amber)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Duration: 3-6 Months</span>
                  </div>
                </div>
              </div>

              {/* Consultation CTA */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "32px", marginTop: "40px", gap: "24px", flexWrap: "wrap" }}>
                <div style={{ textAlign: "left" }}>
                  <h4 style={{ fontSize: "1.1rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700, color: "var(--text-primary)" }}>Map this blueprint to your operations</h4>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "4px", fontFamily: "var(--font-exo), sans-serif" }}>Schedule a free 30-minute validation call with our architecture team.</p>
                </div>
                <div>
                  <button
                    onClick={handleBookMeeting}
                    disabled={bookedMeeting}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "12px 28px",
                      borderRadius: "8px",
                      fontFamily: "var(--font-orbitron), sans-serif",
                      fontSize: "0.875rem",
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      border: "none",
                      cursor: bookedMeeting ? "not-allowed" : "pointer",
                      opacity: bookedMeeting ? 0.7 : 1,
                      background: "linear-gradient(135deg, var(--neural-blue), var(--violet))",
                      color: "#080B14",
                      transition: "all 0.3s ease",
                      boxShadow: "0 0 20px rgba(0, 229, 255, 0.3)",
                      textDecoration: "none"
                    }}
                    onMouseEnter={(e) => {
                      if (!bookedMeeting) {
                        e.currentTarget.style.boxShadow = "0 0 35px rgba(0, 229, 255, 0.5), 0 0 70px rgba(0, 229, 255, 0.2)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!bookedMeeting) {
                        e.currentTarget.style.boxShadow = "0 0 20px rgba(0, 229, 255, 0.3)";
                        e.currentTarget.style.transform = "translateY(0px)";
                      }
                    }}
                  >
                    <Calendar size={16} /> {bookedMeeting ? "Meeting Requested!" : "Book Free Consultation"}
                  </button>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <div style={{ textAlign: "center" }}>
              <button
                onClick={() => {
                  setStep(1);
                  setIndustry("");
                  setTeamSize("");
                  setGoals([]);
                  setMaturity("");
                  setBudget("");
                  setShowReport(false);
                  setBookedMeeting(false);
                }}
                style={{
                  fontSize: "0.85rem",
                  fontFamily: "var(--font-orbitron), sans-serif",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  background: "transparent",
                  border: "none",
                  textDecoration: "underline",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "var(--neural-blue)"}
                onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
              >
                Restart Diagnostics Wizard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
