"use client";

import React, { useState, useEffect, useRef } from "react";
import { MetricTile } from "@/components/platform/MetricTile";
import { SearchBar }  from "@/components/platform/SearchBar";
import { useEventStream } from "@/lib/platform/hooks";
import type { NatsEvent } from "@/lib/platform/api-client";

const DOMAIN_COLORS: Record<string, { dot: string; badge: string }> = {
  workflow:  { dot: "bg-indigo-400",  badge: "border-indigo-900 bg-indigo-950 text-indigo-400" },
  agent:     { dot: "bg-purple-400",  badge: "border-purple-900 bg-purple-950 text-purple-400" },
  knowledge: { dot: "bg-cyan-400",    badge: "border-cyan-900 bg-cyan-950 text-cyan-400" },
  ai:        { dot: "bg-amber-400",   badge: "border-amber-900 bg-amber-950 text-amber-400" },
  billing:   { dot: "bg-emerald-400", badge: "border-emerald-900 bg-emerald-950 text-emerald-400" },
  audit:     { dot: "bg-neutral-400", badge: "border-neutral-700 bg-neutral-800 text-neutral-300" },
  security:  { dot: "bg-red-400",     badge: "border-red-900 bg-red-950 text-red-400" },
};

const DOMAINS = Object.keys(DOMAIN_COLORS);

function EventRow({ event, selected, onClick }: { event: NatsEvent; selected: boolean; onClick: () => void }) {
  const colors = DOMAIN_COLORS[event.domain] ?? { dot: "bg-neutral-400", badge: "border-neutral-700 bg-neutral-800 text-neutral-400" };
  return (
    <div
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-3 border-b border-neutral-800/60 px-4 py-2.5 transition-colors hover:bg-neutral-800/40 last:border-0 ${selected ? "bg-neutral-800/60" : ""}`}
    >
      <div className={`h-2 w-2 shrink-0 rounded-full ${colors.dot}`} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-xs text-white">{event.subject}</p>
      </div>
      <span className={`shrink-0 rounded border px-1.5 py-0.5 text-xs capitalize ${colors.badge}`}>{event.domain}</span>
      <span className="shrink-0 font-mono text-xs text-neutral-600">#{event.sequence}</span>
      <time className="shrink-0 text-xs text-neutral-600">
        {new Date(event.timestamp).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
      </time>
    </div>
  );
}

export default function EventsPage() {
  const [paused, setPaused]         = useState(false);
  const [search, setSearch]         = useState("");
  const [domainFilter, setDomain]   = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const bottomRef                   = useRef<HTMLDivElement>(null);

  const { events, connected, error, clear } = useEventStream({
    paused,
    domain: domainFilter || undefined,
    search: search       || undefined,
  });

  useEffect(() => {
    if (autoScroll && !paused) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events.length, autoScroll, paused]);

  const selected = events.find(e => e.id === selectedId) ?? null;
  const eventsByDomain = DOMAINS.reduce<Record<string, number>>((acc, d) => {
    acc[d] = events.filter(e => e.domain === d).length;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Event Stream</h1>
          <p className="mt-0.5 text-sm text-neutral-500">Live NATS JetStream events — {events.length} buffered</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <div className={`h-2 w-2 rounded-full ${connected ? "bg-emerald-400 animate-pulse" : "bg-red-500"}`} />
            <span className={connected ? "text-emerald-400" : "text-red-400"}>{connected ? "Connected" : error ?? "Disconnected"}</span>
          </div>
          <button onClick={clear} className="rounded-lg border border-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-300 transition-colors">Clear</button>
          <button onClick={() => setPaused(p => !p)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${paused ? "bg-indigo-600 text-white hover:bg-indigo-500" : "border border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-300"}`}>
            {paused ? "▶ Resume" : "⏸ Pause"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 lg:grid-cols-7">
        {DOMAINS.map(d => (
          <button key={d} onClick={() => setDomain(domainFilter === d ? "" : d)}
            className={`rounded-xl border p-3 text-left transition-all ${domainFilter === d ? "border-indigo-700 bg-indigo-950/30" : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-700"}`}>
            <div className={`mb-1 h-2 w-2 rounded-full ${DOMAIN_COLORS[d]?.dot ?? "bg-neutral-400"}`} />
            <p className="text-xs capitalize text-neutral-400">{d}</p>
            <p className="font-mono text-sm font-bold text-white">{eventsByDomain[d] ?? 0}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Filter by subject…" className="flex-1 max-w-xs" />
        {connected && !paused && (
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span>Live stream active</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/40">
          <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">{events.length.toLocaleString()} events</p>
            <label className="flex cursor-pointer items-center gap-1.5 text-xs text-neutral-500">
              <input type="checkbox" checked={autoScroll} onChange={e => setAutoScroll(e.target.checked)} className="rounded border-neutral-700" />
              Auto-scroll
            </label>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            {events.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-sm text-neutral-500">{paused ? "Stream paused." : "Connecting to NATS event stream…"}</p>
              </div>
            )}
            {events.map(event => (
              <EventRow key={event.id} event={event} selected={selectedId === event.id} onClick={() => setSelectedId(selectedId === event.id ? null : event.id)} />
            ))}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40">
          {selected ? (
            <div className="p-4">
              <div className="mb-3 flex items-start justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Event Detail</p>
                <button onClick={() => setSelectedId(null)} className="text-neutral-600 hover:text-neutral-400">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor"><path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"/></svg>
                </button>
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-xs text-neutral-600">Subject</p>
                  <code className="mt-0.5 block break-all font-mono text-xs text-indigo-300">{selected.subject}</code>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-xs text-neutral-600">Sequence</p><p className="font-mono text-sm text-white">#{selected.sequence}</p></div>
                  <div><p className="text-xs text-neutral-600">Domain</p><p className="mt-0.5 capitalize text-sm text-white">{selected.domain}</p></div>
                </div>
                <div><p className="text-xs text-neutral-600">Timestamp</p><p className="text-xs text-white">{new Date(selected.timestamp).toISOString()}</p></div>
                <div>
                  <p className="mb-1 text-xs text-neutral-600">Payload</p>
                  <pre className="overflow-auto rounded-lg border border-neutral-800 bg-neutral-950 p-3 font-mono text-xs text-neutral-300">{JSON.stringify(selected.payload, null, 2)}</pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[200px] items-center justify-center">
              <p className="text-sm text-neutral-600">Select an event to inspect</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
