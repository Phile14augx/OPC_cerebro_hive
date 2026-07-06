"use client";
import { Brain, CheckCircle, ArrowRight, ArrowLeft, Zap, FileSearch, Map, Shield, Building, TrendingUp, Users, Search, ClipboardList, Award, UserCheck, Globe, BarChart2, Telescope } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const offerings = [
  {
    icon: FileSearch, color: "#00E5FF", tag: "Assessment",
    title: "AI Readiness Assessment",
    desc: "Scored diagnostic across 5 maturity dimensions — Data Infrastructure, Process Automation Potential, Workforce AI Literacy, Governance & Risk, and Technology Architecture.",
    bullets: ["AI Maturity Scorecard (25-metric framework)", "Top 30 automation candidates ranked by ROI", "90-day Quick-Win Roadmap"],
    price: "₹3L – ₹8L",
    timeline: "4–6 weeks",
  },
  {
    icon: Map, color: "#7B61FF", tag: "Strategy",
    title: "AI Transformation Strategy",
    desc: "A full multi-quarter AI roadmap with initiative portfolio, build-vs-buy decisions, governance framework, and financial business cases for each initiative.",
    bullets: ["2–3 year AI Strategic Vision Document", "Tech Architecture Blueprint", "Financial ROI model for top 5 initiatives"],
    price: "₹12L – ₹40L",
    timeline: "10–14 weeks",
  },
  {
    icon: Shield, color: "#FF8A00", tag: "Governance",
    title: "AI Governance & Responsible AI",
    desc: "Build your AI governance structure from the ground up — policies, oversight, risk classification, ethics committees, and compliance frameworks aligned to EU AI Act, DPDP Act, and NIST AI RMF.",
    bullets: ["AI Policy Handbook & Risk Classification System", "Model Risk Management Framework", "Regulatory Compliance Matrix (DPDP, EU AI Act, ISO 42001)"],
    price: "₹8L – ₹25L",
    timeline: "6–10 weeks",
  },
  {
    icon: ClipboardList, color: "#00E5FF", tag: "Workshop",
    title: "AI Use Case Discovery Workshops",
    desc: "1–3 day facilitated workshops with cross-functional leadership teams to identify, score, and sequence AI use cases using a 6-factor prioritization matrix.",
    bullets: ["Opportunity scoring across feasibility, ROI, complexity", "Ranked use case portfolio with business cases", "12-month execution sequencing plan"],
    price: "₹1.5L – ₹5L",
    timeline: "1–3 days",
  },
  {
    icon: Building, color: "#FF2ED1", tag: "CoE",
    title: "AI Center of Excellence Setup",
    desc: "Design, build, and operationalize an internal AI CoE — the organizational unit that owns AI strategy, standards, tooling, and delivery capability inside your organization.",
    bullets: ["CoE Operating Model & Team Structure Blueprint", "Technology Platform Selection & Internal AI Standards", "90-Day Launch Plan with stakeholder playbook"],
    price: "₹20L – ₹60L",
    timeline: "12–20 weeks",
  },
  {
    icon: Globe, color: "#7B61FF", tag: "Digital Transformation",
    title: "Digital Transformation Advisory",
    desc: "Broader than AI alone — modernize your entire technology and operations stack with AI embedded as the intelligence layer across digital infrastructure.",
    bullets: ["Legacy ERP/CRM modernization strategy", "Cloud migration architecture & vendor selection", "API-first & data platform consolidation roadmap"],
    price: "₹5L – ₹1Cr",
    timeline: "Ongoing / scoped",
  },
  {
    icon: Search, color: "#FF8A00", tag: "Vendor",
    title: "AI Vendor Evaluation & Selection",
    desc: "Objective, vendor-neutral evaluation of AI platforms, LLMs, automation tools, and data systems — no kickbacks, no preferred partnerships.",
    bullets: ["Market scan of 15–30 vendors per category", "Weighted scorecard & TCO model for top 3 finalists", "RFP management & Contract review guidance"],
    price: "₹3L – ₹12L",
    timeline: "4–8 weeks",
  },
  {
    icon: BarChart2, color: "#00E5FF", tag: "Audit",
    title: "Post-Implementation AI Audit",
    desc: "Review of deployed AI systems — examining model drift, governance compliance, business value delivery, bias, security, and ROI vs. original projections.",
    bullets: ["Model performance & bias testing", "Governance & regulatory compliance review", "Severity-classified findings with remediation roadmap"],
    price: "₹4L – ₹15L",
    timeline: "3–5 weeks",
  },
  {
    icon: TrendingUp, color: "#FF2ED1", tag: "Retainer",
    title: "AI Advisory Retainer",
    desc: "Ongoing monthly access to CerebroHive's strategic AI expertise — a trusted AI thought partner on demand, without commissioning a full project each time.",
    bullets: ["Starter (4 hrs/mo): ₹75K/mo", "Growth (8 hrs/mo): ₹2L/mo", "Strategic (16 hrs/mo): ₹5L/mo"],
    price: "₹75K – ₹10L/mo",
    timeline: "Monthly, ongoing",
  },
  {
    icon: UserCheck, color: "#7B61FF", tag: "Executive",
    title: "Fractional Chief AI Officer (CAiO)",
    desc: "A senior AI leader functioning as your Chief AI Officer on a fractional basis — owning AI strategy, vendor relationships, team building, governance, and board-level AI narrative.",
    bullets: ["AI roadmap ownership & CoE oversight", "Board & investor AI representation", "2–4 days/month, minimum 6-month engagement"],
    price: "₹3L – ₹8L/mo",
    timeline: "6+ month engagement",
  },
];

