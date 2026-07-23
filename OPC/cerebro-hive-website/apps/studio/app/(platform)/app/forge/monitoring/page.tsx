"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Activity, CheckCircle2, AlertTriangle, AlertCircle, Loader2,
  Server, Zap, Globe, Shield, Clock, TrendingUp, TrendingDown,
  RefreshCw, ExternalLink, Cpu, MemoryStick, Database, GitBranch,
  ChevronRight, Play, Boxes,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { StatCard } from "../../components/ui/StatCard";
import { useForgeProject } from "@/lib/forge/hooks";

// ─── Static service health data (in production: polled from project URLs) ───

const HEALTH_STATUSES = ["healthy", "degraded", "down"] as const;
type HealthStatus = typeof HEALTH_STATUSES[number];

interface ServiceHealth {
  name: string;
  url: string;
  status: HealthStatus;
  latencyMs: number;
  uptimePct: number;
  lastChecked: string;
  icon: React.ElementType;
}

const ALERT_SEVERITIES = ["critical", "warning", "info"] as const;
type AlertSeverity = typeof ALERT_SEVERITIES[number];

interface MonitorAlert {
  severity: AlertSeverity;
  service: string;
  message: string;
  time: string;
  resolved: boolean;
}

const defaultAlerts: MonitorAlert[] = [
  { severity: "warning",  service: "API Gateway",    message: "p99 latency exceeded 500ms threshold (current: 612ms)", time: "3m ago",  resolved: false },
  { severity: "info",     service: "Database",       message: "Scheduled maintenance window starts in 2 hours",        time: "10m ago", resolved: false },
  { severity: "critical", service: "Auth Service",   message: "Error rate spike: 4.2% → below 1% SLO threshold",      time: "18m ago", resolved: true  },
];

function buildServices(projectName: string): ServiceHealth[] {
  return [
    { name: `${projectName} API`,        url: "https://api.yourapp.dev",     status: "healthy",  latencyMs: 48,  uptimePct: 99.98, lastChecked: "just now", icon: Server },
    { name: `${projectName} Web`,        url: "https://app.yourapp.dev",     status: "healthy",  latencyMs: 82,  uptimePct: 99.95, lastChecked: "just now", icon: Globe },
    { name: "PostgreSQL",                url: "db:5432",                      status: "healthy",  latencyMs: 4,   uptimePct: 100,   lastChecked: "just now", icon: Database },
    { name: "Redis Cache",               url: "redis:6379",                   status: "healthy",  latencyMs: 1,   uptimePct: 100,   lastChecked: "just now", icon: Zap },
    { name: "Auth Service",              url: "https://auth.yourapp.dev",    status: "degraded", latencyMs: 612, uptimePct: 98.12, lastChecked: "1m ago",   icon: Shield },
    { name: `${projectName} Mobile API`, url: "https://mobile.yourapp.dev",  status: "healthy",  latencyMs: 55,  uptimePct: 99.91, lastChecked: "just now", icon: Cpu },
  ];
}

const STATUS_CONFIG: Record<HealthStatus, { variant: "success" | "warning" | "destructive"; color: string; dot: string }> = {
  healthy:  { variant: "success",     color: "text-green-400",  dot: "bg-green-400" },
  degraded: { variant: "warning",     color: "text-amber-400",  dot: "bg-amber-400" },
  down:     { variant: "destructive", color: "text-red-400",    dot: "bg-red-400" },
};

const ALERT_CONFIG: Record<AlertSeverity, { variant: "destructive" | "warning" | "info"; icon: React.ElementType }> = {
  critical: { variant: "destructive", icon: AlertCircle },
  warning:  { variant: "warning",     icon: AlertTriangle },
  info:     { variant: "info",        icon: Activity },
};

