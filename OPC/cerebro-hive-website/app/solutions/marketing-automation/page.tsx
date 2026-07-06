"use client";
import { CheckCircle, ShieldCheck, Zap, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

const features = [
  { title: "Programmatic SEO Pipelines", desc: "Build autonomous SEO content generation cycles that ingest search queries and compile structured pages." },
  { title: "Multi-Channel Asset Generator", desc: "Generate blog copy, social media hooks, and newsletter layout variations from a single source document." },
  { title: "Intelligent Social Scheduling", desc: "Extract key learnings from technical docs and schedule visual threads for Twitter, LinkedIn, or newsletters." },
  { title: "Dynamic A/B Ad Copy", desc: "Optimize PPC performance with automated generation of ad variants matched to visitor intents." }
];

export default function MarketingAutomationPage() {
  return (
    <>
      <section style={{ paddingTop: "140px", paddingBottom: "60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(255,46,209,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="container-wide" style={{ position: "relative" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none", marginBottom: "24px" }}>
            <ArrowLeft size={14} /> Back to Home
          </Link>
          <div className="section-label" style={{ display: "inline-flex", marginBottom: "20px", color: "#FF2ED1", background: "rgba(255,46,209,0.08)", borderColor: "rgba(255,46,209,0.25)" }}>
            <Zap size={11} /> Content Operations
          </div>
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", marginBottom: "20px" }}>
            Marketing &amp; SEO <span className="gradient-text-full">Automation</span>
          </h1>
          <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "1.1rem", color: "var(--text-muted)", maxWidth: "600px", lineHeight: 1.7 }}>
            Multiply content output and inbound organic traffic. Deploy programmatic SEO and multi-channel marketing campaigns powered by AI.
          </p>
        </div>
      </section>

      {/* Metrics Row */}
      <section style={{ paddingBottom: "40px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {[
              { label: "Content Velocity", value: "10x output scale" },
              { label: "Organic Inbound", value: "4x traffic multiplier" },
              { label: "Asset Curation", value: "80% faster drafting" }
            ].map((stat, i) => (
              <div key={i} className="card-glass" style={{ padding: "24px", textAlign: "center" }}>
                <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.5rem", fontWeight: 800, color: "var(--hot-pink)", marginBottom: "6px" }}>{stat.value}</div>
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
                Programmatic and Structured Content
              </h2>
              <p style={{ fontFamily: "Exo 2, sans-serif", color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "24px" }}>
                Relying entirely on manual copywriting delays search engine presence. We engineer programmatic content pipelines that ingest structured dataset tables and transform them into thousands of search-engine optimized landings. Every generated page incorporates technical schemas and strict factual checks to eliminate errors and maintain brand authority.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {features.map((f) => (
                  <div key={f.title} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <CheckCircle size={16} color="var(--hot-pink)" style={{ flexShrink: 0, marginTop: "3px" }} />
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
                <Zap size={18} color="var(--hot-pink)" />
                <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1rem", fontWeight: 700, color: "var(--hot-pink)" }}>
                  SEO stack audit
                </h3>
              </div>
              <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "24px" }}>
                We inspect your target keywords, competitors, and indexing velocities to scope custom LLM SEO workflows and programmatic generators.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "32px" }}>
                {["Programmatic SEO Analysis", "Competitive Content Plan", "12-Month Organic Forecast"].map((b) => (
                  <div key={b} style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    <ShieldCheck size={14} color="var(--hot-pink)" />
                    {b}
                  </div>
                ))}
              </div>

              <Link href="/contact" className="btn-primary" style={{ width: "100%", justifyContent: "center", display: "inline-flex", gap: "6px", background: "linear-gradient(135deg, var(--hot-pink), var(--violet))" }}>
                Request Marketing Audit <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
