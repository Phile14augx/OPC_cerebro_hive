"use client";
import { useState, SVGProps } from "react";
import { Globe, DollarSign, Clock, ChevronDown, ChevronUp, ArrowRight, Briefcase, Heart, Eye, Zap, Shield, HelpCircle } from "lucide-react";
import Link from "next/link";

const roles = [
  {
    id: "llm-eng",
    title: "Senior AI / LLM Engineer",
    dept: "Engineering",
    location: "Remote (Global)",
    type: "Full-Time",
    desc: "Lead architectural decisions for custom agent networks. Fine-tune open-source models, build custom orchestration with LangGraph, and deploy secure enterprise RAG stacks.",
    requirements: [
      "3+ years experience with production NLP/LLM applications",
      "Deep expertise in Python, PyTorch, LangChain, and LangGraph",
      "Experience deploying models at scale with AWS, Docker, or Kubernetes",
      "Strong systems thinking and autonomous problem-solving capabilities"
    ]
  },
  {
    id: "data-eng",
    title: "Lead Data Engineer",
    dept: "Engineering",
    location: "Remote (Global)",
    type: "Full-Time",
    desc: "Architect robust, high-throughput ETL pipelines, design schemas, and build data warehouse environments to serve analytics dashboards and AI model runtimes.",
    requirements: [
      "5+ years engineering high-scale data infrastructure",
      "Expertise in SQL, Python, dbt, Apache Airflow, and Snowflake/BigQuery",
      "Familiarity with vector storage systems (Pinecone, pgvector)",
      "Strong understanding of real-time streaming (Kafka, Kinesis)"
    ]
  },
  {
    id: "ai-consultant",
    title: "Enterprise AI Strategy Consultant",
    dept: "Consulting",
    location: "Remote (Global)",
    type: "Full-Time",
    desc: "Partner with enterprise executive teams to assess operational bottlenecks, formulate prioritized AI implementation roadmaps, and establish risk governance frameworks.",
    requirements: [
      "4+ years management consulting or equivalent client delivery role",
      "Strong business acumen with solid technical understanding of LLM capabilities",
      "Outstanding communication, presentation, and roadmap structuring skills",
      "Proven track record of managing cross-functional transformation programs"
    ]
  },
  {
    id: "frontend-eng",
    title: "Frontend Engineer (Next.js / WebGL)",
    dept: "Engineering",
    location: "Remote (Global)",
    type: "Full-Time",
    desc: "Build highly interactive, beautiful, and lightning-fast client interfaces, dashboards, and interactive canvas components for the CerebroHive product suite.",
    requirements: [
      "3+ years building production Next.js / React client interfaces",
      "Deep understanding of modern styling paradigms and CSS variables",
      "Experience with WebGL, Three.js, or Framer Motion animation engines",
      "Commitment to high-fidelity designs, visual excellence, and responsive layouts"
    ]
  },
  {
    id: "dev-rel",
    title: "Developer Advocate (AI Academy)",
    dept: "L&D",
    location: "Remote (Global)",
    type: "Full-Time",
    desc: "Grow, teach, and champion our student community. Create high-quality educational resources, support learning paths, and interface with our cohort developers.",
    requirements: [
      "Strong technical writing skills with a passion for teaching complex systems",
      "Proficient developer with experience building prompt or agent applications",
      "Experience building or managing online communities (Discord, YouTube)",
      "Excellent video presentation or technical speaking capabilities"
    ]
  },
];

const values = [
  { icon: Target, label: "Obsess over outcomes", desc: "We don&apos;t count hours or focus on PowerPoint slides. We measure success strictly by operational KPIs and working code deployed to production." },
  { icon: Eye, label: "Default to transparency", desc: "Decisions, challenges, finances, and project statuses are default-public within the team. We believe clear, open communication scales teams." },
  { icon: Zap, label: "Ship fast, learn faster", desc: "Perfect is the enemy of the live prototype. We build quickly, gather feedback from real-world usage, and iterate continuously." },
  { icon: Shield, label: "Think in systems", desc: "Every process is part of a larger machine. We architect clean, modular components that scale safely without technical debt." },
  { icon: Heart, label: "Radical ownership", desc: "No finger-pointing. You have full autonomy to solve issues, deploy fixes, and improve our services — and you own the outcome." },
  { icon: HelpCircle, label: "Teach what you know", desc: "We are an education and services team. Share knowledge freely, mentor peers, write documentation, and contribute to the Academy." },
];