const process = [
  { step: "01", title: "Assess", desc: "15-point readiness audit across data, technology, talent, processes, and leadership alignment." },
  { step: "02", title: "Strategize", desc: "Map prioritised opportunities to your business objectives. Score ROI and rank implementation complexity." },
  { step: "03", title: "Design", desc: "Architect the technical and organisational blueprint. Select models, design integrations, plan change management." },
  { step: "04", title: "Deploy", desc: "Execute the first 90 days: build, test, go-live, measure outcomes, and iterate based on real-world performance data." },
];

const stats = [
  { label: "AI Roadmaps Delivered", value: "120+" },
  { label: "Average Cost Reduction", value: "35%" },
  { label: "Fastest Engagement", value: "90 Days" },
];

const retainerTiers = [
  { name: "Starter", hours: "4 hrs/mo", includes: "Monthly strategy call, async Q&A, quarterly roadmap review", price: "₹75,000 / $1,000" },
  { name: "Growth", hours: "8 hrs/mo", includes: "Bi-weekly calls, vendor evaluations, use case reviews, priority async access", price: "₹2,00,000 / $2,500" },
  { name: "Strategic", hours: "16 hrs/mo", includes: "Weekly calls, CoE support, board prep, executive AI coaching, first-response SLA", price: "₹5,00,000 / $6,500" },
  { name: "Enterprise Partner", hours: "30+ hrs/mo", includes: "Embedded advisory, dedicated AI lead, unlimited async, quarterly on-site", price: "₹10,00,000+ / $12,000+" },
];

