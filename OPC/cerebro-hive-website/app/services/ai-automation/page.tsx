"use client";
import { Settings, CheckCircle, ArrowRight, ArrowLeft, Zap, Bot, GitMerge, Monitor, Users, Database, FileText, BarChart3, Headphones, CreditCard, Server } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const automationServices = [
  {
    icon: GitMerge, color: "#FF8A00", tag: "Workflows",
    title: "Workflow Automation (No-Code/Low-Code)",
    desc: "Design and implement automated workflows using n8n, Make, Zapier, Power Automate, and HubSpot Workflows — connecting your entire SaaS stack without custom development.",
    useCases: ["Lead management & CRM entry automation", "Invoice generation & payment reminder sequences", "New employee onboarding & document collection", "Reporting automation — multi-source data → formatted reports"],
    tools: ["n8n", "Make", "Zapier", "Power Automate", "Airtable", "HubSpot Workflows"],
    price: "₹50K – ₹5L",
    timeline: "1–4 weeks/package",
  },
  {
    icon: Bot, color: "#7B61FF", tag: "AI Agents",
    title: "AI Agent Development",
    desc: "Custom AI agents — from customer-facing chatbots to autonomous task executors — built on LangGraph, LangChain, and leading LLMs with tool use, memory, and human-in-the-loop controls.",
    useCases: ["RAG-powered customer support agents", "Research agents (browse, synthesize, report)", "Multi-step process orchestration agents", "Competitive intelligence & monitoring agents"],
    tools: ["LangGraph", "LangChain", "GPT-4o", "Claude", "Pinecone", "Twilio"],
    price: "₹2L – ₹30L",
    timeline: "3–12 weeks",
  },
  {
    icon: Monitor, color: "#00E5FF", tag: "RPA",
    title: "Robotic Process Automation (RPA)",
    desc: "Software robots that automate high-volume, rule-based processes — ideal for legacy system integration where APIs don't exist. Full lifecycle from PDD to bot monitoring.",
    useCases: ["Bank reconciliation & 3-way invoice matching", "KYC document verification & loan processing", "Regulatory report generation & filing", "ERP data entry from external systems"],
    tools: ["UiPath", "Automation Anywhere", "Power Automate Desktop", "Blue Prism", "OCR", "Playwright"],
    price: "₹3L – ₹20L",
    timeline: "4–10 weeks/bot",
  },
  {
    icon: CreditCard, color: "#FF2ED1", tag: "CRM",
    title: "CRM Automation & Optimization",
    desc: "Deep configuration and AI augmentation of CRM platforms — AI-powered lead scoring, pipeline automation, contact enrichment, revenue forecasting, and customer health scoring.",
    useCases: ["AI lead scoring from behavioral & firmographic data", "Sales playbook automation & deal health monitoring", "Customer 360 view across support, billing, product usage", "CPQ automation — proposal generation & discount guardrails"],
    tools: ["Salesforce", "HubSpot", "Zoho CRM", "Pipedrive", "Apollo", "Clearbit"],
    price: "₹2L – ₹15L",
    timeline: "3–8 weeks",
  },
  {
    icon: Server, color: "#FF8A00", tag: "ERP",
    title: "ERP Automation & AI Integration",
    desc: "Automation of complex ERP workflows and integration of AI capabilities into SAP, Oracle, Tally, Odoo, and ERPNext — reducing manual entry and accelerating financial close.",
    useCases: ["Intelligent document processing for invoices & POs", "Automated 3-way matching with exception routing", "Predictive inventory management & demand forecasting", "Financial close automation & GST reconciliation"],
    tools: ["SAP", "Oracle", "Microsoft Dynamics", "Tally", "Odoo", "ERPNext"],
    price: "₹5L – ₹50L",
    timeline: "6–20 weeks",
  },
  {
    icon: Headphones, color: "#00E5FF", tag: "Support",
    title: "Customer Support Automation",
    desc: "End-to-end automation of the customer support function — Tier 0 self-service AI, Tier 1 agent assist, and Tier 2 back-office automation with multilingual support.",
    useCases: ["AI chatbot handling 60–70% of queries without human", "Real-time agent assist — suggested replies & summaries", "Auto-classification, routing & SLA monitoring", "Multilingual support (English, Hindi, Tamil, regional languages)"],
    tools: ["Zendesk", "Freshdesk", "Intercom", "WhatsApp Business API", "Twilio", "Salesforce Service Cloud"],
    price: "₹3L – ₹20L build + ₹50K–₹3L/mo managed",
    timeline: "4–10 weeks",
  },
  {
    icon: Users, color: "#7B61FF", tag: "HR",
    title: "HR Process Automation",
    desc: "Automation of the HR function from recruitment to offboarding — job description generation, resume screening, interview scheduling, onboarding workflows, payroll validation, and compliance reporting.",
    useCases: ["Resume parsing & AI candidate scoring", "Interview scheduling & rejection email automation", "New hire document collection & IT provisioning", "Leave management, expense routing & payroll validation"],
    tools: ["Darwinbox", "Keka", "Workday", "BambooHR", "Naukri API", "LinkedIn Recruiter API"],
    price: "₹2L – ₹12L",
    timeline: "3–8 weeks",
  },
  {
    icon: FileText, color: "#FF2ED1", tag: "Documents",
    title: "Document Intelligence & Processing",
    desc: "AI-powered document processing that ingests any document format and extracts, classifies, validates, and routes data — eliminating manual document handling at scale.",
    useCases: ["Invoice & receipt extraction (>95% accuracy)", "KYC document verification (Aadhaar, PAN, Passport)", "Contract summarization & clause comparison", "Bank statement parsing & medical report extraction"],
    tools: ["AWS Textract", "Azure Form Recognizer", "GPT-4o Vision", "LangChain", "AWS S3", "SharePoint"],
    price: "₹3L – ₹18L",
    timeline: "3–8 weeks",
  },
  {
    icon: BarChart3, color: "#00E5FF", tag: "Data",
    title: "Data Pipeline & Analytics Automation",
    desc: "Automated ETL/ELT pipelines that extract data from multiple sources, transform it, load it into analytics platforms, and trigger automated reporting and anomaly alerts.",
    useCases: ["CRM + ERP → data warehouse pipelines", "Real-time event streaming (Kafka, Pub/Sub)", "Automated KPI dashboards distributed to Slack/email", "Anomaly detection alerts on financial and operational KPIs"],
    tools: ["dbt", "Airbyte", "Apache Airflow", "BigQuery", "Snowflake", "Metabase", "Power BI"],
    price: "₹4L – ₹25L",
    timeline: "4–10 weeks",
  },
  {
    icon: Database, color: "#7B61FF", tag: "Managed",
    title: "Automation-as-a-Service (Managed)",
    desc: "CerebroHive takes full operational responsibility for your automation infrastructure — monitoring, maintaining, iterating, and expanding automations on an ongoing managed retainer.",
    useCases: ["99.5% uptime SLA on all deployed automations", "Monthly performance reports (runs, errors, time saved)", "Ongoing iteration & new automation additions within hours", "Quarterly portfolio review & expansion recommendations"],
    tools: ["Full-stack monitoring", "Dedicated account manager", "SLA-backed response", "Monthly reporting"],
    price: "₹25K – ₹5L/month",
    timeline: "Ongoing managed service",
  },
];

