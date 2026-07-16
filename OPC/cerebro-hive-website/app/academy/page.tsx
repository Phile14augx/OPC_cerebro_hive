"use client";
import { BookOpen, Compass, GraduationCap, Award, ArrowRight, Zap, HelpCircle, Clock, CheckCircle, Star, Users, Code, BarChart2, Shield, Brain, Layers, Database, Cpu, FileCode } from "lucide-react";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { useState } from "react";

const academyPaths = [
  {
    title: "Individual Courses",
    desc: "Search, filter, and enroll in targeted courses. Track lesson progress and trigger completion certificates synced to your profile.",
    href: "/academy/courses",
    icon: BookOpen,
    color: "#7B61FF",
    tag: "Self-Paced",
    bullets: ["LangChain & Multi-Agent Frameworks", "LLM Fine-Tuning & RAG Pipelines", "Introduction to Prompt Engineering"],
  },
  {
    title: "Learning Paths",
    desc: "Follow curated, sequential tracks designed to take you from foundational concepts to enterprise-grade system deployment.",
    href: "/academy/learning-paths",
    icon: Compass,
    color: "#00E5FF",
    tag: "Structured",
    bullets: ["AI Developer Path (6 Months)", "AI Architect Path (6 Months)", "AI Product Manager Path (3 Months)"],
  },
  {
    title: "Corporate Programs",
    desc: "Tailor cohort workshops for development teams. Administer cohort lists and reallocate employee seats dynamically.",
    href: "/academy/corporate-programs",
    icon: GraduationCap,
    color: "#FF2ED1",
    tag: "Enterprise",
    bullets: ["Dedicated Slack communication channel", "Proctored corporate certification", "Live hands-on agent workshops"],
  },
];

