"use client";
import { BookOpen, CheckCircle, ArrowRight, ArrowLeft, Award, Users, BarChart2, Edit, Lock, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const features = [
  { icon: Edit, color: "#FF2ED1", title: "Course Creation Tools", desc: "Rich content editor with video embedding, quiz blocks, code playgrounds, and PDF attachment support." },
  { icon: BarChart2, color: "#00E5FF", title: "Adaptive Pacing Engine", desc: "AI-driven content sequencing that adjusts difficulty and pace based on individual quiz performance and engagement signals." },
  { icon: Award, color: "#FFBA00", title: "Certificate Issuance", desc: "Auto-generate branded certificates on completion. QR verification, LinkedIn sync via OpenBadge standard, and shareable certificate URLs." },
  { icon: Users, color: "#7B61FF", title: "Cohort Management", desc: "Invite corporate teams, manage seat allocation, bulk-enroll employees, and export completion reports for compliance." },
  { icon: BarChart2, color: "#FF8A00", title: "Analytics Dashboard", desc: "Granular learner analytics: completion rates, time-per-module, quiz scores, drop-off points, and cohort comparisons." },
  { icon: Lock, color: "#00E5FF", title: "Proctored Assessments", desc: "Honour-system and AI-monitored proctoring options. Configurable attempt limits, time windows, and passing thresholds." },
];

const audiences = [
  {
    title: "Corporate L&D Teams",
    desc: "Deploy structured AI training programs across your entire organisation. Track team-level completion, generate compliance reports, and share certifications with regulators.",
    color: "#7B61FF",
    bullets: ["Bulk seat management", "Custom branding & domain", "Compliance export reports"],
  },
  {
    title: "Independent Educators",
    desc: "Launch your own AI education course catalogue. Set your own pricing, control your student data, and issue branded certificates under your own academy identity.",
    color: "#FF2ED1",
    bullets: ["Custom course builder", "Stripe payment integration", "White-label branding"],
  },
  {
    title: "AI Academies & Bootcamps",
    desc: "Run cohort-based programmes with synchronised enrollment, assignment submission portals, group discussions, and live session scheduling.",
    color: "#00E5FF",
    bullets: ["Cohort-based scheduling", "Assignment submission portal", "Live session integrations"],
  },
];

const pricingTiers = [
  {
    name: "Educator",
    price: "$29",
    period: "month",
    color: "#FF2ED1",
    desc: "For independent instructors and trainers creating individual courses and bootcamps.",
    bullets: ["Up to 50 active students", "Unlimited course hosting", "Branded course catalogs", "Stripe payment integrations"],
    cta: "Select Educator",
    href: "/contact?product=learn&tier=educator"
  },
  {
    name: "Academy",
    price: "$199",
    period: "month",
    color: "#7B61FF",
    desc: "For educational institutions scaling high-tier cohort-based learning environments.",
    bullets: ["Up to 1,000 active students", "White-label custom domain", "AI adaptive pacing algorithms", "LinkedIn OpenBadge credential sync", "Auto-grading pipelines"],
    cta: "Select Academy",
    href: "/contact?product=learn&tier=academy"
  },
  {
    name: "Enterprise L&D",
    price: "Custom",
    period: "tailored",
    color: "#00E5FF",
    desc: "For corporations seeking structured workforce upskilling and compliance tracking.",
    bullets: ["Unlimited active students", "SAML SSO security integration", "Dedicated cohort seat managers", "Granular API metrics export", "Full migration services support"],
    cta: "Contact Enterprise Sales",
    href: "/contact?product=learn&tier=enterprise"
  }
];

const stats = [
  { label: "Completion Rate", value: "98%" },
  { label: "Course Modules Available", value: "500+" },
  { label: "Certified Learners", value: "10,000+" },
];

const cohortData = {
  "Engineering Dept": {
    active: 28,
    progress: 88,
    certs: 12,
    score: 92,
    students: [
      { name: "Cody Fisher", progress: 95, status: "Active" },
      { name: "Jane Cooper", progress: 100, status: "Certified" },
      { name: "Alex Rivera", progress: 70, status: "Active" }
    ]
  },
  "Sales & Marketing": {
    active: 45,
    progress: 64,
    certs: 8,
    score: 78,
    students: [
      { name: "Albert Flores", progress: 80, status: "Active" },
      { name: "Bessie Cooper", progress: 60, status: "Active" },
      { name: "Robert Fox", progress: 100, status: "Certified" }
    ]
  },
  "Product Managers": {
    active: 14,
    progress: 79,
    certs: 4,
    score: 85,
    students: [
      { name: "Guy Hawkins", progress: 90, status: "Active" },
      { name: "Darlene Robertson", progress: 100, status: "Certified" },
      { name: "Kristin Watson", progress: 48, status: "Active" }
    ]
  }
};

export default function CerebroLearnPage() {
  const [selectedCohort, setSelectedCohort] = useState<keyof typeof cohortData>("Engineering Dept");
  const data = cohortData[selectedCohort];

  return (
    <>
      {/* Hero */}
      <section style={{ paddingTop: "140px", paddingBottom: "60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255,46,209,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="container-wide" style={{ position: "relative" }}>
          <Link href="/products" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none", marginBottom: "24px", transition: "color 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>
            <ArrowLeft size={14} /> Back to Products
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div className="section-label" style={{ display: "inline-flex", color: "#FF2ED1", background: "rgba(255,46,209,0.08)", borderColor: "rgba(255,46,209,0.25)" }}>
              <BookOpen size={11} /> Learning OS
            </div>
            <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.6rem", fontWeight: 700, color: "#FF2ED1", background: "rgba(255,46,209,0.1)", border: "1px solid rgba(255,46,209,0.3)", padding: "3px 10px", borderRadius: "100px", textTransform: "uppercase" }}>
              Early Access
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(2.8rem, 5vw, 4rem)", marginBottom: "20px" }}>
            Cerebro<span style={{ background: "linear-gradient(135deg, #FF2ED1, #7B61FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Learn</span>
          </h1>
          <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "1.15rem", color: "var(--text-muted)", maxWidth: "580px", lineHeight: 1.7, marginBottom: "36px" }}>
            The AI-native learning management system. Build, deploy, and certify learners through adaptive AI education programmes — with enterprise-grade cohort management and LinkedIn-synced certificates.
          </p>
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            <a href="#admin-preview" className="btn-primary" style={{ gap: "6px", display: "inline-flex", textDecoration: "none", alignItems: "center", background: "linear-gradient(135deg, #FF2ED1, #7B61FF)" }}>
              Launch Admin Preview <ArrowRight size={14} />
            </a>
            <a href="#pricing" className="btn-ghost" style={{ gap: "6px", display: "inline-flex", textDecoration: "none", alignItems: "center", borderColor: "#FF2ED1", color: "#FF2ED1" }}>
              View SaaS Tiers
            </a>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section style={{ paddingBottom: "40px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {stats.map((s, i) => (
              <div key={i} className="card-glass" style={{ padding: "28px 24px", textAlign: "center" }}>
                <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.8rem", fontWeight: 800, color: "#FF2ED1", marginBottom: "6px" }}>{s.value}</div>
                <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.82rem", color: "var(--text-muted)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive LMS Admin Preview */}
      <section id="admin-preview" style={{ paddingBottom: "60px" }}>
        <div className="container-wide">
          <div className="card-glass" style={{ padding: "40px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "28px" }}>
              <div>
                <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.3rem", fontWeight: 700, marginBottom: "6px" }}>
                  Cohort Manager Dashboard
                </h2>
                <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Monitor upskilling progress and certification rates. Select a cohort to query.
                </p>
              </div>

              {/* Selector */}
              <div style={{ position: "relative" }}>
                <select value={selectedCohort} onChange={(e) => setSelectedCohort(e.target.value as keyof typeof cohortData)}
                  style={{ padding: "10px 36px 10px 16px", background: "rgba(8,11,20,0.9)", border: "1px solid rgba(255,46,209,0.3)", borderRadius: "8px", color: "var(--text-primary)", fontFamily: "Orbitron, sans-serif", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", outline: "none", appearance: "none" }}>
                  <option value="Engineering Dept">ENGINEERING DEPT</option>
                  <option value="Sales & Marketing">SALES & MARKETING</option>
                  <option value="Product Managers">PRODUCT MANAGERS</option>
                </select>
                <ChevronDown size={14} color="#FF2ED1" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              </div>
            </div>

            {/* Dashboard grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "48px", alignItems: "start" }}>
              {/* Metrics */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
                {[
                  { label: "Active Enrolled", value: `${data.active} Seats`, color: "#00E5FF" },
                  { label: "Completion Progress", value: `${data.progress}%`, color: "#7B61FF" },
                  { label: "Certs Issued", value: `${data.certs} Awarded`, color: "#FFBA00" },
                  { label: "Average Quiz Score", value: `${data.score}%`, color: "#FF2ED1" }
                ].map((m, idx) => (
                  <div key={idx} className="card-glass" style={{ padding: "20px", background: "rgba(255,255,255,0.01)" }}>
                    <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.15rem", fontWeight: 800, color: m.color, marginBottom: "4px" }}>{m.value}</div>
                    <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.72rem", color: "var(--text-muted)" }}>{m.label}</div>
                  </div>
                ))}
              </div>

              {/* Students Table Mock */}
              <div className="card-glass" style={{ padding: "24px", background: "rgba(8,11,20,0.9)" }}>
                <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "10px", marginBottom: "12px" }}>MEMBER ROSTER</div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {data.students.map((st) => (
                    <div key={st.name} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem" }}>
                        <span style={{ fontFamily: "Exo 2, sans-serif", fontWeight: 600, color: "var(--text-primary)" }}>{st.name}</span>
                        <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.6rem", fontWeight: 700, color: st.status === "Certified" ? "#FFBA00" : "var(--neural-blue)", background: st.status === "Certified" ? "rgba(255,186,0,0.08)" : "rgba(0,229,255,0.08)", padding: "2px 8px", borderRadius: "100px" }}>{st.status}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ flex: 1, height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "100px", overflow: "hidden" }}>
                          <div style={{ width: `${st.progress}%`, height: "100%", background: `linear-gradient(90deg, #FF2ED1, #7B61FF)`, borderRadius: "100px" }} />
                        </div>
                        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.7rem", color: "var(--text-muted)" }}>{st.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SaaS Pricing Tiers */}
      <section id="pricing" style={{ paddingBottom: "60px" }}>
        <div className="container-wide">
          <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.4rem", fontWeight: 700, marginBottom: "32px", textAlign: "center" }}>SaaS Subscription Tiers</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {pricingTiers.map((tier) => (
              <div key={tier.name} className="card-glass" style={{ padding: "36px 30px", display: "flex", flexDirection: "column", height: "100%", borderColor: `rgba(255,255,255,0.08)`, transition: "border-color 0.35s" }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = `${tier.color}40`}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = `rgba(255,255,255,0.08)`}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.1rem", fontWeight: 700, color: tier.color }}>{tier.name}</h3>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "12px" }}>
                  <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)" }}>{tier.price}</span>
                  <span style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-muted)" }}>/ {tier.period}</span>
                </div>
                <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "24px" }}>
                  {tier.desc}
                </p>
                <ul style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "32px", flex: 1 }}>
                  {tier.bullets.map((b) => (
                    <li key={b} style={{ display: "flex", gap: "8px", alignItems: "flex-start", fontFamily: "Exo 2, sans-serif", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      <CheckCircle size={12} color={tier.color} style={{ flexShrink: 0, marginTop: "2px" }} /> {b}
                    </li>
                  ))}
                </ul>
                <Link href={tier.href} className="btn-primary" style={{ width: "100%", justifyContent: "center", background: `linear-gradient(135deg, ${tier.color}, var(--violet))` }}>
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section style={{ paddingBottom: "40px" }}>
        <div className="container-wide">
          <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.3rem", fontWeight: 700, marginBottom: "28px", textAlign: "center" }}>
            Every feature your <span style={{ background: "linear-gradient(135deg, #FF2ED1, #7B61FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>programme needs</span>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.title} className="card-glass" style={{ padding: "28px 24px" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "10px", background: `${feat.color}14`, border: `1px solid ${feat.color}28`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                    <Icon size={18} color={feat.color} />
                  </div>
                  <h4 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.9rem", fontWeight: 700, marginBottom: "8px" }}>{feat.title}</h4>
                  <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* For Who */}
      <section style={{ paddingBottom: "100px" }}>
        <div className="container-wide">
          <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.3rem", fontWeight: 700, marginBottom: "28px", textAlign: "center" }}>Built for three types of operators</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {audiences.map((aud) => (
              <div key={aud.title} className="card-glass" style={{ padding: "32px 28px" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: aud.color, marginBottom: "16px", boxShadow: `0 0 12px ${aud.color}` }} />
                <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px" }}>{aud.title}</h3>
                <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.83rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "20px" }}>{aud.desc}</p>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "7px" }}>
                  {aud.bullets.map((b) => (
                    <div key={b} style={{ display: "flex", gap: "8px", alignItems: "center", fontFamily: "Exo 2, sans-serif", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      <CheckCircle size={12} color={aud.color} /> {b}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
