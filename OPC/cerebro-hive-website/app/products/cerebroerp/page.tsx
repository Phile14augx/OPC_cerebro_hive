"use client";
import { Layers, ArrowRight, Zap, DollarSign, Users, BarChart2, Package, Brain, Clock, Shield, FileText, CheckCircle, TrendingUp, Activity, AlertCircle, Cpu, Database } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const modules = [
  {
    icon: DollarSign,
    color: "#00E5FF",
    title: "Finance & Accounts",
    tag: "Core",
    desc: "Full accounting suite with India-first compliance. GST computation, TDS deduction logic, P&L, and cash flow — unified in one AI-native ledger.",
    features: [
      "Automated GST (GSTR-1, GSTR-3B) filing preparation",
      "TDS deduction, challan generation, and Form 16/16A",
      "Multi-entity P&L with AI anomaly detection",
      "Real-time cash flow forecasting",
      "Bank reconciliation with UPI/NEFT/RTGS",
      "MCA21 compliance reporting",
    ],
  },
  {
    icon: Users,
    color: "#7B61FF",
    title: "HR & Payroll",
    tag: "People Ops",
    desc: "End-to-end HR with PF, ESI, TDS on salary, and gratuity — all calculated and filed automatically. DPDP-compliant employee data handling.",
    features: [
      "PF (EPF) and ESI automatic computation & challan",
      "TDS on salary (Form 24Q, Form 12BB)",
      "Attendance, leave & shift management",
      "Performance review cycles with AI scoring",
      "Offer → onboarding → exit automation",
      "DPDP Act 2023 consent management for employee data",
    ],
  },
  {
    icon: BarChart2,
    color: "#FF2ED1",
    title: "CRM & Sales",
    tag: "Revenue",
    desc: "AI-powered pipeline management with real-time deal scoring. Integrates directly with billing so closed-won deals auto-generate GST invoices.",
    features: [
      "AI lead scoring from CRM interactions",
      "Deal pipeline with stage-based automation",
      "Auto-invoice generation on deal close",
      "Quote builder with GST line-item calculation",
      "Customer payment tracking and dunning",
      "Revenue recognition aligned to AS-9 / Ind AS 115",
    ],
  },
  {
    icon: Package,
    color: "#FF8A00",
    title: "Inventory & Supply Chain",
    tag: "Operations",
    desc: "Real-time stock visibility with AI-driven reorder predictions. Handles multi-warehouse operations with GST on stock transfers between states.",
    features: [
      "Multi-warehouse real-time stock tracking",
      "AI-powered demand forecasting and reorder triggers",
      "IGST handling on inter-state stock transfers",
      "Supplier management and PO automation",
      "Batch & serial number tracking",
      "Quality control inspection workflow",
    ],
  },
  {
    icon: FileText,
    color: "#00E5FF",
    title: "Procurement & Vendor",
    tag: "Spend",
    desc: "Streamline vendor onboarding, PO approvals, and invoice matching. 3-way match (PO → GRN → Invoice) automated with LLM-powered document extraction.",
    features: [
      "Vendor onboarding with GSTIN, PAN, TAN verification",
      "AI-powered 3-way PO/GRN/invoice matching",
      "Approval workflows with delegation rules",
      "TDS deduction at source on vendor payments",
      "Form 26AS reconciliation",
      "Spend analytics and budget tracking",
    ],
  },
  {
    icon: TrendingUp,
    color: "#7B61FF",
    title: "Analytics & Reporting",
    tag: "Intelligence",
    desc: "Live dashboards for management reporting, board packs, and statutory compliance. AI-assisted variance analysis with natural language summaries.",
    features: [
      "Real-time management P&L, balance sheet, cash flow",
      "Statutory reports: Form 26, 26A, 3CD (Tax Audit)",
      "AI variance analysis with plain-English summaries",
      "Consolidated group reporting across entities",
      "Custom KPI dashboards per department",
      "Board pack auto-generation (PDF + PPT)",
    ],
  },
];