const courses = [
  {
    id: "pe101",
    code: "PE-101",
    icon: Brain,
    color: "#00E5FF",
    level: "Beginner",
    title: "Introduction to Prompt Engineering",
    desc: "Master zero-shot, few-shot, chain-of-thought, and system prompt design patterns. Build a reusable prompt library for business workflows.",
    duration: "20 hours",
    modules: 8,
    price: "₹4,999",
    usd: "$60",
    cert: "Certified Prompt Engineer (CPE)",
    topics: ["Zero-shot & Few-shot Prompting", "Chain-of-Thought Reasoning", "System Prompt Architecture", "Prompt Injection Defense", "Business Prompt Templates", "Multi-Model Comparison"],
  },
  {
    id: "bg201",
    code: "BG-201",
    icon: Layers,
    color: "#7B61FF",
    level: "Intermediate",
    title: "Building with LLM APIs",
    desc: "Integrate OpenAI, Anthropic, and Google Gemini APIs into production Python applications. API design, rate limiting, cost optimization, and fallback strategies.",
    duration: "35 hours",
    modules: 12,
    price: "₹9,999",
    usd: "$120",
    cert: "Certified LLM Developer (CLD)",
    topics: ["OpenAI & Anthropic API Integration", "Streaming & Function Calling", "Rate Limiting & Cost Control", "Multi-Model Fallback Logic", "Async Python Patterns", "API Security & Key Management"],
  },
  {
    id: "rp301",
    code: "RP-301",
    icon: Database,
    color: "#FF8A00",
    level: "Intermediate",
    title: "RAG Pipeline Development",
    desc: "Build production-grade Retrieval-Augmented Generation systems with Pinecone, Weaviate, and pgvector. Chunking strategies, embedding models, and reranking.",
    duration: "40 hours",
    modules: 14,
    price: "₹14,999",
    usd: "$180",
    cert: "Certified RAG Engineer (CRE)",
    topics: ["Vector Database Architecture", "Chunking & Embedding Strategies", "Pinecone & Weaviate Setup", "Hybrid Search (BM25 + Dense)", "Reranking with Cross-Encoders", "Production RAG Evaluation"],
  },
  {
    id: "ma401",
    code: "MA-401",
    icon: Cpu,
    color: "#7B61FF",
    level: "Advanced",
    title: "Multi-Agent Systems with LangGraph",
    desc: "Design and deploy stateful multi-agent workflows using LangGraph and LangChain. Build supervisor hierarchies, tool-calling agents, and human-in-the-loop systems.",
    duration: "50 hours",
    modules: 16,
    price: "₹19,999",
    usd: "$240",
    cert: "Certified Agent Architect (CAA)",
    topics: ["LangGraph State Machines", "Supervisor & Worker Architectures", "Tool-Calling & Function Agents", "Memory Systems (Short & Long-Term)", "Human-in-the-Loop Design", "Agent Observability with LangSmith"],
  },
  {
    id: "ft501",
    code: "FT-501",
    icon: FileCode,
    color: "#FF2ED1",
    level: "Advanced",
    title: "LLM Fine-Tuning & Alignment",
    desc: "Fine-tune open-source LLMs (Mistral, LLaMA, Phi) using LoRA/QLoRA on domain-specific datasets. RLHF basics, DPO, and model evaluation frameworks.",
    duration: "45 hours",
    modules: 15,
    price: "₹24,999",
    usd: "$300",
    cert: "Certified Fine-Tuning Specialist (CFS)",
    topics: ["LoRA & QLoRA Training", "Dataset Preparation & Curation", "Mistral / LLaMA / Phi Architectures", "DPO & RLHF Overview", "Model Evaluation (MMLU, HellaSwag)", "Deployment with vLLM & Ollama"],
  },
  {
    id: "ea601",
    code: "EA-601",
    icon: Zap,
    color: "#FF8A00",
    level: "Intermediate",
    title: "Enterprise AI Automation with n8n",
    desc: "Automate end-to-end business workflows using n8n + AI nodes. CRM automation, document processing, email triage, and approval workflows at enterprise scale.",
    duration: "30 hours",
    modules: 10,
    price: "₹12,999",
    usd: "$155",
    cert: "Certified Automation Builder (CAB)",
    topics: ["n8n Architecture & Self-Hosting", "AI Nodes & OpenAI Integration", "CRM Automation (HubSpot, Salesforce)", "Document Processing Pipelines", "Webhook & API Integration", "Error Handling & Monitoring"],
  },
  {
    id: "ve701",
    code: "VE-701",
    icon: Shield,
    color: "#00E5FF",
    level: "Advanced",
    title: "AI for BFSI & Regulated Industries",
    desc: "Apply AI in banking, insurance, and capital markets while maintaining DPDP Act 2023, RBI, and SEBI compliance. Covers fraud detection, credit scoring, and KYC automation.",
    duration: "40 hours",
    modules: 13,
    price: "₹22,999",
    usd: "$275",
    cert: "Certified AI Compliance Practitioner (CACP)",
    topics: ["DPDP Act 2023 for AI", "RBI AI Guidelines", "KYC Automation with AI", "Fraud Detection Models", "Credit Scoring with ML", "Explainable AI (XAI) for Audits"],
  },
  {
    id: "ap801",
    code: "AP-801",
    icon: BarChart2,
    color: "#7B61FF",
    level: "Beginner",
    title: "AI Product Management",
    desc: "Lead AI product strategy, roadmap, and team alignment. Learn to evaluate AI feasibility, write AI-focused PRDs, and measure AI feature success metrics.",
    duration: "25 hours",
    modules: 9,
    price: "₹8,999",
    usd: "$110",
    cert: "Certified AI Product Manager (CAPM)",
    topics: ["AI Feasibility Assessment", "Writing AI-Specific PRDs", "AI Feature Metrics & KPIs", "Cross-Functional AI Team Leadership", "Build vs Buy vs API Framework", "AI Ethics & Responsible Product Development"],
  },
  {
    id: "gs901",
    code: "GS-901",
    icon: Code,
    color: "#FF2ED1",
    level: "Advanced",
    title: "AI Strategy & Governance",
    desc: "Build enterprise AI governance frameworks, risk registers, and readiness audits. Designed for CTOs, CDOs, and AI strategy leads responsible for organizational AI transformation.",
    duration: "35 hours",
    modules: 11,
    price: "₹29,999",
    usd: "$360",
    cert: "Certified AI Strategist (CAS)",
    topics: ["AI Maturity Assessment", "AI Risk Register Construction", "Responsible AI Frameworks", "Vendor Evaluation for AI", "Build the AI Center of Excellence", "90-Day AI Transformation Roadmap"],
  },
  {
    id: "da1001",
    code: "DA-1001",
    icon: Database,
    color: "#FF8A00",
    level: "Intermediate",
    title: "Data Engineering for AI",
    desc: "Build reliable data pipelines that power AI systems. Modern lakehouse architecture, dbt, Airflow orchestration, and feature store design for ML models.",
    duration: "45 hours",
    modules: 15,
    price: "₹17,999",
    usd: "$215",
    cert: "Certified AI Data Engineer (CADE)",
    topics: ["Data Lakehouse Architecture", "dbt for Data Transformation", "Airflow Pipeline Orchestration", "Feature Store Design", "Data Quality & Observability", "AI-Ready Data Schema Patterns"],
  },
];

