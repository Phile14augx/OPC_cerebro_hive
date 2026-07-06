"use client";
import { Zap, ArrowRight, Network, Shield, LayoutDashboard, CheckCircle, Clock, Terminal, Activity, Server, Cpu } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

const visionPillars = [
  {
    icon: Network,
    color: "#00E5FF",
    title: "Universal Orchestration",
    desc: "One runtime that orchestrates CerebroFlow pipelines, CerebroAgent networks, CerebroLearn content delivery, and CerebroERP data — all in a single, unified event graph.",
  },
  {
    icon: Shield,
    color: "#7B61FF",
    title: "Private Model Layer",
    desc: "Run your own fine-tuned models, private RAG indexes, and custom embedding pipelines inside your own infrastructure — fully air-gapped from third-party APIs if required.",
  },
  {
    icon: LayoutDashboard,
    color: "#FF8A00",
    title: "Unified Intelligence Dashboard",
    desc: "A single pane of glass showing every agent action, automation event, learning metric, and ERP signal across your entire organisation in real time.",
  },
];

const connectedProducts = [
  { name: "CerebroFlow", color: "#00E5FF", href: "/products/cerebroflow" },
  { name: "CerebroAgent", color: "#7B61FF", href: "/products/cerebroagent" },
  { name: "CerebroLearn", color: "#FF2ED1", href: "/products/cerebrolearn" },
  { name: "CerebroERP", color: "#FF8A00", href: "/products/cerebroerp" },
];

