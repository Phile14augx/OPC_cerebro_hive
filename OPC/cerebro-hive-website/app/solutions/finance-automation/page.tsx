"use client";
import { CheckCircle, ShieldCheck, Zap, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

const features = [
  { title: "Automated Document Parsing", desc: "Extract line-item details from invoices, receipts, and bank statements automatically using vision LLMs." },
  { title: "Invoice Matching & Verification", desc: "Verify extracted invoice data against purchase orders and shipping manifests to identify anomalies." },
  { title: "Predictive P&L Forecasting", desc: "Build automated monthly projections and cash flow warnings by feeding transaction databases to analysis pipelines." },
  { title: "Autonomous Expense Auditing", desc: "Enforce company expense policies by scanning employee receipt submissions for compliance violations." }
];

export default function FinanceAutomationPage() {
  return (
    <>
      <section style={{ paddingTop: "140px", paddingBottom: "60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(255,138,0,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="container-wide" style={{ position: "relative" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none", marginBottom: "24px" }}>
            <ArrowLeft size={14} /> Back to Home
          </Link>
          <div className="section-label" style={{ display: "inline-flex", marginBottom: "20px", color: "#FF8A00", background: "rgba(255,138,0,0.08)", borderColor: "rgba(255,138,0,0.25)" }}>
            <Zap size={11} /> Finance Operations
          </div>
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", marginBottom: "20px" }}>
            Finance &amp; Ledger <span className="gradient-text-orange">Automation</span>
          </h1>
          <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "1.1rem", color: "var(--text-muted)", maxWidth: "600px", lineHeight: 1.7 }}>
            Minimize human error and speed up bookkeeping. Deploy AI solutions to ingest invoices, match transaction records, and calculate predictive financial forecasts.
          </p>
        </div>
      </section>

      {/* Metrics Row */}
      <section style={{ paddingBottom: "40px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {[
              { label: "Bookkeeping Accuracy", value: "99% invoice match accuracy" },
              { label: "Processing Latency", value: "90% faster document ingestion" },
              { label: "Compliance Coverage", value: "100% automated receipt audits" }
            ].map((stat, i) => (
              <div key={i} className="card-glass" style={{ padding: "24px", textAlign: "center" }}>
                <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.5rem", fontWeight: 800, color: "var(--hive-orange)", marginBottom: "6px" }}>{stat.value}</div>
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
                Frictionless Financial Document Matching
              </h2>
              <p style={{ fontFamily: "Exo 2, sans-serif", color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "24px" }}>
                Entering transaction data and cross-matching orders manually is a bottleneck. We engineer document extraction pipelines that parse scanned attachments using multimodal LLMs, verify fields against ERP databases, reconcile entries in accounting tools (e.g. QuickBooks, Xero), and flag discrepancies to controllers automatically.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {features.map((f) => (
                  <div key={f.title} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <CheckCircle size={16} color="var(--hive-orange)" style={{ flexShrink: 0, marginTop: "3px" }} />
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
                <Zap size={18} color="var(--hive-orange)" />
                <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1rem", fontWeight: 700, color: "var(--hive-orange)" }}>
                  FinOps Scoping
                </h3>
              </div>
              <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "24px" }}>
                We review your document ingestion queues, banking APIs, and database permissions to draft a secure, audit-compliant pipeline framework.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "32px" }}>
                {["Invoice Parsing Audit", "Accounting Software Integration Blueprint", "Data Compliance & Privacy Assessment"].map((b) => (
                  <div key={b} style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    <ShieldCheck size={14} color="var(--hive-orange)" />
                    {b}
                  </div>
                ))}
              </div>

              <Link href="/contact" className="btn-primary" style={{ width: "100%", justifyContent: "center", display: "inline-flex", gap: "6px", background: "linear-gradient(135deg, var(--hive-orange), var(--violet))" }}>
                Request Finance Audit <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