export default function MonitoringPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get("projectId") ?? "";

  const { project, loading } = useForgeProject(projectId);
  const [alerts, setAlerts] = useState<MonitorAlert[]>(defaultAlerts);
  const [refreshing, setRefreshing] = useState(false);
  const [tick, setTick] = useState(0);

  // Simulate live polling
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  const resolveAlert = (i: number) =>
    setAlerts(prev => prev.map((a, idx) => idx === i ? { ...a, resolved: true } : a));

  const projectName = project?.name ?? "Your App";
  const services = buildServices(projectName);

  const healthyCount  = services.filter(s => s.status === "healthy").length;
  const degradedCount = services.filter(s => s.status === "degraded").length;
  const downCount     = services.filter(s => s.status === "down").length;
  const avgLatency    = Math.round(services.reduce((a, s) => a + s.latencyMs, 0) / services.length);
  const avgUptime     = (services.reduce((a, s) => a + s.uptimePct, 0) / services.length).toFixed(2);
  const openAlerts    = alerts.filter(a => !a.resolved).length;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Activity size={20} className="text-cyan-400" />
          <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs">Monitoring & Ops</Badge>
          {project && <Badge variant="secondary" className="text-xs">{project.name}</Badge>}
          <Badge
            variant={downCount > 0 ? "destructive" : degradedCount > 0 ? "warning" : "success"}
            className="text-xs ml-auto"
          >
            <div className={`w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse ${downCount > 0 ? "bg-red-400" : degradedCount > 0 ? "bg-amber-400" : "bg-green-400"}`} />
            {downCount > 0 ? `${downCount} Service Down` : degradedCount > 0 ? `${degradedCount} Degraded` : "All Systems Operational"}
          </Badge>
        </div>
        <h1 className="text-3xl font-space font-bold text-text-primary">Monitoring & Ops</h1>
        <p className="text-text-secondary mt-1">
          Real-time health, performance metrics, SLOs, and alerts for your deployed application.
        </p>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Services Online"  value={`${healthyCount}/${services.length}`} change={degradedCount > 0 ? `${degradedCount} degraded` : "All healthy"} icon={Server}    trend={downCount > 0 ? "down" : "up"} />
        <StatCard label="Avg Latency"      value={`${avgLatency}ms`}                    change="p50 response time"                                              icon={Zap}       trend={avgLatency > 200 ? "down" : "up"} />
        <StatCard label="Uptime (30d)"     value={`${avgUptime}%`}                      change="SLO: 99.9%"                                                      icon={TrendingUp} trend="up" />
        <StatCard label="Open Alerts"      value={String(openAlerts)}                   change={openAlerts === 0 ? "No issues" : "Needs attention"}              icon={AlertTriangle} trend={openAlerts > 0 ? "down" : "up"} />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
        >
          {refreshing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          {refreshing ? "Refreshing…" : "Refresh Status"}
        </Button>
        <Button variant="secondary" className="gap-2"><ExternalLink size={14} /> Open Grafana</Button>
        <Button variant="secondary" className="gap-2"><Activity size={14} /> View Logs</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Service Health */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Service Health</h2>
          <div className="space-y-3">
            {services.map((svc, i) => {
              const cfg = STATUS_CONFIG[svc.status];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className={`p-4 ${svc.status === "degraded" ? "border-amber-500/20" : svc.status === "down" ? "border-red-500/20" : ""}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${svc.status === "healthy" ? "bg-green-500/10 border border-green-500/20" : svc.status === "degraded" ? "bg-amber-500/10 border border-amber-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
                          <svc.icon size={14} className={cfg.color} />
                        </div>
                        <div>
                          <h3 className="font-bold text-text-primary text-sm">{svc.name}</h3>
                          <p className="text-[10px] text-text-muted font-mono">{svc.url}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-right">
                        <div>
                          <p className="text-xs font-bold text-text-primary">{svc.latencyMs}ms</p>
                          <p className="text-[10px] text-text-muted">latency</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-text-primary">{svc.uptimePct}%</p>
                          <p className="text-[10px] text-text-muted">uptime</p>
                        </div>
                        <Badge variant={cfg.variant} className="text-[10px]">
                          <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse mr-1`} />
                          {svc.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Latency bar */}
                    <div className="mt-3 w-full bg-background rounded-full h-1 border border-border">
                      <div
                        className={`h-full rounded-full transition-all ${svc.latencyMs < 100 ? "bg-green-400" : svc.latencyMs < 300 ? "bg-amber-400" : "bg-red-400"}`}
                        style={{ width: `${Math.min((svc.latencyMs / 1000) * 100, 100)}%` }}
                      />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Alerts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Alerts</h2>
            {openAlerts > 0 && (
              <Badge variant="destructive" className="text-[10px]">{openAlerts} open</Badge>
            )}
          </div>

          {alerts.length === 0 ? (
            <Card className="p-6 text-center border-green-500/20 bg-green-500/5">
              <CheckCircle2 size={20} className="mx-auto text-green-400 mb-2" />
              <p className="text-xs text-green-400 font-semibold">No active alerts</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert, i) => {
                const cfg = ALERT_CONFIG[alert.severity];
                const Icon = cfg.icon;
                return (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.07 }}>
                    <Card className={`p-4 ${alert.resolved ? "opacity-50" : ""} ${alert.severity === "critical" && !alert.resolved ? "border-red-500/20" : alert.severity === "warning" && !alert.resolved ? "border-amber-500/20" : ""}`}>
                      <div className="flex items-start gap-3">
                        <Icon size={14} className={alert.severity === "critical" ? "text-red-400" : alert.severity === "warning" ? "text-amber-400" : "text-blue-400"} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={cfg.variant} className="text-[9px] capitalize">{alert.severity}</Badge>
                            <span className="text-[10px] text-text-muted">{alert.service}</span>
                          </div>
                          <p className="text-xs text-text-secondary leading-relaxed">{alert.message}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] text-text-muted flex items-center gap-1">
                              <Clock size={9} /> {alert.time}
                            </span>
                            {!alert.resolved ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 text-[9px] gap-1 px-1.5 text-cyan-400 hover:text-cyan-300"
                                onClick={() => resolveAlert(i)}
                              >
                                <CheckCircle2 size={9} /> Resolve
                              </Button>
                            ) : (
                              <span className="text-[9px] text-green-400 flex items-center gap-1">
                                <CheckCircle2 size={9} /> Resolved
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* SLO Summary */}
          <Card className="p-4 border-cyan-500/10 bg-cyan-500/5 space-y-3 mt-4">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">SLO Summary</h3>
            {[
              { name: "Availability",  value: `${avgUptime}%`, target: "99.9%",  ok: parseFloat(avgUptime) >= 99.9 },
              { name: "Latency p99",   value: `${Math.round(avgLatency * 2.5)}ms`, target: "<500ms", ok: avgLatency * 2.5 < 500 },
              { name: "Error Rate",    value: "0.08%",          target: "<1%",    ok: true },
            ].map((slo, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-text-muted">{slo.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-text-secondary font-mono">{slo.value}</span>
                  <span className="text-text-muted">/ {slo.target}</span>
                  {slo.ok
                    ? <CheckCircle2 size={11} className="text-green-400" />
                    : <AlertTriangle size={11} className="text-amber-400" />
                  }
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>

      {/* Resource Usage */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Resource Usage</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "CPU",      value: 34,  unit: "%",  icon: Cpu,         color: "bg-cyan-400" },
            { label: "Memory",   value: 61,  unit: "%",  icon: MemoryStick, color: "bg-violet-400" },
            { label: "Storage",  value: 28,  unit: "%",  icon: Database,    color: "bg-emerald-400" },
            { label: "Network",  value: 12,  unit: "MB/s", icon: Activity,  color: "bg-amber-400" },
          ].map((res, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <res.icon size={14} className="text-text-muted" />
                <span className="text-xs font-bold text-text-muted uppercase tracking-widest">{res.label}</span>
              </div>
              <p className="text-2xl font-space font-bold text-text-primary mb-2">{res.value}<span className="text-sm text-text-muted ml-1">{res.unit}</span></p>
              <div className="w-full bg-background rounded-full h-1.5 border border-border">
                <div
                  className={`h-full rounded-full ${res.color} transition-all`}
                  style={{ width: `${typeof res.value === "number" ? res.value : 0}%` }}
                />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="secondary"
          className="gap-2"
          onClick={() => router.push(`/app/forge?projectId=${projectId}`)}
        >
          <Boxes size={16} /> Back to Dashboard
        </Button>
        {projectId && (
          <Button
            className="gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
            onClick={() => router.push(`/app/forge/repos?projectId=${projectId}`)}
          >
            <GitBranch size={16} /> View Repository
          </Button>
        )}
      </div>
    </div>
  );
}