const certTiers = [
  { tier: "Associate", badge: "A", color: "#00E5FF", desc: "1 course completed. Introduction-level credentials for non-technical practitioners.", examples: "CPE, CAPM" },
  { tier: "Professional", badge: "P", color: "#7B61FF", desc: "3+ courses + capstone project. Practitioner-level credentials validating implementation ability.", examples: "CLD, CRE, CAB, CADE" },
  { tier: "Expert", badge: "E", color: "#FF8A00", desc: "5+ courses + peer review + live assessment. Architecture-level credentials for senior AI practitioners.", examples: "CAA, CFS, CACP" },
  { tier: "Fellow", badge: "F", color: "#FF2ED1", desc: "Full Learning Path completion + 6-month residency review. Highest designation reserved for complete path alumni.", examples: "CAS" },
];

const bootcampFormats = [
  {
    title: "Weekend AI Bootcamp",
    duration: "2 Days (Sat–Sun)",
    format: "Live Online",
    price: "₹6,999",
    usd: "$85",
    color: "#00E5FF",
    desc: "Intense 16-hour sprint. Build a working AI agent from scratch over one weekend.",
    includes: ["LLM API setup", "RAG pipeline build", "Deploy on HuggingFace Spaces", "Completion certificate"],
  },
  {
    title: "4-Week Sprint",
    duration: "28 Days",
    format: "Live + Self-Paced",
    price: "₹24,999",
    usd: "$300",
    color: "#7B61FF",
    desc: "Structured 4-week intensive. Two live sessions per week + async content + capstone project.",
    includes: ["8 live sessions", "Mentor office hours", "Peer cohort access", "Capstone deployment", "Professional certificate"],
  },
  {
    title: "6-Month Fellowship",
    duration: "6 Months",
    format: "Cohort-Based",
    price: "₹1,49,999",
    usd: "$1,800",
    color: "#FF8A00",
    desc: "Comprehensive transformation program. Covers the full AI stack from foundations to production deployment.",
    includes: ["Full 10-course access", "Weekly 1:1 mentoring", "Industry project placement", "Alumni network access", "Fellow-level certification", "Job placement support"],
  },
  {
    title: "Corporate Cohort",
    duration: "Custom",
    format: "On-Site or Virtual",
    price: "Custom",
    usd: "Custom",
    color: "#FF2ED1",
    desc: "Fully bespoke programs for enterprise teams. Minimum 10 seats. Content tailored to your tech stack and business domain.",
    includes: ["Custom curriculum", "Dedicated trainer", "Private Slack channel", "Team certification", "Post-training support (3 months)", "Executive AI briefing"],
  },
];

const metrics = [
  { label: "Students Trained", value: "10,000+", sub: "Across 30+ countries" },
  { label: "Completion Rate", value: "98%", sub: "Industry-leading support" },
  { label: "Corporate Partners", value: "40+", sub: "Enterprise integrations" },
  { label: "Specialized Paths", value: "8", sub: "Tailored to industry roles" },
];

