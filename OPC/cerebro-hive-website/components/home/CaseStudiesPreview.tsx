"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const caseStudies = [
  {
    industry: "Logistics & Supply Chain",
    timeline: "8 Weeks",
    division: "AI Automation",
    challenge: "A major logistics company was drowning in 15,000+ monthly support tickets across 14 languages. Manual resolution took 48–72 hours average.",
    solution: "Deployed a multi-agent customer support system powered by LangGraph — triage agent, resolution agent, and escalation agent — integrated with Zendesk.",
    metrics: [
      { value: "65%", label: "Cost Reduction" },
      { value: "4 min", label: "Avg Response Time" },
      { value: "78%", label: "Auto-Resolution Rate" },
    ],
    color: "#00E5FF",
    href: "/case-studies/logistics-support-automation",
  },
  {
    industry: "Professional Services",
    timeline: "6 Weeks",
    division: "AI Consulting + Automation",
    challenge: "A consulting firm with a 200-person sales team had no AI-powered lead qualification. 60% of rep time was spent on low-quality prospects.",
    solution: "Built an AI sales pipeline — lead enrichment, behavioral scoring, personalized email drafting, and Salesforce CRM automation using GPT-4o.",
    metrics: [
      { value: "3×", label: "Pipeline Velocity" },
      { value: "40%", label: "More Qualified Leads" },
      { value: "$2.4M", label: "Added Pipeline Value" },
    ],
    color: "#7B61FF",
    href: "/case-studies/sales-pipeline-automation",
  },
  {
    industry: "Financial Services",
    timeline: "12 Weeks",
    division: "AI Training + Consulting",
    challenge: "An enterprise bank needed to upskill 150 employees across analytics, automation, and AI governance — in parallel with regulatory compliance.",
    solution: "Delivered a custom corporate AI training program: 8-module curriculum, live sessions, assessments, and CerebroHive certifications.",
    metrics: [
      { value: "150", label: "Employees Certified" },
      { value: "94%", label: "Completion Rate" },
      { value: "4.9/5", label: "Training Rating" },
    ],
    color: "#FFBA00",
    href: "/case-studies/enterprise-ai-training",
  },
];

export default function CaseStudiesPreview() {
  return (
    <section className="section-pad" style={{ background: "rgba(0,0,0,0.2)" }}>
      <div className="container-wide">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "48px", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <div className="section-label">Proven Results</div>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
              Real Outcomes,{" "}
              <span className="gradient-text-orange">Real Impact</span>
            </h2>
          </div>
          <Link href="/case-studies" className="btn-ghost" style={{ padding: "10px 24px", fontSize: "0.8rem" }}>
            All Case Studies →
          </Link>
        </div>

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
          {caseStudies.map((cs) => (
            <div
              key={cs.industry}
              className="card-glass"
              style={{ padding: "32px", display: "flex", flexDirection: "column" }}
            >
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                <div>
                  <div style={{
                    fontFamily: "Orbitron, sans-serif",
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: cs.color,
                    marginBottom: "6px",
                  }}>
                    {cs.division}
                  </div>
                  <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.95rem", fontWeight: 700, lineHeight: 1.3 }}>
                    {cs.industry}
                  </h3>
                </div>
                <div style={{
                  fontFamily: "Exo 2, sans-serif",
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "6px",
                  padding: "4px 10px",
                  whiteSpace: "nowrap",
                }}>
                  {cs.timeline}
                </div>
              </div>

              <div className="neon-divider" style={{ marginBottom: "20px" }} />

              {/* Challenge */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.65rem", color: "#FF8A00", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>
                  Challenge
                </div>
                <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.65 }}>
                  {cs.challenge}
                </p>
              </div>

              {/* Solution */}
              <div style={{ marginBottom: "24px" }}>
                <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.65rem", color: "#00E5FF", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>
                  Solution
                </div>
                <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.65 }}>
                  {cs.solution}
                </p>
              </div>

              {/* Metrics */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "28px", marginTop: "auto" }}>
                {cs.metrics.map((m) => (
                  <div key={m.label} style={{
                    background: `${cs.color}0A`,
                    border: `1px solid ${cs.color}25`,
                    borderRadius: "10px",
                    padding: "12px 8px",
                    textAlign: "center",
                  }}>
                    <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.1rem", fontWeight: 800, color: cs.color }}>
                      {m.value}
                    </div>
                    <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "4px", lineHeight: 1.3 }}>
                      {m.label}
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href={cs.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontFamily: "Orbitron, sans-serif",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: cs.color,
                  textDecoration: "none",
                  letterSpacing: "0.05em",
                }}
              >
                Read Case Study <ArrowRight size={13} />
              </Link>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .case-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
