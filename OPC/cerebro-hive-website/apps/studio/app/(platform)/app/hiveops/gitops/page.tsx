"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  GitMerge, CheckCircle2, AlertTriangle, RefreshCw, Clock,
  ArrowRight, GitBranch, Tag, Eye, RotateCcw, Zap,
  ChevronDown, ChevronRight, Activity, Layers,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";

type SyncStatus = "synced" | "syncing" | "out_of_sync" | "degraded" | "unknown";

interface ArgoCDApp {
  name: string;
  namespace: string;
  env: string;
  repo: string;
  path: string;
  targetRevision: string;
  currentVersion: string;
  syncStatus: SyncStatus;
  healthStatus: "healthy" | "degraded" | "progressing" | "suspended";
  lastSync: string;
  resources: { kind: string; name: string; status: string }[];
}

const APPS: ArgoCDApp[] = [
  {
    name: "cerebro-production",
    namespace: "cerebro-prod",
    env: "Production",
    repo: "github.com/cerebro/cerebro-hive",
    path: "infra/argocd/applications/production.yaml",
    targetRevision: "v2.14.3",
    currentVersion: "v2.14.3",
    syncStatus: "synced",
    healthStatus: "healthy",
    lastSync: "2h ago",
    resources: [
      { kind: "Deployment", name: "studio",       status: "healthy" },
      { kind: "Deployment", name: "forge-api",    status: "healthy" },
      { kind: "Deployment", name: "platform-api", status: "healthy" },
      { kind: "Deployment", name: "ai-gateway",   status: "healthy" },
      { kind: "Service",    name: "studio-svc",   status: "healthy" },
      { kind: "Ingress",    name: "cerebro-ing",  status: "healthy" },
    ],
  },
  {
    name: "cerebro-staging",
    namespace: "cerebro-staging",
    env: "Staging",
    repo: "github.com/cerebro/cerebro-hive",
    path: "infra/argocd/applications/staging.yaml",
    targetRevision: "v2.15.0",
    currentVersion: "v2.15.0",
    syncStatus: "synced",
    healthStatus: "healthy",
    lastSync: "45m ago",
    resources: [
      { kind: "Deployment", name: "studio",       status: "healthy" },
      { kind: "Deployment", name: "forge-api",    status: "healthy" },
      { kind: "Deployment", name: "platform-api", status: "healthy" },
      { kind: "Service",    name: "studio-svc",   status: "healthy" },
    ],
  },
  {
    name: "cerebro-development",
    namespace: "cerebro-dev",
    env: "Development",
    repo: "github.com/cerebro/cerebro-hive",
    path: "infra/argocd/applications/dev.yaml",
    targetRevision: "main",
    currentVersion: "sha-d7c40e1",
    syncStatus: "out_of_sync",
    healthStatus: "degraded",
    lastSync: "5m ago",
    resources: [
      { kind: "Deployment", name: "studio",       status: "healthy" },
      { kind: "Deployment", name: "forge-api",    status: "progressing" },
      { kind: "Deployment", name: "ai-gateway",   status: "degraded" },
      { kind: "Service",    name: "studio-svc",   status: "healthy" },
    ],
  },
  {
    name: "monitoring",
    namespace: "monitoring",
    env: "All",
    repo: "github.com/cerebro/cerebro-hive",
    path: "infra/argocd/application-monitoring.yaml",
    targetRevision: "HEAD",
    currentVersion: "HEAD",
    syncStatus: "synced",
    healthStatus: "healthy",
    lastSync: "1h ago",
    resources: [
      { kind: "Deployment", name: "prometheus",    status: "healthy" },
      { kind: "Deployment", name: "grafana",       status: "healthy" },
      { kind: "Deployment", name: "loki",          status: "healthy" },
      { kind: "Deployment", name: "tempo",         status: "healthy" },
      { kind: "Deployment", name: "alertmanager",  status: "healthy" },
    ],
  },
];