export default function CerebroOSPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const waitlistCount = 1204;

  const [allocation, setAllocation] = useState(42);
  const [traffic, setTraffic] = useState(84);
  const [latency, setLatency] = useState(12);
  const [monitorLogs, setMonitorLogs] = useState<string[]>([
    "[14:24:00] CerebroOS Core online. Initializing neural pathways...",
    "[14:24:01] Connected to CerebroFlow event bus.",
    "[14:24:02] Connected to CerebroAgent network supervisor.",
  ]);

  useEffect(() => {
    const logTemplates = [
      "Connection from CerebroFlow: trigger path /webhooks/invoice-paid",
      "CerebroAgent dispatched tool: WebSearch (Topic: AI Agent Architecture)",
      "CerebroLearn issued OpenBadge certification for ID: CH-9832",
      "CerebroERP synced transactions: 12 invoices reconciled, 0 anomalies detected",
      "Model routing request dispatched to Claude 3.5 Sonnet: Token count: 1.2k",
      "pgvector similarity query executed successfully (latency: 8.4ms)",
      "System alert: CPU load spike at 84% - scaling model workers",
      "CerebroOS synchronized central state graph database",
    ];

    const interval = setInterval(() => {
      // Fluctuate stats
      setAllocation(prev => Math.min(95, Math.max(20, prev + Math.floor(Math.random() * 11) - 5)));
      setTraffic(prev => Math.min(150, Math.max(40, prev + Math.floor(Math.random() * 15) - 7)));
      setLatency(prev => Math.min(30, Math.max(5, prev + Math.floor(Math.random() * 5) - 2)));

      // Add a random log
      const randomTemplate = logTemplates[Math.floor(Math.random() * logTemplates.length)];
      const now = new Date();
      const timeStr = `[${now.toTimeString().split(" ")[0]}]`;
      setMonitorLogs(prev => {
        const next = [...prev, `${timeStr} ${randomTemplate}`];
        if (next.length > 6) next.shift();
        return next;
      });
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Cinematic Hero */}
      <section className="hex-pattern" style={{ paddingTop: "140px", paddingBottom: "80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 60% at 50% 30%, rgba(0,229,255,0.05) 0%, rgba(123,97,255,0.04) 40%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "20%", left: "10%", width: "400px", height: "400px", background: "rgba(123,97,255,0.04)", borderRadius: "50%", filter: "blur(120px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "30%", right: "10%", width: "300px", height: "300px", background: "rgba(0,229,255,0.03)", borderRadius: "50%", filter: "blur(100px)", pointerEvents: "none" }} />
        <div className="container-wide" style={{ position: "relative", textAlign: "center" }}>
          <Link href="/products" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none", marginBottom: "32px" }}>
            ← Back to Products
          </Link>
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "24px" }}>
            <div className="section-label" style={{ display: "inline-flex" }}>
              <Zap size={11} /> Long-Term Vision
            </div>
            <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.6rem", fontWeight: 700, color: "var(--text-muted)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", padding: "3px 10px", borderRadius: "100px", textTransform: "uppercase" }}>
              Labs Research
            </span>
          </div>

          <h1 style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)", marginBottom: "24px", letterSpacing: "-0.02em" }}>
            Cerebro<span className="gradient-text-full">OS</span>
          </h1>
          <p style={{ fontFamily: "Orbitron, sans-serif", fontSize: "clamp(1rem, 2.5vw, 1.4rem)", color: "var(--text-muted)", maxWidth: "700px", margin: "0 auto 16px", lineHeight: 1.5, fontWeight: 600, letterSpacing: "0.02em" }}>
            The Intelligence Layer
          </p>
          <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "1.05rem", color: "var(--text-muted)", maxWidth: "600px", margin: "0 auto 16px", lineHeight: 1.7 }}>
            An enterprise AI operating layer that connects every CerebroHive product and third-party system into a single, unified intelligence platform. One runtime. Infinite agent potential.
          </p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: "Exo 2, sans-serif", fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "48px" }}>
            <Clock size={14} /> Currently in active CerebroHive Labs research
          </div>
        </div>
      </section>

      {/* Live System Monitor Console */}
      <section style={{ paddingBottom: "60px" }}>
        <div className="container-wide">
          <div className="card-glass" style={{ padding: "40px" }}>
            <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.35rem", fontWeight: 700, marginBottom: "28px", textAlign: "center" }}>
              CerebroOS Core System Monitor
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "40px" }}>
              {/* Metrics side */}
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div className="card-glass" style={{ padding: "20px 24px", background: "rgba(255,255,255,0.01)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.7rem", color: "var(--text-muted)" }}>AI ENGINE ALLOCATION</span>
                    <Cpu size={14} color="var(--neural-blue)" />
                  </div>
                  <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.4rem", fontWeight: 800, color: "var(--neural-blue)", marginBottom: "8px" }}>
                    {allocation}%
                  </div>
                  <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "100px", overflow: "hidden" }}>
                    <div style={{ width: `${allocation}%`, height: "100%", background: "var(--neural-blue)", transition: "width 0.5s ease" }} />
                  </div>
                </div>

                <div className="card-glass" style={{ padding: "20px 24px", background: "rgba(255,255,255,0.01)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.7rem", color: "var(--text-muted)" }}>API TRAFFIC RATE</span>
                    <Activity size={14} color="var(--violet)" />
                  </div>
                  <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.4rem", fontWeight: 800, color: "var(--violet)" }}>
                    {traffic} req/s
                  </div>
                </div>

                <div className="card-glass" style={{ padding: "20px 24px", background: "rgba(255,255,255,0.01)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.7rem", color: "var(--text-muted)" }}>VECTOR QUERY LATENCY</span>
                    <Server size={14} color="var(--hive-orange)" />
                  </div>
                  <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.4rem", fontWeight: 800, color: "var(--hive-orange)" }}>
                    {latency} ms
                  </div>
                </div>
              </div>

              {/* Terminal Logs side */}
              <div style={{ background: "#06090F", border: "1px solid rgba(0,229,255,0.2)", borderRadius: "12px", padding: "24px", display: "flex", flexDirection: "column", gap: "12px", height: "304px", overflow: "hidden", boxShadow: "0 0 20px rgba(0,229,255,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Terminal size={14} color="var(--neural-blue)" />
                    <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em" }}>LIVE LOG STREAM</span>
                  </div>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "Orbitron, sans-serif", fontSize: "0.58rem", color: "var(--neural-blue)" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--neural-blue)", animation: "pulse 1.5s infinite" }} /> SYSTEM ACTIVE
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, overflowY: "auto" }}>
                  {monitorLogs.map((log, idx) => (
                    <div key={idx} style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.75rem", color: log.includes("alert") ? "var(--hot-pink)" : "var(--text-muted)", lineHeight: 1.5 }}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Constellation Diagram */}
      <section style={{ paddingBottom: "40px" }}>
        <div className="container-wide">
          <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.3rem", fontWeight: 700, textAlign: "center", marginBottom: "32px" }}>
            What it connects
          </h2>
          <div className="card-glass" style={{ padding: "48px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* Constellation SVG */}
            <svg viewBox="0 0 500 220" style={{ width: "100%", maxWidth: "600px", height: "auto" }}>
              {/* Product nodes */}
              {[
                { x: 80, y: 50, name: "CerebroFlow", color: "#00E5FF" },
                { x: 80, y: 170, name: "CerebroERP", color: "#FF8A00" },
                { x: 420, y: 50, name: "CerebroAgent", color: "#7B61FF" },
                { x: 420, y: 170, name: "CerebroLearn", color: "#FF2ED1" },
              ].map((node) => (
                <g key={node.name}>
                  <line x1={node.x} y1={node.y} x2={250} y2={110} stroke={node.color} strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
                  <circle cx={node.x} cy={node.y} r="28" fill={`${node.color}10`} stroke={node.color} strokeWidth="1.5" />
                  <text x={node.x} y={node.y + 4} textAnchor="middle" fontSize="8" fill={node.color} fontFamily="Orbitron, sans-serif" fontWeight="700">
                    {node.name.replace("Cerebro", "C.")}
                  </text>
                </g>
              ))}
              {/* CerebroOS core */}
              <circle cx={250} cy={110} r="42" fill="rgba(0,229,255,0.05)" stroke="rgba(0,229,255,0.4)" strokeWidth="2" />
              <circle cx={250} cy={110} r="30" fill="rgba(0,229,255,0.08)" stroke="rgba(123,97,255,0.3)" strokeWidth="1" />
              <text x={250} y={105} textAnchor="middle" fontSize="10" fill="var(--text-primary)" fontFamily="Orbitron, sans-serif" fontWeight="800">CerebroOS</text>
              <text x={250} y={121} textAnchor="middle" fontSize="7.5" fill="#8892A4" fontFamily="Exo 2, sans-serif">Intelligence Layer</text>
              {/* External node */}
              <circle cx={250} cy={5} r="14" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              <text x={250} y={9} textAnchor="middle" fontSize="6.5" fill="#8892A4" fontFamily="Exo 2, sans-serif">3rd Party</text>
              <line x1={250} y1={18} x2={250} y2={68} stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="3 3" />
            </svg>
            <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.82rem", color: "var(--text-muted)", textAlign: "center", maxWidth: "500px", marginTop: "20px", lineHeight: 1.6 }}>
              CerebroOS sits at the centre — orchestrating data, agents, workflows, and learning events across all products and any connected third-party system through a unified API and event bus.
            </p>
          </div>
        </div>
      </section>

      {/* Vision Pillars */}
      <section style={{ paddingBottom: "40px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {visionPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div key={pillar.title} className="card-glass" style={{ padding: "32px 28px" }}>
                  <div style={{ width: 44, height: 44, borderRadius: "10px", background: `${pillar.color}14`, border: `1px solid ${pillar.color}30`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                    <Icon size={20} color={pillar.color} />
                  </div>
                  <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "10px" }}>{pillar.title}</h3>
                  <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.83rem", color: "var(--text-muted)", lineHeight: 1.65 }}>{pillar.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Connected Products */}
      <section style={{ paddingBottom: "40px" }}>
        <div className="container-wide">
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "32px" }}>
            <p style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.6rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "20px", textAlign: "center" }}>
              Explore connected products
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              {connectedProducts.map((prod) => (
                <Link key={prod.name} href={prod.href} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", padding: "10px 20px", background: `${prod.color}08`, border: `1px solid ${prod.color}28`, borderRadius: "100px", fontFamily: "Orbitron, sans-serif", fontSize: "0.72rem", fontWeight: 700, color: prod.color, transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = `${prod.color}14`; e.currentTarget.style.borderColor = `${prod.color}50`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = `${prod.color}08`; e.currentTarget.style.borderColor = `${prod.color}28`; }}>
                  {prod.name} <ArrowRight size={12} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist */}
      <section style={{ paddingBottom: "100px" }}>
        <div className="container-wide">
          <div className="card-glass" style={{ padding: "48px", maxWidth: "600px", margin: "0 auto", textAlign: "center", background: "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(0,229,255,0.03) 0%, transparent 70%)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "14px" }}>
              <Zap size={16} color="var(--neural-blue)" />
              <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.6rem", fontWeight: 700, color: "var(--neural-blue)", textTransform: "uppercase", letterSpacing: "0.15em" }}>
                Join the Vision
              </span>
            </div>
            <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.4rem", fontWeight: 700, marginBottom: "12px" }}>Be part of what comes next.</h2>
            <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.7, marginBottom: "12px" }}>
              Founding members will help shape product decisions, get preview access to Labs demos, and receive founding member pricing when CerebroOS launches.
            </p>
            <p style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.78rem", fontWeight: 700, color: "var(--neural-blue)", marginBottom: "28px" }}>
              {waitlistCount.toLocaleString()} organisations already on the list
            </p>
            {!submitted ? (
              <form onSubmit={(e) => { e.preventDefault(); if (email.includes("@")) setSubmitted(true); }} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <input type="email" placeholder="your@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required
                  style={{ padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "var(--text-primary)", fontFamily: "Exo 2, sans-serif", fontSize: "0.9rem", outline: "none", textAlign: "center" }} />
                <button type="submit" className="btn-primary" style={{ justifyContent: "center", gap: "6px" }}>
                  Secure My Founding Spot <ArrowRight size={13} />
                </button>
              </form>
            ) : (
              <div style={{ padding: "16px 0" }}>
                <CheckCircle size={36} color="var(--neural-blue)" style={{ margin: "0 auto 12px" }} />
                <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1rem", fontWeight: 700, color: "var(--neural-blue)", marginBottom: "6px" }}>
                  You are founding member #{waitlistCount + 1}
                </div>
                <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  We will reach out with Labs updates and invite you to founding member sessions as they are scheduled.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
