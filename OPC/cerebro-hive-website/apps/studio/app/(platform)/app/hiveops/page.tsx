"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Activity, GitBranch, Rocket, Shield, DollarSign, Server,
  GitMerge, CheckCircle2, AlertTriangle, XCircle, Clock,
  TrendingUp, TrendingDown, Zap, ArrowUpRight, RefreshCw,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { StatCard } from "../components/ui/StatCard";

// ── Static demo data ──────────────────────────────────────────────────────────

const PIPELINE_RUNS = [
  { name: "studio",     branch: "main",    status: "success", duration: "4m 12s", ago: "2 min ago",  sha: "a3f91b2" },
  { name: "forge-api",  branch: "feat/ai-review", status: "running", duration: "1m 48s", ago: "now",       sha: "d7c40e1" },
  { name: "platform-api", branch: "main",  status: "success", duration: "3m 55s", ago: "14 min ago", sha: "9b2ff3a" },
  { name: "web",        branch: "fix/auth", status: "failed",  duration: "2m 03s", ago: "31 min ago", sha: "1e8da44" },
  { name: "ml-svc",     branch: "main",    status: "success", duration: "6m 22s", ago: "1h ago",     sha: "f2c19b7" },
];

const ENVIRONMENTS = [
  { name: "Production",  health: "healthy",  version: "v2.14.3", synced: true,  pods: "48/48", cpu: 42, mem: 61 },
  { name: "Staging",     health: "healthy",  version: "v2.15.0", synced: true,  pods: "24/24", cpu: 28, mem: 45 },
  { name: "Development", health: "degraded", version: "v2.15.1", synced: false, pods: "19/24", cpu: 71, mem: 83 },
];

const SECURITY_SUMMARY = { critical: 0, high: 2, medium: 7, low: 14, lastScan: "6 min ago" };

const COST_SUMMARY = {
  todayUsd: 127.40,
  monthUsd: 3820.50,
  tokensToday: "4.2M",
  topProvider: "Anthropic",
};

const STATUS_ICON = {
  success: <CheckCircle2 size={13} className="text-green-400" />,
  running: <RefreshCw size={13} className="text-blue-400 animate-spin" />,
  failed:  <XCircle size={13} className="text-red-400" />,
  pending: <Clock size={13} className="text-text-muted" />,
};

const HEALTH_VARIANT: Record<string, string> = {
  healthy:  "text-green-400 bg-green-500/10 border-green-500/20",
  degraded: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  down:     "text-red-400 bg-red-500/10 border-red-500/20",
};

const QUICK_LINKS = [
  { title: "Pipelines",   href: "/app/hiveops/pipelines",   icon: GitBranch,  color: "text-violet-400", bg: "bg-violet-500/10" },
  { title: "Deployments", href: "/app/hiveops/deployments", icon: Rocket,     color: "text-blue-400",   bg: "bg-blue-500/10" },
  { title: "Security",    href: "/app/hiveops/security",    icon: Shield,     color: "text-red-400",    bg: "bg-red-500/10" },
  { title: "AI Costs",    href: "/app/hiveops/costs",       icon: DollarSign, color: "text-green-400",  bg: "bg-green-500/10" },
  { title: "Clusters",    href: "/app/hiveops/clusters",    icon: Server,     color: "text-cyan-400",   bg: "bg-cyan-500/10" },
  { title: "GitOps",      href: "/app/hiveops/gitops",      icon: GitMerge,   color: "text-pink-400",   bg: "bg-pink-500/10" },
];

