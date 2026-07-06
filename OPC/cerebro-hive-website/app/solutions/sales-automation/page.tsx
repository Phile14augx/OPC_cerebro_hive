"use client";
import { CheckCircle, ShieldCheck, Zap, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

const features = [
  { title: "Lead Ingestion & Scoring", desc: "Automate inbound lead scoring based on corporate metadata, LinkedIn profiles, and engagement data." },
  { title: "Outbound Nurture Agents", desc: "Deploy hyper-personalized email outreach sequences that dynamically update based on recipient feedback." },
  { title: "Autonomous Booking Sync", desc: "Connect prospects directly to Calendly/HubSpot calendars once qualification criteria are matched." },
  { title: "CRM Sync Automation", desc: "Perform hands-free pipeline updates, interaction notes logging, and email history sync in Salesforce/HubSpot." }
];

export default function SalesAutomationPage() {
  return (
    <>
      <section style={{ paddingTop: "140px", paddingBottom: "60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(123,97,255,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="container-wide" style={{ position: "relative" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none", marginBottom: "24px" }}>
            <ArrowLeft size={14} /> Back to Home
          </Link>
          <div className="section-label" style={{ display: "inline-flex", marginBottom: "20px", color: "#7B61FF", background: "rgba(123,97,255,0.08)", borderColor: "rgba(123,97,255,0.25)" }}>
            <Zap size={11} /> Revenue Operations
          </div>
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", marginBottom: "20px" }}>
            Sales &amp; Pipeline <span className="gradient-text-blue-violet">Automation</span>
          </h1>
          <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "1.1rem", color: "var(--text-muted)", maxWidth: "600px", lineHeight: 1.7 }}>
            Shorten sales cycles and eliminate manual data entry. Deploy autonomous sales development agents that source, qualify, and book meetings.
          </p>
        </div>
      </section>

      {/* Metrics Row */}
      <section style={{ paddingBottom: "40px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {[
              { label: "Lead Response Time", value: "< 5 minute followup" },
              { label: "Meeting Rates", value: "3x meetings booked" },
              { label: "CRM Logging", value: "100% automated logging" }
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
                Always-on Pipeline Ingestion
              </h2>
              <p style={{ fontFamily: "Exo 2, sans-serif", color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "24px" }}>
                Manual CRM logging and slow lead follow-ups cost deals. Our sales automation pipelines act immediately when an inquiry hits your forms or LinkedIn campaigns. By using secure webhooks and LLMs, we enrich prospects, generate personalized icebreakers, follow up in minutes, and book calls directly on sales representatives&apos; calendars.
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
                  RevOps Assessment
                </h3>
              </div>
              <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "24px" }}>
                We analyze your lead routing rules, CRM structure, and email domain reputation to design a secure, high-yield sales automation stack.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "32px" }}>
                {["Outbound Lead Scopes", "CRM Flow Map Recommendations", "Email Deliverability Optimization Plan"].map((b) => (
                  <div key={b} style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    <ShieldCheck size={14} color="var(--violet)" />
                    {b}
                  </div>
                ))}
              </div>

              <Link href="/contact" className="btn-primary" style={{ width: "100%", justifyContent: "center", display: "inline-flex", gap: "6px", background: "linear-gradient(135deg, var(--violet), var(--hot-pink))" }}>
                Request Pipeline Audit <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
