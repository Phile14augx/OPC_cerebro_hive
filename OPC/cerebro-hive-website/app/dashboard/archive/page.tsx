import React from 'react';
import { FileText, MoreVertical, Filter, CheckCircle2, Clock, AlertCircle, Upload } from 'lucide-react';
import { listDocuments, type DocumentDTO } from '@/app/actions/archive';

// Server Component — renders with real API data.
export default async function ArchivePage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Math.max(1, Number(searchParams?.page ?? '1'));
  const pageSize = 20;

  const result = await listDocuments(page, pageSize);
  const documents: DocumentDTO[] = result.data?.documents ?? [];
  const total = result.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function statusStyle(status: string) {
    if (status === 'indexed') return 'text-green-400';
    if (status === 'failed') return 'text-red-400';
    return 'text-yellow-400';
  }

  function statusDot(status: string) {
    if (status === 'indexed') return 'bg-green-400';
    if (status === 'failed') return 'bg-red-400';
    return 'bg-yellow-400 animate-pulse';
  }

  function statusIcon(status: string) {
    if (status === 'indexed') return <CheckCircle2 size={12} />;
    if (status === 'failed') return <AlertCircle size={12} />;
    return <Clock size={12} />;
  }

  function formatSize(bytes?: number): string {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  function formatDate(iso?: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto h-full flex flex-col animate-fade-in-up">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Document Archive</h1>
          <p className="text-muted text-sm mt-1">
            {total} document{total !== 1 ? 's' : ''} in your knowledge base.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-border/50 rounded-lg text-sm font-medium text-white hover:bg-surface-hover transition-colors">
            <Filter size={16} />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 border border-transparent rounded-lg text-sm font-medium text-white transition-colors">
            <Upload size={16} />
            Upload
          </button>
        </div>
      </div>

      {/* Error State */}
      {result.error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          ⚠ {result.error} — showing cached data if available.
        </div>
      )}

      {/* Data Table */}
      <div className="bg-surface border border-border/50 rounded-xl overflow-hidden flex-1 flex flex-col">
        {documents.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center text-muted">
            <FileText size={48} className="mb-4 text-gray-700" />
            <p className="text-lg font-medium text-white mb-2">No documents yet</p>
            <p className="text-sm mb-6">Upload your first PDF to start building your knowledge base.</p>
            <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">
              <Upload size={16} />
              Upload Document
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-surface-hover border-b border-border/50 text-muted uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-medium">Document Title</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Size</th>
                    <th className="px-6 py-4 font-medium">Added</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-gray-300">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <FileText size={18} className="text-indigo-400 shrink-0" />
                        <span className="font-medium text-white group-hover:text-indigo-300 transition-colors cursor-pointer truncate max-w-xs">
                          {doc.title}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1.5 text-xs font-medium ${statusStyle(doc.status)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusDot(doc.status)}`} />
                          {statusIcon(doc.status)}
                          <span className="capitalize">{doc.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted">{formatSize(doc.size_bytes)}</td>
                      <td className="px-6 py-4 text-muted">{formatDate(doc.created_at)}</td>
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

            {/* Pagination */}
            <div className="mt-auto p-4 border-t border-border/50 flex items-center justify-between text-sm text-muted bg-surface-hover/30">
              <p>
                Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total} documents
              </p>
              <div className="flex gap-2">
                <a
                  href={`/dashboard/archive?page=${page - 1}`}
                  aria-disabled={page <= 1}
                  className={`px-3 py-1 rounded border border-border/50 hover:bg-surface-hover ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`}
                >
                  Previous
                </a>
                <a
                  href={`/dashboard/archive?page=${page + 1}`}
                  aria-disabled={page >= totalPages}
                  className={`px-3 py-1 rounded border border-border/50 hover:bg-surface-hover ${page >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
                >
                  Next
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
