"use client";
import { CheckCircle, ArrowRight, ArrowLeft, Zap, GitBranch, Cpu, Activity, Shield, Clock, Layers, Play, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const features = [
  { icon: GitBranch, color: "#00E5FF", title: "Visual Pipeline Builder", desc: "Drag-and-drop LangGraph canvas. Connect LLM nodes, conditionals, and API calls without writing orchestration code." },
  { icon: Cpu, color: "#7B61FF", title: "AI Decision Nodes", desc: "Embed GPT-4o, Claude 3.5, or Gemini as active decision agents inside any step of your pipeline." },
  { icon: Activity, color: "#FF8A00", title: "Real-Time Monitoring", desc: "Live execution graphs, failure alerts, latency tracking, and throughput dashboards per workflow." },
  { icon: Shield, color: "#00E5FF", title: "Fault-Tolerant Retries", desc: "Configurable exponential backoff, dead-letter queues, and human escalation on critical path failures." },
  { icon: Clock, color: "#FF2ED1", title: "One-Click Deployment", desc: "Publish workflows to production or staging environments with instant rollback support." },
  { icon: Layers, color: "#7B61FF", title: "Version Control", desc: "Full workflow versioning. Compare diffs, restore previous builds, and audit change history per deployment." },
];

const integrations = [
  { name: "Slack", color: "#4A154B" }, { name: "Salesforce", color: "#00A1E0" },
  { name: "HubSpot", color: "#FF7A59" }, { name: "Notion", color: "#000000" },
  { name: "Airtable", color: "#FCB400" }, { name: "Twilio", color: "#F22F46" },
  { name: "OpenAI", color: "#00A67E" }, { name: "Pinecone", color: "#1B17D0" },
  { name: "Zendesk", color: "#03363D" }, { name: "Google Drive", color: "#4285F4" },
  { name: "Stripe", color: "#635BFF" }, { name: "PostgreSQL", color: "#4169E1" },
];

const pricingTiers = [
  {
    name: "Developer",
    price: "$0",
    period: "forever",
    color: "#00E5FF",
    desc: "For individual builders exploring local agent pipelines and testing automations.",
    bullets: ["1,000 tasks per month", "3 active workflows", "Standard API connectors", "Community support forum"],
    cta: "Start Free",
    href: "/contact?product=flow&tier=dev"
  },
  {
    name: "Growth",
    price: "$49",
    period: "month",
    color: "#7B61FF",
    desc: "For growing teams seeking to orchestrate production agent and database pipelines.",
    bullets: ["50,000 tasks per month", "Unlimited active workflows", "Standard & premium connectors", "Shared team workspaces", "Email SLA support"],
    cta: "Start 14-Day Free Trial",
    href: "/contact?product=flow&tier=growth"
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "tailored",
    color: "#FF8A00",
    desc: "For mission-critical enterprise scaling, strict compliance, and dedicated infrastructure.",
    bullets: ["Unlimited tasks & workflows", "Private VPC & on-prem deployment", "99.99% execution uptime SLA", "Dedicated solutions architect", "Custom connector build support"],
    cta: "Contact Enterprise Sales",
    href: "/contact?product=flow&tier=enterprise"
  }
];

export default function CerebroFlowPage() {
  const [nodes, setNodes] = useState([
    { id: 1, type: "trigger", label: "Email Received", color: "#FF8A00" },
    { id: 2, type: "ai", label: "Classify Sentiment", color: "#00E5FF" },
    { id: 3, type: "action", label: "Slack Notify", color: "#7B61FF" }
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [taskVolume, setTaskVolume] = useState(20000);

  // Run mock workflow execution log stream
  const runWorkflow = () => {
    if (isRunning) return;
    setIsRunning(true);
    setLogs([]);

    const steps = [
      "[09:30:00] Ingesting trigger data: Customer inquiry email",
      "[09:30:01] Processing Trigger: Email Received -> Extracting subject & body",
      "[09:30:02] Activating AI Node: Classify Sentiment...",
      "[09:30:03] AI Analysis Output: Sentiment = Negative, Priority = High",
      "[09:30:04] Evaluating Branching Logic: High priority path selected",
      "[09:30:05] Calling Action: Slack Notify -> Dispatched alert to #critical-ops",
      "[09:30:06] ✓ SUCCESS: Executed in 6.2s. Manual hours saved: 0.15 hrs."
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setLogs(prev => [...prev, step]);
        if (idx === steps.length - 1) {
          setIsRunning(false);
        }
      }, (idx + 1) * 800);
    });
  };

  const addNode = (type: "trigger" | "ai" | "action", label: string, color: string) => {
    if (nodes.length >= 6) return;
    const newNode = {
      id: Date.now(),
      type,
      label,
      color
    };
    setNodes(prev => [...prev, newNode]);
  };

  const clearCanvas = () => {
    setNodes([]);
    setLogs([]);
  };

  // Cost calculations
  const zapierCost = Math.round(taskVolume * 0.005);
  const flowCost = Math.round(taskVolume * 0.001);
  const savings = Math.max(0, zapierCost - flowCost);

  return (
    <>
      {/* Hero */}
      <section style={{ paddingTop: "140px", paddingBottom: "60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,229,255,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="container-wide" style={{ position: "relative" }}>
          <Link href="/products" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none", marginBottom: "24px", transition: "color 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>
            <ArrowLeft size={14} /> Back to Products
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div className="section-label" style={{ display: "inline-flex" }}>
              <Zap size={11} /> Automation Suite
            </div>
            <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.6rem", fontWeight: 700, color: "#00E5FF", background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.3)", padding: "3px 10px", borderRadius: "100px", textTransform: "uppercase" }}>
              GA — Live
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(2.8rem, 5vw, 4rem)", marginBottom: "20px" }}>
            Cerebro<span className="gradient-text-full">Flow</span>
          </h1>
          <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "1.15rem", color: "var(--text-muted)", maxWidth: "580px", lineHeight: 1.7, marginBottom: "36px" }}>
            The AI-native visual automation platform. Connect LLM decision nodes, APIs, and data sources into fault-tolerant recursive pipelines — without writing orchestration code.
          </p>
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            <a href="#playground" className="btn-primary" style={{ gap: "6px", display: "inline-flex", textDecoration: "none", alignItems: "center" }}>
              Launch Playground <ArrowRight size={14} />
            </a>
            <a href="#pricing" className="btn-ghost" style={{ gap: "6px", display: "inline-flex", textDecoration: "none", alignItems: "center" }}>
              View SaaS Tiers
            </a>
          </div>
        </div>
      </section>

      {/* Interactive Workflow Canvas Playground */}
      <section id="playground" style={{ paddingBottom: "60px" }}>
        <div className="container-wide">
          <div className="card-glass" style={{ padding: "40px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "28px" }}>
              <div>
                <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.3rem", fontWeight: 700, marginBottom: "6px" }}>
                  Interactive Workflow Canvas
                </h2>
                <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Configure your automation nodes on the grid, then run a simulation.
                </p>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button onClick={runWorkflow} disabled={isRunning || nodes.length === 0} className="btn-primary" style={{ padding: "8px 18px", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <Play size={12} fill="#080B14" /> {isRunning ? "Running..." : "Run Workflow"}
                </button>
                <button onClick={clearCanvas} className="btn-ghost" style={{ padding: "8px 18px", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <RefreshCw size={12} /> Clear Canvas
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "32px" }}>
              {/* Sidebar tools */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Add Flow Nodes</div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <button onClick={() => addNode("trigger", "Webhook API", "#FF8A00")} style={{ padding: "12px", background: "rgba(255,138,0,0.08)", border: "1px solid rgba(255,138,0,0.3)", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-primary)" }}>
                    <Plus size={14} color="#FF8A00" /> + Trigger (Webhook)
                  </button>
                  <button onClick={() => addNode("trigger", "Schedule Run", "#FF8A00")} style={{ padding: "12px", background: "rgba(255,138,0,0.08)", border: "1px solid rgba(255,138,0,0.3)", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-primary)" }}>
                    <Plus size={14} color="#FF8A00" /> + Trigger (Schedule)
                  </button>
                  <button onClick={() => addNode("ai", "Summarize Text", "#00E5FF")} style={{ padding: "12px", background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.3)", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-primary)" }}>
                    <Plus size={14} color="#00E5FF" /> + AI Node (Summary)
                  </button>
                  <button onClick={() => addNode("ai", "Agent Classifier", "#00E5FF")} style={{ padding: "12px", background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.3)", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-primary)" }}>
                    <Plus size={14} color="#00E5FF" /> + AI Node (Classifier)
                  </button>
                  <button onClick={() => addNode("action", "Postgres Save", "#7B61FF")} style={{ padding: "12px", background: "rgba(123,97,255,0.08)", border: "1px solid rgba(123,97,255,0.3)", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-primary)" }}>
                    <Plus size={14} color="#7B61FF" /> + Action (Postgres)
                  </button>
                  <button onClick={() => addNode("action", "Stripe Invoice", "#7B61FF")} style={{ padding: "12px", background: "rgba(123,97,255,0.08)", border: "1px solid rgba(123,97,255,0.3)", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-primary)" }}>
                    <Plus size={14} color="#7B61FF" /> + Action (Stripe)
                  </button>
                </div>
              </div>

              {/* Main workspace */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Node Grid */}
                <div style={{ height: "180px", background: "rgba(255,255,255,0.01)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", gap: "16px", flexWrap: "wrap", overflowY: "auto" }}>
                  {nodes.length === 0 ? (
                    <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.82rem", color: "var(--text-muted)" }}>Canvas is empty. Click sidebar buttons to build a workflow.</div>
                  ) : (
                    nodes.map((n, i) => (
                      <div key={n.id} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ padding: "14px 20px", background: "rgba(8,11,20,0.9)", border: `1px solid ${n.color}50`, borderRadius: "10px", boxShadow: `0 0 10px ${n.color}18`, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                          <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.58rem", fontWeight: 700, color: n.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>{n.type}</span>
                          <span style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-primary)", fontWeight: 600 }}>{n.label}</span>
                        </div>
                        {i < nodes.length - 1 && <span style={{ color: "var(--text-muted)", fontSize: "1.2rem", fontWeight: 700 }}>→</span>}
                      </div>
                    ))
                  )}
                </div>

                {/* Log Terminal */}
                <div style={{ background: "#06090F", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "16px 20px", height: "150px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "8px", marginBottom: "4px" }}>
                    <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.62rem", fontWeight: 700, color: "var(--text-muted)" }}>EXECUTION LOG FEED</span>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: isRunning ? "var(--neural-blue)" : "rgba(255,255,255,0.2)", boxShadow: isRunning ? "0 0 8px var(--neural-blue)" : "none" }} />
                  </div>
                  {logs.length === 0 ? (
                    <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.75rem", color: "var(--text-dim)" }}>No active executions. Click &quot;Run Workflow&quot; above to trace.</div>
                  ) : (
                    logs.map((log, i) => (
                      <div key={i} style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.75rem", color: log.includes("SUCCESS") ? "var(--neural-blue)" : "var(--text-muted)", whiteSpace: "pre-wrap" }}>{log}</div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cost Calculator Section */}
      <section style={{ paddingBottom: "60px" }}>
        <div className="container-wide">
          <div className="card-glass" style={{ padding: "40px" }}>
            <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.30rem", fontWeight: 700, marginBottom: "8px", textAlign: "center" }}>
              Calculate Your Automation Savings
            </h2>
            <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "center", marginBottom: "32px" }}>
              See how CerebroFlow&apos;s bulk-execution model saves costs compared to legacy platforms.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "60px", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                  <span style={{ fontFamily: "Exo 2, sans-serif", fontWeight: 600, fontSize: "0.92rem", color: "var(--text-primary)" }}>Monthly Automated Tasks</span>
                  <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.9rem", color: "var(--neural-blue)", fontWeight: 700 }}>{taskVolume.toLocaleString()} Runs</span>
                </div>
                <input type="range" min="5000" max="250000" step="5000" value={taskVolume}
                  onChange={(e) => setTaskVolume(Number(e.target.value))}
                  style={{ width: "100%", height: "4px", accentColor: "var(--neural-blue)", cursor: "pointer" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "8px" }}>
                  <span>5,000</span><span>125,000</span><span>250,000</span>
                </div>
              </div>

              <div className="card-glass" style={{ padding: "28px", background: "rgba(255,255,255,0.015)" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    <span>Legacy Platform (Zapier) Cost:</span>
                    <span style={{ textDecoration: "line-through" }}>${zapierCost.toLocaleString()}/mo</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    <span>CerebroFlow Platform Cost:</span>
                    <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>${flowCost.toLocaleString()}/mo</span>
                  </div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.75rem", fontWeight: 700, color: "var(--neural-blue)" }}>ESTIMATED SAVINGS</span>
                    <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.4rem", fontWeight: 800, color: "var(--neural-blue)" }}>${savings.toLocaleString()}/mo</span>
                  </div>
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
            Everything you need to <span className="gradient-text-full">automate at scale</span>
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

      {/* Integration Logos */}
      <section style={{ paddingBottom: "40px" }}>
        <div className="container-wide">
          <p style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", textAlign: "center", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "24px" }}>
            Connects with your existing stack
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "12px" }}>
            {integrations.map((integ) => (
              <div key={integ.name} className="card-glass" style={{ padding: "14px 10px", textAlign: "center" }}>
                <span style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)" }}>{integ.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ paddingBottom: "100px" }}>
        <div className="container-wide">
          <div className="card-glass" style={{ padding: "56px 48px", textAlign: "center", background: "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(0,229,255,0.04) 0%, transparent 70%)" }}>
            <div className="section-label" style={{ display: "inline-flex", marginBottom: "20px" }}><Zap size={11} /> Get Started Today</div>
            <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.8rem", fontWeight: 700, marginBottom: "16px" }}>
              Automate your first pipeline <span className="gradient-text-full">in 30 minutes</span>
            </h2>
            <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.95rem", color: "var(--text-muted)", maxWidth: "520px", margin: "0 auto 32px", lineHeight: 1.7 }}>
              Our automation architects will map your highest-ROI workflow, configure the first pipeline together, and hand it off fully tested.
            </p>
            <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/contact" className="btn-primary" style={{ gap: "6px" }}>Book a Free Architecture Call <ArrowRight size={14} /></Link>
              <Link href="/case-studies" className="btn-ghost">See Real Results</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
