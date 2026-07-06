"use client";
import { Brain, Settings, Database, GraduationCap, ArrowRight, Zap, Calculator, CheckCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const services = [
  {
    title: "AI Consulting & Strategy",
    desc: "Align your executive board, audit operational bottlenecks, and design a 90-day execution roadmap for secure model deployments.",
    href: "/services/ai-consulting",
    icon: Brain,
    color: "#00E5FF",
    tag: "Strategy",
  },
  {
    title: "AI Automation & Agents",
    desc: "Build recursive LLM orchestration pipelines using LangGraph and n8n to automate complex support, CRM enrichment, and outreach workflows.",
    href: "/services/ai-automation",
    icon: Settings,
    color: "#FF8A00",
    tag: "Automation",
  },
  {
    title: "Data & ETL Engineering",
    desc: "Structure your business records. We construct modern data lakes to securely feed LLMs, vector indexes, and BI tools.",
    href: "/services/data-engineering",
    icon: Database,
    color: "#7B61FF",
    tag: "Data",
  },
  {
    title: "Corporate AI Education",
    desc: "Empower your technical and business teams with structured cohort training, live workshops, and digital certification sharing.",
    href: "/services/corporate-training",
    icon: GraduationCap,
    color: "#FF2ED1",
    tag: "Training",
  },
  {
    title: "Custom AI Development",
    desc: "Train domain-specific private models, build high-performance vector retrieval architectures, and deploy secure inference API microservices.",
    href: "/services/ai-development",
    icon: Zap,
    color: "#FF2ED1",
    tag: "Development",
  },
];

export default function ServicesPage() {
  const [manualHours, setManualHours] = useState(250);
  const [hourlyRate, setHourlyRate] = useState(45);
  const [complexity, setComplexity] = useState<"low" | "medium" | "high">("medium");

  const currentCost = manualHours * hourlyRate * 12;
  const automationRate = complexity === "low" ? 0.75 : complexity === "medium" ? 0.55 : 0.35;
  const potentialSavings = Math.round(currentCost * automationRate);
  const hoursSavedYearly = Math.round(manualHours * automationRate * 12);
  const implementationWeeks = complexity === "low" ? 4 : complexity === "medium" ? 8 : 14;

  return (
    <>
      {/* Hero */}
      <section style={{ paddingTop: "140px", paddingBottom: "50px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(0,229,255,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="container-wide" style={{ position: "relative" }}>
          <div className="section-label" style={{ display: "inline-flex", marginBottom: "20px" }}>
            <Zap size={11} /> Capabilities Overview
          </div>
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", marginBottom: "20px" }}>
            Our AI <span className="gradient-text-full">Services Suite</span>
          </h1>
          <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "1.1rem", color: "var(--text-muted)", maxWidth: "600px", lineHeight: 1.7 }}>
            Empowering enterprise teams with strategic consulting, custom autonomous pipelines, structured data lakes, and certified L&D paths.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section style={{ paddingBottom: "20px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
            {services.map((serv) => {
              const Icon = serv.icon;
              return (
                <Link key={serv.title} href={serv.href} style={{ textDecoration: "none" }}>
                  <div className="card-glass" style={{ padding: "36px 30px", display: "flex", flexDirection: "column", height: "100%" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                      <div style={{ width: 44, height: 44, borderRadius: "10px", background: `${serv.color}14`, border: `1px solid ${serv.color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={20} color={serv.color} />
                      </div>
                      <span style={{ fontSize: "0.6rem", fontFamily: "Orbitron, sans-serif", fontWeight: 700, color: "var(--text-muted)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", padding: "3px 10px", borderRadius: "100px", textTransform: "uppercase" }}>
                        {serv.tag}
                      </span>
                    </div>

                    <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px" }}>
                      {serv.title}
                    </h3>

                    <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "28px", flex: 1 }}>
                      {serv.desc}
                    </p>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: serv.color, fontSize: "0.8rem", fontWeight: 600, marginTop: "auto" }}>
                      Explore Service <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Feasibility ROI Calculator */}
      <section className="section-pad" style={{ paddingTop: "60px" }}>
        <div className="container-wide">
          <div className="card-glass" style={{ padding: "48px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <Calculator size={20} color="var(--neural-blue)" />
              <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.4rem", fontWeight: 700 }}>
                AI Feasibility & ROI Estimator
              </h2>
            </div>
            <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "40px" }}>
              Input your current manual workloads to estimate automation gains.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "60px", alignItems: "start" }}>
              {/* Inputs */}
              <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span style={{ fontFamily: "Exo 2, sans-serif", fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>Monthly Manual Hours</span>
                    <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.85rem", color: "var(--neural-blue)", fontWeight: 700 }}>{manualHours} hrs/mo</span>
                  </div>
                  <input type="range" min="50" max="1000" step="25" value={manualHours}
                    onChange={(e) => setManualHours(Number(e.target.value))}
                    style={{ width: "100%", height: "4px", accentColor: "var(--neural-blue)", cursor: "pointer" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "6px" }}>
                    <span>50 hrs</span><span>500 hrs</span><span>1,000 hrs</span>
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span style={{ fontFamily: "Exo 2, sans-serif", fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>Average Hourly Staff Rate</span>
                    <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.85rem", color: "var(--neural-blue)", fontWeight: 700 }}>${hourlyRate}/hr</span>
                  </div>
                  <input type="range" min="15" max="150" step="5" value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    style={{ width: "100%", height: "4px", accentColor: "var(--neural-blue)", cursor: "pointer" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "6px" }}>
                    <span>$15/hr</span><span>$80/hr</span><span>$150/hr</span>
                  </div>
                </div>

                <div>
                  <span style={{ fontFamily: "Exo 2, sans-serif", fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)", display: "block", marginBottom: "12px" }}>Task / Pipeline Complexity</span>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                    {(["low", "medium", "high"] as const).map((level) => (
                      <button key={level} onClick={() => setComplexity(level)}
                        style={{
                          padding: "10px", borderRadius: "8px", cursor: "pointer", fontFamily: "Orbitron, sans-serif", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", transition: "all 0.2s",
                          background: complexity === level ? "rgba(0,229,255,0.1)" : "rgba(255,255,255,0.03)",
                          border: complexity === level ? "1px solid var(--neural-blue)" : "1px solid rgba(255,255,255,0.06)",
                          color: complexity === level ? "var(--neural-blue)" : "var(--text-muted)",
                        }}
                      >{level}</button>
                    ))}
                  </div>
                  <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "10px", lineHeight: 1.5 }}>
                    {complexity === "low" && "Structured inputs, simple document parsing, direct Slack alerts — 75% automation potential."}
                    {complexity === "medium" && "Dynamic email sorting, CRM enrichment, multi-agent validation flows — 55% automation potential."}
                    {complexity === "high" && "Complex legacy integrations, multi-agent recursive LangGraph workflows — 35% automation potential."}
                  </p>
                </div>
              </div>

              {/* Results */}
              <div className="card-glass" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
                <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.6rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.15em" }}>Yearly ROI Forecast</span>

                <div>
                  <span style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.78rem", color: "var(--text-muted)", display: "block" }}>Potential Cost Savings</span>
                  <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "2.2rem", fontWeight: 800, color: "var(--neural-blue)" }}>${potentialSavings.toLocaleString()}</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "20px" }}>
                  <div>
                    <span style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Hours Reclaimed</span>
                    <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>{hoursSavedYearly.toLocaleString()} hrs</span>
                  </div>
                  <div>
                    <span style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Automation Rate</span>
                    <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>{Math.round(automationRate * 100)}%</span>
                  </div>
                </div>

                <div style={{ background: "rgba(0,229,255,0.04)", border: "1px solid rgba(0,229,255,0.1)", borderRadius: "10px", padding: "14px 16px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <ShieldCheck size={16} color="var(--neural-blue)" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                    Build timeline: approximately <strong style={{ color: "var(--neural-blue)" }}>{implementationWeeks} weeks</strong>, including testing cycles and user onboarding.
                  </p>
                </div>

                <Link href="/contact" className="btn-primary" style={{ justifyContent: "center", display: "inline-flex", gap: "6px", marginTop: "4px" }}>
                  Validate ROI with our Architects <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ paddingBottom: "100px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {[
              { label: "Free Scoping Call", desc: "30-min call to map your use case and estimate ROI", icon: CheckCircle },
              { label: "Custom Architecture", desc: "Tailored agent blueprints matched to your tech stack", icon: CheckCircle },
              { label: "Post-Launch Support", desc: "3-month monitoring, iteration, and optimisation SLA", icon: CheckCircle },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "24px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px" }}>
                  <Icon size={16} color="var(--neural-blue)" style={{ flexShrink: 0, marginTop: "3px" }} />
                  <div>
                    <h4 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.85rem", fontWeight: 700, marginBottom: "4px" }}>{item.label}</h4>
                    <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
