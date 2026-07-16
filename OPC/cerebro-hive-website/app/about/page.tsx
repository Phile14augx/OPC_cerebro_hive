"use client";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { ArrowRight, Target, Lightbulb, Users, Globe, Rocket, Shield } from "lucide-react";


const values = [
  { icon: Target, title: "Intelligence First", description: "Every solution we build is grounded in rigorous AI thinking — not hype. We engineer intelligence that delivers measurable outcomes.", color: "#00E5FF" },
  { icon: Globe, title: "Connection at Scale", description: "We bridge the gap between cutting-edge AI research and practical business application — connecting minds, data, and systems.", color: "#7B61FF" },
  { icon: Rocket, title: "Real Impact", description: "Success for us is not a delivered project — it's a transformed business. We measure ourselves by your outcomes.", color: "#FF8A00" },
  { icon: Shield, title: "Trustworthy AI", description: "We build AI systems that are explainable, governed, and aligned with ethical principles and business risk frameworks.", color: "#FF2ED1" },
  { icon: Lightbulb, title: "Continuous Learning", description: "The AI landscape evolves daily. So do we. Every team member commits to staying at the frontier of AI capability.", color: "#FFBA00" },
  { icon: Users, title: "Collaborative Partnership", description: "We embed with your team, not alongside them. Your success is our success — we're partners in transformation.", color: "#00E5FF" },
];

const timeline = [
  { year: "2020", event: "CerebroHive founded", desc: "Started as an AI consulting boutique focused on SMEs." },
  { year: "2021", event: "Academy Launch", desc: "Launched the CerebroHive Academy with 5 foundational AI courses." },
  { year: "2022", event: "Automation Practice", desc: "Expanded into AI automation — first LangChain agent deployments." },
  { year: "2023", event: "100+ Projects", desc: "Crossed 100 completed AI projects across 20+ industries." },
  { year: "2024", event: "10,000+ Students", desc: "Academy surpasses 10,000 enrolled students globally." },
  { year: "2025", event: "Product Suite Launch", desc: "CerebroFlow and CerebroAgent enter private beta." },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section style={{ paddingTop: "140px", paddingBottom: "80px", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(0,229,255,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div className="container-wide" style={{ position: "relative" }}>
          <div className="section-label" style={{ display: "inline-flex", marginBottom: "24px" }}>Our Story</div>
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", maxWidth: "720px", marginBottom: "24px" }}>
            We Built CerebroHive to{" "}
            <span className="gradient-text-full">Change How Organizations Use AI</span>
          </h1>
          <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "1.15rem", color: "var(--text-muted)", maxWidth: "640px", lineHeight: 1.75 }}>
            CerebroHive was founded on a simple belief: AI transformation shouldn&apos;t be exclusive to organizations with billion-dollar technology budgets. Every team deserves access to world-class AI strategy, automation, and education.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="section-pad-sm" style={{ background: "rgba(0,0,0,0.2)" }}>
        <div className="container-wide">
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "60px",
            alignItems: "center",
          }}>
            <div>
              <div className="section-label">Our Mission</div>
              <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", marginBottom: "24px" }}>
                Intelligence.{" "}
                <span className="gradient-text-blue-violet">Connection.</span>{" "}
                <span className="gradient-text-orange">Impact.</span>
              </h2>
              <p style={{ fontFamily: "Exo 2, sans-serif", color: "var(--text-muted)", fontSize: "1rem", lineHeight: 1.8, marginBottom: "20px" }}>
                CerebroHive connects intelligent minds and data to build innovative AI solutions that create real business impact. We operate at the intersection of strategy, technology, and education — making us uniquely qualified to drive end-to-end AI transformation.
              </p>
              <p style={{ fontFamily: "Exo 2, sans-serif", color: "var(--text-muted)", fontSize: "1rem", lineHeight: 1.8 }}>
                Our name reflects this mission: &quot;Cerebro&quot; — the intelligence hub, the thinking center. &quot;Hive&quot; — the collaborative network, the connected system. Together: intelligence that scales through connection.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {[
                { n: "500+", l: "Projects Delivered", c: "#00E5FF" },
                { n: "50+", l: "AI Agents Built", c: "#7B61FF" },
                { n: "10K+", l: "Students Trained", c: "#FF2ED1" },
                { n: "30+", l: "Industries Served", c: "#FFBA00" },
              ].map((s) => (
                <div key={s.l} style={{
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${s.c}20`,
                  borderRadius: "16px",
                  padding: "28px 20px",
                  textAlign: "center",
                }}>
                  <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "2rem", fontWeight: 900, color: s.c, marginBottom: "8px" }}>{s.n}</div>
                  <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.825rem", color: "var(--text-muted)" }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-pad">
        <div className="container-wide">
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <div className="section-label" style={{ display: "inline-flex" }}>Our Values</div>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
              What Guides <span className="gradient-text-full">Everything We Do</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="card-glass" style={{ padding: "28px 24px" }}>
                  <div style={{ width: 44, height: 44, borderRadius: "10px", background: `${v.color}14`, border: `1px solid ${v.color}30`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                    <Icon size={20} color={v.color} />
                  </div>
                  <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.95rem", fontWeight: 700, marginBottom: "10px" }}>{v.title}</h3>
                  <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.65 }}>{v.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-pad" style={{ background: "rgba(0,0,0,0.2)" }}>
        <div className="container-wide">
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <div className="section-label" style={{ display: "inline-flex" }}>Our Journey</div>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
              Building the <span className="gradient-text-blue-violet">Future of AI</span>
            </h2>
          </div>
          <div style={{ maxWidth: "700px", margin: "0 auto", position: "relative" }}>
            <div style={{ position: "absolute", left: "80px", top: 0, bottom: 0, width: 1, background: "rgba(0,229,255,0.15)" }} />
            {timeline.map((item) => (
              <div key={item.year} style={{ display: "flex", gap: "32px", alignItems: "flex-start", marginBottom: "36px" }}>
                <div style={{ width: 64, textAlign: "right", fontFamily: "Orbitron, sans-serif", fontWeight: 700, fontSize: "0.8rem", color: "var(--neural-blue)", paddingTop: "4px", flexShrink: 0 }}>
                  {item.year}
                </div>
                <div style={{ position: "relative", paddingLeft: "32px" }}>
                  <div style={{ position: "absolute", left: -6, top: 6, width: 13, height: 13, borderRadius: "50%", background: "var(--neural-blue)", boxShadow: "0 0 12px rgba(0,229,255,0.5)" }} />
                  <h4 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.95rem", fontWeight: 700, marginBottom: "6px" }}>{item.event}</h4>
                  <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.875rem", color: "var(--text-muted)" }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-pad">
        <div className="container-wide" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: "20px" }}>
            Ready to <span className="gradient-text-full">Work Together?</span>
          </h2>
          <p style={{ fontFamily: "Exo 2, sans-serif", color: "var(--text-muted)", fontSize: "1.05rem", marginBottom: "36px" }}>
            Let&apos;s explore how CerebroHive can accelerate your AI journey.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <TrackedLink href="/contact" analyticsEvent="cta_click" analyticsCategory="conversion" analyticsLabel="Book Free Consultation — About" className="btn-primary">Book Free Consultation <ArrowRight size={16} /></TrackedLink>
            <TrackedLink href="/services" analyticsEvent="cta_click" analyticsCategory="engagement" analyticsLabel="Explore Services — About" className="btn-ghost">Explore Services</TrackedLink>
          </div>
        </div>
      </section>
    </>
  );
}
