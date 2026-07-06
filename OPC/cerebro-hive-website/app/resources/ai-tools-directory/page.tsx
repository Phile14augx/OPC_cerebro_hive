"use client";
import { useState } from "react";
import { Search, Sparkles, ExternalLink, ArrowLeft, Star } from "lucide-react";
import Link from "next/link";

const categories = ["All", "Frameworks", "Automation", "Vector DBs", "LLM APIs", "AI Coding", "Audio"];

const tools = [
  {
    name: "LangGraph",
    category: "Frameworks",
    rating: 9.8,
    description: "A framework for building stateful, multi-actor applications with LLMs, ideal for creating advanced agentic loops.",
    verdict: "Essential tool for orchestrating multi-agent loops and complex agent state behaviors.",
    link: "https://github.com/langchain-ai/langgraph",
    color: "#00E5FF",
  },
  {
    name: "n8n",
    category: "Automation",
    rating: 9.5,
    description: "A node-based workflow automation tool with extensive integration options, featuring built-in advanced LLM sub-nodes.",
    verdict: "The best node-based integration builder for connecting standard services to LLM chains.",
    link: "https://n8n.io",
    color: "#FF8A00",
  },
  {
    name: "Claude 3.5 Sonnet",
    category: "LLM APIs",
    rating: 9.9,
    description: "Anthropic's state-of-the-art model offering superior reasoning, code generation, and structured XML output generation.",
    verdict: "Top reasoning agent engine in 2025. Standard for software development and logic-heavy workflows.",
    link: "https://anthropic.com",
    color: "#7B61FF",
  },
  {
    name: "LlamaIndex",
    category: "Frameworks",
    rating: 9.4,
    description: "A data framework for connecting private business datasets to large language models, tailored for building advanced RAG apps.",
    verdict: "The absolute standard for parsing documents and structuring data indexes for vector search.",
    link: "https://llamaindex.ai",
    color: "#FF2ED1",
  },
  {
    name: "Pinecone",
    category: "Vector DBs",
    rating: 9.2,
    description: "A fully managed cloud native vector database designed to scale to billions of vectors with sub-millisecond latencies.",
    verdict: "Reliable, fast serverless vector index with excellent administration dashboards.",
    link: "https://pinecone.io",
    color: "#00E5FF",
  },
  {
    name: "v0 by Vercel",
    category: "AI Coding",
    rating: 9.7,
    description: "A generative UI development environment that outputs react components, HTML pages, and styled code from simple prompt edits.",
    verdict: "Cuts frontend wireframing duration by 80%. Exceptional utility for rapid app prototyping.",
    link: "https://v0.dev",
    color: "#FFBA00",
  },
  {
    name: "ElevenLabs",
    category: "Audio",
    rating: 9.6,
    description: "Advanced text-to-speech audio platform creating realistic voiceovers, voice clones, and real-time audio agent connections.",
    verdict: "Unmatched speech naturalness. Ideal for voice automation agent pipelines.",
    link: "https://elevenlabs.io",
    color: "#7B61FF",
  },
  {
    name: "Qdrant",
    category: "Vector DBs",
    rating: 9.1,
    description: "A rust-based vector database and search engine built for fast payload filtering and production deployments.",
    verdict: "Extremely performant, open-source vector store for advanced developers with hybrid search requirements.",
    link: "https://qdrant.tech",
    color: "#FF8A00",
  }
];

export default function ToolsDirectoryPage() {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");

  const filteredTools = tools.filter((tool) => {
    const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase()) ||
                          tool.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === "All" || tool.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <>
      <section style={{ paddingTop: "140px", paddingBottom: "50px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(255,138,0,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="container-wide" style={{ position: "relative" }}>
          <Link href="/resources/blog" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none", marginBottom: "24px" }}>
            <ArrowLeft size={14} /> Back to Blog
          </Link>
          <div className="section-label" style={{ display: "inline-flex", marginBottom: "20px", color: "#FF8A00", background: "rgba(255,138,0,0.08)", borderColor: "rgba(255,138,0,0.25)" }}>
            <Sparkles size={11} /> AI Tools Directory
          </div>
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", marginBottom: "20px" }}>
            The AI <span className="gradient-text-orange">Development Stack</span>
          </h1>
          <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "1.1rem", color: "var(--text-muted)", maxWidth: "600px", lineHeight: 1.7 }}>
            A curated database of top-tier AI models, tools, and developer frameworks. We test and rate each one for production readiness.
          </p>
        </div>
      </section>

      {/* Filters & Search */}
      <section style={{ paddingBottom: "40px" }}>
        <div className="container-wide">
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "16px 20px" }}>
            {/* Search Box */}
            <div style={{ position: "relative", maxWidth: "340px", width: "100%" }}>
              <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Search tools or keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "100px", padding: "10px 16px 10px 42px", fontFamily: "Exo 2, sans-serif", fontSize: "0.85rem", color: "var(--text-primary)", outline: "none" }}
              />
            </div>

            {/* Categories */}
            <div style={{ display: "flex", gap: "6px", overflowX: "auto", maxWidth: "100%" }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  style={{
                    padding: "8px 16px",
                    background: selectedCat === cat ? "rgba(255,138,0,0.12)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${selectedCat === cat ? "rgba(255,138,0,0.35)" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: "100px",
                    fontFamily: "Exo 2, sans-serif",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    color: selectedCat === cat ? "var(--hive-orange)" : "var(--text-muted)",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Grid of Tools */}
      <section className="section-pad" style={{ paddingTop: "0px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
            {filteredTools.map((tool) => (
              <div key={tool.name} className="card-glass" style={{ padding: "32px", display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                  <div>
                    <span style={{ fontSize: "0.65rem", fontFamily: "Orbitron, sans-serif", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {tool.category}
                    </span>
                    <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>
                      {tool.name}
                    </h3>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,214,10,0.08)", border: "1px solid rgba(255,214,10,0.25)", padding: "4px 10px", borderRadius: "100px" }}>
                    <Star size={13} color="var(--gold)" fill="var(--gold)" />
                    <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.8rem", fontWeight: 700, color: "var(--gold)" }}>
                      {tool.rating}
                    </span>
                  </div>
                </div>

                <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.65, marginBottom: "20px" }}>
                  {tool.description}
                </p>

                {/* Cerebro Verdict Card */}
                <div style={{ background: "rgba(255,255,255,0.02)", borderLeft: `3px solid ${tool.color}`, padding: "14px 18px", borderRadius: "0 12px 12px 0", marginBottom: "28px" }}>
                  <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.625rem", color: tool.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                    CerebroHive Verdict
                  </div>
                  <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-primary)", lineHeight: 1.45 }}>
                    {tool.verdict}
                  </div>
                </div>

                <a
                  href={tool.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost"
                  style={{ width: "100%", justifyContent: "center", marginTop: "auto", fontSize: "0.8rem", display: "inline-flex", gap: "6px" }}
                >
                  Visit Tool Page <ExternalLink size={12} />
                </a>
              </div>
            ))}
          </div>

          {filteredTools.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)", fontFamily: "Exo 2, sans-serif" }}>
              No tools matched your search or category filters. Try resetting the criteria.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
