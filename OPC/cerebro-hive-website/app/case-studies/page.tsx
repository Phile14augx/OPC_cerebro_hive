"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Filter } from "lucide-react";

interface CaseStudy {
  slug: string;
  title: string;
  client: string;
  category: "Consulting" | "Automation" | "Academy";
  metrics: string[];
  summary: string;
  techStack: string[];
}

const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "logistics-support-automation",
    title: "Automating Email Ticketing and Support Operations",
    client: "Global Logistics Corp",
    category: "Automation",
    metrics: ["65% Cost Reduction", "12m Response Time", "94% Customer CSAT"],
    summary: "Built an intelligent email parsing and routing system that processes thousands of daily shipping inquiries using Claude 3.5 Sonnet and n8n pipelines.",
    techStack: ["n8n", "Claude 3.5", "Pinecone Vector Store", "SendGrid"]
  },
  {
    slug: "sales-pipeline-automation",
    title: "Autonomous Prospecting and CRM Data Enrichment",
    client: "Vanguard Financial Services",
    category: "Automation",
    metrics: ["3x Qualified Leads", "85% Data Accuracy", "180+ Hours Saved/mo"],
    summary: "Deployed multi-agent LangGraph flows to automate outbound email campaigns, score incoming client profiles, and synchronize database entries.",
    techStack: ["LangGraph", "OpenAI GPT-4o", "Hubspot API", "Python"]
  },
  {
    slug: "corporate-ai-training",
    title: "Enterprise AI Transformation and Developer Up-skilling",
    client: "Apex Software Labs",
    category: "Academy",
    metrics: ["50+ Certified Engineers", "40% Dev Velocity", "98% Onboarding Score"],
    summary: "Curated custom education programs and proctored certification modules to up-skill corporate software engineers in RAG systems and LLM proxy gate architectures.",
    techStack: ["CerebroLearn LMS", "LangChain Workshops", "Custom Agent Labs"]
  }
];

export default function CaseStudiesPage() {
  const [filter, setFilter] = useState<string>("All");

  const filteredCaseStudies = filter === "All"
    ? CASE_STUDIES
    : CASE_STUDIES.filter((cs) => cs.category === filter);

  return (
    <>
      {/* Hero Section */}
      <section style={{ paddingTop: "140px", paddingBottom: "50px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(0,229,255,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="container-wide" style={{ position: "relative" }}>
          
          <div className="section-label" style={{ display: "inline-flex", marginBottom: "20px" }}>
            <Sparkles size={11} style={{ marginRight: "4px" }} /> Client Proof & Outcomes
          </div>
          
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", marginBottom: "20px" }}>
            Case <span className="gradient-text-full">Studies</span>
          </h1>
          
          <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "1.1rem", color: "var(--text-muted)", maxWidth: "600px", lineHeight: 1.7 }}>
            Explore how CerebroHive helps organizations deploy secure AI models, automate workflows, and build certified teams.
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section style={{ paddingBottom: "32px" }}>
        <div className="container-wide">
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "12px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "24px" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700, fontFamily: "Orbitron, sans-serif", textTransform: "uppercase", letterSpacing: "0.15em", display: "flex", alignItems: "center", gap: "6px", marginRight: "8px" }}>
              <Filter size={14} color="var(--violet)" /> Filter:
            </span>
            {["All", "Consulting", "Automation", "Academy"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                style={{
                  padding: "8px 18px",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  fontFamily: "Orbitron, sans-serif",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  background: filter === cat ? "rgba(0,229,255,0.1)" : "rgba(255,255,255,0.03)",
                  border: filter === cat ? "1px solid var(--neural-blue)" : "1px solid rgba(255,255,255,0.06)",
                  color: filter === cat ? "var(--text-primary)" : "var(--text-muted)",
                  boxShadow: filter === cat ? "0 0 15px rgba(0,229,255,0.15)" : "none"
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies Grid */}
      <section style={{ paddingBottom: "100px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
            {filteredCaseStudies.map((cs) => {
              const accentColor = cs.category === "Academy" ? "var(--violet)" : "var(--neural-blue)";
              
              return (
                <Link key={cs.slug} href={`/case-studies/${cs.slug}`} style={{ textDecoration: "none" }}>
                  <div className="card-glass" style={{ padding: "36px 30px", display: "flex", flexDirection: "column", height: "100%" }}>
                    
                    {/* Top Meta Row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                      <span style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        Client: <strong style={{ color: "var(--text-primary)" }}>{cs.client}</strong>
                      </span>
                      <span style={{
                        fontSize: "0.6rem",
                        fontFamily: "Orbitron, sans-serif",
                        fontWeight: 700,
                        color: accentColor,
                        background: cs.category === "Academy" ? "rgba(123,97,255,0.08)" : "rgba(0,229,255,0.08)",
                        border: cs.category === "Academy" ? "1px solid rgba(123,97,255,0.2)" : "1px solid rgba(0,229,255,0.2)",
                        padding: "3px 10px",
                        borderRadius: "100px",
                        textTransform: "uppercase"
                      }}>
                        {cs.category}
                      </span>
                    </div>

                    {/* Card Title */}
                    <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px", lineHeight: 1.4 }}>
                      {cs.title}
                    </h3>

                    {/* Card Summary */}
                    <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "20px" }}>
                      {cs.summary}
                    </p>

                    {/* Outcome Metrics */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
                      {cs.metrics.map((metric, idx) => {
                        const mColor = cs.category === "Academy" ? "var(--violet)" : "var(--neural-blue)";
                        const mBg = cs.category === "Academy" ? "rgba(123,97,255,0.06)" : "rgba(0,229,255,0.06)";
                        const mBorder = cs.category === "Academy" ? "rgba(123,97,255,0.15)" : "rgba(0,229,255,0.15)";
                        return (
                          <span key={idx} style={{
                            fontFamily: "var(--font-mono), JetBrains Mono, monospace",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            color: mColor,
                            background: mBg,
                            border: `1px solid ${mBorder}`,
                            padding: "4px 10px",
                            borderRadius: "4px"
                          }}>
                            {metric}
                          </span>
                        );
                      })}
                    </div>

                    {/* Divider */}
                    <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", margin: "0 -30px 20px -30px" }} />

                    {/* Tech Stack */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "24px" }}>
                      {cs.techStack.map((tech, idx) => (
                        <span key={idx} style={{
                          fontSize: "0.6rem",
                          fontFamily: "Orbitron, sans-serif",
                          fontWeight: 700,
                          color: "var(--text-muted)",
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,255,255,0.04)",
                          padding: "3px 8px",
                          borderRadius: "100px",
                          textTransform: "uppercase"
                        }}>
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Read Case Study Button Link */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: accentColor, fontSize: "0.8rem", fontWeight: 600, marginTop: "auto", fontFamily: "Orbitron, sans-serif" }}>
                      Read Case Study <ArrowRight size={14} />
                    </div>

                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