export default function AIConsultingPage() {
  const [activeTab, setActiveTab] = useState<"services" | "retainer">("services");

  return (
    <>
      {/* Hero */}
      <section style={{ paddingTop: "140px", paddingBottom: "60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,229,255,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="container-wide" style={{ position: "relative" }}>
          <Link href="/services" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none", marginBottom: "24px", transition: "color 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>
            <ArrowLeft size={14} /> Back to Services
          </Link>
          <div className="section-label" style={{ display: "inline-flex", marginBottom: "20px" }}>
            <Brain size={11} /> Strategy & Governance
          </div>
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", marginBottom: "20px" }}>
            AI Consulting <span className="gradient-text-full">& Strategy</span>
          </h1>
          <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "1.1rem", color: "var(--text-muted)", maxWidth: "640px", lineHeight: 1.7 }}>
            From first AI assessment to organization-wide transformation. Ten distinct consulting engagements — strategy, governance, CoE design, vendor selection, and fractional executive leadership — delivered by practitioners who've built real systems, not just PowerPoints.
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

      {/* Process Timeline */}
      <section style={{ paddingBottom: "48px" }}>
        <div className="container-wide">
          <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.4rem", fontWeight: 700, marginBottom: "32px" }}>Our 4-step consulting process</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0", position: "relative" }}>
            <div style={{ position: "absolute", top: "28px", left: "calc(12.5% + 10px)", right: "calc(12.5% + 10px)", height: "1px", background: "linear-gradient(90deg, var(--neural-blue), var(--violet), var(--hive-orange), transparent)", opacity: 0.3, zIndex: 0 }} />
            {process.map((p, i) => (
              <div key={p.step} style={{ padding: "0 16px", position: "relative", zIndex: 1 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: `rgba(0,229,255,${0.08 + i * 0.02})`, border: `1px solid rgba(0,229,255,${0.2 + i * 0.1})`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                  <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.7rem", fontWeight: 800, color: "var(--neural-blue)" }}>{p.step}</span>
                </div>
                <h4 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.9rem", fontWeight: 700, marginBottom: "8px" }}>{p.title}</h4>
                <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tab switcher */}
      <section style={{ paddingBottom: "12px" }}>
        <div className="container-wide">
          <div style={{ display: "flex", gap: "12px", marginBottom: "32px" }}>
            {(["services", "retainer"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{
                  padding: "10px 24px", borderRadius: "8px", cursor: "pointer", fontFamily: "Orbitron, sans-serif", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", transition: "all 0.2s",
                  background: activeTab === tab ? "rgba(0,229,255,0.1)" : "rgba(255,255,255,0.03)",
                  border: activeTab === tab ? "1px solid var(--neural-blue)" : "1px solid rgba(255,255,255,0.06)",
                  color: activeTab === tab ? "var(--neural-blue)" : "var(--text-muted)",
                }}>
                {tab === "services" ? "All 10 Services" : "Advisory Retainer Tiers"}
              </button>
            ))}
          </div>

          {activeTab === "services" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
              {offerings.map((off) => {
                const Icon = off.icon;
                return (
                  <div key={off.title} className="card-glass" style={{ padding: "32px 28px", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: 42, height: 42, borderRadius: "10px", background: `${off.color}14`, border: `1px solid ${off.color}28`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icon size={18} color={off.color} />
                        </div>
                        <div>
                          <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.58rem", fontWeight: 700, color: off.color, background: `${off.color}12`, border: `1px solid ${off.color}25`, padding: "2px 8px", borderRadius: "100px", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>{off.tag}</span>
                          <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.92rem", fontWeight: 700, color: "var(--text-primary)" }}>{off.title}</h3>
                        </div>
                      </div>
                    </div>
                    <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.83rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "16px" }}>{off.desc}</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px", flex: 1 }}>
                      {off.bullets.map((b) => (
                        <div key={b} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                          <CheckCircle size={12} color={off.color} style={{ flexShrink: 0, marginTop: "2px" }} />
                          <span style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.78rem", color: "var(--text-muted)" }}>{b}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", display: "block" }}>Investment</span>
                        <span style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.82rem", fontWeight: 600, color: off.color }}>{off.price}</span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", display: "block" }}>Timeline</span>
                        <span style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)" }}>{off.timeline}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "retainer" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
              {retainerTiers.map((tier, i) => (
                <div key={tier.name} className="card-glass" style={{ padding: "32px 28px", borderColor: i === 2 ? "rgba(123,97,255,0.3)" : "rgba(255,255,255,0.07)" }}>
                  {i === 2 && (
                    <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.55rem", fontWeight: 700, color: "#7B61FF", background: "rgba(123,97,255,0.1)", border: "1px solid rgba(123,97,255,0.3)", padding: "3px 10px", borderRadius: "100px", textTransform: "uppercase", display: "inline-block", marginBottom: "12px" }}>Most Popular</div>
                  )}
                  <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>{tier.name}</h3>
                  <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.75rem", fontWeight: 700, color: "var(--neural-blue)", marginBottom: "16px" }}>{tier.hours}</div>
                  <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.83rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "20px" }}>{tier.includes}</p>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)" }}>{tier.price}</span>
                    <Link href="/contact" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--neural-blue)", fontSize: "0.78rem", fontWeight: 600, textDecoration: "none" }}>
                      Get Started <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              ))}
              <div className="card-glass" style={{ padding: "32px 28px", gridColumn: "1 / -1", background: "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(123,97,255,0.04) 0%, transparent 70%)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                  <Telescope size={20} color="#7B61FF" />
                  <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1rem", fontWeight: 700 }}>Fractional Chief AI Officer</h3>
                  <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.58rem", color: "#7B61FF", background: "rgba(123,97,255,0.1)", border: "1px solid rgba(123,97,255,0.3)", padding: "2px 8px", borderRadius: "100px", textTransform: "uppercase" }}>Executive</span>
                </div>
                <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.87rem", color: "var(--text-muted)", lineHeight: 1.7, maxWidth: "700px", marginBottom: "20px" }}>
                  A senior AI leader functioning as your Chief AI Officer on a fractional basis. Owns AI roadmap, vendor relationships, team building, governance, and board-level AI narrative — without the cost of a full-time CAiO hire at ₹80L–₹2Cr annually.
                </p>
                <div style={{ display: "flex", gap: "32px", marginBottom: "24px", flexWrap: "wrap" }}>
                  {["AI roadmap ownership", "CoE design & oversight", "Board & investor representation", "AI risk & compliance ownership", "Vendor negotiation & selection", "2–4 days/month engagement"].map((item) => (
                    <div key={item} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <CheckCircle size={12} color="#7B61FF" style={{ flexShrink: 0 }} />
                      <span style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.78rem", color: "var(--text-muted)" }}>{item}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                  <span style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>₹3,00,000 – ₹8,00,000 / month &nbsp;·&nbsp; Minimum 6-month engagement</span>
                  <Link href="/contact" className="btn-primary" style={{ display: "inline-flex", gap: "6px" }}>
                    Discuss Fractional CAiO <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Core Showcase */}
      <section style={{ paddingTop: "40px", paddingBottom: "40px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "60px", alignItems: "start" }}>
            <div>
              <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.5rem", fontWeight: 700, marginBottom: "20px" }}>
                Strategy without execution is theory.
              </h2>
              <p style={{ fontFamily: "Exo 2, sans-serif", color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "28px" }}>
                Most AI consulting engagements end with a PowerPoint. Ours end with a live system. We embed our architects directly inside your operations, build the first working prototype with your team, and don&apos;t disengage until you have a measurable business outcome — not just a roadmap.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {[
                  "Executive board alignment workshops",
                  "Vendor-neutral technology selection (no kickbacks)",
                  "Custom model and integration architecture",
                  "Risk and governance framework design",
                  "India-specific regulatory compliance (DPDP, RBI, SEBI, GST)",
                  "30-60-90 day milestone accountability structure",
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
                  Free AI Readiness Call
                </h3>
              </div>
              <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "24px" }}>
                30-minute scoping call with one of our AI architects. We&apos;ll review your current operations, identify your highest-impact automation opportunity, and outline a preliminary roadmap — at no cost.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
                {[
                  "No sales pitch — a genuine architecture review",
                  "Receive a written preliminary assessment",
                  "We'll tell you honestly if AI isn't the right next step",
                ].map((b) => (
                  <div key={b} style={{ display: "flex", gap: "8px", alignItems: "flex-start", fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "Exo 2, sans-serif" }}>
                    <CheckCircle size={13} color="var(--neural-blue)" style={{ flexShrink: 0, marginTop: "2px" }} /> {b}
                  </div>
                ))}
              </div>
              <Link href="/contact" className="btn-primary" style={{ width: "100%", justifyContent: "center", display: "inline-flex", gap: "6px" }}>
                Book a Free Architecture Call <ArrowRight size={14} />
              </Link>
              <div style={{ marginTop: "16px", textAlign: "center" }}>
                <Link href="/tools/ai-readiness" style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-muted)", textDecoration: "none" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "var(--neural-blue)"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>
                  Or take the free AI Readiness Assessment →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom trust row */}
      <section style={{ paddingBottom: "100px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {[
              { label: "Vendor-neutral", desc: "We have no preferred vendor relationships. Every recommendation is based purely on client fit.", color: "#00E5FF" },
              { label: "India-First Design", desc: "Every engagement accounts for India-specific regulations — DPDP Act, RBI, SEBI, GST, and MCA21.", color: "#7B61FF" },
              { label: "Outcome-based delivery", desc: "We define measurable KPIs before we start. If targets aren't hit, we keep iterating.", color: "#FF8A00" },
            ].map((item) => (
              <div key={item.label} style={{ padding: "24px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px" }}>
                <h4 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.85rem", fontWeight: 700, color: item.color, marginBottom: "8px" }}>{item.label}</h4>
                <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
