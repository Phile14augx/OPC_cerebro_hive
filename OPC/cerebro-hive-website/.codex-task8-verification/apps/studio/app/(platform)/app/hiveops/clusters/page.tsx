"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Server, Cpu, MemoryStick, HardDrive, Activity,
  CheckCircle2, AlertTriangle, XCircle, RefreshCw,
  ChevronDown, ChevronRight, Layers, Network,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";

const CLUSTERS = [
  {
    name: "eks-prod-us-east-1",
    env: "Production",
    provider: "AWS EKS",
    region: "us-east-1",
    version: "1.31",
    status: "healthy",
    nodes: [
      { name: "node-prod-01", role: "worker", instance: "m5.2xlarge", cpu: { used: 42, total: 8  }, mem: { used: 22, total: 32  }, pods: 18, status: "ready" },
      { name: "node-prod-02", role: "worker", instance: "m5.2xlarge", cpu: { used: 61, total: 8  }, mem: { used: 28, total: 32  }, pods: 22, status: "ready" },
      { name: "node-prod-03", role: "worker", instance: "m5.2xlarge", cpu: { used: 38, total: 8  }, mem: { used: 19, total: 32  }, pods: 16, status: "ready" },
      { name: "node-prod-04", role: "gpu",    instance: "g4dn.xlarge",cpu: { used: 77, total: 4  }, mem: { used: 14, total: 16  }, pods: 4,  status: "ready" },
      { name: "ctrl-plane-01",role: "control",instance: "t3.medium",  cpu: { used: 28, total: 2  }, mem: { used: 3,  total: 8   }, pods: 8,  status: "ready" },
    ],
    totalPods: 68, runningPods: 68,
    namespaces: ["cerebro-prod", "monitoring", "ingress-nginx", "cert-manager", "argocd"],
  },
  {
    name: "eks-staging-us-east-1",
    env: "Staging",
    provider: "AWS EKS",
    region: "us-east-1",
    version: "1.31",
    status: "healthy",
    nodes: [
      { name: "node-stg-01", role: "worker", instance: "m5.xlarge", cpu: { used: 28, total: 4 }, mem: { used: 11, total: 16 }, pods: 21, status: "ready" },
      { name: "node-stg-02", role: "worker", instance: "m5.xlarge", cpu: { used: 34, total: 4 }, mem: { used: 13, total: 16 }, pods: 19, status: "ready" },
    ],
    totalPods: 40, runningPods: 40,
    namespaces: ["cerebro-staging", "monitoring", "ingress-nginx", "cert-manager"],
  },
  {
    name: "eks-dev-us-east-1",
    env: "Development",
    provider: "AWS EKS",
    region: "us-east-1",
    version: "1.31",
    status: "degraded",
    nodes: [
      { name: "node-dev-01", role: "worker", instance: "t3.xlarge", cpu: { used: 71, total: 4 }, mem: { used: 13, total: 16 }, pods: 19, status: "ready" },
      { name: "node-dev-02", role: "worker", instance: "t3.xlarge", cpu: { used: 83, total: 4 }, mem: { used: 15, total: 16 }, pods: 16, status: "pressure" },
    ],
    totalPods: 35, runningPods: 30,
    namespaces: ["cerebro-dev", "monitoring", "ingress-nginx"],
  },
];

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; badge: string; label: string }> = {
  healthy:  { icon: <CheckCircle2 size={13} className="text-green-400" />,  badge: "bg-green-500/10 text-green-400 border-green-500/20",  label: "Healthy" },
  degraded: { icon: <AlertTriangle size={13} className="text-amber-400" />, badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",  label: "Degraded" },
  down:     { icon: <XCircle size={13} className="text-red-400" />,         badge: "bg-red-500/10 text-red-400 border-red-500/20",        label: "Down" },
  ready:    { icon: <CheckCircle2 size={11} className="text-green-400" />,  badge: "bg-green-500/10 text-green-400 border-green-500/20",  label: "Ready" },
  pressure: { icon: <AlertTriangle size={11} className="text-amber-400" />, badge: "bg-amber-500/10 text-amber-400 border-amber-500/20", label: "Pressure" },
};

const ROLE_COLOR: Record<string, string> = {
  worker:  "text-blue-400",
  gpu:     "text-violet-400",
  control: "text-teal-400",
};

function Bar({ pct, warn = 70, crit = 85 }: { pct: number; warn?: number; crit?: number }) {
  const color = pct >= crit ? "bg-red-400" : pct >= warn ? "bg-amber-400" : "bg-teal-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-background rounded-full border border-border">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-[9px] font-mono w-7 text-right ${pct >= crit ? "text-red-400" : pct >= warn ? "text-amber-400" : "text-text-muted"}`}>{pct}%</span>
    </div>
  );
}

export default function ClustersPage() {
  const [expanded, setExpanded] = useState<string>("eks-prod-us-east-1");

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Server size={18} className="text-cyan-400" />
          <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs">Kubernetes</Badge>
        </div>
        <h1 className="text-2xl font-space font-bold text-text-primary">Cluster Management</h1>
        <p className="text-text-secondary text-sm mt-1">Node health, resource utilization, and workload distribution across all Kubernetes clusters.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Clusters",     value: "3",   icon: Server },
          { label: "Total Nodes",  value: "9",   icon: Cpu },
          { label: "Running Pods", value: "138", icon: Layers },
          { label: "Namespaces",   value: "14",  icon: Network },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <Icon size={16} className="text-cyan-400" />
              </div>
              <div>
                <div className="text-xl font-space font-bold text-text-primary">{s.value}</div>
                <div className="text-[10px] text-text-muted">{s.label}</div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Cluster list */}
      <div className="space-y-3">
        {CLUSTERS.map((cluster) => {
          const isExpanded = expanded === cluster.name;
          const cfg = STATUS_CONFIG[cluster.status];
          const avgCpu = Math.round(cluster.nodes.reduce((s, n) => s + n.cpu.used, 0) / cluster.nodes.length);
          const avgMem = Math.round(cluster.nodes.reduce((s, n) => s + (n.mem.used / n.mem.total) * 100, 0) / cluster.nodes.length);

          return (
            <Card key={cluster.name} className={`overflow-hidden ${isExpanded ? (cluster.status === "degraded" ? "border-amber-500/20" : "border-teal-500/20") : ""}`}>
              <button
                className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-surface-elevated/20 transition-colors"
                onClick={() => setExpanded(isExpanded ? "" : cluster.name)}
              >
                {cfg.icon}
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-text-primary font-mono">{cluster.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold ${cfg.badge}`}>{cfg.label}</span>
                    <Badge variant="secondary" className="text-[9px]">{cluster.env}</Badge>
                    <Badge variant="secondary" className="text-[9px]">{cluster.provider}</Badge>
                    <span className="text-[9px] text-text-muted">k8s {cluster.version}</span>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-[10px] text-text-muted shrink-0">
                  <span>{cluster.nodes.length} nodes</span>
                  <span className={cluster.runningPods < cluster.totalPods ? "text-amber-400" : "text-green-400"}>
                    {cluster.runningPods}/{cluster.totalPods} pods
                  </span>
                  <span>CPU {avgCpu}%</span>
                  <span>Mem {avgMem}%</span>
                </div>
                {isExpanded ? <ChevronDown size={14} className="text-text-muted" /> : <ChevronRight size={14} className="text-text-muted" />}
              </button>

              {isExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  className="border-t border-border">
                  {/* Nodes table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border bg-surface-elevated/30">
                          {["Node", "Role", "Instance", "CPU", "Memory", "Pods", "Status"].map(h => (
                            <th key={h} className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {cluster.nodes.map((node, i) => {
                          const nc = STATUS_CONFIG[node.status] ?? STATUS_CONFIG.ready;
                          const memPct = Math.round((node.mem.used / node.mem.total) * 100);
                          return (
                            <tr key={i} className="border-b border-border/50 hover:bg-surface-elevated/10 transition-colors">
                              <td className="px-4 py-3 font-mono text-[11px] text-text-primary">{node.name}</td>
                              <td className="px-4 py-3"><span className={`text-[10px] font-semibold capitalize ${ROLE_COLOR[node.role] ?? "text-text-muted"}`}>{node.role}</span></td>
                              <td className="px-4 py-3 font-mono text-[10px] text-text-muted">{node.instance}</td>
                              <td className="px-4 py-3 w-32"><Bar pct={node.cpu.used} /></td>
                              <td className="px-4 py-3 w-32"><Bar pct={memPct} /></td>
                              <td className="px-4 py-3 text-text-secondary">{node.pods}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full border font-semibold ${nc.badge}`}>
                                  {nc.icon} {nc.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {/* Namespaces */}
                  <div className="px-5 py-3 border-t border-border bg-surface-elevated/20">
                    <span className="text-[10px] text-text-muted mr-2">Namespaces:</span>
                    {cluster.namespaces.map((ns) => (
                      <Badge key={ns} variant="secondary" className="text-[9px] mr-1 font-mono">{ns}</Badge>
                    ))}
                  </div>
                </motion.div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