const managedTiers = [
  { name: "Essential", automations: "Up to 10", hours: "4 hrs/mo", sla: "48-hour response", price: "₹25,000 / $350" },
  { name: "Professional", automations: "Up to 25", hours: "8 hrs/mo", sla: "24-hour response", price: "₹75,000 / $1,000" },
  { name: "Enterprise", automations: "Unlimited", hours: "20 hrs/mo", sla: "4-hour response", price: "₹2,50,000 / $3,000" },
  { name: "Mission Critical", automations: "Unlimited", hours: "40 hrs/mo", sla: "1-hour response", price: "₹5,00,000 / $6,500" },
];

const architectureSteps = [
  { step: "01", label: "Audit", desc: "Map current manual processes and score automation potential using our 6-factor framework" },
  { step: "02", label: "Design", desc: "Select tools, design data flow, architect agent behaviours, and define error handling" },
  { step: "03", label: "Build", desc: "Develop, test in staging, validate with real data, iterate with client feedback" },
  { step: "04", label: "Deploy", desc: "Go live, monitor for 30 days post-launch, hand off runbook and documentation" },
];

const stats = [
  { label: "Automations Deployed", value: "2.4M+" },
  { label: "Avg. Task Deflection", value: "70%" },
  { label: "Typical Build Time", value: "< 8 Weeks" },
];

