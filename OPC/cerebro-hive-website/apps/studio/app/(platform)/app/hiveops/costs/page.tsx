"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign, TrendingUp, TrendingDown, Zap, Brain,
  Users, FolderKanban, BarChart3, AlertTriangle,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { StatCard } from "../../components/ui/StatCard";

// ── Demo data ─────────────────────────────────────────────────────────────────

const DAILY_SPEND = [
  { day: "Mon", usd: 98 }, { day: "Tue", usd: 134 }, { day: "Wed", usd: 121 },
  { day: "Thu", usd: 187 }, { day: "Fri", usd: 142 }, { day: "Sat", usd: 76 },
  { day: "Sun", usd: 63 }, { day: "Mon", usd: 127 },
];
const MAX_DAILY = Math.max(...DAILY_SPEND.map(d => d.usd));

const PROVIDERS = [
  { name: "Anthropic",    model: "claude-opus-4-5",       tokensToday: 2_140_000, costToday: 64.20,  costMonth: 1_840.50, color: "bg-violet-400", pct: 48 },
  { name: "OpenAI",       model: "gpt-4o",               tokensToday:   980_000, costToday: 29.40,  costMonth:   920.30, color: "bg-green-400",  pct: 24 },
  { name: "Anthropic",    model: "claude-haiku-4-5",     tokensToday: 1_100_000, costToday: 22.00,  costMonth:   640.20, color: "bg-purple-400", pct: 17 },
  { name: "Azure OpenAI", model: "gpt-4o (azure)",       tokensToday:   340_000, costToday: 11.80,  costMonth:   419.50, color: "bg-blue-400",   pct: 11 },
];

const TOP_WORKSPACES = [
  { name: "Acme Corp",    plan: "Enterprise", tokensMonth: 28_400_000, costMonth: 920.40 },
  { name: "TechStart Inc",plan: "Pro",        tokensMonth: 12_100_000, costMonth: 381.20 },
  { name: "GlobalAI Ltd", plan: "Enterprise", tokensMonth:  9_800_000, costMonth: 310.80 },
  { name: "DataFlow",     plan: "Pro",        tokensMonth:  7_200_000, costMonth: 228.60 },
  { name: "NeuralOps",    plan: "Starter",    tokensMonth:  3_400_000, costMonth: 107.10 },
];

const TOP_AGENTS = [
  { name: "CerebroForge Codegen",  calls: 12_840, costMonth: 420.30, model: "claude-opus-4-5" },
  { name: "Architecture Studio",   calls:  8_210, costMonth: 298.50, model: "claude-opus-4-5" },
  { name: "AI Documentation",      calls:  6_980, costMonth: 182.40, model: "claude-haiku-4-5" },
  { name: "AI Code Review",        calls:  5_440, costMonth: 164.20, model: "claude-opus-4-5" },
  { name: "AI PR Summary",         calls: 14_200, costMonth: 142.00, model: "claude-haiku-4-5" },
];