export default function AcademyPage() {
  const [quizStep, setQuizStep] = useState(1);
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [objective, setObjective] = useState("");
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"courses" | "bootcamps" | "certs">("courses");
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  const handleQuizAnswer = (type: "role" | "exp" | "obj", value: string) => {
    if (type === "role") { setRole(value); setQuizStep(2); }
    else if (type === "exp") { setExperience(value); setQuizStep(3); }
    else if (type === "obj") {
      setObjective(value);
      setQuizStep(4);
      if (role === "developer" && value === "build") setRecommendation("AI Engineer Path");
      else if (role === "developer" && value === "infrastructure") setRecommendation("AI Architect Path");
      else if (role === "manager" || value === "adoption") setRecommendation("AI Product Manager Path");
      else if (role === "leader" || value === "governance") setRecommendation("AI Consultant Path");
      else setRecommendation("AI Engineer Path");
    }
  };

  const resetQuiz = () => { setRole(""); setExperience(""); setObjective(""); setRecommendation(null); setQuizStep(1); };

  const levelColor = (level: string) => {
    if (level === "Beginner") return "#00E5FF";
    if (level === "Intermediate") return "#FF8A00";
    return "#FF2ED1";
  };

  return (
    <>
      {/* Hero */}
      <section style={{ paddingTop: "140px", paddingBottom: "50px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(123,97,255,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="container-wide" style={{ position: "relative" }}>
          <div className="section-label" style={{ display: "inline-flex", marginBottom: "20px", color: "var(--violet)", background: "rgba(123,97,255,0.08)", borderColor: "rgba(123,97,255,0.2)" }}>
            <Zap size={11} /> Certified L&D Ecosystem
          </div>
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", marginBottom: "20px" }}>
            CerebroHive <span className="gradient-text-blue-violet">Academy</span>
          </h1>
          <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "1.1rem", color: "var(--text-muted)", maxWidth: "600px", lineHeight: 1.7 }}>
            10 specialized courses. 4 bootcamp formats. India's most comprehensive AI certification ecosystem — built for practitioners, not spectators.
          </p>
        </div>
      </section>

      {/* Metrics Row */}
      <section style={{ paddingBottom: "40px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
            {metrics.map((m, i) => (
              <div key={i} className="card-glass" style={{ padding: "28px 24px", textAlign: "center" }}>
                <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.8rem", fontWeight: 800, color: "var(--violet)", marginBottom: "6px" }}>{m.value}</div>
                <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>{m.label}</div>
                <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.75rem", color: "var(--text-muted)" }}>{m.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Academy Paths Grid */}
      <section style={{ paddingBottom: "40px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {academyPaths.map((path) => {
              const Icon = path.icon;
              return (
                <Link key={path.title} href={path.href} style={{ textDecoration: "none" }}>
                  <div className="card-glass" style={{ padding: "36px 30px", display: "flex", flexDirection: "column", height: "100%" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                      <div style={{ width: 44, height: 44, borderRadius: "10px", background: `${path.color}14`, border: `1px solid ${path.color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={20} color={path.color} />
                      </div>
                      <span style={{ fontSize: "0.6rem", fontFamily: "Orbitron, sans-serif", fontWeight: 700, color: "var(--text-muted)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", padding: "3px 10px", borderRadius: "100px", textTransform: "uppercase" }}>
                        {path.tag}
                      </span>
                    </div>
                    <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px" }}>{path.title}</h3>
                    <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "20px" }}>{path.desc}</p>
                    <ul style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px", marginBottom: "28px", display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                      {path.bullets.map((b) => (
                        <li key={b} style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-muted)", listStyle: "none", display: "flex", gap: "6px", alignItems: "flex-start" }}>
                          <span style={{ color: path.color, fontSize: "1rem", lineHeight: 1 }}>›</span> {b}
                        </li>
                      ))}
                    </ul>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: path.color, fontSize: "0.8rem", fontWeight: 600, marginTop: "auto" }}>
                      Explore Path <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Full Catalog Section */}
      <section style={{ paddingBottom: "20px" }}>
        <div className="container-wide">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div className="section-label" style={{ display: "inline-flex", marginBottom: "12px", color: "var(--violet)", background: "rgba(123,97,255,0.08)", borderColor: "rgba(123,97,255,0.2)" }}>
                <GraduationCap size={11} /> Full Catalog
              </div>
              <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.5rem", fontWeight: 700 }}>10 Specialized Courses</h2>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              {(["courses", "bootcamps", "certs"] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{ padding: "9px 20px", borderRadius: "8px", cursor: "pointer", fontFamily: "Orbitron, sans-serif", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", transition: "all 0.2s",
                    background: activeTab === tab ? "rgba(123,97,255,0.12)" : "rgba(255,255,255,0.03)",
                    border: activeTab === tab ? "1px solid rgba(123,97,255,0.4)" : "1px solid rgba(255,255,255,0.06)",
                    color: activeTab === tab ? "var(--violet)" : "var(--text-muted)" }}>
                  {tab === "courses" ? "All Courses" : tab === "bootcamps" ? "Bootcamps" : "Certifications"}
                </button>
              ))}
            </div>
          </div>

          {/* Courses Tab */}
          {activeTab === "courses" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {courses.map((course) => {
                const Icon = course.icon;
                const isExpanded = expandedCourse === course.id;
                return (
                  <div key={course.id} className="card-glass"
                    onClick={() => setExpandedCourse(isExpanded ? null : course.id)}
                    style={{ padding: "24px 28px", cursor: "pointer", transition: "border-color 0.2s", borderColor: isExpanded ? `${course.color}40` : "rgba(255,255,255,0.07)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{ width: 40, height: 40, borderRadius: "10px", background: `${course.color}14`, border: `1px solid ${course.color}28`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={18} color={course.color} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                          <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.65rem", color: "var(--text-dim)", opacity: 0.6 }}>{course.code}</span>
                          <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.58rem", fontWeight: 700, color: levelColor(course.level), background: `${levelColor(course.level)}12`, border: `1px solid ${levelColor(course.level)}25`, padding: "1px 8px", borderRadius: "100px" }}>{course.level}</span>
                        </div>
                        <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.92rem", fontWeight: 700, color: "var(--text-primary)" }}>{course.title}</h3>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "20px", flexShrink: 0 }}>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.95rem", fontWeight: 800, color: "var(--violet)" }}>{course.price}</div>
                          <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.7rem", color: "var(--text-muted)" }}>{course.usd}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-muted)", fontSize: "0.75rem" }}>
                          <Clock size={12} /> {course.duration}
                        </div>
                        <span style={{ color: "var(--text-muted)", fontSize: "1.1rem", transform: isExpanded ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>›</span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.06)" }} onClick={(e) => e.stopPropagation()}>
                        <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.83rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "20px" }}>{course.desc}</p>
                        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px" }}>
                          <div>
                            <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.6rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>Topics Covered</div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                              {course.topics.map((t) => (
                                <div key={t} style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                                  <CheckCircle size={11} color={course.color} style={{ flexShrink: 0, marginTop: "2px" }} />
                                  <span style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.4 }}>{t}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div style={{ padding: "14px 16px", background: `${course.color}06`, border: `1px solid ${course.color}18`, borderRadius: "8px" }}>
                              <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.6rem", fontWeight: 700, color: course.color, marginBottom: "4px" }}>Credential Earned</div>
                              <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.78rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
                                <Award size={13} color="#FFBA00" /> {course.cert}
                              </div>
                            </div>
                            <div style={{ padding: "14px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px" }}>
                              <div style={{ display: "flex", gap: "16px" }}>
                                <div>
                                  <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.7rem", color: "var(--text-muted)" }}>Modules</div>
                                  <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)" }}>{course.modules}</div>
                                </div>
                                <div>
                                  <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.7rem", color: "var(--text-muted)" }}>Duration</div>
                                  <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)" }}>{course.duration}</div>
                                </div>
                              </div>
                            </div>
                            <TrackedLink href="/academy/courses" analyticsEvent="cta_click" analyticsCategory="conversion" analyticsLabel="Enroll Now — Academy Course" className="btn-primary" style={{ display: "inline-flex", gap: "6px", justifyContent: "center" }}>
                              Enroll Now <ArrowRight size={13} />
                            </TrackedLink>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Bootcamps Tab */}
          {activeTab === "bootcamps" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
              {bootcampFormats.map((bc) => (
                <div key={bc.title} className="card-glass" style={{ padding: "32px 28px", borderColor: `${bc.color}20` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                    <div>
                      <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.58rem", fontWeight: 700, color: bc.color, background: `${bc.color}12`, border: `1px solid ${bc.color}25`, padding: "2px 8px", borderRadius: "100px", display: "inline-block", marginBottom: "8px" }}>{bc.format}</span>
                      <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>{bc.title}</h3>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.1rem", fontWeight: 800, color: bc.color }}>{bc.price}</div>
                      <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.7rem", color: "var(--text-muted)" }}>{bc.usd !== "Custom" ? bc.usd : "Contact us"}</div>
                    </div>
                  </div>
                  <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.83rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "16px" }}>{bc.desc}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px" }}>
                    <Clock size={12} color="var(--text-muted)" />
                    <span style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.75rem", color: "var(--text-muted)" }}>{bc.duration}</span>
                  </div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "7px" }}>
                    {bc.includes.map((item) => (
                      <div key={item} style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                        <CheckCircle size={12} color={bc.color} />
                        <span style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.77rem", color: "var(--text-muted)" }}>{item}</span>
                      </div>
                    ))}
                  </div>
                  <TrackedLink href={bc.price === "Custom" ? "/contact" : "/academy/courses"} analyticsEvent="cta_click" analyticsCategory="conversion" analyticsLabel={bc.price === "Custom" ? "Request Proposal — Academy Pricing" : "Enroll Now — Academy Pricing"}
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: bc.color, fontSize: "0.8rem", fontWeight: 600, textDecoration: "none", marginTop: "20px" }}>
                    {bc.price === "Custom" ? "Request Proposal" : "Enroll Now"} <ArrowRight size={13} />
                  </TrackedLink>
                </div>
              ))}
            </div>
          )}

          {/* Certs Tab */}
          {activeTab === "certs" && (
            <div>
              <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.9rem", color: "var(--text-muted)", maxWidth: "640px", lineHeight: 1.7, marginBottom: "28px" }}>
                CerebroHive certifications use a 4-tier framework. Each tier signals a distinct level of AI proficiency — from first exposure to full-stack deployment. All credentials include a shareable digital badge with a public verification URL.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "36px" }}>
                {certTiers.map((tier) => (
                  <div key={tier.tier} className="card-glass" style={{ padding: "28px 22px", borderColor: `${tier.color}25` }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: `${tier.color}18`, border: `2px solid ${tier.color}40`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
                      <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1rem", fontWeight: 900, color: tier.color }}>{tier.badge}</span>
                    </div>
                    <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.85rem", fontWeight: 700, color: tier.color, marginBottom: "8px" }}>{tier.tier}</div>
                    <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.77rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "10px" }}>{tier.desc}</p>
                    <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.65rem", color: "var(--text-dim)", opacity: 0.6 }}>{tier.examples}</div>
                  </div>
                ))}
              </div>

              <div className="card-glass" style={{ padding: "28px 32px" }}>
                <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1rem", fontWeight: 700, marginBottom: "16px" }}>All Certifications at a Glance</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
                  {courses.map((c) => (
                    <div key={c.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <Award size={14} color="#FFBA00" />
                      <div>
                        <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-primary)" }}>{c.cert}</div>
                        <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.68rem", color: "var(--text-muted)" }}>via {c.title}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Learning Path Finder Quiz */}
      <section className="section-pad" style={{ paddingTop: "60px" }}>
        <div className="container-wide">
          <div className="card-glass" style={{ padding: "48px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <Compass size={20} color="var(--violet)" />
              <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.4rem", fontWeight: 700 }}>Learning Path Finder</h2>
            </div>
            <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "36px" }}>
              Answer 3 quick questions to discover which certification track matches your objectives.
            </p>

            {quizStep === 1 && (
              <div>
                <h4 style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                  <HelpCircle size={16} color="var(--violet)" /> Question 1 of 3 — What is your primary professional domain?
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                  {[{ label: "Software Engineer / Dev", val: "developer" }, { label: "Product / Project Manager", val: "manager" }, { label: "Business Owner / Leader", val: "leader" }].map((opt) => (
                    <button key={opt.val} onClick={() => handleQuizAnswer("role", opt.val)}
                      style={{ padding: "18px 16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "var(--text-muted)", fontFamily: "Exo 2, sans-serif", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(123,97,255,0.4)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "var(--text-muted)"; }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {quizStep === 2 && (
              <div>
                <h4 style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                  <HelpCircle size={16} color="var(--violet)" /> Question 2 of 3 — What is your experience level with AI?
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                  {[{ label: "None / Exploring tools", val: "beginner" }, { label: "Used pre-built API models", val: "intermediate" }, { label: "Built complex model pipelines", val: "advanced" }].map((opt) => (
                    <button key={opt.val} onClick={() => handleQuizAnswer("exp", opt.val)}
                      style={{ padding: "18px 16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "var(--text-muted)", fontFamily: "Exo 2, sans-serif", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(123,97,255,0.4)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "var(--text-muted)"; }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {quizStep === 3 && (
              <div>
                <h4 style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                  <HelpCircle size={16} color="var(--violet)" /> Question 3 of 3 — What is your main learning objective?
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                  {[{ label: "Build custom models & agents", val: "build" }, { label: "Design ETL & vector infrastructure", val: "infrastructure" }, { label: "Lead corporate adoption & strategy", val: "adoption" }, { label: "Address compliance & governance", val: "governance" }].map((opt) => (
                    <button key={opt.val} onClick={() => handleQuizAnswer("obj", opt.val)}
                      style={{ padding: "18px 16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "var(--text-muted)", fontFamily: "Exo 2, sans-serif", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(123,97,255,0.4)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "var(--text-muted)"; }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {quizStep === 4 && recommendation && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "40px", flexWrap: "wrap" }}>
                <div>
                  <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.6rem", fontWeight: 700, color: "var(--violet)", textTransform: "uppercase", letterSpacing: "0.15em", display: "block", marginBottom: "8px" }}>Your Recommended Track</span>
                  <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                    <Award size={24} color="#FFBA00" /> {recommendation}
                  </h3>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
                    {[`Domain: ${role}`, `Level: ${experience}`, `Goal: ${objective}`].map((tag) => (
                      <span key={tag} style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.6rem", color: "var(--text-muted)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", padding: "3px 10px", borderRadius: "100px", textTransform: "uppercase" }}>{tag}</span>
                    ))}
                  </div>
                  <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.875rem", color: "var(--text-muted)", maxWidth: "500px", lineHeight: 1.6 }}>
                    {recommendation === "AI Engineer Path" && "Focuses on deploying n8n pipelines, LangGraph state channels, and OpenAI/Anthropic model connections."}
                    {recommendation === "AI Architect Path" && "Focuses on database vector indexing schemas, private model proxies, and secure ETL pipelines."}
                    {recommendation === "AI Product Manager Path" && "Focuses on operational ROI analysis, prompt library creation, and 90-day execution blueprints."}
                    {recommendation === "AI Consultant Path" && "Focuses on board alignment, AI governance policies, risk controls, and readiness auditing."}
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <Link href="/academy/learning-paths" className="btn-primary" style={{ display: "inline-flex", gap: "6px" }}>
                    Begin Track <ArrowRight size={14} />
                  </Link>
                  <button onClick={resetQuiz}
                    style={{ padding: "10px 20px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", color: "var(--text-muted)", fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                    Retake Quiz
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ paddingBottom: "100px", paddingTop: "20px" }}>
        <div className="container-wide">
          <div className="card-glass" style={{ padding: "40px", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                <Users size={13} color="var(--violet)" /> 10,000+ learners
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                <Star size={13} color="#FFBA00" /> 4.9 / 5.0 rating
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                <Award size={13} color="var(--neural-blue)" /> Blockchain-verified certs
              </div>
            </div>
            <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.5rem", fontWeight: 700, marginBottom: "12px" }}>
              Ready to start your <span className="gradient-text-blue-violet">AI education?</span>
            </h2>
            <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.9rem", color: "var(--text-muted)", maxWidth: "480px", margin: "0 auto 24px", lineHeight: 1.7 }}>
              Browse all 10 courses or talk to our learning advisors to build a custom curriculum for your team.
            </p>
            <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
              <TrackedLink href="/academy/courses" analyticsEvent="cta_click" analyticsCategory="engagement" analyticsLabel="Browse All Courses — Academy" className="btn-primary" style={{ gap: "6px" }}>
                Browse All Courses <ArrowRight size={14} />
              </TrackedLink>
              <TrackedLink href="/contact" analyticsEvent="cta_click" analyticsCategory="conversion" analyticsLabel="Corporate Training Inquiry — Academy" className="btn-ghost">
                Corporate Training Inquiry
              </TrackedLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
