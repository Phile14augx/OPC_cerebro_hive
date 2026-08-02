"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  GitBranch, CheckCircle2, XCircle, Clock, RefreshCw,
  Play, StopCircle, RotateCcw, Filter, Search,
  ChevronDown, ChevronRight, Zap, AlertTriangle,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";

type RunStatus = "success" | "running" | "failed" | "pending" | "cancelled";

interface PipelineRun {
  id: string;
  service: string;
  branch: string;
  sha: string;
  actor: string;
  status: RunStatus;
  stages: { name: string; status: RunStatus; duration: string }[];
  startedAt: string;
  duration: string;
  trigger: "push" | "pr" | "manual" | "schedule";
}

const PIPELINE_RUNS: PipelineRun[] = [
  {
    id: "run-4821",
    service: "forge-api",
    branch: "feat/ai-review",
    sha: "d7c40e1",
    actor: "phil",
    status: "running",
    trigger: "pr",
    startedAt: "Just now",
    duration: "1m 48s",
    stages: [
      { name: "Typecheck", status: "success",  duration: "23s" },
      { name: "Lint",      status: "success",  duration: "18s" },
      { name: "Unit Tests",status: "running",  duration: "—" },
      { name: "Build",     status: "pending",  duration: "—" },
      { name: "Security",  status: "pending",  duration: "—" },
      { name: "Docker",    status: "pending",  duration: "—" },
    ],
  },
  {
    id: "run-4820",
    service: "studio",
    branch: "main",
    sha: "a3f91b2",
    actor: "phil",
    status: "success",
    trigger: "push",
    startedAt: "2 min ago",
    duration: "4m 12s",
    stages: [
      { name: "Typecheck", status: "success", duration: "31s" },
      { name: "Lint",      status: "success", duration: "22s" },
      { name: "Unit Tests",status: "success", duration: "58s" },
      { name: "Build",     status: "success", duration: "1m 12s" },
      { name: "Security",  status: "success", duration: "44s" },
      { name: "Docker",    status: "success", duration: "45s" },
    ],
  },
  {
    id: "run-4819",
    service: "platform-api",
    branch: "main",
    sha: "9b2ff3a",
    actor: "github-actions[bot]",
    status: "success",
    trigger: "schedule",
    startedAt: "14 min ago",
    duration: "3m 55s",
    stages: [
      { name: "Typecheck", status: "success", duration: "28s" },
      { name: "Lint",      status: "success", duration: "19s" },
      { name: "Unit Tests",status: "success", duration: "51s" },
      { name: "Build",     status: "success", duration: "1m 04s" },
      { name: "Security",  status: "success", duration: "38s" },
      { name: "Docker",    status: "success", duration: "55s" },
    ],
  },
  {
    id: "run-4818",
    service: "web",
    branch: "fix/auth",
    sha: "1e8da44",
    actor: "phil",
    status: "failed",
    trigger: "pr",
    startedAt: "31 min ago",
    duration: "2m 03s",
    stages: [
      { name: "Typecheck", status: "success",  duration: "29s" },
      { name: "Lint",      status: "success",  duration: "20s" },
      { name: "Unit Tests",status: "failed",   duration: "1m 04s" },
      { name: "Build",     status: "cancelled",duration: "—" },
      { name: "Security",  status: "cancelled",duration: "—" },
      { name: "Docker",    status: "cancelled",duration: "—" },
    ],
  },
  {
    id: "run-4817",
    service: "ml-svc",
    branch: "main",
    sha: "f2c19b7",
    actor: "phil",
    status: "success",
    trigger: "push",
    startedAt: "1h ago",
    duration: "6m 22s",
    stages: [
      { name: "Typecheck", status: "success", duration: "14s" },
      { name: "Lint",      status: "success", duration: "11s" },
      { name: "Unit Tests",status: "success", duration: "2m 18s" },
      { name: "Build",     status: "success", duration: "1m 44s" },
      { name: "Security",  status: "success", duration: "1m 02s" },
      { name: "Docker",    status: "success", duration: "1m 13s" },
    ],
  },
];

