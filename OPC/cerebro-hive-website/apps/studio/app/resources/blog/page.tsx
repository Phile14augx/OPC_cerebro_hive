"use client";
import { BookOpen, ArrowRight, Zap, Clock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const categories = ["All", "AI Agents", "LLMs", "Automation", "Data Engineering", "Consulting", "Academy"];

const articles = [
  {
    title: "What is an AI Agent and How Does It Work?",
    excerpt: "AI agents are autonomous systems that perceive their environment, reason about it, and take actions to achieve goals. This guide breaks down the architecture behind modern LLM-powered agents — from tool use to memory management to multi-agent coordination.",
    category: "AI Agents",
    date: "June 12, 2026",
    readTime: "8 min read",
    featured: true,
    slug: "#",
    color: "#7B61FF",
  },
  {
    title: "RAG vs Fine-Tuning: Which Does Your Business Need?",
    excerpt: "Retrieval-Augmented Generation and fine-tuning solve different problems. Understanding when to use each — and when to combine them — is one of the most consequential decisions in an enterprise AI deployment.",
    category: "LLMs",
    date: "June 10, 2026",
    readTime: "6 min read",
    featured: false,
    slug: "#",
    color: "#00E5FF",
  },
  {
    title: "10 Business Processes You Should Automate in 2025",
    excerpt: "From email triage and invoice parsing to lead enrichment and support ticket deflection — here are the ten processes where AI automation delivers the fastest, most measurable ROI for mid-market businesses.",
    category: "Automation",
    date: "June 7, 2026",
    readTime: "7 min read",
    featured: false,
    slug: "#",
    color: "#FF8A00",
  },
  {
    title: "How to Build an AI Strategy in 90 Days",
    excerpt: "Most AI strategy projects stall because they try to solve everything at once. This guide outlines a 90-day sprint framework: assess, prioritise, pilot, and measure — with real deliverables at each stage.",
    category: "Consulting",
    date: "June 5, 2026",
    readTime: "9 min read",
    featured: false,
    slug: "#",
    color: "#00E5FF",
  },
  {
    title: "Building a Vector Database for Enterprise RAG",
    excerpt: "Choosing the right vector database — Pinecone, pgvector, Weaviate, or Qdrant — depends on your latency requirements, data volume, and team's operational familiarity. Here's how to evaluate them.",
    category: "Data Engineering",
    date: "June 3, 2026",
    readTime: "7 min read",
    featured: false,
    slug: "#",
    color: "#7B61FF",
  },
  {
    title: "The 5 Levels of AI Maturity",
    excerpt: "Where is your organisation on the AI adoption curve? This maturity model — from Ad-Hoc experimentation to AI-Native operations — gives you a clear framework to benchmark your current state and plan the next step.",
    category: "Consulting",
    date: "May 30, 2026",
    readTime: "5 min read",
    featured: false,
    slug: "#",
    color: "#FF2ED1",
  },
  {
    title: "LangGraph vs CrewAI: Multi-Agent Framework Comparison",
    excerpt: "Two of the most discussed multi-agent orchestration frameworks in production today. We compare architecture, state management, tool support, observability, and real-world production reliability across both.",
    category: "AI Agents",
    date: "May 27, 2026",
    readTime: "10 min read",
    featured: false,
    slug: "#",
    color: "#7B61FF",
  },
  {
    title: "AI Governance: What Every Business Leader Needs to Know",
    excerpt: "AI governance is not just a compliance checkbox. It is the operating structure that determines whether your AI investments create sustainable value or introduce uncontrolled risk. Here's the framework we use with enterprise clients.",
    category: "Consulting",
    date: "May 24, 2026",
    readTime: "8 min read",
    featured: false,
    slug: "#",
    color: "#FF8A00",
  },
];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const featuredArticle = articles.find((a) => a.featured);
  const filteredArticles = articles.filter((a) => !a.featured && (activeCategory === "All" || a.category === activeCategory));

  return (
    <>
      {/* Hero */}
      <section style={{ paddingTop: "60px", paddingBottom: "50px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(0,229,255,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="container-wide" style={{ position: "relative" }}>
          <div className="section-label" style={{ display: "inline-flex", marginBottom: "20px" }}>
            <Zap size={11} /> Intelligence Dispatch
          </div>
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", marginBottom: "20px" }}>
            The CerebroHive <span className="gradient-text-full">Blog</span>
          </h1>
          <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "1.1rem", color: "var(--text-muted)", maxWidth: "600px", lineHeight: 1.7 }}>
            Deep-dives into AI agents, LLM engineering, automation strategy, and enterprise AI adoption — written by practitioners who build production systems.
          </p>
        </div>
      </section>

      {/* Featured Article */}
      {featuredArticle && (
        <section style={{ paddingBottom: "40px" }}>
          <div className="container-wide">
            <Link href={featuredArticle.slug} style={{ textDecoration: "none" }}>
              <div className="card-glass" style={{ padding: "48px", background: `radial-gradient(ellipse 60% 80% at 0% 50%, ${featuredArticle.color}08 0%, transparent 70%)` }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "20px" }}>
                  <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.58rem", fontWeight: 700, color: featuredArticle.color, background: `${featuredArticle.color}14`, border: `1px solid ${featuredArticle.color}30`, padding: "3px 10px", borderRadius: "100px", textTransform: "uppercase" }}>
                    {featuredArticle.category}
                  </span>
                  <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.58rem", fontWeight: 700, color: "var(--text-muted)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", padding: "3px 10px", borderRadius: "100px", textTransform: "uppercase" }}>
                    Featured
                  </span>
                </div>
                <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "clamp(1.3rem, 3vw, 1.9rem)", fontWeight: 700, marginBottom: "16px", maxWidth: "700px" }}>
                  {featuredArticle.title}
                </h2>
                <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.7, maxWidth: "680px", marginBottom: "28px" }}>
                  {featuredArticle.excerpt}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: featuredArticle.color, fontSize: "0.85rem", fontWeight: 600, fontFamily: "Exo 2, sans-serif" }}>
                    Read Article <ArrowRight size={14} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-muted)", fontSize: "0.78rem", fontFamily: "Exo 2, sans-serif" }}>
                    <Clock size={12} /> {featuredArticle.readTime}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.78rem", fontFamily: "Exo 2, sans-serif" }}>
                    {featuredArticle.date}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Category Filter */}
      <section style={{ paddingBottom: "24px" }}>
        <div className="container-wide">
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "8px 18px", borderRadius: "100px", cursor: "pointer", fontFamily: "Exo 2, sans-serif", fontSize: "0.82rem", fontWeight: 600, transition: "all 0.2s",
                  background: activeCategory === cat ? "rgba(0,229,255,0.1)" : "rgba(255,255,255,0.03)",
                  border: activeCategory === cat ? "1px solid var(--neural-blue)" : "1px solid rgba(255,255,255,0.07)",
                  color: activeCategory === cat ? "var(--neural-blue)" : "var(--text-muted)",
                }}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Article Grid */}
      <section style={{ paddingBottom: "40px" }}>
        <div className="container-wide">
          {filteredArticles.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)", fontFamily: "Exo 2, sans-serif" }}>
              No articles in this category yet. More coming soon.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
              {filteredArticles.map((article) => (
                <Link key={article.title} href={article.slug} style={{ textDecoration: "none" }}>
                  <div className="card-glass" style={{ padding: "32px 28px", height: "100%", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "16px" }}>
                      <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.58rem", fontWeight: 700, color: article.color, background: `${article.color}12`, border: `1px solid ${article.color}28`, padding: "2px 8px", borderRadius: "100px", textTransform: "uppercase" }}>
                        {article.category}
                      </span>
                    </div>
                    <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.95rem", fontWeight: 700, marginBottom: "10px", lineHeight: 1.4, color: "var(--text-primary)" }}>
                      {article.title}
                    </h3>
                    <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6, flex: 1, marginBottom: "20px" }}>
                      {article.excerpt.substring(0, 120)}...
                    </p>
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-muted)", fontSize: "0.75rem", fontFamily: "Exo 2, sans-serif" }}>
                        <Clock size={11} /> {article.readTime}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", color: article.color, fontSize: "0.78rem", fontFamily: "Exo 2, sans-serif", fontWeight: 600 }}>
                        Read <ArrowRight size={12} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section style={{ paddingBottom: "100px" }}>
        <div className="container-wide">
          <div className="card-glass" style={{ padding: "48px", display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "48px", alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <BookOpen size={18} color="var(--neural-blue)" />
                <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.6rem", fontWeight: 700, color: "var(--neural-blue)", textTransform: "uppercase", letterSpacing: "0.15em" }}>Weekly Newsletter</span>
              </div>
              <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.4rem", fontWeight: 700, marginBottom: "12px" }}>
                AI insights, every Thursday.
              </h2>
              <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
                Join 4,200+ engineers, founders, and AI practitioners who read the CerebroHive Dispatch. One issue per week. No noise. Unsubscribe any time.
              </p>
            </div>
            <div>
              {!subscribed ? (
                <form onSubmit={(e) => { e.preventDefault(); if (email.includes("@")) setSubscribed(true); }} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required
                    style={{ padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "var(--text-primary)", fontFamily: "Exo 2, sans-serif", fontSize: "0.9rem", outline: "none" }} />
                  <button type="submit" className="btn-primary" style={{ justifyContent: "center", gap: "6px" }}>
                    Subscribe to the Dispatch <ArrowRight size={13} />
                  </button>
                  <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.72rem", color: "var(--text-dim)", textAlign: "center" }}>No spam. Weekly cadence. Unsubscribe any time.</p>
                </form>
              ) : (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1rem", fontWeight: 700, color: "var(--neural-blue)", marginBottom: "8px" }}>✓ You are subscribed</div>
                  <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.85rem", color: "var(--text-muted)" }}>Your first issue will arrive this Thursday.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
