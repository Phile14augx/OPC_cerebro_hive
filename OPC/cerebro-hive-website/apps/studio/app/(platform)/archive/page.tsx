"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Library, FileText, Search, Plus, 
  Settings, Bot, FileDigit, Database, 
  ArrowRight, ShieldCheck
} from "lucide-react";

export default function ArchiveOverviewPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const modules = [
    {
      title: "Document Browser",
      description: "Manage, upload, and organize enterprise knowledge assets across workspaces.",
      icon: <FileText className="w-6 h-6 text-blue-500" />,
      href: "/archive/documents",
      stats: "12,453 documents",
    },
    {
      title: "Semantic Search",
      description: "Hybrid keyword and vector search powered by Cerebro X and pgvector.",
      icon: <Search className="w-6 h-6 text-purple-500" />,
      href: "/archive/search",
      stats: "99.8% precision",
    },
    {
      title: "Prompt Library",
      description: "Version-controlled, prompt templates for consistent AI generation.",
      icon: <Bot className="w-6 h-6 text-emerald-500" />,
      href: "/archive/prompts",
      stats: "340 prompts",
    },
    {
      title: "Model Registry",
      description: "Manage connected foundational models, LLMs, and embedding providers.",
      icon: <FileDigit className="w-6 h-6 text-amber-500" />,
      href: "/archive/models",
      stats: "8 active models",
    },
    {
      title: "Datasets",
      description: "Curated JSONL datasets for evaluation, fine-tuning, and offline RAG.",
      icon: <Database className="w-6 h-6 text-rose-500" />,
      href: "/archive/datasets",
      stats: "45 datasets",
    },
  ];

  return (
    <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight font-space flex items-center gap-3">
            <Library className="w-8 h-8 text-primary" />
            CerebroArchive™
          </h1>
          <p className="text-text-muted mt-2 text-lg">
            The intelligent knowledge layer powering your enterprise AI platform.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/archive/documents/new" className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm shadow-primary/20">
            <Plus size={18} />
            Add Knowledge
          </Link>
          <button className="bg-surface hover:bg-surface-hover border border-border text-text-primary px-4 py-2.5 rounded-lg font-medium transition-colors">
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="mb-12 relative max-w-3xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-text-muted" />
        </div>
        <input
          type="text"
          className="w-full bg-surface border border-border text-text-primary rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm text-lg placeholder:text-text-muted"
          placeholder="Search the entire enterprise archive..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
          <kbd className="hidden sm:inline-block px-2 py-1 bg-background border border-border rounded text-xs font-mono text-text-muted font-medium">⌘K</kbd>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { label: "Total Vectors Indexed", value: "3.4M", trend: "+12% this month" },
          { label: "RAG Queries / Day", value: "84.2K", trend: "+5% this week" },
          { label: "Storage Used", value: "1.2 TB", trend: "MinIO S3 Backend" }
        ].map((stat, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-text-muted text-sm font-medium">{stat.label}</h3>
            <p className="text-3xl font-bold text-text-primary mt-2 font-space">{stat.value}</p>
            <p className="text-emerald-500 text-sm mt-2 font-medium">{stat.trend}</p>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold text-text-primary mb-6 font-space">Platform Modules</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((mod, i) => (
          <Link href={mod.href} key={i}>
            <div className="bg-surface border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-md transition-all group h-full flex flex-col cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
              
              <div className="w-12 h-12 bg-background border border-border rounded-lg flex items-center justify-center mb-5 shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                {mod.icon}
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2 font-space group-hover:text-primary transition-colors">{mod.title}</h3>
              <p className="text-text-muted text-sm flex-1 leading-relaxed">{mod.description}</p>
              
              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs font-medium text-text-muted bg-background px-2 py-1 rounded border border-border/50">
                  {mod.stats}
                </span>
                <ArrowRight size={16} className="text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="bg-blue-500/20 p-3 rounded-full shrink-0">
            <ShieldCheck className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">Enterprise Data Governance</h3>
            <p className="text-text-muted text-sm mt-1 max-w-xl">
              All documents are automatically encrypted at rest and access is governed by HiveShield™ policies. Multi-tenant isolation is active.
            </p>
          </div>
        </div>
        <button className="bg-background border border-border text-text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface transition-colors whitespace-nowrap">
          View Audit Logs
        </button>
      </div>
    </div>
  );
}
