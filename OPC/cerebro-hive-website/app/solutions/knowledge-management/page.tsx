"use client";
import { MessageSquare, CheckCircle, ShieldCheck, Zap, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

const features = [
  { title: "Multi-Source RAG Pipeline", desc: "Connect Slack, Google Drive, Confluence, Notion, and local file storage to a unified vector index database." },
  { title: "Semantic Document Search", desc: "Provide employees with natural language queries that yield direct document snippets and verifiable citations." },
  { title: "Autonomous Knowledge Synthesis", desc: "Draft synthesis tables, compare internal project files, and write comprehensive summaries of scattered docs." },
  { title: "Role-Based Access Compliance", desc: "Maintain absolute compliance. The vector databases inherit existing document permission scopes automatically." }
];

export default function KnowledgeManagementPage() {
  return (
    <>
      <section style={{ paddingTop: "140px", paddingBottom: "60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(0,229,255,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="container-wide" style={{ position: "relative" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none", marginBottom: "24px" }}>
            <ArrowLeft size={14} /> Back to Home
          </Link>
          <div className="section-label" style={{ display: "inline-flex", marginBottom: "20px" }}>
            <MessageSquare size={11} /> Internal Knowledge
          </div>
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", marginBottom: "20px" }}>
            AI Knowledge <span className="gradient-text-blue-violet">Management</span>
          </h1>
          <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "1.1rem", color: "var(--text-muted)", maxWidth: "600px", lineHeight: 1.7 }}>
            Build a private semantic brain for your enterprise. Enable staff to query scattered folders and receive factual answers with source citation links instantly.
          </p>
        </div>
      </section>

      {/* Metrics Row */}
      <section style={{ paddingBottom: "40px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {[
              { label: "Search Time", value: "80% faster search times" },
              { label: "Accuracy Rate", value: "99.5% citation accuracy" },
              { label: "Data Indexing", value: "Millions of docs indexed" }
            ].map((stat, i) => (
              <div key={i} className="card-glass" style={{ padding: "24px", textAlign: "center" }}>
                <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.5rem", fontWeight: 800, color: "var(--neural-blue)", marginBottom: "6px" }}>{stat.value}</div>
                <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-muted)" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Showcase */}
      <section className="section-pad" style={{ paddingTop: "20px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "60px", alignItems: "center" }}>
            <div>
              <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.5rem", fontWeight: 700, marginBottom: "24px" }}>
                Connect Scattered Corporate Knowledge
              </h2>
              <p style={{ fontFamily: "Exo 2, sans-serif", color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "24px" }}>
                Hours are lost weekly parsing documents across isolated folders and chats. Our AI knowledge managers ingest scattered files, parse PDFs and spreadsheets, index them into vector search indexes, and serve them via Slack or a custom web dashboard. Every response lists the original document link, ensuring transparency and trust.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {features.map((f) => (
                  <div key={f.title} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <CheckCircle size={16} color="var(--neural-blue)" style={{ flexShrink: 0, marginTop: "3px" }} />
                    <div>
                      <h4 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)" }}>{f.title}</h4>
                      <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Block */}
            <div className="card-glass" style={{ padding: "40px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <Zap size={18} color="var(--neural-blue)" />
                <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1rem", fontWeight: 700, color: "var(--neural-blue)" }}>
                  Knowledge Stack Audit
                </h3>
              </div>
              <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "24px" }}>
                We review your document storage nodes, security policies, and query intents to design a high-accuracy, private RAG pipeline.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "32px" }}>
                {["RAG Index Architecture Map", "Data Security Scoping Matrix", "Pilot Ingestion Proof of Concept"].map((b) => (
                  <div key={b} style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    <ShieldCheck size={14} color="var(--neural-blue)" />
                    {b}
                  </div>
                ))}
              </div>

              <Link href="/contact" className="btn-primary" style={{ width: "100%", justifyContent: "center", display: "inline-flex", gap: "6px" }}>
                Request Knowledge Audit <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
