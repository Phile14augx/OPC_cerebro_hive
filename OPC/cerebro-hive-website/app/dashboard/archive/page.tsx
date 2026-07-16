'use client';

import React from 'react';
import { FileText, MoreVertical, Filter, Download, Trash2, Tag } from 'lucide-react';

const MOCK_ARCHIVE = [
  { id: '1', title: 'Attention Is All You Need', authors: 'Vaswani et al.', year: 2017, type: 'PDF', status: 'Indexed' },
  { id: '2', title: 'Q3 Enterprise Architecture Review', authors: 'Internal', year: 2026, type: 'PDF', status: 'Indexed' },
  { id: '3', title: 'Retrieval-Augmented Generation for Knowledge-Intensive Tasks', authors: 'Lewis et al.', year: 2020, type: 'PDF', status: 'Indexed' },
  { id: '4', title: 'Semantic Search Whitepaper v2', authors: 'Data Team', year: 2026, type: 'DOCX', status: 'Processing' },
  { id: '5', title: 'Security Audit & PII Compliance', authors: 'SecOps', year: 2025, type: 'PDF', status: 'Failed' },
];

export default function ArchivePage() {
  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto h-full flex flex-col animate-fade-in-up">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Document Archive</h1>
          <p className="text-muted text-sm mt-1">Manage and organize your ingested knowledge base.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-border/50 rounded-lg text-sm font-medium text-white hover:bg-surface-hover transition-colors">
            <Filter size={16} />
            Filter
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-surface border border-border/50 rounded-xl overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-hover border-b border-border/50 text-muted uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Document Title</th>
                <th className="px-6 py-4 font-medium">Authors / Source</th>
                <th className="px-6 py-4 font-medium">Year</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-gray-300">
              {MOCK_ARCHIVE.map((doc) => (
                <tr key={doc.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <FileText size={18} className="text-indigo-400" />
                    <span className="font-medium text-white group-hover:text-indigo-300 transition-colors cursor-pointer">{doc.title}</span>
                  </td>
                  <td className="px-6 py-4">{doc.authors}</td>
                  <td className="px-6 py-4">{doc.year}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-surface-hover rounded text-xs font-medium border border-border/50">{doc.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 text-xs font-medium
                      ${doc.status === 'Indexed' ? 'text-green-400' : 
                        doc.status === 'Processing' ? 'text-yellow-400' : 'text-red-400'}
                    `}>
                      <span className={`w-1.5 h-1.5 rounded-full 
                        ${doc.status === 'Indexed' ? 'bg-green-400' : 
                          doc.status === 'Processing' ? 'bg-yellow-400 animate-pulse' : 'bg-red-400'}
                      `} />
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-500 hover:text-white transition-colors p-1">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="mt-auto p-4 border-t border-border/50 flex items-center justify-between text-sm text-muted bg-surface-hover/30">
          <p>Showing 1 to 5 of 42 documents</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded border border-border/50 hover:bg-surface-hover disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 rounded border border-border/50 hover:bg-surface-hover">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
