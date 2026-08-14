/**
 * Nexarch — Agent Detail Page
 * Tabs: Overview | Instances | Tools | Permissions | Audit
 */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bot, ArrowLeft, Activity, Wrench, ShieldCheck, History,
  Play, Pause, Square, AlertTriangle, ChevronRight, Clock,
} from "lucide-react";

type Tab = "overview" | "instances" | "tools" | "permissions" | "audit";

const LIFECYCLE_COLORS: Record<string, string> = {
  running:    "text-emerald-400 bg-emerald-900/30 border-emerald-800",
  queued:     "text-yellow-400 bg-yellow-900/30 border-yellow-800",
  paused:     "text-gray-400 bg-gray-800 border-gray-700",
  failed:     "text-red-400 bg-red-900/30 border-red-800",
  terminated: "text-gray-600 bg-gray-900 border-gray-800",
  completed:  "text-blue-400 bg-blue-900/30 border-blue-800",
  quarantined:"text-orange-400 bg-orange-900/30 border-orange-800",
  initializing:"text-violet-400 bg-violet-900/30 border-violet-800",
};

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [agent, setAgent]   = useState<any>(null);
  const [tab, setTab]       = useState<Tab>("overview");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/nexarch/agents/${id}`).then(r => r.json()),
      fetch(`/api/nexarch/events?entityType=agent&entityId=${id}`).then(r => r.json()),
    ]).then(([aData, evData]) => {
      setAgent(aData.data);
      setEvents(evData.data ?? []);
      setLoading(false);
    });
  }, [id]);

  const handleLifecycle = async (instanceId: string, action: string) => {
    await fetch(`/api/nexarch/agents/${id}/lifecycle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instanceId, action }),
    });
    const res = await fetch(`/api/nexarch/agents/${id}`);
    const data = await res.json();
    setAgent(data.data);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="w-5 h-5 text-violet-400 animate-spin mr-2" />
        <span className="text-gray-500">Loading agent…</span>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Agent not found</p>
        <Link href="/nexarch/agents" className="text-violet-400 text-sm mt-2 block">← Back to registry</Link>
      </div>
    );
  }

  const instances: any[] = agent.instances ?? [];
  const running = instances.filter((i: any) => ["running", "queued", "initializing"].includes(i.state));

  const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "overview",   label: "Overview",    icon: Bot         },
    { id: "instances",  label: "Instances",   icon: Activity    },
    { id: "tools",      label: "Tools",       icon: Wrench      },
    { id: "permissions",label: "Permissions", icon: ShieldCheck },
    { id: "audit",      label: "Audit",       icon: History     },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/nexarch/agents" className="hover:text-white flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Agents
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-white">{agent.name}</span>
      </div>

      {/* Hero */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            running.length > 0 ? "bg-emerald-900/50" : "bg-gray-800"
          }`}>
            <Bot className={`w-6 h-6 ${running.length > 0 ? "text-emerald-400" : "text-gray-500"}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-lg font-bold text-white">{agent.name}</h1>
              <span className="text-xs px-2 py-0.5 bg-gray-800 border border-gray-700 text-gray-400 rounded">
                v{agent.version}
              </span>
              {agent.isDeprecated && (
                <span className="text-xs px-2 py-0.5 bg-gray-900 border border-gray-700 text-gray-600 rounded">
                  deprecated
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-1">{agent.description}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span>Owner: <span className="text-gray-300">{agent.owner}</span></span>
              <span>Type: <span className="text-gray-300">{agent.type}</span></span>
              <span>Risk: <span className={`font-medium ${
                agent.riskLevel === "critical" ? "text-red-400" :
                agent.riskLevel === "high" ? "text-orange-400" :
                agent.riskLevel === "medium" ? "text-yellow-400" : "text-emerald-400"
              }`}>{agent.riskLevel}</span></span>
              <span>Trust: <span className="text-gray-300">{agent.trustLevel}/100</span></span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">Active instances</p>
            <p className="text-2xl font-bold text-white">{running.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-800">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors border-b-2 -mb-px ${
              tab === t.id
                ? "border-violet-500 text-white"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      {tab === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Model Policy</h3>
              <dl className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Preferred model</dt>
                  <dd className="text-gray-300 font-mono">{agent.modelPolicy?.preferredModel ?? "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Max context</dt>
                  <dd className="text-gray-300">{(agent.modelPolicy?.maxContextTokens ?? 0).toLocaleString()} tokens</dd>
                </div>
              </dl>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Default Budget</h3>
              <dl className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Token budget</dt>
                  <dd className="text-gray-300">{(agent.defaultBudget?.tokenBudget ?? 0).toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Cost budget</dt>
                  <dd className="text-gray-300">${(agent.defaultBudget?.costBudgetUsd ?? 0).toFixed(2)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Period</dt>
                  <dd className="text-gray-300">{agent.defaultBudget?.period ?? "mission"}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Capabilities</h3>
            <div className="flex flex-wrap gap-2">
              {(agent.capabilities ?? []).map((cap: string) => (
                <span key={cap} className="text-xs px-2 py-1 bg-violet-900/30 border border-violet-800 text-violet-300 rounded">
                  {cap}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-white mb-2">Purpose</h3>
            <p className="text-sm text-gray-400">{agent.purpose}</p>
          </div>
        </div>
      )}

      {tab === "instances" && (
        <div className="space-y-2">
          {instances.length === 0 ? (
            <div className="py-8 text-center text-gray-600">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No instances recorded</p>
            </div>
          ) : (
            instances.map((inst: any) => (
              <div key={inst.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-xs font-mono text-gray-500">{inst.id}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded border ${LIFECYCLE_COLORS[inst.state] ?? "text-gray-500"}`}>
                        {inst.state}
                      </span>
                      {inst.missionId && (
                        <Link href={`/nexarch/missions/${inst.missionId}`} className="text-xs text-violet-400 hover:underline">
                          Mission →
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {inst.state === "running" && (
                      <button
                        onClick={() => handleLifecycle(inst.id, "pause")}
                        className="p-1.5 rounded hover:bg-gray-800 text-yellow-500 hover:text-yellow-400 transition-colors"
                        title="Pause"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    )}
                    {inst.state === "paused" && (
                      <button
                        onClick={() => handleLifecycle(inst.id, "resume")}
                        className="p-1.5 rounded hover:bg-gray-800 text-emerald-500 hover:text-emerald-400 transition-colors"
                        title="Resume"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                    {!["completed", "terminated", "quarantined"].includes(inst.state) && (
                      <button
                        onClick={() => handleLifecycle(inst.id, "terminate")}
                        className="p-1.5 rounded hover:bg-gray-800 text-red-500 hover:text-red-400 transition-colors"
                        title="Terminate"
                      >
                        <Square className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3 text-xs">
                  <div>
                    <p className="text-gray-600">Tokens used</p>
                    <p className="text-gray-300">{(inst.usage?.tokensUsed ?? 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Cost</p>
                    <p className="text-gray-300">${(inst.usage?.costUsd ?? 0).toFixed(4)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Priority</p>
                    <p className="text-gray-300">{inst.priority ?? 500}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "tools" && (
        <div>
          <div className="flex flex-wrap gap-2">
            {(agent.toolPermissions ?? []).map((toolId: string) => (
              <span key={toolId} className="text-xs px-2 py-1 bg-gray-900 border border-gray-800 text-gray-300 rounded font-mono">
                {toolId}
              </span>
            ))}
            {(agent.toolPermissions ?? []).length === 0 && (
              <p className="text-gray-600 text-sm">No tools assigned to this agent definition.</p>
            )}
          </div>
        </div>
      )}

      {tab === "permissions" && (
        <div className="space-y-3">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-violet-400" /> Capability Grants
            </h3>
            <div className="space-y-1">
              {(agent.capabilities ?? []).map((cap: string) => (
                <div key={cap} className="flex items-center gap-2 text-xs py-1 border-b border-gray-800 last:border-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-gray-300 font-mono">{cap}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "audit" && (
        <div className="space-y-2">
          {events.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-6">No audit events</p>
          ) : (
            events.map((ev: any) => (
              <div key={ev.id} className="flex items-start gap-3 text-xs bg-gray-900 border border-gray-800 rounded p-3">
                <Clock className="w-3.5 h-3.5 text-gray-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-gray-500">{new Date(ev.createdAt).toLocaleString()}</span>
                    <span className="px-1 py-0.5 bg-gray-800 text-violet-400 rounded">{ev.action}</span>
                    <span className="text-gray-600">by {ev.actorId}</span>
                  </div>
                  {ev.details && Object.keys(ev.details).length > 0 && (
                    <pre className="mt-1 text-gray-600 font-mono whitespace-pre-wrap text-[10px]">
                      {JSON.stringify(ev.details, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
