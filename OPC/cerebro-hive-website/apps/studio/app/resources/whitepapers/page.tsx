"use client";
import { FileText, Download, ArrowRight, Zap, X, CheckCircle } from "lucide-react";
import { useState } from "react";

const whitepapers = [
  {
    title: "Enterprise AI Adoption: The 2025 Guide",
    desc: "A comprehensive framework for enterprise decision-makers navigating AI adoption: strategy, governance, tool selection, team structure, and 12-month ROI measurement.",
    audience: "Enterprise Leaders",
    pages: "42 pages",
    color: "#00E5FF",
    tags: ["Strategy", "Enterprise", "ROI"],
  },
  {
    title: "AI Governance Framework for Mid-Market Companies",
    desc: "Practical governance policies, risk controls, ethical guidelines, and oversight structures designed specifically for companies with 50–500 employees deploying AI systems.",
    audience: "Compliance & Risk",
    pages: "28 pages",
    color: "#7B61FF",
    tags: ["Governance", "Risk", "Policy"],
  },
  {
    title: "AI Agent Architecture: From Concept to Production",
    desc: "A deep technical walkthrough of building production-grade AI agents — memory management, tool integration, observability, failure modes, and multi-agent orchestration with LangGraph.",
    audience: "Technical Leaders",
    pages: "56 pages",
    color: "#FF8A00",
    tags: ["Agents", "LangGraph", "Architecture"],
  },
  {
    title: "The Future of Work in an AI-Native World",
    desc: "How AI is reshaping job functions across every department — and what HR, L&D, and operations leaders need to do now to prepare their workforce for the next five years.",
    audience: "HR & L&D Leaders",
    pages: "34 pages",
    color: "#FF2ED1",
    tags: ["Workforce", "L&D", "Future of Work"],
  },
  {
    title: "Automation ROI Calculator: Methodology & Templates",
    desc: "The exact framework CerebroHive uses to estimate automation ROI for clients — including process audit templates, cost model spreadsheets, and 12-month projection methods.",
    audience: "Operations Leaders",
    pages: "22 pages",
    color: "#FFBA00",
    tags: ["ROI", "Automation", "Templates"],
  },
];

const stats = [
  { label: "Whitepapers Published", value: "5" },
  { label: "Total Downloads", value: "12,400+" },
  { label: "Countries Reached", value: "30" },
  { label: "Companies Citing Our Research", value: "200+" },
];

type Whitepaper = typeof whitepapers[0];

function GatedModal({ paper, onClose }: { paper: Whitepaper; onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email.includes("@") && company) setSubmitted(true);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(8,11,20,0.85)", backdropFilter: "blur(8px)" }}>
      <div className="card-glass" style={{ padding: "44px", maxWidth: "480px", width: "90%", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
          <X size={18} />
        </button>
        {!submitted ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <FileText size={18} color={paper.color} />
              <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.6rem", fontWeight: 700, color: paper.color, textTransform: "uppercase", letterSpacing: "0.15em" }}>
                Free Download
              </span>
            </div>
            <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1rem", fontWeight: 700, marginBottom: "8px", lineHeight: 1.4 }}>
              {paper.title}
            </h3>
            <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "24px", lineHeight: 1.5 }}>
              Enter your details to receive the download link. We may follow up with related research — unsubscribe any time.
            </p>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { placeholder: "Full name", value: name, onChange: setName, type: "text" },
                { placeholder: "Work email", value: email, onChange: setEmail, type: "email" },
                { placeholder: "Company name", value: company, onChange: setCompany, type: "text" },
              ].map((field) => (
                <input key={field.placeholder} type={field.type} placeholder={field.placeholder} value={field.value} onChange={(e) => field.onChange(e.target.value)} required
                  style={{ padding: "11px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "var(--text-primary)", fontFamily: "Exo 2, sans-serif", fontSize: "0.88rem", outline: "none" }} />
              ))}
              <button type="submit" className="btn-primary" style={{ justifyContent: "center", gap: "6px" }}>
                Send Me the Report <ArrowRight size={13} />
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <CheckCircle size={40} color={paper.color} style={{ margin: "0 auto 16px" }} />
            <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1rem", fontWeight: 700, color: paper.color, marginBottom: "8px" }}>Report on its way</h3>
            <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
              Check your inbox. The download link will arrive within 2 minutes. Check your spam folder if you do not see it.
            </p>
            <button onClick={onClose} style={{ marginTop: "20px", padding: "10px 24px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", color: "var(--text-muted)", fontFamily: "Exo 2, sans-serif", fontSize: "0.82rem", cursor: "pointer" }}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WhitepapersPage() {
  const [selectedPaper, setSelectedPaper] = useState<Whitepaper | null>(null);

  return (
    <>
      {selectedPaper && <GatedModal paper={selectedPaper} onClose={() => setSelectedPaper(null)} />}

      {/* Hero */}
      <section style={{ paddingTop: "60px", paddingBottom: "50px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(0,229,255,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="container-wide" style={{ position: "relative" }}>
          <div className="section-label" style={{ display: "inline-flex", marginBottom: "20px" }}>
            <Zap size={11} /> Original Research
          </div>
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", marginBottom: "20px" }}>
            AI Research <span className="gradient-text-full">& Whitepapers</span>
          </h1>
          <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "1.1rem", color: "var(--text-muted)", maxWidth: "600px", lineHeight: 1.7 }}>
            Original research, frameworks, and technical guides from the CerebroHive team. Free to download — no paywalls, just practical intelligence for AI practitioners and business leaders.
          </p>
        </div>
      </section>

      {/* Stats Row */}
      <section style={{ paddingBottom: "40px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
            {stats.map((s, i) => (
              <div key={i} className="card-glass" style={{ padding: "24px", textAlign: "center" }}>
                <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.5rem", fontWeight: 800, color: "var(--neural-blue)", marginBottom: "6px" }}>{s.value}</div>
                <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.78rem", color: "var(--text-muted)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Whitepaper Cards */}
      <section style={{ paddingBottom: "100px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
            {whitepapers.map((paper) => (
              <div key={paper.title} className="card-glass" style={{ padding: "36px 30px", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.58rem", fontWeight: 700, color: paper.color, background: `${paper.color}12`, border: `1px solid ${paper.color}28`, padding: "3px 10px", borderRadius: "100px", textTransform: "uppercase", alignSelf: "flex-start" }}>
                      {paper.audience}
                    </span>
                    <div style={{ width: 44, height: 56, borderRadius: "6px", background: `${paper.color}10`, border: `1px solid ${paper.color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FileText size={22} color={paper.color} />
                    </div>
                  </div>
                  <span style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.72rem", color: "var(--text-muted)" }}>{paper.pages}</span>
                </div>

                <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1rem", fontWeight: 700, marginBottom: "12px", lineHeight: 1.4 }}>
                  {paper.title}
                </h3>
                <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6, flex: 1, marginBottom: "20px" }}>
                  {paper.desc}
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "24px" }}>
                  {paper.tags.map((tag) => (
                    <span key={tag} style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.7rem", color: "var(--text-muted)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: "4px" }}>{tag}</span>
                  ))}
                </div>

                <button onClick={() => setSelectedPaper(paper)}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer", background: "none", border: "none", padding: 0, color: paper.color, fontSize: "0.82rem", fontFamily: "Exo 2, sans-serif", fontWeight: 600, transition: "gap 0.2s" }}>
                  <Download size={14} /> Download Report <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
