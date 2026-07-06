"use client";
import { Landmark, Heart, Factory, Scale, GraduationCap, ShoppingBag, MessageSquare, Calendar, Sparkles, Database, Users, BadgeDollarSign, ShieldAlert, ArrowRight, Zap, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const industryVerticals = [
  {
    icon: Landmark,
    color: "#00E5FF",
    tag: "BFSI",
    title: "Banking, Financial Services & Insurance",
    subtitle: "Automate compliance, processing, and risk across every banking and insurance workflow.",
    useCases: [
      { label: "KYC Automation", desc: "Aadhaar, PAN, face verification, CIBIL integration — zero-touch onboarding" },
      { label: "Loan Processing", desc: "Application intake, document verification, credit scoring, approval workflows" },
      { label: "Fraud Detection", desc: "Real-time transaction monitoring, anomaly scoring, alert routing" },
      { label: "Claims Processing", desc: "First notice of loss, document collection, adjuster routing, settlement automation" },
      { label: "RBI Compliance", desc: "Circular monitoring, SLA tracking, regulatory filing automation" },
      { label: "Revenue Cycle", desc: "Underwriting assistance, policy renewal automation, collections intelligence" },
    ],
    regulatory: ["RBI Guidelines", "IRDAI Regulations", "SEBI Directives", "PFRDA Rules"],
    href: "/solutions/erp-automation",
  },
  {
    icon: Heart,
    color: "#FF2ED1",
    tag: "Healthcare",
    title: "Healthcare & Life Sciences",
    subtitle: "AI automation for clinical documentation, patient communication, revenue cycle, and supply chain.",
    useCases: [
      { label: "Clinical Documentation", desc: "AI-assisted clinical notes, discharge summaries, medical coding (ICD-10)" },
      { label: "Patient Communication", desc: "Appointment reminders, pre-procedure instructions, post-discharge follow-up" },
      { label: "Revenue Cycle", desc: "Insurance pre-authorization, claim submission, denial management, collections" },
      { label: "Pharmacy Supply Chain", desc: "Inventory management, equipment maintenance prediction, procurement automation" },
      { label: "Administrative Automation", desc: "HR processes, payroll, compliance documentation, NABH standards" },
      { label: "Clinical Decision Support", desc: "Evidence-based treatment recommendations (advisory, not prescriptive)" },
    ],
    regulatory: ["CDSCO Regulations", "DPDP Act (Health Data)", "NABH Standards", "Clinical Establishment Act"],
    href: "/solutions/customer-support-ai",
  },
  {
    icon: Factory,
    color: "#FF8A00",
    tag: "Manufacturing",
    title: "Manufacturing & Industrial",
    subtitle: "Predictive maintenance, quality control, demand forecasting, and supply chain optimization at scale.",
    useCases: [
      { label: "Predictive Maintenance", desc: "IoT sensor data analysis to predict equipment failure before it happens" },
      { label: "Quality Control", desc: "Computer vision-based defect detection on production lines" },
      { label: "Demand Forecasting", desc: "ML models for production planning and raw material procurement" },
      { label: "Supply Chain Optimization", desc: "Supplier risk monitoring, logistics coordination, inventory optimization" },
      { label: "Energy Management", desc: "Consumption analysis, anomaly detection, optimization recommendations" },
      { label: "Workforce Scheduling", desc: "Shift management, attendance tracking, payroll for factory workforce" },
    ],
    regulatory: ["ISO 9001 / ISO 14001", "BIS Standards", "Factory Act Compliance", "EPF & ESI Act"],
    href: "/solutions/erp-automation",
  },
  {
    icon: Scale,
    color: "#7B61FF",
    tag: "Legal",
    title: "Legal Services & Law Firms",
    subtitle: "Contract intelligence, due diligence automation, and client communication — dramatically reducing billable time on repetitive tasks.",
    useCases: [
      { label: "Contract Intelligence", desc: "Automated review, clause extraction, risk flagging, comparison to standard positions" },
      { label: "Legal Research", desc: "Case law summarization, precedent identification, regulatory update monitoring" },
      { label: "Due Diligence Automation", desc: "Document review in M&A, real estate, and fundraising transactions" },
      { label: "Document Drafting", desc: "AI-assisted drafting of NDAs, employment contracts, vendor agreements" },
      { label: "Client Communication", desc: "Automated status updates, billing summaries, matter digests" },
      { label: "Practice Management", desc: "Matter tracking, billing automation, deadline management" },
    ],
    regulatory: ["Bar Council Guidelines", "DPDP Act (Client Data)", "Companies Act 2013", "Arbitration Act"],
    href: "/solutions/knowledge-management",
  },
  {
    icon: GraduationCap,
    color: "#00E5FF",
    tag: "EdTech",
    title: "Education & EdTech",
    subtitle: "AI tutoring, adaptive learning, administrative automation, and institutional analytics for schools, universities, and learning platforms.",
    useCases: [
      { label: "AI Tutoring", desc: "24/7 AI tutors that answer questions and generate custom explanations" },
      { label: "Adaptive Learning", desc: "Dynamic content sequencing based on individual learner performance" },
      { label: "Admissions Automation", desc: "Application processing, fee management, shortlisting workflows" },
      { label: "Assessment Automation", desc: "AI-generated assessments, automated grading, gap identification" },
      { label: "Student Support Agent", desc: "AI helpdesk for academic calendar, fees, and academic queries" },
      { label: "Institutional Analytics", desc: "At-risk student identification, cohort benchmarking, learning outcomes" },
    ],
    regulatory: ["UGC Regulations", "NEP 2020 Alignment", "DPDP Act (Student Data)", "AICTE Norms"],
    href: "/academy",
  },
  {
    icon: ShoppingBag,
    color: "#FF8A00",
    tag: "Retail",
    title: "Retail & E-Commerce",
    subtitle: "Recommendation engines, inventory optimization, support automation, and content generation at catalog scale.",
    useCases: [
      { label: "Product Recommendations", desc: "Personalized recommendations based on browsing, purchase, and behavioral data" },
      { label: "Inventory Optimization", desc: "Demand forecasting, automated reorder, supplier communication" },
      { label: "Customer Support AI", desc: "Order status, returns, refunds, and product queries handled by AI agents" },
      { label: "Dynamic Pricing", desc: "Real-time pricing optimization based on demand, inventory, and competitor signals" },
      { label: "Content Generation", desc: "Product descriptions, category pages, SEO content for large catalogs" },
      { label: "Fraud Detection", desc: "Real-time order fraud scoring, payment fraud detection" },
    ],
    regulatory: ["Consumer Protection Act", "IT Act 2000", "DPDP Act", "GST Compliance"],
    href: "/solutions/sales-automation",
  },
];

const functionSolutions = [
  {
    title: "Customer Support AI",
    desc: "Automate ticket deflection, emails, and voice calls with advanced RAG customer agents.",
    href: "/solutions/customer-support-ai",
    icon: MessageSquare,
    color: "#00E5FF",
    tag: "Operations",
  },
  {
    title: "Sales Automation",
    desc: "Deploy autonomous sales agents to qualify inbound leads and schedule meetings directly.",
    href: "/solutions/sales-automation",
    icon: Calendar,
    color: "#7B61FF",
    tag: "Revenue",
  },
  {
    title: "Marketing Automation",
    desc: "Scale content velocity with programmatic SEO pipelines and generative copy builders.",
    href: "/solutions/marketing-automation",
    icon: Sparkles,
    color: "#FF2ED1",
    tag: "Growth",
  },
  {
    title: "Knowledge Management",
    desc: "Unify scattered documents in Slack, Notion, and Drive into a semantic knowledge graph.",
    href: "/solutions/knowledge-management",
    icon: Database,
    color: "#00E5FF",
    tag: "Strategy",
  },
  {
    title: "HR & Recruitment",
    desc: "Accelerate recruitment, automate screening calendars, and speed up onboarding checks.",
    href: "/solutions/hr-automation",
    icon: Users,
    color: "#7B61FF",
    tag: "HR Ops",
  },
  {
    title: "Finance Automation",
    desc: "Automate receipt parsing, invoice matching, GST reconciliation, and predictive P&L models.",
    href: "/solutions/finance-automation",
    icon: BadgeDollarSign,
    color: "#FF8A00",
    tag: "Finance",
  },
  {
    title: "ERP AI Integration",
    desc: "Integrate legacy ERP schemas (SAP, Oracle, Tally) with AI decision nodes and automation.",
    href: "/solutions/erp-automation",
    icon: ShieldAlert,
    color: "#00E5FF",
    tag: "Enterprise",
  },
];

export default function SolutionsIndexPage() {
  const [activeVertical, setActiveVertical] = useState<number | null>(null);
  const [view, setView] = useState<"industry" | "function">("industry");

  return (
    <>
      <section style={{ paddingTop: "140px", paddingBottom: "50px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(0,229,255,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="container-wide" style={{ position: "relative" }}>
          <div className="section-label" style={{ display: "inline-flex", marginBottom: "20px" }}>
            <Zap size={11} /> Enterprise Solutions
          </div>
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", marginBottom: "20px" }}>
            AI Solutions <span className="gradient-text-full">Directory</span>
          </h1>
          <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "1.1rem", color: "var(--text-muted)", maxWidth: "640px", lineHeight: 1.7 }}>
            Industry-specific AI blueprints and cross-functional automation solutions — designed for the Indian market with native regulatory compliance built in.
          </p>
        </div>
      </section>

      {/* View Toggle */}
      <section style={{ paddingBottom: "12px" }}>
        <div className="container-wide">
          <div style={{ display: "flex", gap: "12px", marginBottom: "32px" }}>
            {(["industry", "function"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)}
                style={{
                  padding: "10px 24px", borderRadius: "8px", cursor: "pointer", fontFamily: "Orbitron, sans-serif", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", transition: "all 0.2s",
                  background: view === v ? "rgba(0,229,255,0.1)" : "rgba(255,255,255,0.03)",
                  border: view === v ? "1px solid var(--neural-blue)" : "1px solid rgba(255,255,255,0.06)",
                  color: view === v ? "var(--neural-blue)" : "var(--text-muted)",
                }}>
                {v === "industry" ? "By Industry Vertical" : "By Business Function"}
              </button>
            ))}
          </div>

          {/* Industry Verticals */}
          {view === "industry" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
              {industryVerticals.map((vertical, idx) => {
                const Icon = vertical.icon;
                const isActive = activeVertical === idx;
                return (
                  <div key={vertical.title} className="card-glass"
                    onClick={() => setActiveVertical(isActive ? null : idx)}
                    style={{ padding: "32px 28px", cursor: "pointer", transition: "border-color 0.25s", borderColor: isActive ? `${vertical.color}50` : "rgba(255,255,255,0.07)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: isActive ? "24px" : "0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div style={{ width: 46, height: 46, borderRadius: "12px", background: `${vertical.color}14`, border: `1px solid ${vertical.color}28`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icon size={22} color={vertical.color} />
                        </div>
                        <div>
                          <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.58rem", fontWeight: 700, color: vertical.color, background: `${vertical.color}12`, border: `1px solid ${vertical.color}25`, padding: "2px 8px", borderRadius: "100px", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>{vertical.tag}</span>
                          <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.92rem", fontWeight: 700, color: "var(--text-primary)" }}>{vertical.title}</h3>
                        </div>
                      </div>
                      <span style={{ color: "var(--text-muted)", fontSize: "1.2rem", transform: isActive ? "rotate(90deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>›</span>
                    </div>

                    {isActive && (
                      <div>
                        <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.83rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "20px" }}>{vertical.subtitle}</p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
                          {vertical.useCases.map((uc) => (
                            <div key={uc.label} style={{ padding: "12px 14px", background: `${vertical.color}06`, border: `1px solid ${vertical.color}18`, borderRadius: "8px" }}>
                              <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.65rem", fontWeight: 700, color: vertical.color, marginBottom: "4px" }}>{uc.label}</div>
                              <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{uc.desc}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                          <div>
                            <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.6rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Regulatory Alignment</div>
                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                              {vertical.regulatory.map((reg) => (
                                <span key={reg} style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.7rem", color: "var(--text-muted)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", padding: "2px 8px", borderRadius: "4px" }}>{reg}</span>
                              ))}
                            </div>
                          </div>
                          <Link href="/contact" onClick={(e) => e.stopPropagation()}
                            style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: vertical.color, fontSize: "0.78rem", fontWeight: 600, textDecoration: "none" }}>
                            Discuss Your Use Case <ArrowRight size={13} />
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Function Solutions */}
          {view === "function" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
              {functionSolutions.map((sol) => {
                const Icon = sol.icon;
                return (
                  <Link key={sol.title} href={sol.href} style={{ textDecoration: "none" }}>
                    <div className="card-glass" style={{ padding: "36px 30px", display: "flex", flexDirection: "column", height: "100%" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                        <div style={{ width: 44, height: 44, borderRadius: "10px", background: `${sol.color}14`, border: `1px solid ${sol.color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon size={20} color={sol.color} />
                        </div>
                        <span style={{ fontSize: "0.6rem", fontFamily: "Orbitron, sans-serif", fontWeight: 700, color: "var(--text-muted)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", padding: "3px 10px", borderRadius: "100px", textTransform: "uppercase" }}>
                          {sol.tag}
                        </span>
                      </div>
                      <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px" }}>{sol.title}</h3>
                      <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "28px", flex: 1 }}>{sol.desc}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: sol.color, fontSize: "0.8rem", fontWeight: 600, marginTop: "auto" }}>
                        Explore Solution <ArrowRight size={14} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section style={{ paddingTop: "60px", paddingBottom: "100px" }}>
        <div className="container-wide">
          <div className="card-glass" style={{ padding: "48px", textAlign: "center", background: "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(0,229,255,0.04) 0%, transparent 70%)" }}>
            <div className="section-label" style={{ display: "inline-flex", marginBottom: "16px" }}><Zap size={11} /> Don't see your industry?</div>
            <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.5rem", fontWeight: 700, marginBottom: "14px" }}>
              We build <span className="gradient-text-full">custom solutions</span> for any vertical
            </h2>
            <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.9rem", color: "var(--text-muted)", maxWidth: "500px", margin: "0 auto 28px", lineHeight: 1.7 }}>
              Every engagement starts with a process audit, not a template. Tell us about your use case and we'll scope a solution that fits your existing tech stack and business objectives.
            </p>
            <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/contact" className="btn-primary" style={{ gap: "6px" }}>
                Discuss Your Use Case <ArrowRight size={14} />
              </Link>
              <Link href="/tools/solution-finder" className="btn-ghost">
                Use the Solution Finder
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
