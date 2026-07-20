"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  FileText, Search, Plus, Filter, 
  MoreVertical, File, Download, Trash2, 
  RefreshCcw, FolderOpen, ArrowUpRight
} from "lucide-react";

const DUMMY_DOCS = [
  { id: "1", title: "Q3 Earnings Report", type: "pdf", domain: "finance", status: "indexed", chunks: 142, date: "2026-07-15" },
  { id: "2", title: "API v2 Documentation", type: "md", domain: "engineering", status: "indexed", chunks: 85, date: "2026-07-18" },
  { id: "3", title: "Employee Handbook 2026", type: "docx", domain: "hr", status: "processing", chunks: 0, date: "2026-07-19" },
  { id: "4", title: "Competitor Analysis - Acme Corp", type: "pdf", domain: "strategy", status: "indexed", chunks: 312, date: "2026-07-10" },
  { id: "5", title: "Architecture Decision Record (ADR-042)", type: "md", domain: "engineering", status: "failed", chunks: 0, date: "2026-07-20" },
];

export default function DocumentBrowserPage() {
  const [search, setSearch] = useState("");
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "indexed": return <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded text-xs font-medium">Indexed</span>;
      case "processing": return <span className="px-2 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded text-xs font-medium flex items-center gap-1"><RefreshCcw size={10} className="animate-spin" /> Processing</span>;
      case "failed": return <span className="px-2 py-1 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded text-xs font-medium">Failed</span>;
      default: return <span className="px-2 py-1 bg-surface-hover text-text-muted rounded text-xs">Pending</span>;
    }
  };

  return (
    <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
      <div className="flex items-center gap-2 text-sm text-text-muted mb-4 font-medium">
        <Link href="/archive" className="hover:text-primary transition-colors">Archive</Link>
        <span className="text-border">/</span>
        <span className="text-text-primary">Documents</span>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight font-space flex items-center gap-3">
            <FolderOpen className="w-8 h-8 text-blue-500" />
            Document Browser
          </h1>
          <p className="text-text-muted mt-2 text-sm">
            Manage enterprise knowledge assets, track ingestion pipelines, and configure access.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="bg-surface hover:bg-surface-hover border border-border text-text-primary px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
            <Filter size={18} />
            Filter
          </button>
          <button className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm shadow-primary/20">
            <Plus size={18} />
            Upload File
          </button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-text-muted" />
            </div>
            <input
              type="text"
              className="w-full bg-background border border-border text-text-primary rounded-lg py-2 pl-9 pr-4 focus:outline-none focus:border-primary text-sm transition-colors"
              placeholder="Search documents by title or domain..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="text-sm text-text-muted font-medium">
            Showing 5 of 12,453 documents
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-background/50">
                <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider font-space">Name</th>
                <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider font-space">Domain</th>
                <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider font-space">Status</th>
                <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider font-space">Chunks</th>
                <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider font-space">Added</th>
                <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider font-space text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {DUMMY_DOCS.map((doc) => (
                <tr key={doc.id} className="hover:bg-surface-hover transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-background border border-border flex items-center justify-center shrink-0">
                        <File className="w-4 h-4 text-text-muted" />
                      </div>
                      <div>
                        <Link href={`/archive/documents/${doc.id}`} className="font-medium text-text-primary hover:text-primary transition-colors flex items-center gap-1">
                          {doc.title}
                          <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <p className="text-xs text-text-muted uppercase mt-0.5">{doc.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-background border border-border rounded text-xs font-medium text-text-primary capitalize">
                      {doc.domain}
                    </span>
                  </td>
                  <td className="p-4">{getStatusBadge(doc.status)}</td>
                  <td className="p-4 text-sm text-text-muted font-mono">{doc.chunks}</td>
                  <td className="p-4 text-sm text-text-muted">{doc.date}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded transition-colors" title="Download Source">
                        <Download size={16} />
                      </button>
                      <button className="p-1.5 text-text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                      <button className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-hover rounded transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="p-4 border-t border-border flex items-center justify-between bg-background/50">
          <button className="px-3 py-1 text-sm text-text-muted border border-border rounded hover:bg-surface transition-colors disabled:opacity-50" disabled>Previous</button>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-white text-sm font-medium">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface text-text-muted text-sm font-medium transition-colors">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface text-text-muted text-sm font-medium transition-colors">3</button>
            <span className="text-text-muted">...</span>
          </div>
          <button className="px-3 py-1 text-sm text-text-primary border border-border rounded hover:bg-surface transition-colors">Next</button>
        </div>
      </div>
    </div>
  );
}
