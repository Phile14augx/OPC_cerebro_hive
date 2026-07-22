"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, GraduationCap, Award, Calendar } from "lucide-react";

export default function CorporateTrainingCaseStudy() {
  const [booked, setBooked] = useState(false);

  const stats = [
    { label: "Certified Engineers", value: "50+" },
    { label: "Coding Velocity Gains", value: "40%" },
    { label: "Course Onboarding Score", value: "98%" }
  ];

  const approachCards = [
    {
      icon: BookOpen,
      title: "Tailored Syllabus",
      desc: "Created role-based paths covering RAG pipelines, API proxies, and agent loops."
    },
    {
      icon: GraduationCap,
      title: "Interactive Labs",
      desc: "Deployed sandbox notebooks simulating database parsing and token routing."
    },
    {
      icon: Award,
      title: "Proctored Audits",
      desc: "Implemented custom exam modules with QR code certificate generation."
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section style={{ paddingTop: "60px", paddingBottom: "50px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(123,97,255,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="container-wide" style={{ position: "relative" }}>
          
          <Link href="/case-studies" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none", marginBottom: "24px", transition: "color 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>
            <ArrowLeft size={14} /> Back to Case Studies
          </Link>

          <div className="section-label" style={{ display: "inline-flex", marginBottom: "20px", color: "var(--violet)", background: "rgba(123,97,255,0.06)", borderColor: "rgba(123,97,255,0.2)" }}>
            Case Study: Academy Education
          </div>

          <h1 style={{ fontSize: "clamp(2.2rem, 4vw, 3rem)", marginBottom: "24px", lineHeight: 1.25 }}>
            Enterprise AI Transformation and Developer Up-skilling
          </h1>

          {/* Metadata Grid */}
          <div className="card-glass" style={{ padding: "24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "20px" }}>
            <div>
              <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "4px" }}>Client</span>
              <strong style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.95rem", color: "var(--text-primary)" }}>Apex Software Labs</strong>
            </div>
            <div>
              <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "4px" }}>Timeline</span>
              <strong style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.95rem", color: "var(--text-primary)" }}>12 Weeks</strong>
            </div>
            <div>
              <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "4px" }}>Industry</span>
              <strong style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.95rem", color: "var(--text-primary)" }}>Software Development</strong>
            </div>
            <div>
              <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "4px" }}>Core Tech</span>
              <strong style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.95rem", color: "var(--text-primary)" }}>CerebroLearn LMS · Lab Sprints</strong>
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
              Apex Software Labs wanted to transition their engineering workforce into AI developers. While their teams were skilled in standard typescript and python backend architectures, they lacked structured expertise in RAG vector database integration, guardrail systems, and multi-agent frameworks.
            </p>
            <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
              Without a centralized up-skilling program, developer learning was fragmented, leading to delayed SaaS AI feature releases and insecure token management practices.
            </p>
          </div>

          {/* Approach Card */}
          <div className="card-glass" style={{ padding: "36px 30px" }}>
            <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.4rem", fontWeight: 700, marginBottom: "20px", color: "var(--text-primary)" }}>Our Approach</h2>
            <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.7, marginBottom: "28px" }}>
              CerebroHive Academy deployed a custom enterprise-cohort program powered by our CerebroLearn platform:
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
              We conducted a 12-week hybrid bootcamp. Engineers attended weekly live architect-led workshops, solved coding labs in shared environments, completed security audits, and graduated with shareable credentials validating their ability to deploy secure production-grade AI systems.
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
              Apex Software Labs successfully launched three core SaaS AI capabilities (semantic file queries, auto-tagging, and developer bots) within 3 months post-bootcamp. Development cycles reduced significantly due to standardized coding structures.
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
              &quot;Partnering with CerebroHive Academy provided the structured up-skilling roadmap our engineering teams needed. Our development velocity increased, security guidelines are standardized, and our AI feature pipeline is thriving.&quot;
            </blockquote>
            <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", display: "block" }}>— VP of Engineering, Apex Software Labs</span>
          </div>

          {/* CTA Section */}
          <div className="card-glass" style={{ padding: "48px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", border: "1px solid rgba(123,97,255,0.15)" }}>
            <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)" }}>Up-Skill Your Engineering Force</h3>
            <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.9rem", color: "var(--text-muted)", maxWidth: "500px", lineHeight: 1.6 }}>
              Connect with our training directors to design custom developer, solutions architect, or product manager pathways for your teams.
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
