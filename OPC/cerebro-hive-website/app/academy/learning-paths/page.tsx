"use client";
import { Clock, Target, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

const paths = [
  {
    title: "AI Engineer Path",
    subtitle: "Build production-ready LLM pipelines and RAG workflows.",
    duration: "6 Months",
    color: "#00E5FF",
    steps: [
      { num: "01", name: "AI Foundations & Prompting", desc: "Prerequisite core prompting methodologies." },
      { num: "02", name: "Enterprise RAG Systems", desc: "Build hybrid indexes and vector parsing architectures." },
      { num: "03", name: "Building Multi-Agent Systems", desc: "State management and actor loops." }
    ],
    targetRoles: ["AI Developer", "LLM Engineer", "Software Engineer"]
  },
  {
    title: "AI Architect Path",
    subtitle: "Design scalable, secure, and governed agentic infrastructure.",
    duration: "6 Months",
    color: "#7B61FF",
    steps: [
      { num: "01", name: "Enterprise RAG Systems", desc: "Advanced vector scaling and metadata filtering." },
      { num: "02", name: "Building Multi-Agent Systems", desc: "LangGraph state flow, routing, and loops." },
      { num: "03", name: "AI Strategy & Governance", desc: "Architecture compliance and security reviews." }
    ],
    targetRoles: ["Cloud Architect", "AI Solutions Architect", "Tech Lead"]
  },
  {
    title: "AI Consultant Path",
    subtitle: "Guide corporate readiness assessments and adopt AI tools safely.",
    duration: "3 Months",
    color: "#FF8A00",
    steps: [
      { num: "01", name: "AI Foundations & Prompting", desc: "Understand model capabilities and constraints." },
      { num: "02", name: "AI Strategy & Roadmapping", desc: "Maturity assessments and project scoping." },
      { num: "03", name: "Change Management & Adoption", desc: "Onboarding business teams and setting up center of excellence." }
    ],
    targetRoles: ["Management Consultant", "Business Analyst", "AI Consultant"]
  },
  {
    title: "AI Product Manager Path",
    subtitle: "Scope AI features, evaluate ROI, and lead model selection.",
    duration: "3 Months",
    color: "#FF2ED1",
    steps: [
      { num: "01", name: "AI Foundations & Prompting", desc: "Learn constraints, pricing structures, and latency profiles." },
      { num: "02", name: "AI Strategy & Roadmapping", desc: "Scoping models and drafting value blueprints." },
      { num: "03", name: "AI Product Metrics", desc: "Track hallucinations, user evaluation feedback, and cost limits." }
    ],
    targetRoles: ["Product Manager", "Project Manager", "AI PM"]
  }
];

export default function LearningPathsPage() {
  return (
    <>
      <section style={{ paddingTop: "60px", paddingBottom: "50px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(123,97,255,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="container-wide" style={{ position: "relative" }}>
          <Link href="/academy/courses" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none", marginBottom: "24px" }}>
            <ArrowLeft size={14} /> Back to Course Catalog
          </Link>
          <div className="section-label" style={{ display: "inline-flex", marginBottom: "20px" }}>
            <Target size={11} /> Structured Learning Tracks
          </div>
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", marginBottom: "20px" }}>
            Academy <span className="gradient-text-blue-violet">Learning Paths</span>
          </h1>
          <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "1.1rem", color: "var(--text-muted)", maxWidth: "600px", lineHeight: 1.7 }}>
            Structured, role-based curriculums to guide your journey from foundational prompt engineering to production agent scaling.
          </p>
        </div>
      </section>

      <section className="section-pad" style={{ paddingTop: "20px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" }}>
            {paths.map((path) => (
              <div key={path.title} className="card-glass" style={{ padding: "36px", display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.25rem", fontWeight: 800 }}>
                    {path.title}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: path.color, background: `${path.color}14`, border: `1px solid ${path.color}30`, padding: "4px 12px", borderRadius: "100px", fontSize: "0.75rem", fontFamily: "Orbitron, sans-serif" }}>
                    <Clock size={12} /> {path.duration}
                  </div>
                </div>
                
                <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "28px" }}>
                  {path.subtitle}
                </p>

                {/* Timeline Roadmap */}
                <div style={{ position: "relative", paddingLeft: "24px", marginBottom: "32px", display: "flex", flexDirection: "column", gap: "20px", flex: 1 }}>
                  <div style={{ position: "absolute", left: "7px", top: "10px", bottom: "10px", width: "1px", background: "rgba(255,255,255,0.08)" }} />
                  {path.steps.map((step) => (
                    <div key={step.num} style={{ position: "relative" }}>
                      <div style={{
                        position: "absolute", left: "-24px", top: "2px",
                        width: "15px", height: "15px", borderRadius: "50%",
                        background: path.color, boxShadow: `0 0 10px ${path.color}`
                      }} />
                      <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>
                        {step.name}
                      </div>
                      <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                        {step.desc}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Target roles & button */}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "20px", marginTop: "auto" }}>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "20px" }}>
                    {path.targetRoles.map((role) => (
                      <span key={role} style={{ fontSize: "0.7rem", color: "var(--text-muted)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", padding: "3px 10px", borderRadius: "4px" }}>
                        {role}
                      </span>
                    ))}
                  </div>

                  <Link
                    href="/academy/courses"
                    className="btn-primary"
                    style={{ width: "100%", justifyContent: "center", display: "inline-flex", gap: "6px" }}
                  >
                    View Path Courses <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