const aiCapabilities = [
  {
    icon: Brain,
    color: "#00E5FF",
    title: "Document Intelligence",
    desc: "OCR + LLM extraction from invoices, purchase orders, and contracts. Fields auto-populate with zero manual entry. Supports PDF, image, and WhatsApp-forwarded documents.",
  },
  {
    icon: AlertCircle,
    color: "#FF8A00",
    title: "Anomaly Detection",
    desc: "Flags unusual patterns in transactions, duplicate payments, GST mismatches, and payroll irregularities before they escalate into audit issues.",
  },
  {
    icon: Activity,
    color: "#7B61FF",
    title: "Predictive Forecasting",
    desc: "Revenue, expense, and headcount projections trained on your historical data. Updates weekly. Integrates with budgeting cycles.",
  },
  {
    icon: Shield,
    color: "#FF2ED1",
    title: "Compliance Auto-Pilot",
    desc: "Monitors GST rate changes, TDS threshold updates, MCA circular notifications, and DPDP obligations. Alerts you before deadlines — not after.",
  },
];

const regulatoryStack = [
  { label: "GST", desc: "GSTR-1, GSTR-3B, GSTR-9, E-way Bill, HSN classification, ITC reconciliation", color: "#00E5FF" },
  { label: "TDS / TCS", desc: "Section 194, 195, 194C/H/J, 194Q, 206C, Form 26Q, Form 27EQ, challan generation", color: "#7B61FF" },
  { label: "PF & ESI", desc: "EPF Act, ESIC, challan ECR, UAN management, Form 12A, Form 3A", color: "#FF8A00" },
  { label: "MCA21", desc: "ROC filings, Form AOC-4, MGT-7, annual return compliance tracking", color: "#FF2ED1" },
  { label: "DPDP Act 2023", desc: "Consent management for employee and customer data, data principal rights workflows, privacy notices", color: "#00E5FF" },
  { label: "Aadhaar / PAN", desc: "Aadhaar-PAN linking status, PAN verification via NSDL API, digilocker integration for KYC", color: "#7B61FF" },
  { label: "RBI / FEMA", desc: "FCRA compliance for foreign contributions, FEMA reporting for cross-border transactions", color: "#FF8A00" },
  { label: "Income Tax", desc: "Form 3CB/3CD for tax audit, Form 26AS reconciliation, ITR data preparation", color: "#FF2ED1" },
];

const pricingTiers = [
  {
    name: "Startup",
    price: "₹5,999",
    usd: "$72",
    period: "/month",
    desc: "For growing businesses up to 25 employees and ₹5Cr ARR.",
    modules: ["Finance & Accounts", "HR & Payroll (up to 25 headcount)", "Basic CRM"],
    highlight: false,
  },
  {
    name: "Business",
    price: "₹14,999",
    usd: "$180",
    period: "/month",
    desc: "Full-suite access for mid-market companies up to 100 employees.",
    modules: ["All 6 modules", "Up to 100 headcount", "Multi-entity support", "Priority support SLA"],
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    usd: "Custom",
    period: "",
    desc: "For groups, holding companies, and businesses with 100+ employees or multi-state operations.",
    modules: ["Unlimited entities", "Unlimited headcount", "Custom integrations", "Dedicated implementation manager"],
    highlight: false,
  },
];

