/**
 * Nexarch Command Center — dashboard home
 * Live stats pulled from /api/nexarch/metrics + SSE stream for real-time updates
 */
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Bot, Target, CheckSquare, AlertTriangle, Zap, DollarSign,
  ShieldAlert, Activity, Clock, TrendingUp, RefreshCw, ArrowRight,
} from "lucide-react";

interface Metrics {
  agents: { total: number; active: number; idle: number; failed: number };
  missions: { total: number; running: number; completed: number; failed: number };
  tasks: { total: number; running: number; pending: number; completed: number; failed: number };
  approvals: { pending: number };
  costs: { totalUsd: number; todayUsd: number };
  policyViolations: number;
  toolCallsToday: number;
  successRate: number;
}

function StatCard({
  label, value, sub, icon: Icon, color, href,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string; href?: string;
}) {
  const inner = (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
        </div>
        <Icon className={`w-5 h-5 mt-1 ${color} opacity-60`} />
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    running: "bg-emerald-400 animate-pulse",
    queued:  "bg-yellow-400",
    paused:  "bg-gray-500",
    failed:  "bg-red-500",
    completed: "bg-blue-400",
    pending: "bg-gray-600",
  };
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${colors[status] ?? "bg-gray-600"}`} />
  );
}

export default function CommandCenterPage() {
  const [metrics, setMetrics]     = useState<Metrics | null>(null);
  const [agents, setAgents]       = useState<any[]>([]);
  const [missions, setMissions]   = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [events, setEvents]       = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const refresh = useCallback(async () => {
    try {
      const [mRes, aRes, msRes, aprRes, evRes] = await Promise.all([
        fetch("/api/nexarch/metrics"),
        fetch("/api/nexarch/agents"),
        fetch("/api/nexarch/missions?status=running"),
        fetch("/api/nexarch/approvals?status=pending"),
        fetch("/api/nexarch/events?limit=8"),
      ]);
      const [mData, aData, msData, aprData, evData] = await Promise.all([
        mRes.json(), aRes.json(), msRes.json(), aprRes.json(), evRes.json(),
      ]);
      if (mData.data)   setMetrics(mData.data);
      if (aData.data)   setAgents(aData.data.slice(0, 6));
      if (msData.data)  setMissions(msData.data.slice(0, 4));
      if (aprData.data) setApprovals(aprData.data);
      if (evData.data)  setEvents(evData.data.slice(0, 8));
      setLastUpdated(new Date());
    } catch (err) {
      console.error("metrics fetch error", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    // SSE stream for live updates
    const es = new EventSource("/api/nexarch/stream");
    es.addEventListener("metrics", (e) => {
      const d = JSON.parse(e.data);
      setMetrics(d);
      setLastUpdated(new Date());
    });
    es.addEventListener("approvals", (e) => {
      const d = JSON.parse(e.data);
      setApprovals(d.pending ?? []);
    });
    return () => es.close();
  }, [refresh]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Activity className="w-6 h-6 text-violet-400 animate-spin" />
        <span className="ml-2 text-gray-400">Loading command center…</span>
      </div>
    );
  }

  const m = metrics;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Command Center</h1>
          <p className="text-sm text-gray-500 mt-0.5">Real-time view of your AI workforce</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600">
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
          <button
            onClick={refresh}
            className="p-1.5 rounded hover:bg-gray-800 text-gray-500 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Active Agents" value={m?.agents.active ?? 0}
          sub={`${m?.agents.total ?? 0} total`}
          icon={Bot} color="text-violet-400" href="/nexarch/agents"
        />
        <StatCard
          label="Running Missions" value={m?.missions.running ?? 0}
          sub={`${m?.missions.completed ?? 0} completed`}
          icon={Target} color="text-emerald-400" href="/nexarch/missions"
        />
        <StatCard
          label="Pending Approvals" value={m?.approvals.pending ?? 0}
          sub={approvals.length > 0 ? "Action required" : "All clear"}
          icon={CheckSquare}
          color={approvals.length > 0 ? "text-amber-400" : "text-gray-400"}
          href="/nexarch/approvals"
        />
        <StatCard
          label="Today's Cost" value={`$${(m?.costs.todayUsd ?? 0).toFixed(2)}`}
          sub={`$${(m?.costs.totalUsd ?? 0).toFixed(2)} total`}
          icon={DollarSign} color="text-blue-400"
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Tasks Running" value={m?.tasks.running ?? 0}
          sub={`${m?.tasks.pending ?? 0} pending`}
          icon={Activity} color="text-cyan-400"
        />
        <StatCard
          label="Success Rate" value={`${((m?.successRate ?? 0) * 100).toFixed(1)}%`}
          sub="Last 24 hours" icon={TrendingUp} color="text-emerald-400"
        />
        <StatCard
          label="Tool Calls Today" value={m?.toolCallsToday ?? 0}
          sub="Across all agents" icon={Zap} color="text-yellow-400"
        />
        <StatCard
          label="Policy Violations" value={m?.policyViolations ?? 0}
          sub="Flagged actions" icon={ShieldAlert}
          color={(m?.policyViolations ?? 0) > 0 ? "text-red-400" : "text-gray-500"}
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Active missions */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Running Missions</h2>
            <Link href="/nexarch/missions" className="text-xs text-violet-400 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {missions.length === 0 ? (
            <p className="text-sm text-gray-600 py-4 text-center">No active missions</p>
          ) : (
            <div className="space-y-2">
              {missions.map((mission: any) => (
                <Link
                  key={mission.id}
                  href={`/nexarch/missions/${mission.id}`}
                  className="block p-3 bg-gray-800/50 rounded hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <StatusDot status={mission.status} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{mission.title}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{mission.objective}</p>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-700 text-gray-400 rounded">
                      {mission.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Approval queue */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Approval Queue</h2>
            <Link href="/nexarch/approvals" className="text-xs text-violet-400 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {approvals.length === 0 ? (
            <div className="py-6 text-center">
              <CheckSquare className="w-8 h-8 text-gray-700 mx-auto mb-2" />
              <p className="text-xs text-gray-600">No pending approvals</p>
            </div>
          ) : (
            <div className="space-y-2">
              {approvals.slice(0, 5).map((apr: any) => (
                <div key={apr.id} className="p-3 bg-gray-800/50 rounded border border-amber-900/30">
                  <div className="flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" />
                    <span className="text-xs font-medium text-white truncate">{apr.agentName}</span>
                    <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      apr.riskLevel === "critical" ? "bg-red-900/50 text-red-400" :
                      apr.riskLevel === "high"     ? "bg-orange-900/50 text-orange-400" :
                      "bg-yellow-900/50 text-yellow-400"
                    }`}>{apr.riskLevel}</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{apr.action}</p>
                  <Link
                    href="/nexarch/approvals"
                    className="mt-2 block text-center text-xs py-1 bg-violet-700 hover:bg-violet-600 rounded text-white transition-colors"
                  >
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Agent roster + event log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Agent roster */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Agent Roster</h2>
            <Link href="/nexarch/agents" className="text-xs text-violet-400 hover:underline flex items-center gap-1">
              Registry <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-1">
            {agents.map((agent: any) => (
              <Link
                key={agent.id}
                href={`/nexarch/agents/${agent.id}`}
                className="flex items-center gap-2 p-2 rounded hover:bg-gray-800 transition-colors"
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  agent.instances?.some((i: any) => i.state === "running")
                    ? "bg-emerald-400 animate-pulse"
                    : "bg-gray-600"
                }`} />
                <span className="text-sm text-gray-300 flex-1 truncate">{agent.name}</span>
                <span className="text-[10px] text-gray-600">{agent.type}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  agent.riskLevel === "critical" ? "bg-red-900/50 text-red-400" :
                  agent.riskLevel === "high"     ? "bg-orange-900/50 text-orange-400" :
                  agent.riskLevel === "medium"   ? "bg-yellow-900/50 text-yellow-400" :
                  "bg-gray-800 text-gray-500"
                }`}>{agent.riskLevel}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Audit event log */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Recent Events</h2>
            <Link href="/nexarch/observability" className="text-xs text-violet-400 hover:underline flex items-center gap-1">
              Full log <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-1.5">
            {events.length === 0 ? (
              <p className="text-xs text-gray-600 text-center py-4">No events yet</p>
            ) : (
              events.map((ev: any) => (
                <div key={ev.id} className="flex items-start gap-2 text-xs">
                  <Clock className="w-3 h-3 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-gray-500 font-mono">
                      {new Date(ev.createdAt).toLocaleTimeString()}
                    </span>
                    <span className="mx-1.5 text-gray-700">·</span>
                    <span className="text-violet-400">{ev.entityType}</span>
                    <span className="mx-1.5 text-gray-700">·</span>
                    <span className="text-gray-300">{ev.action}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
