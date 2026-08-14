/**
 * Nexarch — Agent Registry
 */
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Bot, Search, Filter, Plus, ChevronRight, Activity } from "lucide-react";

const RISK_COLORS: Record<string, string> = {
  critical: "bg-red-900/40 text-red-400 border-red-800",
  high:     "bg-orange-900/40 text-orange-400 border-orange-800",
  medium:   "bg-yellow-900/40 text-yellow-400 border-yellow-800",
  low:      "bg-emerald-900/40 text-emerald-400 border-emerald-800",
};

const TYPE_COLORS: Record<string, string> = {
  planner:     "text-violet-400",
  executor:    "text-blue-400",
  reviewer:    "text-cyan-400",
  monitor:     "text-green-400",
  specialist:  "text-yellow-400",
  coordinator: "text-pink-400",
};

export default function AgentsPage() {
  const [agents, setAgents]     = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterRisk, setFilterRisk] = useState("");

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (filterType) params.set("type", filterType);
    if (filterRisk) params.set("riskLevel", filterRisk);
    const res = await fetch(`/api/nexarch/agents?${params}`);
    const data = await res.json();
    setAgents(data.data ?? []);
    setLoading(false);
  }, [filterType, filterRisk]);

  useEffect(() => { load(); }, [load]);

  const visible = agents.filter(a =>
    !search ||
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Agent Registry</h1>
          <p className="text-sm text-gray-500">
            {agents.length} registered agent{agents.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-violet-700 hover:bg-violet-600 rounded text-sm text-white transition-colors">
          <Plus className="w-4 h-4" /> New Agent
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search agents…"
            className="w-full pl-8 pr-3 py-1.5 bg-gray-900 border border-gray-800 rounded text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500"
          />
        </div>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-2.5 py-1.5 bg-gray-900 border border-gray-800 rounded text-sm text-gray-400 focus:outline-none"
        >
          <option value="">All types</option>
          {["planner","executor","reviewer","monitor","specialist","coordinator"].map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          value={filterRisk}
          onChange={e => setFilterRisk(e.target.value)}
          className="px-2.5 py-1.5 bg-gray-900 border border-gray-800 rounded text-sm text-gray-400 focus:outline-none"
        >
          <option value="">All risk levels</option>
          {["low","medium","high","critical"].map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* Agent grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Activity className="w-5 h-5 text-violet-400 animate-spin mr-2" />
          <span className="text-gray-500">Loading agents…</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {visible.map((agent: any) => {
            const instances: any[] = agent.instances ?? [];
            const running = instances.filter((i: any) => i.state === "running").length;
            const isActive = running > 0;
            return (
              <Link
                key={agent.id}
                href={`/nexarch/agents/${agent.id}`}
                className="block bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 hover:bg-gray-900/80 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isActive ? "bg-emerald-900/50" : "bg-gray-800"
                  }`}>
                    <Bot className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-gray-500"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white truncate">{agent.name}</h3>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                      )}
                    </div>
                    <p className={`text-xs ${TYPE_COLORS[agent.type] ?? "text-gray-500"}`}>
                      {agent.type}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                </div>

                <p className="text-xs text-gray-500 mt-2 line-clamp-2">{agent.description}</p>

                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${RISK_COLORS[agent.riskLevel] ?? "bg-gray-800 text-gray-500 border-gray-700"}`}>
                    {agent.riskLevel} risk
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-gray-800 border border-gray-700 text-gray-400 rounded">
                    v{agent.version}
                  </span>
                  {running > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-emerald-900/40 border border-emerald-800 text-emerald-400 rounded">
                      {running} running
                    </span>
                  )}
                  {agent.isDeprecated && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-800 border border-gray-700 text-gray-600 rounded">
                      deprecated
                    </span>
                  )}
                </div>

                <div className="mt-2 flex gap-1 flex-wrap">
                  {(agent.capabilities ?? []).slice(0, 3).map((cap: string) => (
                    <span key={cap} className="text-[9px] px-1 py-0.5 bg-violet-900/30 text-violet-400 rounded">
                      {cap}
                    </span>
                  ))}
                  {(agent.capabilities ?? []).length > 3 && (
                    <span className="text-[9px] text-gray-600">
                      +{agent.capabilities.length - 3} more
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {!loading && visible.length === 0 && (
        <div className="py-12 text-center">
          <Bot className="w-12 h-12 text-gray-800 mx-auto mb-3" />
          <p className="text-gray-500">No agents found</p>
          <p className="text-xs text-gray-700 mt-1">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
