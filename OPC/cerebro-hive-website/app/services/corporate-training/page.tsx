"use client";
import { GraduationCap, CheckCircle, ArrowRight, ArrowLeft, Zap, MapPin, Laptop, Shuffle } from "lucide-react";
import Link from "next/link";

const formats = [
  {
    icon: MapPin,
    color: "#00E5FF",
    title: "On-Site Workshops",
    tag: "INTENSIVE",
    desc: "Interactive hands-on training sessions held directly at your corporate headquarters, tailored to your team's specific stack and business use cases.",
    duration: "1-3 Days",
    bullets: ["Direct architect instruction", "Interactive live-coding labs", "Custom team hackathons"],
  },
  {
    icon: Laptop,
    color: "#7B61FF",
    title: "Virtual Cohorts",
    tag: "FLEXIBLE",
    desc: "Live online training sessions scheduled over multiple weeks to minimize work disruption while building robust, practical technical foundations.",
    duration: "4-8 Weeks",
    bullets: ["Weekly live code review", "Dedicated Slack learning channel", "Recorded sessions library"],
  },
  {
    icon: Shuffle,
    color: "#FF8A00",
    title: "Blended Hybrid",
    tag: "SCALABLE",
    desc: "A hybrid model combining self-paced video modules on our platform with bi-weekly live workshops to scale up training across large departments.",
    duration: "Custom",
    bullets: ["Custom learning paths", "Verified certification pathways", "L&D metrics dashboard tracking"],
  },
];

const stats = [
  { label: "Students Certified", value: "10,000+" },
  { label: "Corporate Partners", value: "50+" },
  { label: "Avg. Productivity Gain", value: "40%" },
];

export default function CorporateTrainingPage() {
  return (
    <>
      {/* Hero */}
      <section style={{ paddingTop: "140px", paddingBottom: "60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(123,97,255,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="container-wide" style={{ position: "relative" }}>
          <Link href="/services" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none", marginBottom: "24px", transition: "color 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>
            <ArrowLeft size={14} /> Back to Services
          </Link>
          <div className="section-label" style={{ display: "inline-flex", marginBottom: "20px" }}>
            <GraduationCap size={11} /> Enterprise L&D
          </div>
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", marginBottom: "20px" }}>
            Corporate <span className="gradient-text-full">AI Training</span>
          </h1>
          <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "1.1rem", color: "var(--text-muted)", maxWidth: "600px", lineHeight: 1.7 }}>
            Build an AI-ready workforce. Up-skill your software development teams, product managers, and executive leaders with practical, production-grade AI certifications.
          </p>
        </div>
      </section>

      {/* Stats Row */}
      <section style={{ paddingBottom: "40px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {stats.map((s, i) => (
              <div key={i} className="card-glass" style={{ padding: "24px", textAlign: "center" }}>
                <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.5rem", fontWeight: 800, color: "var(--neural-blue)", marginBottom: "6px" }}>{s.value}</div>
                <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-muted)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formats Grid */}
      <section style={{ paddingBottom: "40px" }}>
        <div className="container-wide">
          <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.4rem", fontWeight: 700, marginBottom: "28px" }}>Three training structures. Fully customized.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {formats.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="card-glass" style={{ padding: "32px 28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <div style={{ width: 44, height: 44, borderRadius: "10px", background: `${f.color}14`, border: `1px solid ${f.color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={20} color={f.color} />
                    </div>
                    <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.6rem", fontWeight: 700, color: f.color, background: `${f.color}12`, border: `1px solid ${f.color}30`, padding: "3px 10px", borderRadius: "100px" }}>{f.tag}</span>
                  </div>
                  <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1rem", fontWeight: 700, marginBottom: "10px" }}>{f.title}</h3>
                  <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.83rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "16px" }}>{f.desc}</p>
                  <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "16px" }}>
                    Duration: <strong style={{ color: "var(--text-primary)" }}>{f.duration}</strong>
                  </div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {f.bullets.map((b) => (
                      <div key={b} style={{ display: "flex", gap: "8px", alignItems: "flex-start", fontFamily: "Exo 2, sans-serif", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        <CheckCircle size={12} color={f.color} style={{ flexShrink: 0, marginTop: "2px" }} /> {b}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Showcase */}
      <section style={{ paddingBottom: "100px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "60px", alignItems: "center" }}>
            <div>
              <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.5rem", fontWeight: 700, marginBottom: "20px" }}>
                AI capability built from the inside.
              </h2>
              <p style={{ fontFamily: "Exo 2, sans-serif", color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "28px" }}>
                Traditional workshops talk about prompt engineering. We focus on production engineering: building autonomous multi-agent pipelines, configuring vector databases, monitoring system metrics, and securing corporate compliance frameworks. We don&apos;t just teach tool usage — we teach how to architect systems.
              </p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {[
                  "Tailored curricula based on your corporate stack",
                  "Real-world project-based graduation tracks",
                  "Enterprise seat manager and completion analytics",
                  "Direct slack support channels with lead architects",
                ].map((item) => (
                  <div key={item} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <CheckCircle size={15} color="var(--neural-blue)" style={{ flexShrink: 0, marginTop: "3px" }} />
                    <span style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.875rem", color: "var(--text-muted)" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Panel */}
            <div className="card-glass" style={{ padding: "40px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <Zap size={18} color="var(--neural-blue)" />
                <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1rem", fontWeight: 700, color: "var(--neural-blue)" }}>
                  Custom Program Intake
                </h3>
              </div>
              <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "24px" }}>
                Book a scoping meeting with our L&D team to review your objectives, estimate budget allocations, and outline a tailored curriculum path.
              </p>
              <Link href="/academy/corporate-programs" className="btn-primary" style={{ width: "100%", justifyContent: "center", display: "inline-flex", gap: "6px" }}>
                Request Training Proposal <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
