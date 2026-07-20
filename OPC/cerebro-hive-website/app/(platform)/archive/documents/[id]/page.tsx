"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ArrowLeft, FileText, Database, Info, 
  Settings, Save, Search, Download, Shield,
  RefreshCcw, AlertTriangle, Play, LayoutList
} from "lucide-react";

const DOC = {
  id: "1",
  title: "Q3 Earnings Report",
  type: "pdf",
  domain: "finance",
  status: "indexed",
  chunks: 142,
  date: "2026-07-15",
  content: "This is a preview of the extracted plain text content. In a real environment, this would show the raw extracted text from the PDF, which can be edited before re-indexing...",
  tags: ["quarterly", "financials", "public"],
  meta: {
    author: "Jane Doe",
    classification: "Internal Confidential"
  }
};

export default function DocumentViewerPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [activeTab, setActiveTab] = useState("content");
  
  return (
    <div className="flex-1 p-8 max-w-7xl mx-auto w-full h-[calc(100vh-4rem)] flex flex-col">
      {/* Breadcrumbs & Header */}
      <div className="flex items-center gap-2 text-sm text-text-muted mb-6 font-medium shrink-0">
        <Link href="/archive" className="hover:text-primary transition-colors">Archive</Link>
        <span className="text-border">/</span>
        <Link href="/archive/documents" className="hover:text-primary transition-colors">Documents</Link>
        <span className="text-border">/</span>
        <span className="text-text-primary truncate max-w-xs">{DOC.title}</span>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/archive/documents" className="p-2 bg-surface hover:bg-surface-hover border border-border rounded-lg text-text-muted transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight font-space flex items-center gap-3">
              {DOC.title}
            </h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-text-muted">
              <span className="uppercase font-medium px-2 py-0.5 bg-background border border-border rounded text-xs">{DOC.type}</span>
              <span className="flex items-center gap-1 text-emerald-500 font-medium bg-emerald-500/10 px-2 py-0.5 rounded text-xs">
                Indexed
              </span>
              <span>{DOC.chunks} semantic chunks</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="bg-surface hover:bg-surface-hover border border-border text-text-primary px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Download size={16} />
            Source File
          </button>
          <button className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm shadow-primary/20">
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 gap-6">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="flex border-b border-border bg-background/50 p-1 gap-1">
            <button 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'content' ? 'bg-background text-text-primary shadow-sm border border-border/50' : 'text-text-muted hover:text-text-primary hover:bg-surface'}`}
              onClick={() => setActiveTab('content')}
            >
              <FileText size={16} /> Extracted Text
            </button>
            <button 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'chunks' ? 'bg-background text-text-primary shadow-sm border border-border/50' : 'text-text-muted hover:text-text-primary hover:bg-surface'}`}
              onClick={() => setActiveTab('chunks')}
            >
              <LayoutList size={16} /> Semantic Chunks
            </button>
          </div>
          
          <div className="flex-1 p-0 overflow-hidden relative">
            {activeTab === 'content' ? (
              <textarea 
                className="w-full h-full p-6 bg-background resize-none focus:outline-none text-text-primary leading-relaxed font-mono text-sm"
                defaultValue={DOC.content}
                spellCheck={false}
              />
            ) : (
              <div className="p-6 h-full overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-space">Indexed Chunks (142)</h3>
                  <button className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                    <RefreshCcw size={14} /> Re-chunk Document
                  </button>
                </div>
                
                {[1, 2, 3].map((chunk) => (
                  <div key={chunk} className="mb-4 bg-background border border-border rounded-lg p-4 relative group">
                    <div className="absolute -left-3 top-4 w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center text-xs font-bold text-text-muted">
                      {chunk}
                    </div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-mono text-text-muted bg-surface px-2 py-1 rounded">tokens: 412</span>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-xs text-text-muted hover:text-primary">Edit</button>
                        <button className="text-xs text-text-muted hover:text-rose-500">Drop</button>
                      </div>
                    </div>
                    <p className="text-sm text-text-primary font-serif leading-relaxed">
                      {DOC.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="w-80 shrink-0 flex flex-col gap-6 overflow-y-auto">
          {/* Status Panel */}
          <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
              <Database size={16} className="text-primary" />
              Pipeline Status
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">Extraction</p>
                  <p className="text-xs text-text-muted">Parsed successfully</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">Chunking</p>
                  <p className="text-xs text-text-muted">Fixed-size (512 tokens)</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">Embedding</p>
                  <p className="text-xs text-text-muted">Cerebro X (small)</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">Indexing</p>
                  <p className="text-xs text-text-muted">pgvector & OpenSearch</p>
                </div>
              </div>
            </div>
            
            <button className="w-full mt-6 bg-background border border-border hover:bg-surface-hover text-text-primary text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
              <RefreshCcw size={14} /> Re-run Pipeline
            </button>
          </div>
          
          {/* Metadata Panel */}
          <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
              <Info size={16} className="text-primary" />
              Metadata & Taxonomy
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1.5 block">Domain</label>
                <select className="w-full bg-background border border-border rounded-lg text-sm p-2 text-text-primary focus:outline-none focus:border-primary">
                  <option value="finance">Finance</option>
                  <option value="hr">HR</option>
                  <option value="engineering">Engineering</option>
                  <option value="general">General</option>
                </select>
              </div>
              
              <div>
                <label className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1.5 block">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {DOC.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded border border-primary/20">
                      {tag}
                    </span>
                  ))}
                  <button className="px-2 py-1 bg-background border border-dashed border-border text-text-muted text-xs font-medium rounded hover:text-text-primary hover:border-text-muted transition-colors">
                    + Add
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Access Control */}
          <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
              <Shield size={16} className="text-primary" />
              Governance & Access
            </h3>
            <div className="flex items-center gap-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
              <AlertTriangle size={18} className="text-rose-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-rose-500">Restricted Internal</p>
                <p className="text-xs text-rose-500/80 mt-0.5">Visible only to explicitly authorized groups.</p>
              </div>
            </div>
            <button className="w-full mt-4 bg-background border border-border hover:bg-surface-hover text-text-primary text-sm font-medium py-2 rounded-lg transition-colors">
              Manage Access
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
