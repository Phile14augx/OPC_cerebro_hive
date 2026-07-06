"use client";
import { Database, CheckCircle, ArrowRight, ArrowLeft, Zap, Server, BarChart, Cpu, HardDrive, ShieldCheck } from "lucide-react";
import Link from "next/link";

const offerings = [
  { icon: Cpu, color: "#00E5FF", title: "ETL Pipeline Design & Build", desc: "Automate raw data ingestion, transformation, validation, and loading pipelines using custom scripts, Airflow, or dbt." },
  { icon: Database, color: "#7B61FF", title: "Warehouse & Lake Architecture", desc: "Optimize modern data storage platforms like Snowflake, Google BigQuery, and AWS Redshift for analytics workflows." },
  { icon: BarChart, color: "#FF8A00", title: "Analytics Platform Setup", desc: "Build real-time BI dashboards, custom analytics solutions, and integrate self-service tools like Metabase or Superset." },
  { icon: Server, color: "#FF2ED1", title: "Real-Time Streaming Pipelines", desc: "Deploy message brokers and event-driven data streaming layers using Apache Kafka, RabbitMQ, and AWS Kinesis." },
  { icon: ShieldCheck, color: "#00E5FF", title: "Data Governance & Quality", desc: "Establish schemas, continuous data validation checkpoints, audit logs, and cataloging for strict regulatory compliance." },
  { icon: HardDrive, color: "#7B61FF", title: "Vector DB & RAG Infrastructure", desc: "Provision and tune Pinecone, PgVector, and Milvus instances optimized for low-latency agentic RAG searches." },
];

const stats = [
  { label: "Pipelines Active", value: "120+" },
  { label: "Data Sources Synced", value: "50+" },
  { label: "Pipeline Uptime SLA", value: "99.99%" },
];

export default function DataEngineeringPage() {
  return (
    <>
      {/* Hero */}
      <section style={{ paddingTop: "140px", paddingBottom: "60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,229,255,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="container-wide" style={{ position: "relative" }}>
          <Link href="/services" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none", marginBottom: "24px", transition: "color 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>
            <ArrowLeft size={14} /> Back to Services
          </Link>
          <div className="section-label" style={{ display: "inline-flex", marginBottom: "20px" }}>
            <Database size={11} /> Data & Infrastructure
          </div>
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", marginBottom: "20px" }}>
            Data <span className="gradient-text-full">Engineering</span>
          </h1>
          <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "1.1rem", color: "var(--text-muted)", maxWidth: "600px", lineHeight: 1.7 }}>
            Build structured, resilient data pipelines and enterprise analytics warehouses. Clean, high-throughput pipelines that fuel your AI systems, reports, and operational dashboards.
          </p>
        </div>
      </section>

      {/* Stats Row */}
      <section style={{ paddingBottom: "40px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {stats.map((s, i) => (
              <div key={i} className="card-glass" style={{ padding: "24px", textAlign: "center" }}>
                <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.5rem", fontWeight: 800, color: "var(--neural-blue)", marginBottom: "6px" }}>{s.value}</div>
                <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-muted)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Showcase */}
      <section style={{ paddingBottom: "40px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "60px", alignItems: "center" }}>
            <div>
              <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.4rem", fontWeight: 700, marginBottom: "20px" }}>
                Resilient pipelines. Pure schemas.
              </h2>
              <p style={{ fontFamily: "Exo 2, sans-serif", color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "28px" }}>
                AI models are only as good as the datasets they ingest. We engineer fault-tolerant ETL architectures with strict schemas and automated quality checkpoints to ensure your analytical platforms and LLM models read only clean, reliable, structured data.
              </p>
              
              {/* Inline Pipeline SVG */}
              <div style={{ padding: "24px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", marginBottom: "20px" }}>
                <svg viewBox="0 0 500 120" style={{ width: "100%", height: "auto" }}>
                  {/* Nodes */}
                  <g>
                    {/* Sources */}
                    <circle cx="50" cy="60" r="16" fill="rgba(123,97,255,0.1)" stroke="#7B61FF" strokeWidth="1.5" />
                    <text x="50" y="64" textAnchor="middle" fill="#FFF" fontSize="10" fontFamily="Orbitron">SRC</text>
                    
                    {/* ETL Engine */}
                    <circle cx="200" cy="60" r="18" fill="rgba(0,229,255,0.1)" stroke="#00E5FF" strokeWidth="1.5" />
                    <text x="200" y="64" textAnchor="middle" fill="#FFF" fontSize="10" fontFamily="Orbitron">ETL</text>
                    
                    {/* Warehouse */}
                    <circle cx="350" cy="60" r="18" fill="rgba(255,138,0,0.1)" stroke="#FF8A00" strokeWidth="1.5" />
                    <text x="350" y="64" textAnchor="middle" fill="#FFF" fontSize="10" fontFamily="Orbitron">DWH</text>
                    
                    {/* AI / BI */}
                    <circle cx="450" cy="60" r="16" fill="rgba(255,46,209,0.1)" stroke="#FF2ED1" strokeWidth="1.5" />
                    <text x="450" y="64" textAnchor="middle" fill="#FFF" fontSize="10" fontFamily="Orbitron">AI/BI</text>
                  </g>
                  
                  {/* Edges */}
                  <g strokeWidth="1.5" fill="none">
                    <line x1="66" y1="60" x2="182" y2="60" stroke="#7B61FF" strokeDasharray="4 4" />
                    <line x1="218" y1="60" x2="332" y2="60" stroke="#00E5FF" strokeDasharray="4 4" />
                    <line x1="368" y1="60" x2="434" y2="60" stroke="#FF8A00" strokeDasharray="4 4" />
                  </g>
                </svg>
              </div>
            </div>

            {/* CTA Panel */}
            <div className="card-glass" style={{ padding: "40px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <Zap size={18} color="var(--neural-blue)" />
                <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1rem", fontWeight: 700, color: "var(--neural-blue)" }}>
                  Data Infrastructure Audit
                </h3>
              </div>
              <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "24px" }}>
                A deep assessment of your data pipeline latency, warehouse optimizations, schema validity, and vector storage indexing models.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
                {["Scoping bottleneck analysis", "GCP/AWS cost optimization assessment", "Custom pipeline integration blueprint"].map((b) => (
                  <div key={b} style={{ display: "flex", gap: "8px", alignItems: "flex-start", fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "Exo 2, sans-serif" }}>
                    <CheckCircle size={13} color="var(--neural-blue)" style={{ flexShrink: 0, marginTop: "2px" }} /> {b}
                  </div>
                ))}
              </div>
              <Link href="/contact" className="btn-primary" style={{ width: "100%", justifyContent: "center", display: "inline-flex", gap: "6px" }}>
                Book Technical Audit <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Offerings Grid */}
      <section style={{ paddingBottom: "100px" }}>
        <div className="container-wide">
          <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.3rem", fontWeight: 700, marginBottom: "28px" }}>
            Data engineering capabilities
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {offerings.map((off) => {
              const Icon = off.icon;
              return (
                <div key={off.title} className="card-glass" style={{ padding: "28px 24px" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "10px", background: `${off.color}14`, border: `1px solid ${off.color}28`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                    <Icon size={18} color={off.color} />
                  </div>
                  <h4 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.88rem", fontWeight: 700, marginBottom: "8px" }}>{off.title}</h4>
                  <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{off.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