export default function AIAutomationPage() {
  const [activeService, setActiveService] = useState<number | null>(null);
  const [showManagedTiers, setShowManagedTiers] = useState(false);

  return (
    <>
      {/* Hero */}
      <section style={{ paddingTop: "140px", paddingBottom: "60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255,138,0,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="container-wide" style={{ position: "relative" }}>
          <Link href="/services" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none", marginBottom: "24px", transition: "color 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>
            <ArrowLeft size={14} /> Back to Services
          </Link>
          <div className="section-label" style={{ display: "inline-flex", marginBottom: "20px", color: "var(--hive-orange)", background: "rgba(255,138,0,0.08)", borderColor: "rgba(255,138,0,0.25)" }}>
            <Settings size={11} /> Agents & Workflows
          </div>
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", marginBottom: "20px" }}>
            AI Automation <span className="gradient-text-orange">& Agents</span>
          </h1>
          <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "1.1rem", color: "var(--text-muted)", maxWidth: "640px", lineHeight: 1.7 }}>
            Ten distinct automation disciplines — from no-code workflow automation and AI agent development to RPA, ERP integration, document intelligence, and fully managed automation services. We pick the right tool for your problem, not the one we happen to sell.
          </p>
        </div>
      </section>

      {/* Stats Row */}
      <section style={{ paddingBottom: "40px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {stats.map((s, i) => (
              <div key={i} className="card-glass" style={{ padding: "24px", textAlign: "center" }}>
                <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.5rem", fontWeight: 800, color: "var(--hive-orange)", marginBottom: "6px" }}>{s.value}</div>
                <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-muted)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All 10 Services Grid */}
      <section style={{ paddingBottom: "48px" }}>
        <div className="container-wide">
          <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.4rem", fontWeight: 700, marginBottom: "8px" }}>10 automation disciplines. One team.</h2>
          <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: "28px" }}>Click any service to expand details.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
            {automationServices.map((svc, idx) => {
              const Icon = svc.icon;
              const isActive = activeService === idx;
              return (
                <div key={svc.title}
                  className="card-glass"
                  onClick={() => setActiveService(isActive ? null : idx)}
                  style={{ padding: "28px 24px", cursor: "pointer", transition: "border-color 0.25s", borderColor: isActive ? `${svc.color}50` : "rgba(255,255,255,0.07)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: isActive ? "20px" : "0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: 40, height: 40, borderRadius: "10px", background: `${svc.color}14`, border: `1px solid ${svc.color}28`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={18} color={svc.color} />
                      </div>
                      <div>
                        <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.58rem", fontWeight: 700, color: svc.color, background: `${svc.color}12`, border: `1px solid ${svc.color}25`, padding: "2px 8px", borderRadius: "100px", textTransform: "uppercase", display: "block", marginBottom: "3px" }}>{svc.tag}</span>
                        <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)" }}>{svc.title}</h3>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.75rem", fontWeight: 600, color: svc.color }}>{svc.price}</span>
                      <span style={{ color: "var(--text-muted)", fontSize: "1.2rem", transform: isActive ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>›</span>
                    </div>
                  </div>

                  {isActive && (
                    <div>
                      <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.83rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "16px" }}>{svc.desc}</p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "16px" }}>
                        <div>
                          <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Use Cases</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                            {svc.useCases.map((uc) => (
                              <div key={uc} style={{ display: "flex", gap: "7px", alignItems: "flex-start" }}>
                                <CheckCircle size={11} color={svc.color} style={{ flexShrink: 0, marginTop: "2px" }} />
                                <span style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.77rem", color: "var(--text-muted)" }}>{uc}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Tools & Platforms</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {svc.tools.map((tool) => (
                              <span key={tool} style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.67rem", color: "var(--text-muted)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", padding: "2px 8px", borderRadius: "4px" }}>{tool}</span>
                            ))}
                          </div>
                          <div style={{ marginTop: "16px", padding: "12px", background: `${svc.color}06`, border: `1px solid ${svc.color}20`, borderRadius: "8px" }}>
                            <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "3px" }}>Typical Timeline</div>
                            <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.82rem", fontWeight: 700, color: svc.color }}>{svc.timeline}</div>
                          </div>
                        </div>
                      </div>
                      {svc.tag === "Managed" && (
                        <button onClick={(e) => { e.stopPropagation(); setShowManagedTiers(true); }}
                          style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.78rem", color: svc.color, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}>
                          View Managed Service Tiers →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Managed Service Tiers (shown on demand) */}
      {showManagedTiers && (
        <section style={{ paddingBottom: "48px" }}>
          <div className="container-wide">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.3rem", fontWeight: 700 }}>Automation-as-a-Service Tiers</h2>
              <button onClick={() => setShowManagedTiers(false)}
                style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.78rem", color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}>
                ✕ Close
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
              {managedTiers.map((tier, i) => (
                <div key={tier.name} className="card-glass" style={{ padding: "28px 22px", borderColor: i === 2 ? "rgba(123,97,255,0.3)" : "rgba(255,255,255,0.07)" }}>
                  <h4 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>{tier.name}</h4>
                  <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.95rem", fontWeight: 700, color: "var(--hive-orange)", marginBottom: "16px" }}>{tier.price}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[
                      `${tier.automations} automations`,
                      `${tier.hours} included`,
                      `SLA: ${tier.sla}`,
                    ].map((item) => (
                      <div key={item} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                        <CheckCircle size={11} color="var(--hive-orange)" style={{ flexShrink: 0, marginTop: "2px" }} />
                        <span style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.77rem", color: "var(--text-muted)" }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Build Process */}
      <section style={{ paddingBottom: "40px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "60px", alignItems: "start" }}>
            <div>
              <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.5rem", fontWeight: 700, marginBottom: "20px" }}>
                From audit to production in under 8 weeks.
              </h2>
              <p style={{ fontFamily: "Exo 2, sans-serif", color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "32px" }}>
                Every automation engagement starts with a process audit, not a technology recommendation. We map what your team actually does manually, score the automation potential of each workflow, and only then select the right tools. The result: systems that get adopted because they fit how your team actually works.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                {architectureSteps.map((s, i) => (
                  <div key={s.step} style={{ display: "flex", gap: "16px", paddingBottom: i < architectureSteps.length - 1 ? "24px" : "0", position: "relative" }}>
                    {i < architectureSteps.length - 1 && (
                      <div style={{ position: "absolute", left: "19px", top: "40px", bottom: 0, width: "1px", background: "linear-gradient(to bottom, rgba(255,138,0,0.3), transparent)" }} />
                    )}
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,138,0,0.1)", border: "1px solid rgba(255,138,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.65rem", fontWeight: 800, color: "var(--hive-orange)" }}>{s.step}</span>
                    </div>
                    <div style={{ paddingTop: "8px" }}>
                      <h4 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.88rem", fontWeight: 700, marginBottom: "4px" }}>{s.label}</h4>
                      <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Panel */}
            <div className="card-glass" style={{ padding: "40px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <Zap size={18} color="var(--hive-orange)" />
                <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1rem", fontWeight: 700, color: "var(--hive-orange)" }}>
                  Free Automation Audit
                </h3>
              </div>
              <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "24px" }}>
                Our automation architects will audit your highest-volume manual processes, identify the top 3 automation opportunities, and provide a preliminary ROI estimate — at no charge.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
                {[
                  "Process map of your top 3 manual workflows",
                  "Tool selection recommendation (vendor-neutral)",
                  "Preliminary cost-benefit analysis",
                ].map((b) => (
                  <div key={b} style={{ display: "flex", gap: "8px", alignItems: "flex-start", fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "Exo 2, sans-serif" }}>
                    <CheckCircle size={13} color="var(--hive-orange)" style={{ flexShrink: 0, marginTop: "2px" }} /> {b}
                  </div>
                ))}
              </div>
              <Link href="/contact" className="btn-orange" style={{ width: "100%", justifyContent: "center", display: "inline-flex", gap: "6px" }}>
                Book Automation Audit <ArrowRight size={14} />
              </Link>
              <div style={{ marginTop: "16px", textAlign: "center" }}>
                <Link href="/tools/solution-finder" style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-muted)", textDecoration: "none" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "var(--hive-orange)"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>
                  Or use the AI Solution Finder →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom trust row */}
      <section style={{ paddingBottom: "100px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {[
              { label: "No lock-in", desc: "We build on open standards. You own every workflow, agent, and integration we create.", color: "#00E5FF" },
              { label: "Ongoing SLA", desc: "3-month post-launch monitoring and iteration agreement included in every engagement.", color: "#7B61FF" },
              { label: "Outcome-based delivery", desc: "We define measurable KPIs before we start. If they are not hit, we keep iterating.", color: "#FF8A00" },
            ].map((item) => (
              <div key={item.label} style={{ padding: "24px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px" }}>
                <h4 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.85rem", fontWeight: 700, color: item.color, marginBottom: "8px" }}>{item.label}</h4>
                <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
