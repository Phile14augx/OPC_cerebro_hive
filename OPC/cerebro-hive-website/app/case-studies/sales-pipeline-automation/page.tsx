"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Brain, Network, Sparkles, Calendar } from "lucide-react";

export default function SalesPipelineCaseStudy() {
  const [booked, setBooked] = useState(false);

  const stats = [
    { label: "Increase in Qualified Leads", value: "3x" },
    { label: "CRM Data Accuracy", value: "85%" },
    { label: "Saved per Sales Rep/mo", value: "180+ Hrs" }
  ];

  const approachCards = [
    {
      icon: Brain,
      title: "Scoring Models",
      desc: "Programmed custom LLM routers classifying lead intent based on download behavior."
    },
    {
      icon: Network,
      title: "Enrichment Agents",
      desc: "Scraped verified public endpoints to parse company size and tech stack keywords."
    },
    {
      icon: Sparkles,
      title: "Contextual Copy",
      desc: "Generated personalized outbound drafts referencing client pain points."
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section style={{ paddingTop: "140px", paddingBottom: "50px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(123,97,255,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="container-wide" style={{ position: "relative" }}>
          
          <Link href="/case-studies" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none", marginBottom: "24px", transition: "color 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>
            <ArrowLeft size={14} /> Back to Case Studies
          </Link>

          <div className="section-label" style={{ display: "inline-flex", marginBottom: "20px", color: "var(--violet)", background: "rgba(123,97,255,0.06)", borderColor: "rgba(123,97,255,0.2)" }}>
            Case Study: Revenue Automation
          </div>

          <h1 style={{ fontSize: "clamp(2.2rem, 4vw, 3rem)", marginBottom: "24px", lineHeight: 1.25 }}>
            Autonomous Prospecting and CRM Data Enrichment
          </h1>

          {/* Metadata Grid */}
          <div className="card-glass" style={{ padding: "24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "20px" }}>
            <div>
              <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "4px" }}>Client</span>
              <strong style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.95rem", color: "var(--text-primary)" }}>Vanguard Financial</strong>
            </div>
            <div>
              <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "4px" }}>Timeline</span>
              <strong style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.95rem", color: "var(--text-primary)" }}>6 Weeks</strong>
            </div>
            <div>
              <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "4px" }}>Industry</span>
              <strong style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.95rem", color: "var(--text-primary)" }}>Finance & Investment</strong>
            </div>
            <div>
              <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "4px" }}>Core Tech</span>
              <strong style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.95rem", color: "var(--text-primary)" }}>LangGraph · GPT-4o · Hubspot</strong>
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
                <div style={{ fontFamily: "var(--font-mono), JetBrains Mono, monospace", fontSize: "1.8rem", fontWeight: 800, color: "var(--violet)", marginBottom: "6px" }}>{s.value}</div>
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
              Vanguard Financial Services struggled with lead qualification. Their sales development representatives (SDRs) spent over 60% of their workday scraping LinkedIn profiles, manually validating email domains, typing repetitive outreach messages, and updating CRM fields.
            </p>
            <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
              Because lead enrichment was slow, response rates to incoming inbound downloads fell behind, causing hundreds of prospective investment clients to drop out of the sales funnel.
            </p>
          </div>

          {/* Approach Card */}
          <div className="card-glass" style={{ padding: "36px 30px" }}>
            <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.4rem", fontWeight: 700, marginBottom: "20px", color: "var(--text-primary)" }}>Our Approach</h2>
            <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.7, marginBottom: "28px" }}>
              CerebroHive engineered an autonomous sales intelligence program orchestrated by LangGraph and GPT-4o:
            </p>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "28px" }}>
              {approachCards.map((c, i) => {
                const Icon = c.icon;
                return (
                  <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "24px" }}>
                    <div style={{ width: 40, height: 40, borderRadius: "8px", background: "rgba(123,97,255,0.08)", border: "1px solid rgba(123,97,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px", color: "var(--violet)" }}>
                      <Icon size={18} />
                    </div>
                    <h4 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>{c.title}</h4>
                    <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{c.desc}</p>
                  </div>
                );
              })}
            </div>
            
            <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
              Our LangGraph agent networks dynamically qualified incoming leads. The moment a contact form was submitted, a research node enriched the profile with firmographic details, scored the intent, and drafted a highly tailored introduction sequence in Hubspot—ready for sales rep review and trigger.
            </p>
          </div>

          {/* Results Card */}
          <div className="card-glass" style={{ padding: "36px 30px" }}>
            <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.4rem", fontWeight: 700, marginBottom: "20px", color: "var(--text-primary)" }}>The Results</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "28px" }}>
              {stats.map((r, i) => (
                <div key={i} style={{ textAlign: "center", padding: "20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px" }}>
                  <span style={{ display: "block", fontFamily: "var(--font-mono), JetBrains Mono, monospace", fontSize: "1.8rem", fontWeight: 800, color: "var(--violet)" }}>{r.value}</span>
                  <span style={{ display: "block", fontFamily: "Exo 2, sans-serif", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>{r.label}</span>
                </div>
              ))}
            </div>
            <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
              Sales reps focused entirely on calling highly qualified accounts instead of scraping data. Response rates to incoming inbound downloads skyrocketed, driving a triple-digit increase in demo conversions.
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
            <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.85rem", fontWeight: 700, color: "var(--violet)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "16px" }}>Client Testimonial</h3>
            <blockquote style={{ fontFamily: "Exo 2, sans-serif", fontSize: "1.1rem", fontStyle: "italic", color: "var(--text-primary)", lineHeight: 1.7, marginBottom: "16px" }}>
              &quot;The custom enrichment pipelines engineered by CerebroHive allowed our sales team to instantly qualify leads within minutes. Our pipeline volume has tripled, and manual contact scraping is a thing of the past.&quot;
            </blockquote>
            <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", display: "block" }}>— VP of Revenue, Vanguard Financial</span>
          </div>

          {/* CTA Section */}
          <div className="card-glass" style={{ padding: "48px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", border: "1px solid rgba(123,97,255,0.15)" }}>
            <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)" }}>Deploy AI-Native Sales Pipelines</h3>
            <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.9rem", color: "var(--text-muted)", maxWidth: "500px", lineHeight: 1.6 }}>
              Connect with our solutions engineers to build automated research nodes and lead-scoring workflows for your CRM.
            </p>
            <button
              onClick={() => setBooked(true)}
              disabled={booked}
              className="btn-primary"
              style={{ display: "inline-flex", gap: "6px", cursor: booked ? "not-allowed" : "pointer", background: "var(--violet)", borderColor: "var(--violet)" }}
              onMouseEnter={(e) => {
                if (!booked) {
                  e.currentTarget.style.opacity = "0.9";
                  e.currentTarget.style.boxShadow = "0 0 15px rgba(123, 97, 255, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <Calendar size={16} /> {booked ? "Session Booked!" : "Book Similar Project Consultation"}
            </button>
          </div>

        </div>
      </section>
    </>
  );
}
