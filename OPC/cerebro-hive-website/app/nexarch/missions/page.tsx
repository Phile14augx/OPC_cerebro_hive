/**
 * Nexarch — Mission Control
 */
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Target, Plus, Search, Clock, Bot, ChevronRight, Activity } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  draft:     "bg-gray-800 text-gray-400 border-gray-700",
  planning:  "bg-violet-900/40 text-violet-400 border-violet-800",
  running:   "bg-emerald-900/40 text-emerald-400 border-emerald-800",
  paused:    "bg-yellow-900/40 text-yellow-400 border-yellow-800",
  completed: "bg-blue-900/40 text-blue-400 border-blue-800",
  failed:    "bg-red-900/40 text-red-400 border-red-800",
  cancelled: "bg-gray-900 text-gray-600 border-gray-800",
};

const STATUS_DOT: Record<string, string> = {
  running:  "bg-emerald-400 animate-pulse",
  planning: "bg-violet-400",
  paused:   "bg-yellow-400",
  completed:"bg-blue-400",
  failed:   "bg-red-400",
  draft:    "bg-gray-600",
};

export default function MissionsPage() {
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [status, setStatus]     = useState("");
  const [search, setSearch]     = useState("");
  const [creating, setCreating] = useState(false);
  const [newMission, setNewMission] = useState({ title: "", objective: "", description: "" });

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    const res = await fetch(`/api/nexarch/missions?${params}`);
    const data = await res.json();
    setMissions(data.data ?? []);
    setLoading(false);
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/nexarch/missions", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newMission, submittedBy: "user" }),
    });
    if (res.ok) {
      setCreating(false);
      setNewMission({ title: "", objective: "", description: "" });
      load();
    }
  };

  const visible = missions.filter(m =>
    !search || m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.objective.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    running:   missions.filter(m => m.status === "running").length,
    planning:  missions.filter(m => m.status === "planning").length,
    completed: missions.filter(m => m.status === "completed").length,
    failed:    missions.filter(m => m.status === "failed").length,
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Mission Control</h1>
          <p className="text-sm text-gray-500">{missions.length} total missions</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-violet-700 hover:bg-violet-600 rounded text-sm text-white transition-colors"
        >
          <Plus className="w-4 h-4" /> New Mission
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Running",   count: counts.running,   color: "text-emerald-400" },
          { label: "Planning",  count: counts.planning,  color: "text-violet-400" },
          { label: "Completed", count: counts.completed, color: "text-blue-400" },
          { label: "Failed",    count: counts.failed,    color: "text-red-400" },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-xs text-gray-600 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Create form */}
      {creating && (
        <div className="bg-gray-900 border border-violet-900 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-white mb-3">New Mission</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Title *</label>
              <input
                required
                value={newMission.title}
                onChange={e => setNewMission(m => ({ ...m, title: e.target.value }))}
                className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-violet-500"
                placeholder="Mission title"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Objective *</label>
              <textarea
                required
                rows={2}
                value={newMission.objective}
                onChange={e => setNewMission(m => ({ ...m, objective: e.target.value }))}
                className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-violet-500 resize-none"
                placeholder="What do you want to achieve?"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-violet-700 hover:bg-violet-600 rounded text-sm text-white transition-colors"
              >
                Create Mission
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search missions…"
            className="w-full pl-8 pr-3 py-1.5 bg-gray-900 border border-gray-800 rounded text-sm text-white placeholder-gray-600 focus:outline-none"
          />
        </div>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="px-2.5 py-1.5 bg-gray-900 border border-gray-800 rounded text-sm text-gray-400 focus:outline-none"
        >
          <option value="">All statuses</option>
          {["draft","planning","running","paused","completed","failed","cancelled"].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Mission list */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Activity className="w-5 h-5 text-violet-400 animate-spin mr-2" />
          <span className="text-gray-500">Loading missions…</span>
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map((mission: any) => {
            const tasks: any[] = mission.tasks ?? [];
            const done  = tasks.filter((t: any) => t.status === "completed").length;
            const total = tasks.length;
            const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <Link
                key={mission.id}
                href={`/nexarch/missions/${mission.id}`}
                className="block bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${STATUS_DOT[mission.status] ?? "bg-gray-700"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-white">{mission.title}</h3>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${STATUS_COLORS[mission.status]}`}>
                        {mission.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{mission.objective}</p>

                    {/* Progress bar */}
                    {total > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-violet-500 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-600">{done}/{total} tasks</span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                      {mission.assignedAgentIds?.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Bot className="w-3 h-3" />
                          {mission.assignedAgentIds.length} agent{mission.assignedAgentIds.length !== 1 ? "s" : ""}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(mission.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-gray-500 mt-1 flex-shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {!loading && visible.length === 0 && (
        <div className="py-12 text-center">
          <Target className="w-12 h-12 text-gray-800 mx-auto mb-3" />
          <p className="text-gray-500">No missions found</p>
        </div>
      )}
    </div>
  );
}