const STATUS_CONFIG: Record<RunStatus, { icon: React.ReactNode; label: string; badge: string }> = {
  success:   { icon: <CheckCircle2 size={13} className="text-green-400" />,  label: "Success",   badge: "bg-green-500/10 text-green-400 border-green-500/20" },
  running:   { icon: <RefreshCw    size={13} className="text-blue-400 animate-spin" />,  label: "Running",   badge: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  failed:    { icon: <XCircle      size={13} className="text-red-400" />,    label: "Failed",    badge: "bg-red-500/10 text-red-400 border-red-500/20" },
  pending:   { icon: <Clock        size={13} className="text-text-muted" />, label: "Pending",   badge: "bg-surface text-text-muted border-border" },
  cancelled: { icon: <StopCircle   size={13} className="text-text-muted" />, label: "Cancelled", badge: "bg-surface text-text-muted border-border" },
};

const TRIGGER_BADGE: Record<string, string> = {
  push:     "Push",
  pr:       "PR",
  manual:   "Manual",
  schedule: "Scheduled",
};

export default function PipelinesPage() {
  const [expanded, setExpanded] = useState<string | null>("run-4821");
  const [filter, setFilter] = useState<RunStatus | "all">("all");

  const filtered = filter === "all" ? PIPELINE_RUNS : PIPELINE_RUNS.filter(r => r.status === filter);

  const stats = {
    total:   PIPELINE_RUNS.length,
    success: PIPELINE_RUNS.filter(r => r.status === "success").length,
    failed:  PIPELINE_RUNS.filter(r => r.status === "failed").length,
    running: PIPELINE_RUNS.filter(r => r.status === "running").length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <GitBranch size={18} className="text-violet-400" />
          <Badge className="bg-violet-500/10 text-violet-400 border border-violet-500/20 text-xs">CI/CD</Badge>
        </div>
        <h1 className="text-2xl font-space font-bold text-text-primary">Pipeline Runs</h1>
        <p className="text-text-secondary text-sm mt-1">GitHub Actions CI/CD across all services.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total", count: stats.total,   color: "text-text-primary" },
          { label: "Passed", count: stats.success, color: "text-green-400" },
          { label: "Failed", count: stats.failed,  color: "text-red-400" },
          { label: "Running", count: stats.running, color: "text-blue-400" },
        ].map((s) => (
          <Card key={s.label} className="p-4 text-center">
            <div className={`text-2xl font-space font-bold ${s.color}`}>{s.count}</div>
            <div className="text-[10px] text-text-muted mt-0.5">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["all", "running", "success", "failed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize ${
              filter === f
                ? "bg-teal-500/15 text-teal-400 border-teal-500/30"
                : "text-text-secondary border-border hover:border-teal-500/30 hover:text-teal-400"
            }`}
          >
            {f === "all" ? "All Runs" : f}
          </button>
        ))}
        <Button variant="ghost" size="sm" className="ml-auto gap-1.5 text-xs">
          <Play size={11} /> Trigger Run
        </Button>
      </div>

      {/* Run list */}
      <div className="space-y-2">
        {filtered.map((run, i) => {
          const isExpanded = expanded === run.id;
          const cfg = STATUS_CONFIG[run.status];

          return (
            <motion.div key={run.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
              <Card className={`overflow-hidden transition-colors ${run.status === "failed" ? "border-red-500/20" : run.status === "running" ? "border-blue-500/20" : ""}`}>
                {/* Row */}
                <button
                  className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-surface-elevated/30 transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : run.id)}
                >
                  {cfg.icon}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-text-primary">{run.service}</span>
                      <span className="text-xs text-text-muted font-mono">{run.branch}</span>
                      <Badge className={`text-[9px] px-1.5 py-0.5 border ${cfg.badge}`}>{cfg.label}</Badge>
                      <Badge variant="secondary" className="text-[9px]">{TRIGGER_BADGE[run.trigger]}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-[10px] text-text-muted">
                      <span className="font-mono">{run.sha}</span>
                      <span>by {run.actor}</span>
                      <span>{run.startedAt}</span>
                      <span>⏱ {run.duration}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {run.status === "failed" && (
                      <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1 text-amber-400 hover:text-amber-300"
                        onClick={(e) => { e.stopPropagation(); }}>
                        <RotateCcw size={10} /> Retry
                      </Button>
                    )}
                    {isExpanded ? <ChevronDown size={14} className="text-text-muted" /> : <ChevronRight size={14} className="text-text-muted" />}
                  </div>
                </button>

                {/* Stage breakdown */}
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border bg-surface-elevated/30 px-5 py-4"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      {run.stages.map((stage, si) => {
                        const sc = STATUS_CONFIG[stage.status as RunStatus];
                        return (
                          <div key={si} className="flex items-center gap-1.5 bg-surface rounded-lg px-3 py-2 border border-border">
                            {sc.icon}
                            <div>
                              <div className="text-[10px] font-semibold text-text-primary">{stage.name}</div>
                              <div className="text-[9px] text-text-muted">{stage.duration}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {run.status === "failed" && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-red-400 bg-red-500/5 border border-red-500/15 rounded-lg px-3 py-2">
                        <AlertTriangle size={12} />
                        Unit tests failed — 3 test suites, 14 assertions. Check the <span className="underline cursor-pointer">run logs</span> for details.
                      </div>
                    )}
                  </motion.div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
