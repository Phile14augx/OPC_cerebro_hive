"use client";

import React, { useState } from "react";
import { useCollections, useDocuments } from "@/lib/platform/hooks";
import { platformApi, type KnowledgeCollection, type KnowledgeDocument } from "@/lib/platform/api-client";
import { DataTable, type Column } from "@/components/platform/DataTable";
import { StatusBadge } from "@/components/platform/StatusBadge";
import { SearchBar } from "@/components/platform/SearchBar";

// ── Create collection modal ───────────────────────────────────────────────────

interface CreateCollectionModalProps {
  onClose:   () => void;
  onCreated: () => void;
}

function CreateCollectionModal({ onClose, onCreated }: CreateCollectionModalProps) {
  const [name, setName]           = useState("");
  const [description, setDesc]    = useState("");
  const [embeddingModel, setEmb]  = useState("text-embedding-3-small");
  const [submitting, setSubmit]   = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmit(true);
    setError(null);
    try {
      await platformApi.knowledge.collections.create({ name: name.trim(), description, embeddingModel });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create collection");
      setSubmit(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">New Collection</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-300 transition-colors">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-400">Name *</label>
            <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Product Documentation"
              className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white
                         placeholder-neutral-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-400">Description</label>
            <textarea value={description} onChange={e => setDesc(e.target.value)} rows={2}
              placeholder="What knowledge is in this collection?"
              className="w-full resize-none rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white
                         placeholder-neutral-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-400">Embedding Model</label>
            <select value={embeddingModel} onChange={e => setEmb(e.target.value)}
              className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white
                         outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30">
              <option value="text-embedding-3-small">text-embedding-3-small (1536d)</option>
              <option value="text-embedding-3-large">text-embedding-3-large (3072d)</option>
              <option value="text-embedding-ada-002">text-embedding-ada-002 (1536d)</option>
            </select>
          </div>
          {error && <p className="rounded-lg border border-red-900 bg-red-950 px-3 py-2 text-sm text-red-400">{error}</p>}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-neutral-800 px-4 py-2 text-sm font-medium text-neutral-400
                         hover:border-neutral-700 hover:text-neutral-300 transition-colors">Cancel</button>
            <button type="submit" disabled={!name.trim() || submitting}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white
                         hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {submitting ? "Creating…" : "Create Collection"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Documents panel ───────────────────────────────────────────────────────────

function DocumentsPanel({ collection }: { collection: KnowledgeCollection }) {
  const [uploading, setUploading] = useState(false);
  const { items: docs, loading, refresh } = useDocuments(collection.id);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const text = await file.text();
      await platformApi.knowledge.documents.create(collection.id, {
        title:    file.name,
        content:  text,
        mimeType: file.type || "text/plain",
      });
      refresh();
    } catch { /* noop */ }
    finally { setUploading(false); e.target.value = ""; }
  };

  const DOC_COLUMNS: Column<KnowledgeDocument>[] = [
    {
      key:    "title",
      header: "Document",
      render: (doc) => (
        <div>
          <p className="font-medium text-white">{doc.title}</p>
          {doc.sourceUrl && <p className="mt-0.5 max-w-xs truncate text-xs text-neutral-500">{doc.sourceUrl}</p>}
        </div>
      ),
    },
    {
      key:    "status",
      header: "Status",
      render: (doc) => <StatusBadge status={doc.status} />,
      className: "whitespace-nowrap",
    },
    {
      key:    "chunks",
      header: "Chunks",
      render: (doc) => <span className="text-xs text-neutral-500">{(doc.chunkCount ?? 0).toLocaleString()}</span>,
      className: "whitespace-nowrap",
    },
    {
      key:    "mimeType",
      header: "Type",
      render: (doc) => (
        <span className="rounded border border-neutral-800 bg-neutral-900 px-1.5 py-0.5 font-mono text-xs text-neutral-400">
          {doc.mimeType?.split("/")[1] ?? "—"}
        </span>
      ),
    },
    {
      key:    "updatedAt",
      header: "Indexed",
      render: (doc) => (
        <span className="text-xs text-neutral-500">
          {new Date(doc.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </span>
      ),
      className: "whitespace-nowrap",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">{collection.name}</h3>
        <label className={`cursor-pointer rounded-lg border border-neutral-800 px-3 py-1.5 text-xs font-medium
                           text-neutral-400 transition-colors hover:border-neutral-700 hover:text-neutral-300 ${uploading ? "opacity-50" : ""}`}>
          {uploading ? "Uploading…" : "+ Upload"}
          <input type="file" accept=".txt,.md,.pdf,.html,.csv,.json" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>
      <DataTable<KnowledgeDocument>
        columns={DOC_COLUMNS}
        data={docs}
        loading={loading}
        rowKey={d => d.id}
        empty={<p className="text-sm text-neutral-500">No documents — upload one to start indexing.</p>}
      />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function KnowledgePage() {
  const [search, setSearch]             = useState("");
  const [selectedId, setSelectedId]     = useState<string | null>(null);
  const [showModal, setModal]           = useState(false);

  const { items: collections, loading, error, refresh, total } = useCollections();

  const selected = collections.find(c => c.id === selectedId) ?? null;

  const COLLECTION_COLUMNS: Column<KnowledgeCollection>[] = [
    {
      key:    "name",
      header: "Collection",
      render: (col) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
                          border border-neutral-800 bg-neutral-800/60 text-sm text-neutral-400">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
            </svg>
          </div>
          <div>
            <p className="font-medium text-white">{col.name}</p>
            {col.description && <p className="mt-0.5 max-w-xs truncate text-xs text-neutral-500">{col.description}</p>}
          </div>
        </div>
      ),
    },
    {
      key:    "docs",
      header: "Documents",
      render: (col) => <span className="text-sm text-neutral-400">{(col.documentCount ?? 0).toLocaleString()}</span>,
      className: "whitespace-nowrap",
    },
    {
      key:    "embeddingModel",
      header: "Embedding Model",
      render: (col) => <span className="font-mono text-xs text-neutral-500">{col.embeddingModel}</span>,
    },
    {
      key:    "dimensions",
      header: "Dimensions",
      render: (col) => <span className="text-xs text-neutral-500">{col.dimensions ?? "—"}</span>,
      className: "whitespace-nowrap",
    },
    {
      key:    "updatedAt",
      header: "Updated",
      render: (col) => (
        <span className="text-xs text-neutral-500">
          {new Date(col.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
        </span>
      ),
      className: "whitespace-nowrap",
    },
  ];

  const filteredCollections = search
    ? collections.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : collections;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Knowledge</h1>
          {total > 0 && <p className="mt-0.5 text-sm text-neutral-500">{total} collections</p>}
        </div>
        <button
          onClick={() => setModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm
                     font-medium text-white hover:bg-indigo-500 transition-colors"
        >
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z"/>
          </svg>
          New Collection
        </button>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search collections…" className="max-w-sm" />

      {error && (
        <div className="rounded-xl border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-400">
          {error} <button onClick={refresh} className="ml-3 underline hover:no-underline">Retry</button>
        </div>
      )}

      {/* Collections table */}
      <DataTable<KnowledgeCollection>
        columns={COLLECTION_COLUMNS}
        data={filteredCollections}
        loading={loading}
        rowKey={c => c.id}
        onRowClick={c => setSelectedId(selectedId === c.id ? null : c.id)}
        empty={
          <div className="flex flex-col items-center gap-3">
            <svg className="h-10 w-10 text-neutral-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-sm text-neutral-500">
              {search ? "No collections match your search." : "No knowledge collections yet."}
            </p>
            {!search && (
              <button onClick={() => setModal(true)} className="text-sm text-indigo-400 underline hover:no-underline">
                Create your first collection
              </button>
            )}
          </div>
        }
      />

      {/* Expanded documents panel */}
      {selected && (
        <div className="rounded-xl border border-indigo-900 bg-indigo-950/20 p-5">
          <DocumentsPanel collection={selected} />
        </div>
      )}

      {showModal && (
        <CreateCollectionModal
          onClose={() => setModal(false)}
          onCreated={() => { setModal(false); refresh(); }}
        />
      )}
    </div>
  );
}