function Target(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

export default function CareersPage() {
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  const toggleRole = (id: string) => {
    setExpandedRole(expandedRole === id ? null : id);
  };

  return (
    <>
      {/* Hero */}
      <section style={{ paddingTop: "140px", paddingBottom: "60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,229,255,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="container-wide" style={{ position: "relative", textAlign: "center" }}>
          <div className="section-label" style={{ display: "inline-flex", marginBottom: "20px" }}>
            <Briefcase size={11} /> Join the Team
          </div>
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.8rem)", marginBottom: "20px", lineHeight: 1.1 }}>
            Build the Future of <span className="gradient-text-full">Intelligence</span>
          </h1>
          <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "1.1rem", color: "var(--text-muted)", maxWidth: "600px", margin: "0 auto", lineHeight: 1.7 }}>
            We are a fully remote, async team of engineers, architects, and instructors building the intelligence layer for mid-market organizations. Join us.
          </p>
        </div>
      </section>

      {/* Culture Section */}
      <section style={{ paddingBottom: "40px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {[
              { icon: Globe, title: "Fully Remote", desc: "Work from anywhere in the world. We structure our coordination asynchronously so you can design your own schedule.", color: "#00E5FF" },
              { icon: DollarSign, title: "Competitive Equity", desc: "Every member of our team owns a piece of the company. We share our upside with the builders who make it happen.", color: "#7B61FF" },
              { icon: Clock, title: "Async-First Culture", desc: "We minimize recurring meetings and coordinate via written specs, code reviews, and transparent dashboards.", color: "#FF8A00" }
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

      {/* Values Grid */}
      <section style={{ paddingBottom: "60px" }}>
        <div className="container-wide">
          <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "16px", padding: "40px" }}>
            <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.3rem", fontWeight: 700, marginBottom: "32px", textAlign: "center" }}>Our Core Values</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "30px" }}>
              {values.map((v) => {
                const Icon = v.icon;
                return (
                  <div key={v.label} style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "8px", background: "rgba(0,229,255,0.06)", border: "1px solid rgba(0,229,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={16} color="var(--neural-blue)" />
                    </div>
                    <div>
                      <h4 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>{v.label}</h4>
                      <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: v.desc }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Open Roles Accordion */}
      <section style={{ paddingBottom: "100px" }}>
        <div className="container-wide" style={{ maxWidth: "800px" }}>
          <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.35rem", fontWeight: 700, marginBottom: "28px" }}>Active Open Positions</h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {roles.map((role) => {
              const isExpanded = expandedRole === role.id;
              return (
                <div key={role.id} className="card-glass" style={{ padding: "24px 28px", transition: "border-color 0.25s", borderColor: isExpanded ? "rgba(0,229,255,0.25)" : "var(--border)" }}>
                  <div onClick={() => toggleRole(role.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                    <div>
                      <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>{role.title}</h3>
                      <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "6px", fontFamily: "Exo 2, sans-serif", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        <span style={{ color: "var(--neural-blue)", fontWeight: 600 }}>{role.dept}</span>
                        <span>•</span>
                        <span>{role.location}</span>
                        <span>•</span>
                        <span>{role.type}</span>
                      </div>
                    </div>
                    <div>
                      {isExpanded ? <ChevronUp size={20} color="var(--text-muted)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.06)", animation: "fadeIn 0.2s ease-out" }}>
                      <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.7, marginBottom: "20px" }}>
                        {role.desc}
                      </p>
                      <h4 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.8rem", fontWeight: 700, marginBottom: "12px" }}>Requirements:</h4>
                      <ul style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
                        {role.requirements.map((req, i) => (
                          <li key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start", fontFamily: "Exo 2, sans-serif", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                            <span style={{ color: "var(--neural-blue)" }}>›</span> {req}
                          </li>
                        ))}
                      </ul>
                      
                      <Link href={`/contact?role=${role.id}`} className="btn-primary" style={{ display: "inline-flex", gap: "6px", fontSize: "0.8rem", padding: "10px 20px" }}>
                        Apply for this Role <ArrowRight size={13} />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Speculative Application CTA */}
          <div style={{ marginTop: "40px", textAlign: "center", padding: "24px", background: "rgba(255,255,255,0.01)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "12px" }}>
            <h4 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.9rem", fontWeight: 700, marginBottom: "8px" }}>Don&apos;t see your role?</h4>
            <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "16px" }}>
              We are always looking for exceptional talent to join our network of AI builders and consultants.
            </p>
            <Link href="/contact?role=speculative" style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.78rem", color: "var(--neural-blue)", textDecoration: "none", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px" }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}>
              Send a Speculative Application <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