export default function HiveOpsOverviewPage() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Activity size={20} className="text-teal-400" />
          <Badge className="bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs">DevOps Control Plane</Badge>
        </div>
        <h1 className="text-3xl font-space font-bold text-text-primary">HiveOps Control Plane</h1>
        <p className="text-text-secondary mt-1">
          Unified operational console — pipelines, deployments, security, cost, and GitOps in one place.
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pipeline Success Rate" value="94.7%"   change="+1.2% vs last week" icon={GitBranch}  trend="up" />
        <StatCard label="Deployments Today"     value="12"      change="3 in progress"       icon={Rocket}     trend="up" />
        <StatCard label="Security Findings"     value="2 HIGH"  change="0 Critical"          icon={Shield}     trend="down" />
        <StatCard label="AI Spend Today"        value="$127"    change="$3,820 this month"   icon={DollarSign} trend="up" />
      </div>

      {/* Quick navigation */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {QUICK_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <Card className="p-4 text-center hover:border-teal-500/30 transition-colors cursor-pointer">
                <div className={`w-9 h-9 rounded-xl ${link.bg} flex items-center justify-center mx-auto mb-2`}>
                  <Icon size={16} className={link.color} />
                </div>
                <p className="text-[11px] font-semibold text-text-primary">{link.title}</p>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Pipeline runs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Recent Pipeline Runs</h2>
            <Link href="/app/hiveops/pipelines">
              <Button variant="ghost" size="sm" className="text-xs gap-1 text-teal-400 hover:text-teal-300">
                View all <ArrowUpRight size={11} />
              </Button>
            </Link>
          </div>
          <div className="space-y-2">
            {PIPELINE_RUNS.map((run, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="px-4 py-3 flex items-center gap-3">
                  {STATUS_ICON[run.status as keyof typeof STATUS_ICON]}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-text-primary">{run.name}</span>
                      <Badge variant="secondary" className="text-[9px] font-mono">{run.branch}</Badge>
                    </div>
                    <p className="text-[10px] text-text-muted font-mono">{run.sha}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-text-secondary">{run.duration}</p>
                    <p className="text-[9px] text-text-muted">{run.ago}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Environment status */}
          <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Environments</h2>
          {ENVIRONMENTS.map((env, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-text-primary">{env.name}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${HEALTH_VARIANT[env.health]}`}>
                  {env.health}
                </span>
              </div>
              <div className="text-[10px] text-text-muted space-y-1">
                <div className="flex justify-between"><span>Version</span><span className="font-mono text-text-secondary">{env.version}</span></div>
                <div className="flex justify-between"><span>Pods</span><span className={env.pods.split("/")[0] === env.pods.split("/")[1] ? "text-green-400" : "text-amber-400"}>{env.pods}</span></div>
                <div className="flex justify-between"><span>CPU</span><span>{env.cpu}%</span></div>
                <div className="flex justify-between"><span>Synced</span><span>{env.synced ? "✅" : "⚠️ Drifted"}</span></div>
              </div>
            </Card>
          ))}

          {/* Security summary */}
          <Card className="p-4 border-red-500/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                <Shield size={12} className="text-red-400" /> Security
              </h3>
              <span className="text-[9px] text-text-muted">{SECURITY_SUMMARY.lastScan}</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: "Critical", count: SECURITY_SUMMARY.critical, color: "text-red-400" },
                { label: "High",     count: SECURITY_SUMMARY.high,     color: "text-orange-400" },
                { label: "Medium",   count: SECURITY_SUMMARY.medium,   color: "text-amber-400" },
                { label: "Low",      count: SECURITY_SUMMARY.low,      color: "text-text-muted" },
              ].map((s) => (
                <div key={s.label}>
                  <div className={`text-lg font-space font-bold ${s.color}`}>{s.count}</div>
                  <div className="text-[9px] text-text-muted">{s.label}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Cost summary */}
          <Card className="p-4 border-green-500/10">
            <div className="flex items-center gap-1.5 mb-3">
              <DollarSign size={12} className="text-green-400" />
              <h3 className="text-xs font-bold text-text-primary">AI Spend</h3>
            </div>
            <div className="space-y-1 text-[10px]">
              <div className="flex justify-between"><span className="text-text-muted">Today</span><span className="font-bold text-text-primary">${COST_SUMMARY.todayUsd.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-text-muted">This Month</span><span className="font-bold text-text-primary">${COST_SUMMARY.monthUsd.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Tokens Today</span><span className="text-text-secondary">{COST_SUMMARY.tokensToday}</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Top Provider</span><span className="text-green-400">{COST_SUMMARY.topProvider}</span></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