const RELEASE_HISTORY = [
  { version: "v2.14.3", env: "Production", deployed: "2h ago",  by: "ArgoCD",   outcome: "success" },
  { version: "v2.15.0", env: "Staging",    deployed: "45m ago", by: "ArgoCD",   outcome: "success" },
  { version: "v2.15.1", env: "Dev",        deployed: "5m ago",  by: "ArgoCD",   outcome: "in_progress" },
  { version: "v2.14.2", env: "Production", deployed: "1d ago",  by: "ArgoCD",   outcome: "success" },
  { version: "v2.14.1", env: "Production", deployed: "3d ago",  by: "phil",     outcome: "rollback" },
];

const SYNC_CONFIG: Record<SyncStatus, { icon: React.ReactNode; badge: string; label: string }> = {
  synced:      { icon: <CheckCircle2 size={13} className="text-green-400" />,  badge: "bg-green-500/10 text-green-400 border-green-500/20",  label: "Synced" },
  syncing:     { icon: <RefreshCw size={13} className="text-blue-400 animate-spin" />, badge: "bg-blue-500/10 text-blue-400 border-blue-500/20", label: "Syncing" },
  out_of_sync: { icon: <AlertTriangle size={13} className="text-amber-400" />, badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",  label: "Out of Sync" },
  degraded:    { icon: <AlertTriangle size={13} className="text-red-400" />,   badge: "bg-red-500/10 text-red-400 border-red-500/20",        label: "Degraded" },
  unknown:     { icon: <Clock size={13} className="text-text-muted" />,        badge: "bg-surface text-text-muted border-border",             label: "Unknown" },
};

const HEALTH_COLOR: Record<string, string> = {
  healthy:     "text-green-400",
  degraded:    "text-red-400",
  progressing: "text-blue-400",
  suspended:   "text-text-muted",
};

const OUTCOME_ICON: Record<string, React.ReactNode> = {
  success:     <CheckCircle2 size={11} className="text-green-400" />,
  in_progress: <RefreshCw size={11} className="text-blue-400 animate-spin" />,
  rollback:    <RotateCcw size={11} className="text-amber-400" />,
  failed:      <AlertTriangle size={11} className="text-red-400" />,
};

export default function GitOpsPage() {
  const [expanded, setExpanded] = useState<string | null>("cerebro-development");

  const syncedCount    = APPS.filter(a => a.syncStatus === "synced").length;
  const outOfSyncCount = APPS.filter(a => a.syncStatus === "out_of_sync").length;
  const healthyCount   = APPS.filter(a => a.healthStatus === "healthy").length;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <GitMerge size={18} className="text-pink-400" />
          <Badge className="bg-pink-500/10 text-pink-400 border border-pink-500/20 text-xs">ArgoCD GitOps</Badge>
        </div>
        <h1 className="text-2xl font-space font-bold text-text-primary">GitOps & Release History</h1>
        <p className="text-text-secondary text-sm mt-1">ArgoCD application sync status, drift detection, and release history.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Applications",  value: String(APPS.length), icon: Layers,       color: "text-pink-400",   bg: "bg-pink-500/10" },
          { label: "Synced",        value: String(syncedCount),    icon: CheckCircle2, color: "text-green-400",  bg: "bg-green-500/10" },
          { label: "Out of Sync",   value: String(outOfSyncCount), icon: AlertTriangle,color: "text-amber-400",  bg: "bg-amber-500/10" },
          { label: "Healthy",       value: String(healthyCount),   icon: Activity,     color: "text-teal-400",   bg: "bg-teal-500/10" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                <Icon size={16} className={s.color} />
              </div>
              <div>
                <div className="text-xl font-space font-bold text-text-primary">{s.value}</div>
                <div className="text-[10px] text-text-muted">{s.label}</div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ArgoCD Apps */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-text-muted">ArgoCD Applications</h2>
        {APPS.map((app) => {
          const isExpanded = expanded === app.name;
          const cfg = SYNC_CONFIG[app.syncStatus];

          return (
            <Card key={app.name} className={`overflow-hidden transition-colors ${
              app.syncStatus === "out_of_sync" ? "border-amber-500/20" :
              app.healthStatus === "degraded"  ? "border-red-500/20"   :
              isExpanded                        ? "border-teal-500/20"  : ""
            }`}>
              <button
                className="w-full px-5 py-4 flex items-center gap-3 text-left hover:bg-surface-elevated/20 transition-colors"
                onClick={() => setExpanded(isExpanded ? null : app.name)}
              >
                {cfg.icon}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-text-primary">{app.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold ${cfg.badge}`}>{cfg.label}</span>
                    <span className={`text-[10px] font-semibold ${HEALTH_COLOR[app.healthStatus] ?? "text-text-muted"} capitalize`}>{app.healthStatus}</span>
                    <Badge variant="secondary" className="text-[9px]">{app.env}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-[10px] text-text-muted flex-wrap">
                    <span className="font-mono">{app.path}</span>
                    <span>→ <span className="text-text-secondary font-semibold">{app.targetRevision}</span></span>
                    <span>synced {app.lastSync}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {app.syncStatus === "out_of_sync" && (
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1 text-teal-400 hover:text-teal-300">
                      <RefreshCw size={10} /> Sync
                    </Button>
                  )}
                  {isExpanded ? <ChevronDown size={13} className="text-text-muted" /> : <ChevronRight size={13} className="text-text-muted" />}
                </div>
              </button>

              {isExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  className="border-t border-border bg-surface-elevated/20 px-5 py-4">
                  <div className="grid grid-cols-2 gap-4 mb-4 text-[10px]">
                    <div>
                      <span className="text-text-muted">Repository</span>
                      <p className="text-text-secondary font-mono mt-0.5">{app.repo}</p>
                    </div>
                    <div>
                      <span className="text-text-muted">Namespace</span>
                      <p className="text-text-secondary font-mono mt-0.5">{app.namespace}</p>
                    </div>
                    <div>
                      <span className="text-text-muted">Target</span>
                      <p className="text-text-primary font-semibold mt-0.5">{app.targetRevision}</p>
                    </div>
                    <div>
                      <span className="text-text-muted">Current</span>
                      <p className={`font-mono mt-0.5 ${app.targetRevision === app.currentVersion ? "text-green-400" : "text-amber-400"}`}>{app.currentVersion}</p>
                    </div>
                  </div>

                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">Resources</h3>
                  <div className="flex flex-wrap gap-2">
                    {app.resources.map((res, i) => (
                      <div key={i} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface border text-[9px] ${
                        res.status === "healthy"     ? "border-green-500/20" :
                        res.status === "degraded"   ? "border-red-500/20"   :
                        res.status === "progressing"? "border-blue-500/20"  : "border-border"
                      }`}>
                        <span className={HEALTH_COLOR[res.status] ?? "text-text-muted"}>●</span>
                        <span className="text-text-muted">{res.kind}</span>
                        <span className="text-text-primary font-semibold">{res.name}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Release history */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-text-muted">Release History</h2>
        <Card className="overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-elevated/30">
                {["Version", "Environment", "Deployed", "By", "Outcome"].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RELEASE_HISTORY.map((r, i) => (
                <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className="border-b border-border/50 hover:bg-surface-elevated/10 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-text-primary">{r.version}</td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="text-[9px]">{r.env}</Badge>
                  </td>
                  <td className="px-4 py-3 text-text-muted text-[10px]">{r.deployed}</td>
                  <td className="px-4 py-3 text-text-secondary text-[10px]">{r.by}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1">
                      {OUTCOME_ICON[r.outcome]}
                      <span className={`text-[10px] capitalize font-semibold ${
                        r.outcome === "success"     ? "text-green-400" :
                        r.outcome === "rollback"    ? "text-amber-400" :
                        r.outcome === "in_progress" ? "text-blue-400"  :
                                                      "text-red-400"
                      }`}>{r.outcome.replace("_", " ")}</span>
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