const BUDGET_ALERTS = [
  { workspace: "Acme Corp",     threshold: 1000, current: 920.40, pct: 92, status: "warning" },
  { workspace: "TechStart Inc", threshold:  500, current: 381.20, pct: 76, status: "ok" },
  { workspace: "GlobalAI Ltd",  threshold:  400, current: 310.80, pct: 78, status: "ok" },
];

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export default function CostsPage() {
  const [view, setView] = useState<"providers" | "workspaces" | "agents">("providers");

  const totalToday  = PROVIDERS.reduce((s, p) => s + p.costToday, 0);
  const totalMonth  = PROVIDERS.reduce((s, p) => s + p.costMonth, 0);
  const totalTokens = PROVIDERS.reduce((s, p) => s + p.tokensToday, 0);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <DollarSign size={18} className="text-green-400" />
          <Badge className="bg-green-500/10 text-green-400 border border-green-500/20 text-xs">FinOps</Badge>
        </div>
        <h1 className="text-2xl font-space font-bold text-text-primary">AI Cost Dashboard</h1>
        <p className="text-text-secondary text-sm mt-1">Token usage, provider spend, per-workspace costs, and budget alerts.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Spend"   value={`$${totalToday.toFixed(2)}`}       change="+12% vs yesterday"    icon={DollarSign} trend="up" />
        <StatCard label="Monthly Spend"   value={`$${totalMonth.toLocaleString()}`} change="73% of $5K budget"    icon={BarChart3}  trend="up" />
        <StatCard label="Tokens Today"    value={fmt(totalTokens)}                  change="Across 4 providers"   icon={Zap}        trend="up" />
        <StatCard label="Cost Per 1K Tok" value="$0.030"                            change="-4% vs last month"    icon={TrendingDown} trend="down" />
      </div>

      {/* Daily spend sparkline */}
      <Card className="p-5">
        <h2 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4">Daily Spend (Last 8 Days)</h2>
        <div className="flex items-end gap-2 h-24">
          {DAILY_SPEND.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-full rounded-t-sm transition-all ${i === DAILY_SPEND.length - 1 ? "bg-teal-400" : "bg-teal-400/40"}`}
                style={{ height: `${(d.usd / MAX_DAILY) * 80}px` }}
              />
              <span className="text-[9px] text-text-muted">{d.day}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-2 text-[10px] text-text-muted">
          <span>Min: $63</span>
          <span className="text-teal-400 font-semibold">Today: ${DAILY_SPEND[DAILY_SPEND.length - 1].usd}</span>
          <span>Max: $187</span>
        </div>
      </Card>

      {/* Tab view */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          {(["providers", "workspaces", "agents"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize ${
                view === v ? "bg-teal-500/15 text-teal-400 border-teal-500/30" : "text-text-secondary border-border hover:border-teal-500/20"
              }`}>
              {v}
            </button>
          ))}
        </div>

        {view === "providers" && (
          <div className="space-y-3">
            {PROVIDERS.map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${p.color}`} />
                    <span className="text-sm font-bold text-text-primary">{p.name}</span>
                    <span className="text-xs text-text-muted font-mono">{p.model}</span>
                    <span className="ml-auto text-sm font-bold text-text-primary">${p.costToday.toFixed(2)}<span className="text-text-muted text-[10px] font-normal">/day</span></span>
                  </div>
                  <div className="w-full bg-background rounded-full h-1.5 border border-border mb-2">
                    <div className={`h-full rounded-full ${p.color}`} style={{ width: `${p.pct}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-text-muted">
                    <span>{fmt(p.tokensToday)} tokens today</span>
                    <span>{p.pct}% of spend</span>
                    <span className="text-text-primary font-semibold">${p.costMonth.toLocaleString()} this month</span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {view === "workspaces" && (
          <div className="space-y-2">
            <div className="grid grid-cols-4 text-[10px] font-semibold uppercase tracking-wider text-text-muted px-4 py-2">
              <span>Workspace</span><span>Plan</span><span>Tokens / Month</span><span>Cost / Month</span>
            </div>
            {TOP_WORKSPACES.map((w, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                <Card className="px-4 py-3 grid grid-cols-4 items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Users size={12} className="text-teal-400" />
                    <span className="text-xs font-semibold text-text-primary">{w.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-[9px] w-fit">{w.plan}</Badge>
                  <span className="text-xs text-text-secondary font-mono">{fmt(w.tokensMonth)}</span>
                  <span className="text-xs font-bold text-text-primary">${w.costMonth.toFixed(2)}</span>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {view === "agents" && (
          <div className="space-y-2">
            <div className="grid grid-cols-4 text-[10px] font-semibold uppercase tracking-wider text-text-muted px-4 py-2">
              <span>Agent</span><span>Model</span><span>Calls / Month</span><span>Cost / Month</span>
            </div>
            {TOP_AGENTS.map((a, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                <Card className="px-4 py-3 grid grid-cols-4 items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Brain size={12} className="text-violet-400" />
                    <span className="text-xs font-semibold text-text-primary">{a.name}</span>
                  </div>
                  <span className="text-[9px] font-mono text-text-muted">{a.model}</span>
                  <span className="text-xs text-text-secondary">{a.calls.toLocaleString()}</span>
                  <span className="text-xs font-bold text-text-primary">${a.costMonth.toFixed(2)}</span>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Budget alerts */}
      <Card className="p-5 border-amber-500/10">
        <h2 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4">Budget Alerts</h2>
        <div className="space-y-4">
          {BUDGET_ALERTS.map((b, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-text-primary">{b.workspace}</span>
                <div className="flex items-center gap-2">
                  {b.pct >= 90 && <AlertTriangle size={11} className="text-amber-400" />}
                  <span className="text-xs text-text-secondary">${b.current.toFixed(2)} / ${b.threshold.toLocaleString()}</span>
                  <span className={`text-[10px] font-bold ${b.pct >= 90 ? "text-amber-400" : "text-green-400"}`}>{b.pct}%</span>
                </div>
              </div>
              <div className="w-full bg-background rounded-full h-1.5 border border-border">
                <div
                  className={`h-full rounded-full transition-all ${b.pct >= 90 ? "bg-amber-400" : "bg-green-400"}`}
                  style={{ width: `${b.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
