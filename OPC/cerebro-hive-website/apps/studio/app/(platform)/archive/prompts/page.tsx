"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Bot, Search, Plus, Filter, 
  Copy, Play, Star, Clock, 
  GitBranch, TerminalSquare, Settings2, MoreHorizontal
} from "lucide-react";

const DUMMY_PROMPTS = [
  {
    id: "1",
    name: "System: Agent Persona",
    slug: "sys-agent-persona-v2",
    description: "Core system prompt defining the tone, boundaries, and identity of CerebroCopilot.",
    category: "System",
    version: 4,
    tags: ["core", "persona"],
    rating: 4.8,
    uses: 12450,
  },
  {
    id: "2",
    name: "RAG Context Assembler",
    slug: "rag-context-assembler",
    description: "Instructs the LLM on how to cite sources and handle conflicting information from vector search.",
    category: "RAG",
    version: 2,
    tags: ["search", "accuracy"],
    rating: 4.9,
    uses: 8320,
  },
  {
    id: "3",
    name: "Code Review Assistant",
    slug: "code-review-assistant",
    description: "Analyzes pull requests for security vulnerabilities, style violations, and performance issues.",
    category: "Engineering",
    version: 1,
    tags: ["code", "security"],
    rating: 4.5,
    uses: 1105,
  },
  {
    id: "4",
    name: "Sales Outreach Email",
    slug: "sales-outreach-email",
    description: "Generates highly personalized outbound emails based on a prospect's LinkedIn profile and company data.",
    category: "Sales",
    version: 6,
    tags: ["email", "outbound"],
    rating: 4.7,
    uses: 4500,
  }
];

export default function PromptLibraryPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "System", "RAG", "Engineering", "Sales", "Marketing", "HR"];

  return (
    <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
      <div className="flex items-center gap-2 text-sm text-text-muted mb-4 font-medium">
        <Link href="/archive" className="hover:text-primary transition-colors">Archive</Link>
        <span className="text-border">/</span>
        <span className="text-text-primary">Prompt Library</span>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight font-space flex items-center gap-3">
            <Bot className="w-8 h-8 text-emerald-500" />
            Prompt Library
          </h1>
          <p className="text-text-muted mt-2 text-sm">
            Version-controlled templates for system instructions, RAG, and AI agent behaviors.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="bg-surface hover:bg-surface-hover border border-border text-text-primary px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
            <Settings2 size={18} />
            Configure
          </button>
          <button className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm shadow-primary/20">
            <Plus size={18} />
            New Prompt
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-64 shrink-0 flex flex-col gap-6">
          <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-text-primary mb-4 uppercase tracking-wider font-space">Categories</h3>
            <div className="space-y-1">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeCategory === cat ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-text-primary hover:bg-surface-hover'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-text-primary mb-4 uppercase tracking-wider font-space">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {["core", "persona", "search", "code", "security", "email", "internal"].map(tag => (
                <button key={tag} className="px-2 py-1 bg-background border border-border text-text-muted hover:text-primary hover:border-primary/50 text-xs font-medium rounded transition-colors">
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          {/* Search Bar */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-text-muted" />
            </div>
            <input
              type="text"
              className="w-full bg-surface border border-border text-text-primary rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm text-sm placeholder:text-text-muted/60"
              placeholder="Search prompts by name, slug, or content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="absolute inset-y-0 right-2 flex items-center">
              <button className="p-2 text-text-muted hover:text-text-primary transition-colors">
                <Filter size={18} />
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {DUMMY_PROMPTS.filter(p => activeCategory === "All" || p.category === activeCategory).map(prompt => (
              <div key={prompt.id} className="bg-surface border border-border rounded-xl p-5 hover:border-border-focus hover:shadow-md transition-all group flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-base font-bold text-text-primary font-space group-hover:text-primary transition-colors">
                      {prompt.name}
                    </h3>
                    <p className="text-xs text-text-muted font-mono mt-1">{prompt.slug}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded transition-colors" title="Test in Playground">
                      <Play size={16} />
                    </button>
                    <button className="p-1.5 text-text-muted hover:text-text-primary hover:bg-background rounded transition-colors" title="Copy Slug">
                      <Copy size={16} />
                    </button>
                    <button className="p-1.5 text-text-muted hover:text-text-primary hover:bg-background rounded transition-colors">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-text-muted leading-relaxed mb-4 flex-1">
                  {prompt.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-0.5 bg-background border border-border rounded text-xs font-medium text-text-primary flex items-center gap-1">
                    <TerminalSquare size={12} className="text-emerald-500" />
                    {prompt.category}
                  </span>
                  {prompt.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-background border border-border rounded text-xs font-medium text-text-muted">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="pt-4 border-t border-border flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-4 text-xs font-medium text-text-muted">
                    <span className="flex items-center gap-1" title="Average Rating">
                      <Star size={14} className="text-amber-500 fill-amber-500/20" /> {prompt.rating}
                    </span>
                    <span className="flex items-center gap-1" title="Total Uses">
                      <Play size={14} /> {(prompt.uses / 1000).toFixed(1)}k
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-mono text-text-muted bg-background px-2 py-1 rounded border border-border/50">
                    <GitBranch size={12} /> v{prompt.version}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
