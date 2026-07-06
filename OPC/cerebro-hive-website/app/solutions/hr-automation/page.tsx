"use client";
import { CheckCircle, ShieldCheck, Zap, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

const features = [
  { title: "Intelligent Resume Scoring", desc: "Parse resumes to extract core skills, matching scoring metrics against structured job spec templates." },
  { title: "Autonomous Screening Schedulers", desc: "Automate initial screening calls scheduling and sync calendar booking links with qualifying candidates." },
  { title: "Unified Onboarding Checklist", desc: "Automate contract creation, Slack workspace invites, and hardware setup ticketing checklists for new hires." },
  { title: "Employee Query Assistants", desc: "Deploy internal HR chat agents that answer corporate benefits queries, leave policies, and code of conduct FAQs." }
];

export default function HRAutomationPage() {
  return (
    <>
      <section style={{ paddingTop: "140px", paddingBottom: "60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(123,97,255,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="container-wide" style={{ position: "relative" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none", marginBottom: "24px" }}>
            <ArrowLeft size={14} /> Back to Home
          </Link>
          <div className="section-label" style={{ display: "inline-flex", marginBottom: "20px", color: "#7B61FF", background: "rgba(123,97,255,0.08)", borderColor: "rgba(123,97,255,0.25)" }}>
            <Zap size={11} /> HR Operations
          </div>
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", marginBottom: "20px" }}>
            HR &amp; Recruitment <span className="gradient-text-blue-violet">Automation</span>
          </h1>
          <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "1.1rem", color: "var(--text-muted)", maxWidth: "600px", lineHeight: 1.7 }}>
            Accelerate hiring cycles and simplify administrative tasks. Deploy AI systems for resume screening, automated candidate scheduling, and digital onboarding.
          </p>
        </div>
      </section>

      {/* Metrics Row */}
      <section style={{ paddingBottom: "40px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {[
              { label: "Hiring Time", value: "70% faster recruitment cycles" },
              { label: "Admin Workload", value: "85% reduction in manual scheduling" },
              { label: "Onboarding Errors", value: "Zero missed setup checklists" }
            ].map((stat, i) => (
              <div key={i} className="card-glass" style={{ padding: "24px", textAlign: "center" }}>
                <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.5rem", fontWeight: 800, color: "var(--violet)", marginBottom: "6px" }}>{stat.value}</div>
                <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-muted)" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Showcase */}
      <section className="section-pad" style={{ paddingTop: "20px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "60px", alignItems: "center" }}>
            <div>
              <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.5rem", fontWeight: 700, marginBottom: "24px" }}>
                Streamline Candidate Experience
              </h2>
              <p style={{ fontFamily: "Exo 2, sans-serif", color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "24px" }}>
                Recruiting teams spend hours reviewing resumes and manually coordinating time slots. Our HR automation setups integrate directly with your applicant tracking system (ATS) to score applicant profiles, trigger automated outreach templates, manage booking calendars, and prepare digital onboarding checklists immediately upon contract execution.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {features.map((f) => (
                  <div key={f.title} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <CheckCircle size={16} color="var(--violet)" style={{ flexShrink: 0, marginTop: "3px" }} />
                    <div>
                      <h4 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)" }}>{f.title}</h4>
                      <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Block */}
            <div className="card-glass" style={{ padding: "40px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <Zap size={18} color="var(--violet)" />
                <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1rem", fontWeight: 700, color: "var(--violet)" }}>
                  HR Workflow Scoping
                </h3>
              </div>
              <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "24px" }}>
                We analyze your ATS connectors, scheduling channels, and internal onboarding templates to map a secure, automated talent cycle.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "32px" }}>
                {["ATS Mapping Consultation", "Onboarding Workflow Blueprint", "Security Compliance Verification Plan"].map((b) => (
                  <div key={b} style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    <ShieldCheck size={14} color="var(--violet)" />
                    {b}
                  </div>
                ))}
              </div>

              <Link href="/contact" className="btn-primary" style={{ width: "100%", justifyContent: "center", display: "inline-flex", gap: "6px", background: "linear-gradient(135deg, var(--violet), var(--hot-pink))" }}>
                Request HR Audit <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
