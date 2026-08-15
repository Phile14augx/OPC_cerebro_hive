/**
 * Nexarch — Observability: Metrics + Audit Trail
 */
"use client";

import { useEffect, useState } from "react";
import { BarChart3, Clock, Search, TrendingUp, Zap, DollarSign, Bot, Target } from "lucide-react";

export default function ObservabilityPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [events, setEvents]   = useState<any[]>([]);
  const [filter, setFilter]   = useState({ entityType: "", search: "", limit: 50 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter.entityType) params.set("entityType", filter.entityType);
    params.set("limit", String(filter.limit));

    Promise.all([
      fetch("/api/nexarch/metrics").then(r => r.json()),
      fetch(`/api/nexarch/events?${params}`).then(r => r.json()),
    ]).then(([mData, evData]) => {
      setMetrics(mData.data);
      setEvents(evData.data ?? []);
      setLoading(false);
    });
  }, [filter.entityType, filter.limit]);

  const visible = events.filter(ev =>
    !filter.search ||
    ev.action.toLowerCase().includes(filter.search.toLowerCase()) ||
    ev.entityId.toLowerCase().includes(filter.search.toLowerCase()) ||
    ev.actorId.toLowerCase().includes(filter.search.toLowerCase())
  );

  const ENTITY_COLORS: Record<string, string> = {
    agent:    "text-violet-400 bg-violet-900/30",
    instance: "text-blue-400 bg-blue-900/30",
    mission:  "text-emerald-400 bg-emerald-900/30",
    task:     "text-cyan-400 bg-cyan-900/30",
    approval: "text-amber-400 bg-amber-900/30",
    tool:     "text-pink-400 bg-pink-900/30",
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Observability</h1>
        <p className="text-sm text-gray-500">Platform metrics and immutable audit trail</p>
      </div>

      {/* Metrics cards */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-gray-500">Success Rate</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">
              {((metrics.successRate ?? 0) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-500">Total Cost</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">
              ${(metrics.costs?.totalUsd ?? 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-gray-500">Tool Calls</span>
            </div>
            <p className="text-2xl font-bold text-yellow-400">
              {metrics.toolCallsToday ?? 0}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-violet-400" />
              <span className="text-xs text-gray-500">Missions</span>
            </div>
            <p className="text-2xl font-bold text-violet-400">
              {metrics.missions?.total ?? 0}
            </p>
          </div>
        </div>
      )}

      {/* Audit log */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg">
        <div className="flex items-center gap-3 p-4 border-b border-gray-800 flex-wrap">
          <BarChart3 className="w-4 h-4 text-violet-400" />
          <h2 className="text-sm font-semibold text-white flex-1">Audit Trail</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
              <input
                value={filter.search}
                onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
                placeholder="Search events…"
                className="pl-7 pr-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-white placeholder-gray-600 focus:outline-none w-44"
              />
            </div>
            <select
              value={filter.entityType}
              onChange={e => setFilter(f => ({ ...f, entityType: e.target.value }))}
              className="px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-gray-400 focus:outline-none"
            >
              <option value="">All entities</option>
              {["agent","instance","mission","task","approval","tool"].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select
              value={filter.limit}
              onChange={e => setFilter(f => ({ ...f, limit: Number(e.target.value) }))}
              className="px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-gray-400 focus:outline-none"
            >
              <option value={25}>25 rows</option>
              <option value={50}>50 rows</option>
              <option value={100}>100 rows</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-gray-800/50">
          {loading ? (
            <div className="py-8 text-center text-gray-500 text-sm">Loading audit events…</div>
          ) : visible.length === 0 ? (
            <div className="py-8 text-center text-gray-600 text-sm">No events match your filter</div>
          ) : (
            visible.map((ev: any) => (
              <div key={ev.id} className="flex items-start gap-3 px-4 py-2.5 hover:bg-gray-800/30 transition-colors">
                <Clock className="w-3.5 h-3.5 text-gray-700 flex-shrink-0 mt-0.5" />
                <div className="w-[140px] flex-shrink-0">
                  <span className="text-[11px] font-mono text-gray-500">
                    {new Date(ev.createdAt).toLocaleString()}
                  </span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 font-medium ${ENTITY_COLORS[ev.entityType] ?? "text-gray-500 bg-gray-800"}`}>
                  {ev.entityType}
                </span>
                <span className="text-xs text-white font-medium flex-shrink-0 w-[180px] truncate">{ev.action}</span>
                <span className="text-[11px] font-mono text-gray-600 truncate flex-1">{ev.entityId}</span>
                <span className="text-[11px] text-gray-600 flex-shrink-0">{ev.actorId}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
