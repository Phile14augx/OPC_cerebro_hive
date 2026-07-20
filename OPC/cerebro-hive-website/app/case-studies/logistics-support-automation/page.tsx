"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Database, Server, Settings, Calendar } from "lucide-react";

export default function LogisticsSupportCaseStudy() {
  const [booked, setBooked] = useState(false);

  const stats = [
    { label: "Support Cost Reduction", value: "65%" },
    { label: "Average Response Latency", value: "< 12 Min" },
    { label: "Verified CSAT Score", value: "94%" }
  ];

  const approachCards = [
    {
      icon: Database,
      title: "Vector Indexing",
      desc: "Indexed legacy shipping manuals and operational protocols in Pinecone."
    },
    {
      icon: Server,
      title: "API Integrations",
      desc: "Wired webhook triggers connecting Salesforce CRM and shipping databases."
    },
    {
      icon: Settings,
      title: "Human-In-The-Loop",
      desc: "Integrated slack validation notifications for high-priority shipments."
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section style={{ paddingTop: "60px", paddingBottom: "50px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(0,229,255,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="container-wide" style={{ position: "relative" }}>
          
          <Link href="/case-studies" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none", marginBottom: "24px", transition: "color 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>
            <ArrowLeft size={14} /> Back to Case Studies
          </Link>

          <div className="section-label" style={{ display: "inline-flex", marginBottom: "20px", color: "var(--neural-blue)", background: "rgba(0,229,255,0.06)", borderColor: "rgba(0,229,255,0.2)" }}>
            Case Study: Automation
          </div>

          <h1 style={{ fontSize: "clamp(2.2rem, 4vw, 3rem)", marginBottom: "24px", lineHeight: 1.25 }}>
            Automating Email Ticketing and Support Operations
          </h1>

          {/* Metadata Grid */}
          <div className="card-glass" style={{ padding: "24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "20px" }}>
            <div>
              <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "4px" }}>Client</span>
              <strong style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.95rem", color: "var(--text-primary)" }}>Global Logistics Corp</strong>
            </div>
            <div>
              <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "4px" }}>Timeline</span>
              <strong style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.95rem", color: "var(--text-primary)" }}>8 Weeks</strong>
            </div>
            <div>
              <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "4px" }}>Industry</span>
              <strong style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.95rem", color: "var(--text-primary)" }}>Logistics & Supply Chain</strong>
            </div>
            <div>
              <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "4px" }}>Core Tech</span>
              <strong style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.95rem", color: "var(--text-primary)" }}>n8n · Claude 3.5 · Pinecone</strong>
            </div>
          </div>

        </div>
      </section>

      {/* Stats Row */}
      <section style={{ paddingBottom: "40px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {stats.map((s, idx) => (
              <div key={idx} className="card-glass" style={{ padding: "24px", textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-mono), JetBrains Mono, monospace", fontSize: "1.8rem", fontWeight: 800, color: "var(--neural-blue)", marginBottom: "6px" }}>{s.value}</div>
                <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-muted)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section style={{ paddingBottom: "100px" }}>
        <div className="container-wide" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          
          {/* Challenge Card */}
          <div className="card-glass" style={{ padding: "36px 30px" }}>
            <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.4rem", fontWeight: 700, marginBottom: "16px", color: "var(--text-primary)" }}>The Challenge</h2>
            <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.7, marginBottom: "16px" }}>
              Global Logistics Corp faced extreme ticket backlogs in their customer operations. Manual support staff spent hours parsing delivery inquiry emails, looking up package logs across three legacy databases, and copy-pasting status updates.
            </p>
            <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
              With over 5,000 inbound emails daily, response latency stretched past 12 hours, driving down CSAT scores and causing warehouse scheduling bottlenecks.
            </p>
          </div>

          {/* Approach Card */}
          <div className="card-glass" style={{ padding: "36px 30px" }}>
            <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.4rem", fontWeight: 700, marginBottom: "20px", color: "var(--text-primary)" }}>Our Approach</h2>
            <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.7, marginBottom: "28px" }}>
              CerebroHive engineered a multi-agent automation orchestration pipeline leveraging n8n and Claude 3.5 Sonnet:
            </p>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "28px" }}>
              {approachCards.map((c, i) => {
                const Icon = c.icon;
                return (
                  <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "24px" }}>
                    <div style={{ width: 40, height: 40, borderRadius: "8px", background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px", color: "var(--neural-blue)" }}>
                      <Icon size={18} />
                    </div>
                    <h4 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>{c.title}</h4>
                    <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{c.desc}</p>
                  </div>
                );
              })}
            </div>
            
            <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
              When an email hits the inbox, an n8n webhook extracts metadata, Claude classifies the intent, parses package references, checks tracking APIs, synthesizes a polite, personalized response drafts, and routes it to the agent dashboard for quick validation.
            </p>
          </div>

          {/* Results Card */}
          <div className="card-glass" style={{ padding: "36px 30px" }}>
            <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.4rem", fontWeight: 700, marginBottom: "20px", color: "var(--text-primary)" }}>The Results</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "28px" }}>
              {stats.map((r, i) => (
                <div key={i} style={{ textAlign: "center", padding: "20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px" }}>
                  <span style={{ display: "block", fontFamily: "var(--font-mono), JetBrains Mono, monospace", fontSize: "1.8rem", fontWeight: 800, color: "var(--neural-blue)" }}>{r.value}</span>
                  <span style={{ display: "block", fontFamily: "Exo 2, sans-serif", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>{r.label}</span>
                </div>
              ))}
            </div>
            <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
              Over 82% of standard inquiries are now fully handled by the autonomous agent without staff involvement. High-priority logistics issues are routed to human operators within 5 minutes, significantly streamlining transport delivery loops.
            </p>
          </div>

          {/* Testimonial Box */}
          <div style={{
            background: "linear-gradient(90deg, rgba(123,97,255,0.06), rgba(0,229,255,0.06))",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "16px",
            padding: "36px 30px",
            position: "relative"
          }}>
            <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.85rem", fontWeight: 700, color: "var(--neural-blue)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "16px" }}>Client Testimonial</h3>
            <blockquote style={{ fontFamily: "Exo 2, sans-serif", fontSize: "1.1rem", fontStyle: "italic", color: "var(--text-primary)", lineHeight: 1.7, marginBottom: "16px" }}>
              &quot;Deploying CerebroHive&apos;s agent ecosystem completely revolutionized our back-office capacity. Our dispatch coordinators no longer waste time search-copying shipment numbers. The AI routes support logs perfectly and our delivery latency plummeted.&quot;
            </blockquote>
            <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", display: "block" }}>— Director of Operations, Global Logistics Corp</span>
          </div>

          {/* CTA Section */}
          <div className="card-glass" style={{ padding: "48px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", border: "1px solid rgba(0,229,255,0.15)" }}>
            <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)" }}>Build a Similar Agent Infrastructure</h3>
            <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.9rem", color: "var(--text-muted)", maxWidth: "500px", lineHeight: 1.6 }}>
              Let&apos;s discuss how multi-agent pipelines and vector indexing can eliminate your team&apos;s operational ticket queues.
            </p>
            <button
              onClick={() => setBooked(true)}
              disabled={booked}
              className="btn-primary"
              style={{ display: "inline-flex", gap: "6px", cursor: booked ? "not-allowed" : "pointer" }}
            >
              <Calendar size={16} /> {booked ? "Session Booked!" : "Book Similar Project Consultation"}
            </button>
          </div>

        </div>
      </section>
    </>
  );
}
