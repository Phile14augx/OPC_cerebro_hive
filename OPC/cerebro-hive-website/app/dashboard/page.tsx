import React from 'react';
import Link from 'next/link';
import { Search, Sparkles, FileText, AlertCircle, CheckCircle2, Clock, Database } from 'lucide-react';
import { getDashboardStats, getRecentDocuments, type DocumentDTO } from '@/app/actions/archive';

// Server Component — runs on the server, fetches real data.
export default async function DashboardOverview() {
  // Parallel data fetching
  const [statsResult, recentResult] = await Promise.all([
    getDashboardStats(),
    getRecentDocuments(4),
  ]);

  const stats = statsResult.data ?? { total: 0, indexed: 0, processing: 0, failed: 0 };
  const recentDocs: DocumentDTO[] = recentResult.data ?? [];

  function relativeTime(isoDate?: string): string {
    if (!isoDate) return 'Unknown';
    const diff = Date.now() - new Date(isoDate).getTime();
    const hours = Math.floor(diff / 3_600_000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

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
          <Link
            href="/dashboard/chat"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <Search size={18} />
            Search
          </Link>
        </div>
      </section>

      {/* 2. Live Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface rounded-xl p-6 border border-border/50 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted">Awaiting Processing</h3>
            <Clock size={16} className="text-yellow-500" />
          </div>
          <div>
            <p className="text-3xl font-bold text-white mb-1">{stats.processing}</p>
            <p className="text-sm text-yellow-500">Documents in ingestion queue</p>
          </div>
        </div>

        <div className="bg-surface rounded-xl p-6 border border-border/50 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted">Indexed Documents</h3>
            <CheckCircle2 size={16} className="text-green-500" />
          </div>
          <div>
            <p className="text-3xl font-bold text-white mb-1">{stats.indexed}</p>
            <p className="text-sm text-green-500">Fully searchable knowledge</p>
          </div>
        </div>

        <div className="bg-surface rounded-xl p-6 border border-border/50 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted">Ingestion Issues</h3>
            <AlertCircle size={16} className="text-red-500" />
          </div>
          <div>
            <p className="text-3xl font-bold text-white mb-1">{stats.failed}</p>
            <p className="text-sm text-red-400">
              {stats.failed === 0 ? 'No failures — all clear' : 'Documents requiring attention'}
            </p>
          </div>
        </div>
      </section>

      {/* 3. Recent Documents & AI Conversations */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Documents */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recently Added</h2>
            <Link href="/dashboard/archive" className="text-sm text-indigo-400 hover:text-indigo-300">
              View all ({stats.total})
            </Link>
          </div>
          
          <div className="bg-surface border border-border/50 rounded-xl overflow-hidden">
            {recentDocs.length === 0 ? (
              <div className="p-10 text-center text-muted">
                <FileText size={32} className="mx-auto mb-3 text-gray-600" />
                <p className="text-sm">No documents yet. Upload your first document to get started.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border/50">
                {recentDocs.map((doc) => (
                  <li key={doc.id} className="p-4 hover:bg-surface-hover transition-colors flex items-center gap-4 cursor-pointer">
                    <div className={`p-2 rounded-lg ${
                      doc.status === 'indexed' ? 'bg-indigo-500/10 text-indigo-400' :
                      doc.status === 'failed'  ? 'bg-red-500/10 text-red-400' :
                      'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{doc.title}</p>
                      <div className="flex items-center gap-3 text-xs text-muted mt-1">
                        <span className="flex items-center gap-1">
                          {doc.status === 'indexed' 
                            ? <CheckCircle2 size={12} className="text-green-400" /> 
                            : doc.status === 'failed'
                            ? <AlertCircle size={12} className="text-red-400" />
                            : <Clock size={12} />}
                          <span className="capitalize">{doc.status}</span>
                        </span>
                        {doc.size_bytes && (
                          <>
                            <span>•</span>
                            <span>{(doc.size_bytes / 1024 / 1024).toFixed(1)} MB</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{relativeTime(doc.created_at)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
          <div className="bg-surface border border-border/50 rounded-xl p-4 space-y-3">
            <Link href="/dashboard/archive" className="block group">
              <div className="p-3 rounded-lg border border-transparent group-hover:border-border/50 group-hover:bg-surface-hover transition-colors">
                <div className="flex items-center gap-3">
                  <Database size={16} className="text-indigo-400" />
                  <div>
                    <p className="text-sm text-white font-medium group-hover:text-indigo-400 transition-colors">Browse Archive</p>
                    <p className="text-xs text-muted">{stats.total} total documents</p>
                  </div>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/chat" className="block group">
              <div className="p-3 rounded-lg border border-transparent group-hover:border-border/50 group-hover:bg-surface-hover transition-colors">
                <div className="flex items-center gap-3">
                  <Sparkles size={16} className="text-purple-400" />
                  <div>
                    <p className="text-sm text-white font-medium group-hover:text-purple-400 transition-colors">AI Research Chat</p>
                    <p className="text-xs text-muted">Ask questions about your documents</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
