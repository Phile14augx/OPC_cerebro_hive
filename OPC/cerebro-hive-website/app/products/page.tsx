"use client";
import { Workflow, Bot, BookOpen, Layers, ArrowRight, Zap, Lock, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const products = [
  {
    title: "CerebroFlow",
    subtitle: "AI Automation Suite",
    desc: "A visual low-code automation platform that connects LLM decision nodes, data sources, and external APIs into recursive, fault-tolerant pipelines.",
    href: "/products/cerebroflow",
    icon: Workflow,
    color: "#00E5FF",
    tag: "GA — Live",
    available: true,
    bullets: ["Drag-and-drop LangGraph pipeline builder", "150+ pre-built API connectors", "Human-in-the-loop escalation nodes"],
  },
  {
    title: "CerebroAgent",
    subtitle: "Autonomous Agent Network",
    desc: "Deploy persistent agent networks that monitor live event streams, execute scheduled reasoning loops, and self-update memory chains.",
    href: "/products/cerebroagent",
    icon: Bot,
    color: "#7B61FF",
    tag: "Beta Access",
    available: true,
    bullets: ["Long-term agent memory via pgvector", "Multi-agent coordination graphs", "Real-time data stream listeners"],
  },
  {
    title: "CerebroLearn",
    subtitle: "AI Learning Management",
    desc: "An intelligent LMS with adaptive content pacing, cohort analytics, and digital certification issuance built natively for AI education programs.",
    href: "/products/cerebrolearn",
    icon: BookOpen,
    color: "#FF2ED1",
    tag: "Early Access",
    available: true,
    bullets: ["Adaptive content sequencing", "Proctored e-certification with LinkedIn sync", "Cohort admin seat management"],
  },
  {
    title: "CerebroERP",
    subtitle: "AI-Enhanced ERP Platform",
    desc: "A mid-market ERP challenger targeting SMEs priced out of SAP and Oracle. AI-native modules for finance, HR, CRM, and inventory.",
    href: "/products/cerebroerp",
    icon: Layers,
    color: "#FF8A00",
    tag: "Coming Soon",
    available: false,
    bullets: ["Finance P&L with anomaly detection", "HR payroll & performance engine", "AI-powered inventory forecasting"],
  },
];

const stats = [
  { label: "Agent Actions/Day", value: "2.4M+" },
  { label: "Avg. Process Speedup", value: "7.2×" },
  { label: "Enterprise Deployments", value: "120+" },
];

export default function ProductsPage() {
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (waitlistEmail.includes("@")) {
      setSubmitted(true);
    }
  };

  return (
    <>
      {/* Hero */}
      <section style={{ paddingTop: "140px", paddingBottom: "50px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(123,97,255,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="container-wide" style={{ position: "relative" }}>
          <div className="section-label" style={{ display: "inline-flex", marginBottom: "20px" }}>
            <Zap size={11} /> Proprietary Software Suite
          </div>
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", marginBottom: "20px" }}>
            CerebroHive <span className="gradient-text-full">Products</span>
          </h1>
          <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "1.1rem", color: "var(--text-muted)", maxWidth: "600px", lineHeight: 1.7 }}>
            A growing suite of proprietary AI-native software platforms — from automation pipelines to enterprise ERP — engineered for scale and built to outlast the hype cycle.
          </p>
        </div>
      </section>

      {/* Stats Row */}
      <section style={{ paddingBottom: "40px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {stats.map((stat, i) => (
              <div key={i} className="card-glass" style={{ padding: "24px", textAlign: "center" }}>
                <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.5rem", fontWeight: 800, color: "var(--neural-blue)", marginBottom: "6px" }}>{stat.value}</div>
                <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-muted)" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section style={{ paddingBottom: "20px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
            {products.map((prod) => {
              const Icon = prod.icon;
              return (
                <div key={prod.title} className="card-glass" style={{ padding: "36px 30px", display: "flex", flexDirection: "column", opacity: prod.available ? 1 : 0.7 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: 44, height: 44, borderRadius: "10px", background: `${prod.color}14`, border: `1px solid ${prod.color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={20} color={prod.color} />
                      </div>
                      <div>
                        <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "2px" }}>
                          {prod.title}
                        </h3>
                        <span style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.75rem", color: "var(--text-muted)" }}>{prod.subtitle}</span>
                      </div>
                    </div>
                    <span style={{
                      fontSize: "0.6rem", fontFamily: "Orbitron, sans-serif", fontWeight: 700,
                      color: prod.available ? prod.color : "var(--text-muted)",
                      background: prod.available ? `${prod.color}14` : "rgba(255,255,255,0.03)",
                      border: `1px solid ${prod.available ? prod.color + "40" : "rgba(255,255,255,0.06)"}`,
                      padding: "3px 10px", borderRadius: "100px", textTransform: "uppercase", whiteSpace: "nowrap"
                    }}>
                      {prod.tag}
                    </span>
                  </div>

                  <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "20px" }}>
                    {prod.desc}
                  </p>

                  <ul style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px", marginBottom: "28px", display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
                    {prod.bullets.map((b) => (
                      <li key={b} style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-muted)", listStyle: "none", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                        <CheckCircle size={13} color={prod.color} style={{ flexShrink: 0, marginTop: "2px" }} /> {b}
                      </li>
                    ))}
                  </ul>

                  {prod.available ? (
                    <Link href={prod.href} style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: prod.color, fontSize: "0.8rem", fontWeight: 600, textDecoration: "none", marginTop: "auto" }}>
                      Explore Product <ArrowRight size={14} />
                    </Link>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "auto" }}>
                      <Lock size={13} /> In Development
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Waitlist + CerebroOS Vision Section */}
      <section className="section-pad" style={{ paddingTop: "60px", paddingBottom: "100px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "40px", alignItems: "start" }}>
            {/* CerebroOS Vision */}
            <div className="card-glass" style={{ padding: "40px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <Zap size={18} color="var(--neural-blue)" />
                <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.2rem", fontWeight: 700 }}>CerebroOS — The Vision</h2>
              </div>
              <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.7, marginBottom: "24px" }}>
                An enterprise AI operating layer that connects every CerebroHive product and third-party system into a unified intelligence platform. One runtime, infinite agent potential.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {["Universal cross-product data orchestration", "Private AI model deployment layer", "Unified enterprise intelligence dashboard"].map((feat) => (
                  <div key={feat} style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "0.82rem", color: "var(--text-muted)", fontFamily: "Exo 2, sans-serif" }}>
                    <CheckCircle size={14} color="var(--neural-blue)" style={{ flexShrink: 0, marginTop: "2px" }} />
                    {feat}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "28px", display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", fontSize: "0.78rem", fontFamily: "Exo 2, sans-serif" }}>
                <Clock size={14} /> Long-term vision product. In active Labs research.
              </div>
            </div>

            {/* Waitlist */}
            <div className="card-glass" style={{ padding: "40px" }}>
              <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.6rem", fontWeight: 700, color: "var(--neural-blue)", textTransform: "uppercase", letterSpacing: "0.15em", display: "block", marginBottom: "16px" }}>Early Access</span>
              <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.15rem", fontWeight: 700, marginBottom: "12px" }}>
                Join the CerebroOS Waitlist
              </h3>
              <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "28px" }}>
                Be among the first cohort to get preview access, shape product decisions, and receive early-adopter enterprise pricing.
              </p>

              {!submitted ? (
                <form onSubmit={handleWaitlist} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <input
                    type="email"
                    placeholder="your@company.com"
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    required
                    style={{
                      padding: "12px 16px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "var(--text-primary)",
                      fontFamily: "Exo 2, sans-serif",
                      fontSize: "0.9rem",
                      outline: "none",
                    }}
                  />
                  <button type="submit" className="btn-primary" style={{ display: "inline-flex", justifyContent: "center", gap: "6px" }}>
                    Secure My Spot <ArrowRight size={14} />
                  </button>
                </form>
              ) : (
                <div style={{ textAlign: "center", padding: "24px 0" }}>
                  <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1rem", fontWeight: 700, color: "var(--neural-blue)", marginBottom: "8px" }}>✓ You are on the list</div>
                  <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.85rem", color: "var(--text-muted)" }}>We will reach out with preview access information as we approach launch.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
