"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useExecution, useExecutionStream } from "@/lib/platform/hooks";
import { platformApi } from "@/lib/platform/api-client";
import { StatusBadge } from "@/components/platform/StatusBadge";

// ── Step event types ──────────────────────────────────────────────────────────

interface StepEvent {
  stepId:    string;
  stepType:  string;
  status:    "running" | "completed" | "failed" | "skipped";
  output?:   unknown;
  error?:    string;
  durationMs?: number;
}

interface LogEntry {
  ts:    number;
  event: string;
  data:  unknown;
}

// ── Step timeline ─────────────────────────────────────────────────────────────

function StepTimeline({ events, isLive }: { events: LogEntry[]; isLive: boolean }) {
  const stepEvents = events.filter(e => ["step_completed", "step_failed", "step_started"].includes(e.event));

  if (stepEvents.length === 0 && !isLive) {
    return <p className="py-4 text-center text-sm text-neutral-500">No step events</p>;
  }

  return (
    <div className="relative flex flex-col">
      {/* Vertical line */}
      <div className="absolute left-[15px] top-5 bottom-5 w-px bg-neutral-800" />

      {stepEvents.map((entry, i) => {
        const step = entry.data as Partial<StepEvent>;
        const isCompleted = entry.event === "step_completed";
        const isFailed    = entry.event === "step_failed";

        return (
          <div key={i} className="relative flex gap-4 py-2">
            {/* Dot */}
            <div className={`relative z-10 mt-1 flex h-[30px] w-[30px] shrink-0 items-center justify-center
                             rounded-full border ${
              isCompleted ? "border-emerald-800 bg-emerald-950" :
              isFailed    ? "border-red-800 bg-red-950" :
                            "border-blue-800 bg-blue-950"
            }`}>
              {isCompleted ? (
                <svg className="h-3.5 w-3.5 text-emerald-400" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M12.416 3.376a.75.75 0 011.208.888L7.55 13.265a.75.75 0 01-1.167.087L2.76 9.73a.75.75 0 111.08-1.044l2.908 3.008 5.668-8.318z"/>
                </svg>
              ) : isFailed ? (
                <svg className="h-3.5 w-3.5 text-red-400" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M5.28 4.22a.75.75 0 00-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 101.06 1.06L8 9.06l2.72 2.72a.75.75 0 101.06-1.06L9.06 8l2.72-2.72a.75.75 0 00-1.06-1.06L8 6.94 5.28 4.22z"/>
                </svg>
              ) : (
                <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
              )}
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-white text-sm">{step.stepId ?? "unknown"}</p>
                <span className="rounded border border-neutral-800 bg-neutral-900 px-1.5 py-0.5 font-mono text-xs text-neutral-500">
                  {step.stepType ?? entry.event}
                </span>
                {step.durationMs != null && (
                  <span className="text-xs text-neutral-600">
                    {step.durationMs < 1000
                      ? `${step.durationMs}ms`
                      : `${(step.durationMs / 1000).toFixed(2)}s`}
                  </span>
                )}
              </div>
              {step.error && (
                <p className="mt-1 rounded border border-red-900 bg-red-950/40 px-2 py-1 font-mono text-xs text-red-400">
                  {step.error}
                </p>
              )}
              {step.output != null && isCompleted && (
                <details className="mt-1 group">
                  <summary className="cursor-pointer text-xs text-neutral-500 hover:text-neutral-400 list-none flex items-center gap-1">
                    <svg className="h-3 w-3 transition-transform group-open:rotate-90" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M4.5 3L7.5 6L4.5 9"/>
                    </svg>
                    Output
                  </summary>
                  <pre className="mt-1 overflow-auto rounded border border-neutral-800 bg-neutral-950 p-2 font-mono text-xs text-neutral-300">
                    {JSON.stringify(step.output, null, 2)}
                  </pre>
                </details>
              )}
            </div>

            <time className="shrink-0 pt-0.5 text-xs text-neutral-600">
              {new Date(entry.ts).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </time>
          </div>
        );
      })}

      {isLive && stepEvents.length > 0 && (
        <div className="relative flex items-center gap-3 py-2 pl-10">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
          <span className="text-xs text-neutral-500">Waiting for next step…</span>
        </div>
      )}
    </div>
  );
}

// ── Raw log ───────────────────────────────────────────────────────────────────

function RawLog({ entries }: { entries: LogEntry[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries.length]);

  return (
    <div className="h-64 overflow-auto rounded-xl border border-neutral-800 bg-neutral-950 p-4 font-mono text-xs">
      {entries.length === 0 ? (
        <p className="text-neutral-600">No events yet…</p>
      ) : (
        entries.map((e, i) => (
          <div key={i} className="mb-1 flex gap-3">
            <time className="shrink-0 text-neutral-600">
              {new Date(e.ts).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </time>
            <span className={`shrink-0 font-semibold ${
              e.event.includes("fail") || e.event.includes("error") ? "text-red-400" :
              e.event.includes("complet")                           ? "text-emerald-400" :
                                                                      "text-blue-400"
            }`}>
              {e.event}
            </span>
            <span className="text-neutral-400 break-all">{JSON.stringify(e.data)}</span>
          </div>
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ExecutionViewerPage() {
  const router              = useRouter();
  const { id: workflowId, execId } = useParams<{ id: string; execId: string }>();
  const [activeTab, setTab] = useState<"timeline" | "raw" | "output">("timeline");
  const [cancelling, setCancelling] = useState(false);

  const { execution, loading: execLoading } = useExecution(execId);
  const { events, connected }               = useExecutionStream(
    execution && !["COMPLETED", "FAILED", "CANCELLED"].includes(execution.status) ? execId : null,
  );

  // Merge SSE events into log entries with timestamps
  const logEntries: LogEntry[] = events.map(e => ({
    ts:    Date.now(),
    event: e.event,
    data:  e.data,
  }));

  const isTerminal   = execution && ["COMPLETED", "FAILED", "CANCELLED"].includes(execution.status);
  const isLive       = !isTerminal && connected;

  const handleCancel = async () => {
    if (!confirm("Cancel this execution?")) return;
    setCancelling(true);
    try { await platformApi.workflows.cancelExecution(execId); } catch { /* noop */ }
    finally { setCancelling(false); }
  };

  const duration = (execution?.startedAt != null) && execution?.completedAt
    ? ((new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime()) / 1000).toFixed(2) + "s"
    : null;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-neutral-500">
        <button onClick={() => router.push("/studio/workflows")} className="hover:text-neutral-300 transition-colors">
          Workflows
        </button>
        <span>/</span>
        <button onClick={() => router.push(`/studio/workflows/${workflowId}`)} className="hover:text-neutral-300 transition-colors">
          {workflowId.slice(0, 8)}…
        </button>
        <span>/</span>
        <span className="text-white">Execution</span>
      </div>

      {execLoading ? (
        <div className="flex flex-col gap-4">
          <div className="h-8 w-48 animate-pulse rounded bg-neutral-800" />
          <div className="h-24 animate-pulse rounded-xl bg-neutral-800/60" />
        </div>
      ) : execution ? (
        <>
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-mono text-lg font-semibold text-white">{execId.slice(0, 12)}…</h1>
                <StatusBadge status={execution.status} size="md" />
                {isLive && (
                  <span className="flex items-center gap-1.5 text-xs text-blue-400">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
                    Live
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-4 text-xs text-neutral-500">
                <span>Trigger: <span className="text-neutral-300">{execution.triggerType ?? "manual"}</span></span>
                {execution.startedAt && (
                  <span>Started: <span className="text-neutral-300">
                    {new Date(execution.startedAt).toLocaleString()}
                  </span></span>
                )}
                {duration && (
                  <span>Duration: <span className="text-neutral-300">{duration}</span></span>
                )}
              </div>
            </div>
            {!isTerminal && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="rounded-lg border border-red-900 bg-red-950 px-4 py-2 text-sm font-medium text-red-400
                           hover:bg-red-900 disabled:opacity-50 transition-colors"
              >
                {cancelling ? "Cancelling…" : "Cancel"}
              </button>
            )}
          </div>

          {/* Input */}
          {execution.input != null && (
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-semibold uppercase tracking-widest text-neutral-500 hover:text-neutral-400">
                <svg className="h-3 w-3 transition-transform group-open:rotate-90" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M4 2l4 4-4 4"/>
                </svg>
                Input
              </summary>
              <pre className="mt-2 overflow-auto rounded-xl border border-neutral-800 bg-neutral-950 p-4 font-mono text-xs text-neutral-300">
                {JSON.stringify(execution.input, null, 2)}
              </pre>
            </details>
          )}

          {/* Tab switcher */}
          <div>
            <div className="mb-4 flex items-center gap-1 rounded-xl border border-neutral-800 bg-neutral-900/40 p-1 w-fit">
              {(["timeline", "raw", "output"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setTab(tab)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? "bg-neutral-800 text-white"
                      : "text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === "timeline" && (
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
                <StepTimeline events={logEntries} isLive={!!isLive} />
                {logEntries.length === 0 && !isLive && (
                  <p className="py-4 text-center text-sm text-neutral-500">
                    {isTerminal ? "No step events were captured." : "Waiting for execution to start…"}
                  </p>
                )}
              </div>
            )}

            {activeTab === "raw" && (
              <RawLog entries={logEntries} />
            )}

            {activeTab === "output" && (
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                {execution.output != null ? (
                  <pre className="overflow-auto font-mono text-xs text-neutral-300">
                    {JSON.stringify(execution.output, null, 2)}
                  </pre>
                ) : (
                  <p className="text-center text-sm text-neutral-500">
                    {isTerminal ? "No output was produced." : "Output will appear when execution completes."}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Error display */}
          {execution.error && (
            <div className="rounded-xl border border-red-900 bg-red-950/30 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-red-400">Error</p>
              <pre className="overflow-auto font-mono text-xs text-red-300">{
                typeof execution.error === "string"
                  ? execution.error
                  : JSON.stringify(execution.error, null, 2)
              }</pre>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-neutral-800 p-8 text-center">
          <p className="text-sm text-neutral-500">Execution not found.</p>
        </div>
      )}
    </div>
  );
}
