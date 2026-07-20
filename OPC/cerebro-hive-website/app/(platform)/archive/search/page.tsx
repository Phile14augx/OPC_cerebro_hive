"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Search, SlidersHorizontal, FileText, Database, 
  MessageSquare, Sparkles, Network, ArrowRight, CornerDownRight, Tag
} from "lucide-react";

export default function SemanticSearchPage() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    // Simulate API delay
    setTimeout(() => {
      setIsSearching(false);
      setHasSearched(true);
    }, 1200);
  };

  const MOCK_RESULTS = [
    {
      id: "1",
      title: "Q3 Earnings Report",
      domain: "finance",
      type: "pdf",
      score: 0.94,
      preview: "...the overall revenue grew by 14% year-over-year, driven primarily by strong adoption of our enterprise AI platform modules in the EMEA region. Operating margins expanded to...",
      highlights: ["enterprise AI platform modules"]
    },
    {
      id: "2",
      title: "Architecture Decision Record (ADR-042)",
      domain: "engineering",
      type: "md",
      score: 0.88,
      preview: "...we evaluated several vector databases for the CerebroArchive module. We decided to use pgvector as it allows us to colocate relational metadata with vector embeddings, simplifying the hybrid search pipeline...",
      highlights: ["CerebroArchive module", "hybrid search pipeline"]
    }
  ];

  return (
    <div className="flex-1 p-8 max-w-5xl mx-auto w-full h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center gap-2 text-sm text-text-muted mb-8 font-medium shrink-0">
        <Link href="/archive" className="hover:text-primary transition-colors">Archive</Link>
        <span className="text-border">/</span>
        <span className="text-text-primary">Semantic Search</span>
      </div>

      {!hasSearched ? (
        <div className="flex-1 flex flex-col items-center justify-center -mt-20">
          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-border">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-text-primary tracking-tight font-space mb-4 text-center">
            Semantic Enterprise Search
          </h1>
          <p className="text-text-muted text-lg mb-10 max-w-xl text-center">
            Find exactly what you're looking for using natural language. CerebroArchive searches across documents, chunks, and metadata using Hybrid AI Search.
          </p>

          <form onSubmit={handleSearch} className="w-full max-w-2xl relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <input
              type="text"
              className="w-full bg-surface border border-border text-text-primary rounded-2xl py-5 pl-14 pr-32 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-lg text-lg placeholder:text-text-muted/60"
              placeholder="Ask a question or search for concepts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <div className="absolute inset-y-0 right-2 flex items-center gap-2">
              <button type="button" className="p-2 text-text-muted hover:text-text-primary hover:bg-background rounded-lg transition-colors" title="Filters">
                <SlidersHorizontal size={20} />
              </button>
              <button 
                type="submit" 
                disabled={!query.trim()}
                className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white px-4 py-2 rounded-xl font-medium transition-colors"
              >
                Search
              </button>
            </div>
          </form>
          
          <div className="mt-8 flex items-center gap-4 text-sm text-text-muted">
            <span className="flex items-center gap-1"><Database size={14} /> pgvector</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="flex items-center gap-1"><Network size={14} /> Reciprocal Rank Fusion (RRF)</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="flex items-center gap-1"><Sparkles size={14} /> OpenSearch BM25</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {/* Search Header */}
          <form onSubmit={handleSearch} className="w-full relative mb-8 shrink-0">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              {isSearching ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="h-5 w-5 text-primary" />
              )}
            </div>
            <input
              type="text"
              className="w-full bg-surface border border-border text-text-primary rounded-xl py-3 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm text-base"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="button" className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-muted hover:text-text-primary transition-colors">
              <SlidersHorizontal size={18} />
            </button>
          </form>

          {/* Results Area */}
          <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar pb-8">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-text-muted font-medium">Found 2 results in 1.43s</p>
              
              <div className="flex items-center gap-2 bg-surface border border-border p-1 rounded-lg">
                <button className="px-3 py-1 bg-background text-text-primary text-xs font-medium rounded shadow-sm border border-border/50">Hybrid (RRF)</button>
                <button className="px-3 py-1 text-text-muted hover:text-text-primary text-xs font-medium rounded">Semantic Only</button>
                <button className="px-3 py-1 text-text-muted hover:text-text-primary text-xs font-medium rounded">Keyword Only</button>
              </div>
            </div>

            {/* AI Synthesized Answer (Optional RAG overlay) */}
            <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 rounded-xl p-6 mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="w-24 h-24 text-primary" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-text-primary font-space">AI Summary</h3>
              </div>
              <p className="text-text-primary leading-relaxed text-sm relative z-10 max-w-3xl">
                Based on the retrieved documents, the CerebroArchive module utilizes <strong>pgvector</strong> as its primary vector database for semantic search. This allows relational metadata to be colocated with vector embeddings. Additionally, it leverages OpenSearch for BM25 keyword search, combining the results using <strong>Reciprocal Rank Fusion (RRF)</strong> to achieve high precision.
              </p>
              <div className="mt-4 flex gap-2 relative z-10">
                <button className="flex items-center gap-1.5 text-xs font-medium bg-background border border-border px-3 py-1.5 rounded-md hover:bg-surface transition-colors">
                  <MessageSquare size={14} /> Ask Follow-up
                </button>
              </div>
            </div>

            {/* Search Results List */}
            <div className="space-y-6">
              {MOCK_RESULTS.map(res => (
                <div key={res.id} className="bg-surface border border-border rounded-xl p-5 hover:border-border-focus hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-2">
                    <Link href={`/archive/documents/${res.id}`} className="text-lg font-bold text-primary hover:underline font-space flex items-center gap-2">
                      <FileText size={18} />
                      {res.title}
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        score: {res.score.toFixed(3)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mb-3">
                    <span className="px-2 py-0.5 bg-background border border-border rounded text-xs font-medium text-text-muted capitalize flex items-center gap-1">
                      <Tag size={10} /> {res.domain}
                    </span>
                    <span className="px-2 py-0.5 bg-background border border-border rounded text-xs font-medium text-text-muted uppercase">
                      {res.type}
                    </span>
                  </div>
                  
                  <div className="relative">
                    <CornerDownRight size={16} className="absolute -left-5 top-1 text-text-muted/50" />
                    <p className="text-sm text-text-primary leading-relaxed font-serif bg-background/50 p-3 rounded-lg border border-border/50">
                      {res.preview}
                    </p>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-xs text-text-muted">
                      Matched via Hybrid Search (Vector + Keyword)
                    </div>
                    <Link href={`/archive/documents/${res.id}`} className="text-xs font-medium text-primary flex items-center gap-1 hover:underline">
                      View Document <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
