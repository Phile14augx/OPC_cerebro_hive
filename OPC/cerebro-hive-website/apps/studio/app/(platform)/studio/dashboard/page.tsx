"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useWorkflows, useAgents, useCollections, useAIUsage, useAdminStats } from "@/lib/platform/hooks";
import { MetricTile } from "@/components/platform/MetricTile";
import { StatusBadge } from "@/components/platform/StatusBadge";

function SectionHeader({ title, href }: { title: string; href?: string }) {
  const router = useRouter();
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">{title}</h2>
      {href && (
        <button onClick={() => router.push(href)} className="text-xs text-indigo-400 hover:text-indigo-300">
          View all →
        </button>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  const now   = new Date();
  const from  = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const to    = now.toISOString();

  const { items: workflows, loading: wfLoading }       = useWorkflows({ limit: 5 });
  const { items: agents, loading: agentLoading }        = useAgents({ limit: 5 });
  const { items: collections, loading: colLoading }     = useCollections();
  const { usage, loading: usageLoading }                = useAIUsage({ from, to });
  const { stats, loading: statsLoading }                = useAdminStats();

  const publishedWfs = workflows.filter(w => w.status === "PUBLISHED").length;
  const activeAgents = agents.filter(a => a.status === "ACTIVE").length;
  const totalDocs    = collections.reduce((sum, c) => sum + (c.documentCount ?? 0), 0);

  return (
    <div className="flex flex-col gap-8 p-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-0.5 text-sm text-neutral-500">
          {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricTile
          label="Published Workflows"
          value={statsLoading ? "—" : String(stats?.workflows.published ?? publishedWfs)}
          sub="this org"
          loading={statsLoading && wfLoading}
          icon={
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
            </svg>
          }
        />
        <MetricTile
          label="Active Agents"
          value={statsLoading ? "—" : String(stats?.agents.active ?? activeAgents)}
          sub="deployed"
          loading={statsLoading && agentLoading}
          icon={
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm6.39-2.908a.75.75 0 01.766.027l3.5 2.25a.75.75 0 010 1.262l-3.5 2.25A.75.75 0 018 12.25v-4.5a.75.75 0 01.39-.658z"/>
            </svg>
          }
        />
        <MetricTile
          label="Knowledge Docs"
          value={colLoading ? "—" : totalDocs.toLocaleString()}
          sub={`${collections.length} collections`}
          loading={colLoading}
          icon={
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
            </svg>
          }
        />
        <MetricTile
          label="AI Spend (MTD)"
          value={usageLoading ? "—" : `$${usage?.totalCostUsd?.toFixed(2) ?? "0.00"}`}
          sub={usage ? `${(usage.totalTokens ?? 0).toLocaleString()} tokens` : undefined}
          loading={usageLoading}
          trend={
            usage?.totalCostUsd != null
              ? { value: `${usage.totalCostUsd > 100 ? "High" : "Normal"} usage`, positive: usage.totalCostUsd <= 100 }
              : undefined
          }
          icon={
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Recent Workflows */}
        <div className="lg:col-span-2">
          <SectionHeader title="Recent Workflows" href="/studio/workflows" />
          <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/40">
            {wfLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 border-b border-neutral-800 px-4 py-3 last:border-0">
                  <div className="h-4 w-48 animate-pulse rounded bg-neutral-800" />
                  <div className="ml-auto h-5 w-20 animate-pulse rounded-full bg-neutral-800" />
                </div>
              ))
            ) : workflows.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-neutral-500">No workflows yet</p>
            ) : (
              workflows.slice(0, 6).map(wf => (
                <div
                  key={wf.id}
                  onClick={() => router.push(`/studio/workflows/${wf.id}`)}
                  className="flex cursor-pointer items-center gap-4 border-b border-neutral-800/60
                             px-4 py-3 transition-colors hover:bg-neutral-800/40 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-white">{wf.name}</p>
                    {wf.description && (
                      <p className="mt-0.5 truncate text-xs text-neutral-500">{wf.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={wf.status} />
                    <span className="text-xs text-neutral-600">v{wf.version}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">

          {/* Active Agents */}
          <div>
            <SectionHeader title="Agents" href="/studio/agents" />
            <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/40">
              {agentLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 border-b border-neutral-800 px-4 py-3 last:border-0">
                    <div className="h-8 w-8 animate-pulse rounded-lg bg-neutral-800" />
                    <div className="h-4 w-32 animate-pulse rounded bg-neutral-800" />
                  </div>
                ))
              ) : agents.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-neutral-500">No agents yet</p>
              ) : (
                agents.slice(0, 5).map(agent => (
                  <div
                    key={agent.id}
                    onClick={() => router.push(`/studio/agents`)}
                    className="flex cursor-pointer items-center gap-3 border-b border-neutral-800/60
                               px-4 py-3 transition-colors hover:bg-neutral-800/40 last:border-0"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
                                    border border-neutral-800 bg-neutral-800/60 text-xs font-bold text-indigo-400">
                      {agent.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{agent.name}</p>
                      <p className="text-xs text-neutral-500">{agent.model}</p>
                    </div>
                    <StatusBadge status={agent.status} size="sm" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Usage breakdown */}
          <div>
            <SectionHeader title="AI Usage (MTD)" />
            <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-4">
              {usageLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <div className="h-4 w-24 animate-pulse rounded bg-neutral-800" />
                      <div className="h-4 w-16 animate-pulse rounded bg-neutral-800" />
                    </div>
                  ))}
                </div>
              ) : usage ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Total requests</span>
                    <span className="font-medium text-white">{(usage.totalRequests ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Prompt tokens</span>
                    <span className="font-medium text-white">{(usage.totalPromptTokens ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Completion tokens</span>
                    <span className="font-medium text-white">{(usage.totalCompletionTokens ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="mt-2 border-t border-neutral-800 pt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-neutral-300">Total cost</span>
                      <span className="font-bold text-white">${usage.totalCostUsd?.toFixed(4) ?? "0.0000"}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-sm text-neutral-500">No usage data</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
