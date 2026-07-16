'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Sparkles, FileText, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export default function DashboardOverview() {
  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10 animate-fade-in-up">
      
      {/* 1. Global AI Search Hero */}
      <section className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50" />
        <div className="relative bg-surface border border-border/50 rounded-2xl p-2 flex items-center shadow-2xl">
          <div className="pl-4 pr-3 text-indigo-400">
            <Sparkles size={24} />
          </div>
          <input 
            type="text" 
            placeholder="Ask anything about your archive... (e.g. 'What did the Q3 report say about latency?')" 
            className="flex-1 bg-transparent border-none text-white text-lg placeholder-gray-500 focus:outline-none focus:ring-0 py-4"
          />
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2">
            <Search size={18} />
            Search
          </button>
        </div>
      </section>

      {/* 2. Actionable Metrics (Knowledge Base Health) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface rounded-xl p-6 border border-border/50 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted">Awaiting Processing</h3>
            <Clock size={16} className="text-yellow-500" />
          </div>
          <div>
            <p className="text-3xl font-bold text-white mb-1">12</p>
            <p className="text-sm text-yellow-500">Documents in ingestion queue</p>
          </div>
        </div>

        <div className="bg-surface rounded-xl p-6 border border-border/50 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted">Active Embeddings</h3>
            <CheckCircle2 size={16} className="text-green-500" />
          </div>
          <div>
            <p className="text-3xl font-bold text-white mb-1">45,281</p>
            <p className="text-sm text-green-500">Vector chunks indexed</p>
          </div>
        </div>

        <div className="bg-surface rounded-xl p-6 border border-border/50 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted">Ingestion Issues</h3>
            <AlertCircle size={16} className="text-red-500" />
          </div>
          <div>
            <p className="text-3xl font-bold text-white mb-1">2</p>
            <p className="text-sm text-red-400">PDF parsing failures</p>
          </div>
        </div>
      </section>

      {/* 3. Recent Documents & Activity Split */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Documents */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recently Added</h2>
            <Link href="/dashboard/archive" className="text-sm text-indigo-400 hover:text-indigo-300">
              View all
            </Link>
          </div>
          
          <div className="bg-surface border border-border/50 rounded-xl overflow-hidden">
            <ul className="divide-y divide-border/50">
              {[
                { title: 'Q3 Enterprise Architecture Review.pdf', status: 'Indexed', time: '2 hours ago', size: '2.4 MB' },
                { title: 'Semantic Search Whitepaper v2.docx', status: 'Processing', time: '5 hours ago', size: '1.1 MB' },
                { title: 'Database Schema Migration Plan.md', status: 'Indexed', time: 'Yesterday', size: '45 KB' },
                { title: 'Client Feedback Q2 Interviews.pdf', status: 'Indexed', time: 'Yesterday', size: '3.8 MB' },
              ].map((doc, i) => (
                <li key={i} className="p-4 hover:bg-surface-hover transition-colors flex items-center gap-4 cursor-pointer">
                  <div className={`p-2 rounded-lg ${doc.status === 'Processing' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-indigo-500/10 text-indigo-400'}`}>
                    <FileText size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{doc.title}</p>
                    <div className="flex items-center gap-3 text-xs text-muted mt-1">
                      <span className="flex items-center gap-1">
                        {doc.status === 'Processing' ? <Clock size={12}/> : <CheckCircle2 size={12}/>}
                        {doc.status}
                      </span>
                      <span>•</span>
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span>{doc.time}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recent AI Conversations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Chats</h2>
          </div>
          
          <div className="bg-surface border border-border/50 rounded-xl p-4 space-y-4">
            {[
              { query: "Summarize the Q3 latency issues", context: "2 sources" },
              { query: "What is our policy on data retention?", context: "Security Manual" },
              { query: "List all dependencies for the new API", context: "Architecture docs" }
            ].map((chat, i) => (
              <Link href="/dashboard/chat" key={i} className="block group">
                <div className="p-3 rounded-lg border border-transparent group-hover:border-border/50 group-hover:bg-surface-hover transition-colors">
                  <p className="text-sm text-white font-medium line-clamp-2 mb-1 group-hover:text-indigo-400 transition-colors">"{chat.query}"</p>
                  <p className="text-xs text-muted flex items-center gap-1">
                    <Database size={12} /> {chat.context}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