export default function CerebroERPPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const waitlistCount = 847;

  return (
    <>
      {/* Hero */}
      <section style={{ paddingTop: "140px", paddingBottom: "60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255,138,0,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="container-wide" style={{ position: "relative" }}>
          <Link href="/products" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none", marginBottom: "24px" }}>
            ← Back to Products
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div className="section-label" style={{ display: "inline-flex", color: "var(--hive-orange)", background: "rgba(255,138,0,0.08)", borderColor: "rgba(255,138,0,0.25)" }}>
              <Layers size={11} /> AI-Enhanced ERP · India-First
            </div>
            <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.6rem", fontWeight: 700, color: "var(--text-muted)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", padding: "3px 10px", borderRadius: "100px", textTransform: "uppercase" }}>
              Coming Soon
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(2.8rem, 5vw, 4rem)", marginBottom: "20px", opacity: 0.9 }}>
            Cerebro<span className="gradient-text-orange">ERP</span>
          </h1>
          <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "1.15rem", color: "var(--text-muted)", maxWidth: "640px", lineHeight: 1.7, marginBottom: "20px" }}>
            The AI-native ERP built for Indian businesses — with GST, TDS, PF, ESI, MCA21, and DPDP Act compliance baked in at the data model level, not bolted on as an afterthought.
          </p>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: "Exo 2, sans-serif", fontSize: "0.82rem", color: "var(--text-muted)" }}>
              <Clock size={14} /> Targeting Q4 2026 private beta
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: "Exo 2, sans-serif", fontSize: "0.82rem", color: "var(--text-muted)" }}>
              <CheckCircle size={14} color="var(--hive-orange)" /> {waitlistCount}+ companies on waitlist
            </div>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section style={{ paddingBottom: "40px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
            {[
              { value: "6", label: "Integrated Modules", sub: "Finance to Analytics" },
              { value: "8+", label: "Compliance Layers", sub: "GST, TDS, PF, ESI & more" },
              { value: "∞", label: "Entities", sub: "Multi-company support" },
              { value: "0", label: "Manual Data Entry", sub: "AI extracts everything" },
            ].map((s) => (
              <div key={s.label} className="card-glass" style={{ padding: "26px 20px", textAlign: "center" }}>
                <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.9rem", fontWeight: 800, color: "var(--hive-orange)", marginBottom: "6px" }}>{s.value}</div>
                <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "3px" }}>{s.label}</div>
                <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.72rem", color: "var(--text-muted)" }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6-Module Grid */}
      <section style={{ paddingBottom: "40px" }}>
        <div className="container-wide">
          <div style={{ marginBottom: "28px" }}>
            <div className="section-label" style={{ display: "inline-flex", marginBottom: "12px", color: "var(--hive-orange)", background: "rgba(255,138,0,0.08)", borderColor: "rgba(255,138,0,0.2)" }}>
              <Cpu size={11} /> Six Modules
            </div>
            <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.4rem", fontWeight: 700 }}>One AI brain. Six business functions.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {modules.map((mod) => {
              const Icon = mod.icon;
              const isActive = activeModule === mod.title;
              return (
                <div key={mod.title} className="card-glass"
                  onClick={() => setActiveModule(isActive ? null : mod.title)}
                  style={{ padding: "28px 24px", cursor: "pointer", transition: "border-color 0.2s", borderColor: isActive ? `${mod.color}50` : "rgba(255,255,255,0.07)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <div style={{ width: 40, height: 40, borderRadius: "10px", background: `${mod.color}14`, border: `1px solid ${mod.color}28`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={18} color={mod.color} />
                    </div>
                    <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.55rem", fontWeight: 700, color: mod.color, background: `${mod.color}10`, border: `1px solid ${mod.color}20`, padding: "2px 7px", borderRadius: "100px", textTransform: "uppercase" }}>{mod.tag}</span>
                  </div>
                  <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.88rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>{mod.title}</h3>
                  {!isActive && (
                    <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{mod.desc}</p>
                  )}
                  {isActive && (
                    <div>
                      <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "14px" }}>{mod.desc}</p>
                      <ul style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {mod.features.map((f) => (
                          <li key={f} style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.75rem", color: "var(--text-muted)", listStyle: "none", display: "flex", gap: "6px", alignItems: "flex-start" }}>
                            <CheckCircle size={11} color={mod.color} style={{ flexShrink: 0, marginTop: "2px" }} /> {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Capabilities */}
      <section style={{ paddingBottom: "40px" }}>
        <div className="container-wide">
          <div style={{ background: "rgba(0,229,255,0.02)", border: "1px solid rgba(0,229,255,0.1)", borderRadius: "16px", padding: "40px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <Brain size={20} color="var(--neural-blue)" />
              <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.2rem", fontWeight: 700 }}>The AI Intelligence Layer</h2>
            </div>
            <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.88rem", color: "var(--text-muted)", maxWidth: "620px", lineHeight: 1.7, marginBottom: "28px" }}>
              Unlike bolt-on "AI buttons," CerebroERP's intelligence layer sees across all six modules simultaneously — detecting cross-functional patterns, surfacing risks, and automating data flows that currently require a dedicated ops team.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
              {aiCapabilities.map((cap) => {
                const Icon = cap.icon;
                return (
                  <div key={cap.title} style={{ padding: "20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px" }}>
                    <div style={{ width: 34, height: 34, borderRadius: "8px", background: `${cap.color}12`, border: `1px solid ${cap.color}25`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                      <Icon size={15} color={cap.color} />
                    </div>
                    <h4 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.78rem", fontWeight: 700, color: cap.color, marginBottom: "8px" }}>{cap.title}</h4>
                    <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.55 }}>{cap.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* India Regulatory Stack */}
      <section style={{ paddingBottom: "40px" }}>
        <div className="container-wide">
          <div style={{ marginBottom: "24px" }}>
            <div className="section-label" style={{ display: "inline-flex", marginBottom: "12px", color: "var(--hive-orange)", background: "rgba(255,138,0,0.08)", borderColor: "rgba(255,138,0,0.2)" }}>
              <Shield size={11} /> India Compliance Stack
            </div>
            <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.35rem", fontWeight: 700 }}>Built for India's regulatory reality</h2>
            <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.88rem", color: "var(--text-muted)", maxWidth: "560px", marginTop: "8px", lineHeight: 1.7 }}>
              Every compliance requirement is modelled at the data layer — not as a separate module, not as a manual export. Your books are always in sync with India's statutory requirements.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }}>
            {regulatoryStack.map((reg) => (
              <div key={reg.label} className="card-glass" style={{ padding: "20px 18px", borderColor: `${reg.color}15` }}>
                <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.8rem", fontWeight: 800, color: reg.color, marginBottom: "8px" }}>{reg.label}</div>
                <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.73rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{reg.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section style={{ paddingBottom: "40px" }}>
        <div className="container-wide">
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.35rem", fontWeight: 700 }}>Pricing tiers</h2>
            <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "8px" }}>Early access participants lock in rates before general availability pricing is set.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {pricingTiers.map((tier) => (
              <div key={tier.name} className="card-glass" style={{ padding: "32px 28px", borderColor: tier.highlight ? "rgba(255,138,0,0.3)" : "rgba(255,255,255,0.07)", background: tier.highlight ? "rgba(255,138,0,0.03)" : undefined, position: "relative" }}>
                {tier.highlight && (
                  <div style={{ position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)", background: "var(--hive-orange)", color: "#000", fontFamily: "Orbitron, sans-serif", fontSize: "0.58rem", fontWeight: 800, padding: "3px 12px", borderRadius: "100px", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
                    Most Popular
                  </div>
                )}
                <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>{tier.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "4px" }}>
                  <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.8rem", fontWeight: 800, color: tier.highlight ? "var(--hive-orange)" : "var(--text-primary)" }}>{tier.price}</span>
                  {tier.period && <span style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-muted)" }}>{tier.period}</span>}
                </div>
                {tier.usd !== "Custom" && <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "12px" }}>{tier.usd}/month</div>}
                <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "16px" }}>{tier.desc}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "7px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "14px" }}>
                  {tier.modules.map((m) => (
                    <div key={m} style={{ display: "flex", gap: "7px", alignItems: "flex-start" }}>
                      <CheckCircle size={12} color={tier.highlight ? "var(--hive-orange)" : "var(--neural-blue)"} style={{ flexShrink: 0, marginTop: "1px" }} />
                      <span style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.76rem", color: "var(--text-muted)" }}>{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist */}
      <section style={{ paddingBottom: "100px" }}>
        <div className="container-wide">
          <div className="card-glass" style={{ padding: "48px", maxWidth: "580px", margin: "0 auto", textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: "Orbitron, sans-serif", fontSize: "0.6rem", fontWeight: 700, color: "var(--hive-orange)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "14px" }}>
              <Zap size={10} /> Early Access Waitlist
            </div>
            <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.3rem", fontWeight: 700, marginBottom: "12px" }}>Be among the first operators.</h2>
            <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.7, marginBottom: "12px" }}>
              Early access participants shape the product roadmap, receive lifetime discounted pricing, and get a dedicated migration engineer to move your data from Tally, Zoho, or QuickBooks.
            </p>
            <p style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.75rem", fontWeight: 700, color: "var(--hive-orange)", marginBottom: "24px" }}>
              {waitlistCount.toLocaleString()} companies already on the waitlist
            </p>
            {!submitted ? (
              <form onSubmit={(e) => { e.preventDefault(); if (email.includes("@")) setSubmitted(true); }} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <input type="email" placeholder="your@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required
                  style={{ padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "var(--text-primary)", fontFamily: "Exo 2, sans-serif", fontSize: "0.9rem", outline: "none" }} />
                <button type="submit" className="btn-orange" style={{ justifyContent: "center", gap: "6px" }}>
                  Join the Waitlist <ArrowRight size={13} />
                </button>
              </form>
            ) : (
              <div style={{ padding: "16px 0" }}>
                <CheckCircle size={36} color="var(--hive-orange)" style={{ margin: "0 auto 12px" }} />
                <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1rem", fontWeight: 700, color: "var(--hive-orange)", marginBottom: "6px" }}>✓ You are #{waitlistCount + 1} on the list</div>
                <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.82rem", color: "var(--text-muted)" }}>We will notify you as soon as private beta invitations open.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
