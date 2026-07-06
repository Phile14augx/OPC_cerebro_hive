"use client";
import { useState } from "react";
import { Users, Award, Shield, CheckCircle, Send, ArrowLeft } from "lucide-react";
import Link from "next/link";

const formats = ["Virtual (Live Cohort)", "On-Site Intensive", "Hybrid (Self-paced + Workshops)"];
const sizes = ["Under 20", "20-50", "50-200", "200+"];
const focuses = ["AI Foundations & Prompting", "RAG & LLM engineering", "Multi-Agent System Design", "AI Strategy & Roadmapping"];

export default function CorporateProgramsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    company: "",
    contactName: "",
    email: "",
    teamSize: "",
    preferredFormat: "",
    trainingFocus: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company || !form.email || !form.contactName) return;
    setSubmitted(true);
  };

  return (
    <>
      <section style={{ paddingTop: "140px", paddingBottom: "60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(0,229,255,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="container-wide" style={{ position: "relative" }}>
          <Link href="/academy/courses" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none", marginBottom: "24px" }}>
            <ArrowLeft size={14} /> Back to Course Catalog
          </Link>
          <div className="section-label" style={{ display: "inline-flex", marginBottom: "20px" }}>
            <Users size={11} /> Enterprise L&D Solutions
          </div>
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", marginBottom: "20px" }}>
            AI-Ready <span className="gradient-text-full">Organizations</span>
          </h1>
          <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "1.1rem", color: "var(--text-muted)", maxWidth: "600px", lineHeight: 1.7 }}>
            Empower your engineering, product, and leadership teams to scope, build, and deploy modern AI solutions safely.
          </p>
        </div>
      </section>

      <section className="section-pad" style={{ paddingTop: "20px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "60px", alignItems: "start" }}>
            {/* Left Column: Offerings */}
            <div>
              <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.5rem", fontWeight: 700, marginBottom: "32px" }}>
                Why Partner with CerebroHive?
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {[
                  {
                    icon: Users,
                    title: "Customized Curriculums",
                    desc: "We tailor case studies and projects specifically to your industry stack (e.g. Finance, Healthcare, CRM automation).",
                    color: "#00E5FF",
                  },
                  {
                    icon: Award,
                    title: "Dedicated Bootcamps & Hackathons",
                    desc: "Intensive 3-5 day programs focused on building active prototypes for internal corporate pipelines.",
                    color: "#7B61FF",
                  },
                  {
                    icon: Shield,
                    title: "Executive Strategic Audits",
                    desc: "Equip leadership teams with governance templates, ROI metrics templates, and adopting rules.",
                    color: "#FF8A00",
                  }
                ].map(({ icon: Icon, title, desc, color }) => (
                  <div key={title} style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                    <div style={{ width: 44, height: 44, borderRadius: "10px", background: `${color}14`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={20} color={color} />
                    </div>
                    <div>
                      <h4 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>{title}</h4>
                      <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.65 }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stat block */}
              <div style={{ display: "flex", gap: "24px", marginTop: "48px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "32px" }}>
                {[
                  { label: "Staff Trained", value: "10,000+ Students" },
                  { label: "Satisfaction Rate", value: "98.7% NPS Score" },
                  { label: "B2B Clients", value: "30+ Enterprises" }
                ].map((stat) => (
                  <div key={stat.label} style={{ flex: 1 }}>
                    <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.2rem", fontWeight: 800, color: "var(--neural-blue)" }}>{stat.value}</div>
                    <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Form */}
            <div className="card-glass" style={{ padding: "40px" }}>
              {submitted ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                    <CheckCircle size={28} color="var(--neural-blue)" />
                  </div>
                  <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.2rem", fontWeight: 700, color: "var(--neural-blue)", marginBottom: "12px" }}>
                    Proposal Request Sent!
                  </h3>
                  <p style={{ fontFamily: "Exo 2, sans-serif", color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.65 }}>
                    Thank you. Our Corporate Training coordinator will review your requirements and reach out within 24 hours to schedule a custom scoping call.
                  </p>
                </div>
              ) : (
                <>
                  <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.15rem", fontWeight: 700, marginBottom: "24px" }}>
                    Request Custom Program Scopes
                  </h3>

                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                      <label style={{ display: "block", fontFamily: "Orbitron, sans-serif", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--neural-blue)", marginBottom: "6px" }}>
                        Company Name
                      </label>
                      <input
                        type="text" required placeholder="Cerebro Industries"
                        value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                        style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px 14px", fontFamily: "Exo 2, sans-serif", fontSize: "0.85rem", color: "var(--text-primary)", outline: "none" }}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                      <div>
                        <label style={{ display: "block", fontFamily: "Orbitron, sans-serif", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--neural-blue)", marginBottom: "6px" }}>
                          Contact Name
                        </label>
                        <input
                          type="text" required placeholder="John Doe"
                          value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                          style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px 14px", fontFamily: "Exo 2, sans-serif", fontSize: "0.85rem", color: "var(--text-primary)", outline: "none" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontFamily: "Orbitron, sans-serif", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--neural-blue)", marginBottom: "6px" }}>
                          Work Email
                        </label>
                        <input
                          type="email" required placeholder="john@company.com"
                          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                          style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px 14px", fontFamily: "Exo 2, sans-serif", fontSize: "0.85rem", color: "var(--text-primary)", outline: "none" }}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                      <div>
                        <label style={{ display: "block", fontFamily: "Orbitron, sans-serif", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--neural-blue)", marginBottom: "6px" }}>
                          Cohort Size
                        </label>
                        <select
                          value={form.teamSize} onChange={(e) => setForm({ ...form, teamSize: e.target.value })}
                          style={{ width: "100%", background: "rgba(8,11,20,0.9)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px 14px", fontFamily: "Exo 2, sans-serif", fontSize: "0.85rem", color: form.teamSize ? "var(--text-primary)" : "var(--text-muted)", outline: "none", cursor: "pointer" }}
                        >
                          <option value="">Select size...</option>
                          {sizes.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: "block", fontFamily: "Orbitron, sans-serif", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--neural-blue)", marginBottom: "6px" }}>
                          Preferred Format
                        </label>
                        <select
                          value={form.preferredFormat} onChange={(e) => setForm({ ...form, preferredFormat: e.target.value })}
                          style={{ width: "100%", background: "rgba(8,11,20,0.9)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px 14px", fontFamily: "Exo 2, sans-serif", fontSize: "0.85rem", color: form.preferredFormat ? "var(--text-primary)" : "var(--text-muted)", outline: "none", cursor: "pointer" }}
                        >
                          <option value="">Select format...</option>
                          {formats.map((f) => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: "block", fontFamily: "Orbitron, sans-serif", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--neural-blue)", marginBottom: "6px" }}>
                        Primary Focus Area
                      </label>
                      <select
                        value={form.trainingFocus} onChange={(e) => setForm({ ...form, trainingFocus: e.target.value })}
                        style={{ width: "100%", background: "rgba(8,11,20,0.9)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px 14px", fontFamily: "Exo 2, sans-serif", fontSize: "0.85rem", color: form.trainingFocus ? "var(--text-primary)" : "var(--text-muted)", outline: "none", cursor: "pointer" }}
                      >
                        <option value="">Select focus...</option>
                        {focuses.map((f) => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", fontFamily: "Orbitron, sans-serif", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--neural-blue)", marginBottom: "6px" }}>
                        Additional Notes / Target Outcomes
                      </label>
                      <textarea
                        rows={3} placeholder="Please describe any custom tools, goals, or scheduling constraints..."
                        value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                        style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px 14px", fontFamily: "Exo 2, sans-serif", fontSize: "0.85rem", color: "var(--text-primary)", outline: "none", resize: "vertical" }}
                      />
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center", display: "flex", gap: "8px", padding: "12px", marginTop: "4px" }}>
                      <Send size={14} /> Submit Program Intake
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
