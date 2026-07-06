"use client";
import { Bot, CheckCircle, ArrowRight, ArrowLeft, Zap, Database, Network, BarChart2, Wrench, Brain, Play, Terminal, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const features = [
  { icon: Wrench, color: "#7B61FF", title: "Visual Agent Builder", desc: "Configure agent tools, system prompts, memory types, and escalation rules through a visual interface — no ML expertise required." },
  { icon: Database, color: "#00E5FF", title: "Long-Term Memory", desc: "Persistent pgvector-backed agent memory. Agents remember past interactions, customer preferences, and operational history." },
  { icon: Network, color: "#FF8A00", title: "Multi-Agent Canvas", desc: "Orchestrate networks of specialised agents using LangGraph state graphs. Supervisor agents delegate tasks to subordinate specialists." },
  { icon: Brain, color: "#FF2ED1", title: "Tool & Function Library", desc: "300+ pre-built tool integrations: web search, CRM write, email send, database query, document parse, API call." },
  { icon: BarChart2, color: "#7B61FF", title: "Usage Analytics", desc: "Per-agent dashboards tracking conversation volume, resolution rate, escalation frequency, and cost per interaction." },
  { icon: Zap, color: "#00E5FF", title: "Real-Time Event Listeners", desc: "Agents that wake on triggers: new CRM record, Slack mention, webhook event, database row insert, or cron schedule." },
];

const useCases = [
  {
    title: "Customer Support Agent",
    desc: "Resolves 70% of tickets autonomously using RAG on your product documentation. Escalates with full context to human agents when confidence is low.",
    color: "#00E5FF",
    metrics: ["70% deflection rate", "< 2s response", "Zendesk integration"],
  },
  {
    title: "Sales Outreach Agent",
    desc: "Enriches inbound leads from LinkedIn and Apollo, scores qualification, drafts personalised outreach, and schedules meetings on your calendar.",
    color: "#7B61FF",
    metrics: ["3× qualified leads", "85% CRM accuracy", "Calendly integration"],
  },
  {
    title: "Internal Knowledge Agent",
    desc: "Answers questions from your Notion, Drive, and Confluence using semantic search. Always cites its sources. Never hallucinates.",
    color: "#FF8A00",
    metrics: ["95% answer accuracy", "Source citations", "Slack + Teams integration"],
  },
];

const pricingTiers = [
  {
    name: "Hobbyist",
    price: "$9",
    period: "month",
    color: "#00E5FF",
    desc: "For developers and individuals building single agents and experimenting with prompt configurations.",
    bullets: ["1 active agent", "2,000 monthly execution tokens", "Basic pre-built tools library", "Community forums access"],
    cta: "Select Hobbyist",
    href: "/contact?product=agent&tier=hobbyist"
  },
  {
    name: "Professional",
    price: "$89",
    period: "month",
    color: "#7B61FF",
    desc: "For growing businesses deploying autonomous agent networks for sales, marketing, and operations.",
    bullets: ["10 active agents", "250,000 execution tokens", "Long-term vector database memory", "Custom API & tools integration", "Email priority SLA support"],
    cta: "Select Professional",
    href: "/contact?product=agent&tier=pro"
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "tailored",
    color: "#FF8A00",
    desc: "For large organizations scaling mission-critical autonomous agent networks across core platforms.",
    bullets: ["Unlimited active agents", "Unlimited execution tokens", "On-prem private server deployment", "Dedicated model fine-tuning support", "24/7 dedicated solutions manager"],
    cta: "Contact Enterprise Sales",
    href: "/contact?product=agent&tier=enterprise"
  }
];

const stats = [
  { label: "Agent Uptime SLA", value: "99.4%" },
  { label: "Avg. Agent Response", value: "< 800ms" },
  { label: "Memory Retention", value: "∞ Context" },
];

export default function CerebroAgentPage() {
  const [agentName, setAgentName] = useState("Cerebro-Support");
  const [agentRole, setAgentRole] = useState("Support Specialist");
  const [useSearch, setUseSearch] = useState(true);
  const [useDatabase, setUseDatabase] = useState(true);
  const [useEmail, setUseEmail] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const runAgentSandbox = () => {
    if (isInitializing) return;
    setIsInitializing(true);
    setLogs([]);

    const steps = [
      `[SANDBOX] Initializing agent: "${agentName}" with role "${agentRole}"...`,
      `[MEMORY] Ingesting RAG context matching "${agentRole}" requirements...`,
      `[AGENT] Active. Running reasoning loop for customer inquiry...`,
      useSearch ? `[TOOL RUN] Executing Web Search -> Crawling documentation for relevant endpoints...` : null,
      useDatabase ? `[TOOL RUN] Querying PostgreSQL Database -> Retrieved customer cohort logs...` : null,
      useEmail ? `[TOOL RUN] Calling AWS SES -> Prepared transactional outbound email draft...` : null,
      `[REASONING] Formulation complete. Confidence score: 0.94.`,
      `[OUTPUT] Response: "Inquiry resolved autonomously. Ticket status set to CLOSED."`,
      `[STATUS] Success. Agent "${agentName}" entered standby mode.`
    ].filter(Boolean) as string[];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setLogs(prev => [...prev, step]);
        if (idx === steps.length - 1) {
          setIsInitializing(false);
        }
      }, (idx + 1) * 750);
    });
  };

  return (
    <>
      {/* Hero */}
      <section style={{ paddingTop: "140px", paddingBottom: "60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(123,97,255,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="container-wide" style={{ position: "relative" }}>
          <Link href="/products" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none", marginBottom: "24px", transition: "color 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>
            <ArrowLeft size={14} /> Back to Products
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div className="section-label" style={{ display: "inline-flex", color: "var(--violet)", background: "rgba(123,97,255,0.08)", borderColor: "rgba(123,97,255,0.25)" }}>
              <Bot size={11} /> Agent Platform
            </div>
            <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.6rem", fontWeight: 700, color: "#7B61FF", background: "rgba(123,97,255,0.1)", border: "1px solid rgba(123,97,255,0.3)", padding: "3px 10px", borderRadius: "100px", textTransform: "uppercase" }}>
              Beta Access
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(2.8rem, 5vw, 4rem)", marginBottom: "20px" }}>
            Cerebro<span className="gradient-text-blue-violet">Agent</span>
          </h1>
          <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "1.15rem", color: "var(--text-muted)", maxWidth: "580px", lineHeight: 1.7, marginBottom: "36px" }}>
            Build, deploy, and orchestrate persistent AI agent networks. From a single customer support bot to a 12-agent recursive reasoning graph — without writing the orchestration layer yourself.
          </p>
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            <a href="#sandbox" className="btn-primary" style={{ gap: "6px", display: "inline-flex", textDecoration: "none", alignItems: "center", background: "linear-gradient(135deg, #7B61FF, #00E5FF)" }}>
              Launch Agent Sandbox <ArrowRight size={14} />
            </a>
            <a href="#pricing" className="btn-ghost" style={{ gap: "6px", display: "inline-flex", textDecoration: "none", alignItems: "center", borderColor: "#7B61FF", color: "#7B61FF" }}>
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
                <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.8rem", fontWeight: 800, color: "var(--violet)", marginBottom: "6px" }}>{s.value}</div>
                <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.82rem", color: "var(--text-muted)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Agent Sandbox */}
      <section id="sandbox" style={{ paddingBottom: "60px" }}>
        <div className="container-wide">
          <div className="card-glass" style={{ padding: "40px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "28px" }}>
              <div>
                <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.3rem", fontWeight: 700, marginBottom: "6px" }}>
                  Interactive Agent Sandbox
                </h2>
                <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Configure a mock agent and run live reasoning trace outputs.
                </p>
              </div>
              <button onClick={runAgentSandbox} disabled={isInitializing} className="btn-primary" style={{ padding: "10px 22px", fontSize: "0.78rem", display: "inline-flex", alignItems: "center", gap: "6px", background: "linear-gradient(135deg, #7B61FF, #00E5FF)" }}>
                <Play size={12} fill="#080B14" /> {isInitializing ? "Initializing..." : "Initialize Agent"}
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "48px", alignItems: "start" }}>
              {/* Configuration panel */}
              <div className="card-glass" style={{ padding: "28px", background: "rgba(255,255,255,0.015)" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div>
                    <label style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>AGENT NAME</label>
                    <input type="text" value={agentName} onChange={(e) => setAgentName(e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "var(--text-primary)", fontFamily: "Exo 2, sans-serif", fontSize: "0.88rem", outline: "none" }} />
                  </div>

                  <div>
                    <label style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>AGENT ROLE / MISSION</label>
                    <select value={agentRole} onChange={(e) => setAgentRole(e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", background: "rgba(8,11,20,0.9)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "var(--text-primary)", fontFamily: "Exo 2, sans-serif", fontSize: "0.88rem", outline: "none", cursor: "pointer" }}>
                      <option value="Support Specialist">Support Specialist</option>
                      <option value="Outbound Lead Generator">Outbound Lead Generator</option>
                      <option value="Data Analyst">Data Analyst</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "12px" }}>ASSIGN TOOLS</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "Exo 2, sans-serif", fontSize: "0.82rem", color: "var(--text-primary)", cursor: "pointer" }}>
                        <input type="checkbox" checked={useSearch} onChange={(e) => setUseSearch(e.target.checked)} style={{ accentColor: "var(--violet)" }} />
                        Web Search
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "Exo 2, sans-serif", fontSize: "0.82rem", color: "var(--text-primary)", cursor: "pointer" }}>
                        <input type="checkbox" checked={useDatabase} onChange={(e) => setUseDatabase(e.target.checked)} style={{ accentColor: "var(--violet)" }} />
                        PostgreSQL Database Write
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "Exo 2, sans-serif", fontSize: "0.82rem", color: "var(--text-primary)", cursor: "pointer" }}>
                        <input type="checkbox" checked={useEmail} onChange={(e) => setUseEmail(e.target.checked)} style={{ accentColor: "var(--violet)" }} />
                        AWS Outbound Email (SES)
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Streaming terminal */}
              <div style={{ background: "#06090F", border: "1px solid rgba(123,97,255,0.25)", borderRadius: "12px", padding: "24px", minHeight: "310px", display: "flex", flexDirection: "column", gap: "10px", boxShadow: "0 0 15px rgba(123,97,255,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Terminal size={14} color="var(--violet)" />
                    <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em" }}>AGENT REASONING TRACE</span>
                  </div>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF5F56" }} />
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FFBD2E" }} />
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#27C93F" }} />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", overflowY: "auto", flex: 1 }}>
                  {logs.length === 0 ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "JetBrains Mono, monospace", fontSize: "0.78rem", color: "var(--text-dim)", marginTop: "20px" }}>
                      <Sparkles size={13} /> Ready to initialize. Configure parameters left and click run.
                    </div>
                  ) : (
                    logs.map((log, idx) => (
                      <div key={idx} style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.78rem", color: log.includes("STATUS") ? "#27C93F" : log.includes("TOOL RUN") ? "#00E5FF" : "var(--text-muted)", lineHeight: 1.5 }}>
                        {log}
                      </div>
                    ))
                  )}
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

      {/* Core Showcase (Architecture Diagram) */}
      <section style={{ paddingBottom: "40px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "60px", alignItems: "center" }}>
            <div>
              <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.6rem", fontWeight: 700, marginBottom: "16px" }}>
                Agents that work while your team sleeps.
              </h2>
              <p style={{ fontFamily: "Exo 2, sans-serif", color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "28px" }}>
                CerebroAgent abstracts the complexity of LangGraph, memory management, and tool registration into a configurable platform. Point it at your data, define its tools, set escalation thresholds — and deploy. The agent handles everything else: context retrieval, tool selection, response generation, and memory update.
              </p>

              {/* Inline SVG architecture diagram */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(123,97,255,0.15)", borderRadius: "12px", padding: "24px", marginBottom: "28px" }}>
                <p style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "16px" }}>Architecture</p>
                <svg viewBox="0 0 400 120" style={{ width: "100%", height: "auto" }}>
                  {/* Input */}
                  <rect x="10" y="40" width="80" height="40" rx="6" fill="rgba(123,97,255,0.12)" stroke="rgba(123,97,255,0.4)" strokeWidth="1" />
                  <text x="50" y="64" textAnchor="middle" fontSize="9" fill="#8892A4" fontFamily="Exo 2, sans-serif">Event / Query</text>
                  {/* Arrow */}
                  <line x1="90" y1="60" x2="115" y2="60" stroke="rgba(123,97,255,0.5)" strokeWidth="1.5" />
                  {/* Agent */}
                  <rect x="115" y="28" width="100" height="64" rx="6" fill="rgba(123,97,255,0.15)" stroke="rgba(123,97,255,0.6)" strokeWidth="1.5" />
                  <text x="165" y="56" textAnchor="middle" fontSize="10" fill="#7B61FF" fontFamily="Orbitron, sans-serif" fontWeight="700">Agent</text>
                  <text x="165" y="72" textAnchor="middle" fontSize="8" fill="#8892A4" fontFamily="Exo 2, sans-serif">LangGraph Core</text>
                  {/* Arrow to tools */}
                  <line x1="215" y1="48" x2="248" y2="32" stroke="rgba(0,229,255,0.5)" strokeWidth="1.5" />
                  <line x1="215" y1="60" x2="248" y2="60" stroke="rgba(0,229,255,0.5)" strokeWidth="1.5" />
                  <line x1="215" y1="72" x2="248" y2="88" stroke="rgba(0,229,255,0.5)" strokeWidth="1.5" />
                  {/* Tool boxes */}
                  {[["Memory", 14], ["Tools", 48], ["APIs", 82]].map(([label, y]) => (
                    <g key={String(label)}>
                      <rect x="248" y={Number(y)} width="70" height="24" rx="4" fill="rgba(0,229,255,0.08)" stroke="rgba(0,229,255,0.2)" strokeWidth="1" />
                      <text x="283" y={Number(y) + 15} textAnchor="middle" fontSize="8" fill="#00E5FF" fontFamily="Exo 2, sans-serif">{String(label)}</text>
                    </g>
                  ))}
                  {/* Arrow to output */}
                  <line x1="318" y1="48" x2="342" y2="60" stroke="rgba(255,138,0,0.5)" strokeWidth="1.5" />
                  <line x1="318" y1="72" x2="342" y2="60" stroke="rgba(255,138,0,0.5)" strokeWidth="1.5" />
                  <rect x="342" y="40" width="50" height="40" rx="6" fill="rgba(255,138,0,0.08)" stroke="rgba(255,138,0,0.3)" strokeWidth="1" />
                  <text x="367" y="62" textAnchor="middle" fontSize="8" fill="#FF8A00" fontFamily="Exo 2, sans-serif">Response</text>
                </svg>
              </div>
            </div>

            {/* Feature Description bullets list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                "Deploy supervisor-led multi-agent networks",
                "Deep pgvector long-term operational memory",
                "Custom function mapping and sandbox execution",
                "Advanced usage dashboards with cost audits",
                "Event listeners for real-time trigger wakeups",
                "Standard compliance-first secure pipeline sandboxing",
              ].map((item) => (
                <div key={item} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <CheckCircle size={15} color="var(--violet)" style={{ flexShrink: 0, marginTop: "3px" }} />
                  <span style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.875rem", color: "var(--text-muted)" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section style={{ paddingBottom: "40px" }}>
        <div className="container-wide">
          <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.3rem", fontWeight: 700, marginBottom: "28px", textAlign: "center" }}>
            Built for <span className="gradient-text-blue-violet">enterprise-grade agent networks</span>
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

      {/* Use Cases */}
      <section style={{ paddingBottom: "100px" }}>
        <div className="container-wide">
          <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.3rem", fontWeight: 700, marginBottom: "28px", textAlign: "center" }}>Production-deployed use cases</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {useCases.map((uc) => (
              <div key={uc.title} className="card-glass" style={{ padding: "32px 28px" }}>
                <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.95rem", fontWeight: 700, color: uc.color, marginBottom: "12px" }}>{uc.title}</h3>
                <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.83rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "20px" }}>{uc.desc}</p>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  {uc.metrics.map((m) => (
                    <div key={m} style={{ display: "flex", gap: "6px", alignItems: "center", fontFamily: "Exo 2, sans-serif", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      <span style={{ color: uc.color, fontWeight: 700 }}>›</span> {m}
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
