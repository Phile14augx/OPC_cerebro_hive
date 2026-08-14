/**
 * Nexarch — Mission Detail: timeline, tasks, agents, events
 */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Target, ArrowLeft, ChevronRight, Clock, Bot, Zap,
  CheckCircle, XCircle, Loader, Activity, DollarSign,
} from "lucide-react";

const TASK_STATUS_ICON: Record<string, React.ReactNode> = {
  completed: <CheckCircle className="w-4 h-4 text-emerald-400" />,
  failed:    <XCircle className="w-4 h-4 text-red-400" />,
  running:   <Loader className="w-4 h-4 text-violet-400 animate-spin" />,
  pending:   <div className="w-4 h-4 rounded-full border-2 border-gray-700" />,
  cancelled: <div className="w-4 h-4 rounded-full bg-gray-700" />,
};

const TASK_PRIORITY_COLOR: Record<string, string> = {
  critical:   "text-red-400",
  high:       "text-orange-400",
  normal:     "text-gray-400",
  low:        "text-gray-600",
  background: "text-gray-700",
};

export default function MissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [mission, setMission]   = useState<any>(null);
  const [events, setEvents]     = useState<any[]>([]);
  const [tasks, setTasks]       = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState<"timeline"|"tasks"|"agents">("timeline");

  useEffect(() => {
    Promise.all([
      fetch(`/api/nexarch/missions/${id}`).then(r => r.json()),
      fetch(`/api/nexarch/missions/${id}/events`).then(r => r.json()),
      fetch(`/api/nexarch/tasks?missionId=${id}`).then(r => r.json()),
    ]).then(([mData, evData, tData]) => {
      setMission(mData.data);
      setEvents((evData.data ?? []).sort((a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ));
      setTasks(tData.data ?? []);
      setLoading(false);
    });
  }, [id]);

  const handleAction = async (action: string) => {
    await fetch(`/api/nexarch/missions/${id}`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ action }),
    });
    const res = await fetch(`/api/nexarch/missions/${id}`);
    setMission((await res.json()).data);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Activity className="w-5 h-5 text-violet-400 animate-spin mr-2" />
      <span className="text-gray-500">Loading mission…</span>
    </div>
  );
  if (!mission) return (
    <div className="p-6 text-center text-gray-500">
      Mission not found. <Link href="/nexarch/missions" className="text-violet-400">← Back</Link>
    </div>
  );

  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const runningTasks   = tasks.filter(t => t.status === "running").length;
  const progress       = tasks.length > 0 ? completedTasks / tasks.length : 0;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/nexarch/missions" className="hover:text-white flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Missions
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-white truncate">{mission.title}</span>
      </div>

      {/* Hero */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-violet-900/50 flex items-center justify-center flex-shrink-0">
            <Target className="w-5 h-5 text-violet-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-lg font-bold text-white">{mission.title}</h1>
              <span className={`text-xs px-2 py-0.5 rounded border font-medium ${
                mission.status === "running"   ? "bg-emerald-900/40 text-emerald-400 border-emerald-800" :
                mission.status === "completed" ? "bg-blue-900/40 text-blue-400 border-blue-800" :
                mission.status === "failed"    ? "bg-red-900/40 text-red-400 border-red-800" :
                "bg-gray-800 text-gray-400 border-gray-700"
              }`}>{mission.status}</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">{mission.objective}</p>

            {/* Progress */}
            {tasks.length > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>{completedTasks}/{tasks.length} tasks</span>
                  <span>{Math.round(progress * 100)}%</span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full transition-all"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-800">
          <div className="text-center">
            <p className="text-lg font-bold text-white">{tasks.length}</p>
            <p className="text-xs text-gray-600">Tasks</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-400">{runningTasks}</p>
            <p className="text-xs text-gray-600">Running</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-white">{mission.assignedAgentIds?.length ?? 0}</p>
            <p className="text-xs text-gray-600">Agents</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-blue-400">${(mission.costAccruedUsd ?? 0).toFixed(2)}</p>
            <p className="text-xs text-gray-600">Cost</p>
          </div>
        </div>

        {/* Actions */}
        {!["completed","failed","cancelled"].includes(mission.status) && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-800">
            {mission.status === "draft" && (
              <button onClick={() => handleAction("start")}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 rounded text-sm text-white transition-colors">
                Start Mission
              </button>
            )}
            {mission.status === "running" && (
              <button onClick={() => handleAction("pause")}
                className="px-3 py-1.5 bg-yellow-700 hover:bg-yellow-600 rounded text-sm text-white transition-colors">
                Pause
              </button>
            )}
            {mission.status === "paused" && (
              <button onClick={() => handleAction("resume")}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 rounded text-sm text-white transition-colors">
                Resume
              </button>
            )}
            <button onClick={() => handleAction("cancel")}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-sm text-gray-400 hover:text-white transition-colors">
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-800">
        {(["timeline","tasks","agents"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm transition-colors border-b-2 -mb-px capitalize ${
              tab === t ? "border-violet-500 text-white" : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {tab === "timeline" && (
        <div className="relative pl-6">
          <div className="absolute left-2.5 top-0 bottom-0 w-px bg-gray-800" />
          {events.length === 0 ? (
            <p className="text-gray-600 text-sm py-4">No events recorded</p>
          ) : (
            events.map((ev: any, idx: number) => (
              <div key={ev.eventId ?? idx} className="relative mb-4 last:mb-0">
                <div className="absolute -left-4 w-3 h-3 rounded-full bg-gray-700 border border-gray-600 top-1" />
                <div className="bg-gray-900 border border-gray-800 rounded p-3">
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="w-3 h-3 text-gray-600" />
                    <span className="text-gray-500 font-mono">{new Date(ev.createdAt).toLocaleString()}</span>
                    <span className="px-1.5 py-0.5 bg-gray-800 text-violet-400 rounded text-[10px]">{ev.type}</span>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">{ev.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tasks */}
      {tab === "tasks" && (
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-6">No tasks in this mission</p>
          ) : (
            tasks.map((task: any) => (
              <div key={task.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {TASK_STATUS_ICON[task.status] ?? <div className="w-4 h-4 rounded-full border border-gray-700" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-white">{task.name}</span>
                      <span className={`text-[10px] font-medium ${TASK_PRIORITY_COLOR[task.priority] ?? "text-gray-500"}`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{task.objective}</p>
                    {task.assignedAgentId && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                        <Bot className="w-3 h-3" /> {task.assignedAgentId}
                      </div>
                    )}
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded border flex-shrink-0 ${
                    task.status === "completed" ? "bg-emerald-900/30 text-emerald-400 border-emerald-800" :
                    task.status === "running"   ? "bg-violet-900/30 text-violet-400 border-violet-800" :
                    task.status === "failed"    ? "bg-red-900/30 text-red-400 border-red-800" :
                    "bg-gray-800 text-gray-500 border-gray-700"
                  }`}>{task.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Agents */}
      {tab === "agents" && (
        <div className="space-y-2">
          {(mission.assignedAgentIds ?? []).length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-6">No agents assigned</p>
          ) : (
            (mission.assignedAgentIds ?? []).map((agentId: string) => (
              <Link
                key={agentId}
                href={`/nexarch/agents/${agentId}`}
                className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-lg p-3 hover:border-gray-700 transition-colors"
              >
                <Bot className="w-4 h-4 text-violet-400" />
                <span className="text-sm text-gray-300 font-mono">{agentId}</span>
                <ChevronRight className="w-4 h-4 text-gray-700 ml-auto" />
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
