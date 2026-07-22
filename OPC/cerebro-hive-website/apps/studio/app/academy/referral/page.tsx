"use client";
import { CheckCircle, ArrowRight, Users, DollarSign, Share2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function AcademyReferralPage() {
  const [studentsReferred, setStudentsReferred] = useState(10);
  const [averageCoursePrice, setAverageCoursePrice] = useState(497);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", website: "" });

  const monthlyPayout = Math.round(studentsReferred * averageCoursePrice * 0.20);
  const yearlyPayout = monthlyPayout * 12;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      setSubmitted(true);
    }
  };

  return (
    <>
      {/* Hero */}
      <section style={{ paddingTop: "60px", paddingBottom: "60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(123,97,255,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="container-wide" style={{ position: "relative", textAlign: "center" }}>
          <Link href="/academy" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none", marginBottom: "24px" }}>
            ← Back to Academy
          </Link>
          <div className="section-label" style={{ display: "inline-flex", color: "var(--violet)", background: "rgba(123,97,255,0.08)", borderColor: "rgba(123,97,255,0.25)", margin: "0 auto 20px" }}>
            <Share2 size={11} /> Affiliate Program
          </div>
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", marginBottom: "20px" }}>
            Share & Earn: Academy <span className="gradient-text-blue-violet">Referrals</span>
          </h1>
          <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "1.1rem", color: "var(--text-muted)", maxWidth: "600px", margin: "0 auto", lineHeight: 1.7 }}>
            Help grow our community of AI builders. Recommend CerebroHive Academy courses and earn a **20% recurring commission** on every enrollment.
          </p>
        </div>
      </section>

      {/* Program Details */}
      <section style={{ paddingBottom: "40px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {[
              { icon: Share2, title: "1. Share Your Link", desc: "Get a custom tracking link generated instantly on registration to share in newsletters, blogs, or socials.", color: "#00E5FF" },
              { icon: Users, title: "2. Refer Students", desc: "When developers or L&D managers sign up for our courses or enterprise cohorts using your link.", color: "#7B61FF" },
              { icon: DollarSign, title: "3. Earn 20% Payouts", desc: "Receive automated payouts monthly. Earn recurring commissions for every month a referred business user remains subscribed.", color: "#FF8A00" }
            ].map((c, i) => {
              const Icon = c.icon;
              return (
                <div key={i} className="card-glass" style={{ padding: "32px 28px" }}>
                  <div style={{ width: 44, height: 44, borderRadius: "10px", background: `${c.color}14`, border: `1px solid ${c.color}30`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                    <Icon size={20} color={c.color} />
                  </div>
                  <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1rem", fontWeight: 700, marginBottom: "8px" }}>{c.title}</h3>
                  <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.83rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{c.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Payout Estimator */}
      <section style={{ paddingBottom: "60px" }}>
        <div className="container-wide">
          <div className="card-glass" style={{ padding: "40px" }}>
            <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.35rem", fontWeight: 700, marginBottom: "8px", textAlign: "center" }}>
              Ambassador Commission Estimator
            </h2>
            <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "center", marginBottom: "40px" }}>
              Adjust the values to estimate your monthly and yearly affiliate payouts.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "60px", alignItems: "center" }}>
              {/* Sliders */}
              <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span style={{ fontFamily: "Exo 2, sans-serif", fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>Monthly Referrals</span>
                    <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.85rem", color: "var(--violet)", fontWeight: 700 }}>{studentsReferred} Students</span>
                  </div>
                  <input type="range" min="1" max="100" value={studentsReferred}
                    onChange={(e) => setStudentsReferred(Number(e.target.value))}
                    style={{ width: "100%", height: "4px", accentColor: "var(--violet)", cursor: "pointer" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "6px" }}>
                    <span>1 Student</span><span>50 Students</span><span>100 Students</span>
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span style={{ fontFamily: "Exo 2, sans-serif", fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>Avg. Course / Cohort Price</span>
                    <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.85rem", color: "var(--violet)", fontWeight: 700 }}>${averageCoursePrice} Ticket</span>
                  </div>
                  <input type="range" min="100" max="2500" step="50" value={averageCoursePrice}
                    onChange={(e) => setAverageCoursePrice(Number(e.target.value))}
                    style={{ width: "100%", height: "4px", accentColor: "var(--violet)", cursor: "pointer" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "6px" }}>
                    <span>$100 (Course)</span><span>$1,300 (Bootcamp)</span><span>$2,500 (Enterprise)</span>
                  </div>
                </div>
              </div>

              {/* Payout Display */}
              <div className="card-glass" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "20px", background: "rgba(123,97,255,0.02)", borderColor: "rgba(123,97,255,0.15)" }}>
                <div>
                  <span style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.78rem", color: "var(--text-muted)", display: "block" }}>Estimated Monthly Commission</span>
                  <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "2rem", fontWeight: 800, color: "var(--violet)" }}>${monthlyPayout.toLocaleString()}</span>
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "20px" }}>
                  <span style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Estimated Yearly Commission</span>
                  <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>${yearlyPayout.toLocaleString()} / year</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ambassador Registration Form */}
      <section style={{ paddingBottom: "100px" }}>
        <div className="container-wide" style={{ maxWidth: "560px" }}>
          <div className="card-glass" style={{ padding: "48px" }}>
            <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.3rem", fontWeight: 700, marginBottom: "12px", textAlign: "center" }}>
              Become an Ambassador
            </h2>
            <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6, textAlign: "center", marginBottom: "28px" }}>
              Submit your details to register for the referral dashboard. We review applications within 24 hours.
            </p>

            {!submitted ? (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.62rem", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>FULL NAME</label>
                  <input type="text" placeholder="John Doe" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "var(--text-primary)", fontFamily: "Exo 2, sans-serif", fontSize: "0.88rem", outline: "none" }} />
                </div>

                <div>
                  <label style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.62rem", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>EMAIL ADDRESS</label>
                  <input type="email" placeholder="you@example.com" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "var(--text-primary)", fontFamily: "Exo 2, sans-serif", fontSize: "0.88rem", outline: "none" }} />
                </div>

                <div>
                  <label style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.62rem", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>WEBSITE / COMMUNITY LINK (OPTIONAL)</label>
                  <input type="url" placeholder="https://myblog.com" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    style={{ width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "var(--text-primary)", fontFamily: "Exo 2, sans-serif", fontSize: "0.88rem", outline: "none" }} />
                </div>

                <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center", display: "inline-flex", gap: "6px", background: "linear-gradient(135deg, var(--violet), var(--neural-blue))" }}>
                  Submit Registration <ArrowRight size={14} />
                </button>
              </form>
            ) : (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <CheckCircle size={36} color="var(--violet)" style={{ margin: "0 auto 12px" }} />
                <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1rem", fontWeight: 700, color: "var(--violet)", marginBottom: "6px" }}>✓ Application Submitted</h3>
                <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  Thank you for registering, {formData.name}. We have sent a confirmation email to <strong>{formData.email}</strong> and will activate your tracking portal shortly.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
