"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Rocket, CheckCircle2, AlertTriangle, XCircle, Clock,
  RefreshCw, ArrowRight, RotateCcw, ChevronDown, ChevronRight,
  GitMerge, Layers, Zap,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";

const ENVIRONMENTS = [
  {
    name: "Production",
    cluster: "eks-prod-us-east-1",
    color: "text-green-400",
    border: "border-green-500/20",
    services: [
      { name: "studio",      version: "v2.14.3", status: "healthy",  replicas: "3/3", image: "ghcr.io/cerebro/studio:v2.14.3",      lastDeploy: "2h ago" },
      { name: "forge-api",   version: "v2.14.2", status: "healthy",  replicas: "2/2", image: "ghcr.io/cerebro/forge-api:v2.14.2",   lastDeploy: "3h ago" },
      { name: "platform-api",version: "v2.14.3", status: "healthy",  replicas: "3/3", image: "ghcr.io/cerebro/platform-api:v2.14.3", lastDeploy: "2h ago" },
      { name: "ai-gateway",  version: "v2.14.1", status: "healthy",  replicas: "2/2", image: "ghcr.io/cerebro/ai-gateway:v2.14.1",  lastDeploy: "1d ago" },
      { name: "ml-svc",      version: "v2.14.0", status: "healthy",  replicas: "1/1", image: "ghcr.io/cerebro/ml-svc:v2.14.0",      lastDeploy: "2d ago" },
    ],
  },
  {
    name: "Staging",
    cluster: "eks-staging-us-east-1",
    color: "text-blue-400",
    border: "border-blue-500/20",
    services: [
      { name: "studio",      version: "v2.15.0", status: "healthy",  replicas: "1/1", image: "ghcr.io/cerebro/studio:v2.15.0",      lastDeploy: "45m ago" },
      { name: "forge-api",   version: "v2.15.0", status: "healthy",  replicas: "1/1", image: "ghcr.io/cerebro/forge-api:v2.15.0",   lastDeploy: "45m ago" },
      { name: "platform-api",version: "v2.15.0", status: "healthy",  replicas: "1/1", image: "ghcr.io/cerebro/platform-api:v2.15.0", lastDeploy: "45m ago" },
      { name: "ai-gateway",  version: "v2.15.0", status: "healthy",  replicas: "1/1", image: "ghcr.io/cerebro/ai-gateway:v2.15.0",  lastDeploy: "45m ago" },
      { name: "ml-svc",      version: "v2.15.0", status: "healthy",  replicas: "1/1", image: "ghcr.io/cerebro/ml-svc:v2.15.0",      lastDeploy: "45m ago" },
    ],
  },
  {
    name: "Development",
    cluster: "eks-dev-us-east-1",
    color: "text-amber-400",
    border: "border-amber-500/20",
    services: [
      { name: "studio",      version: "v2.15.1-sha.d7c40e1", status: "healthy",  replicas: "1/1", image: "ghcr.io/cerebro/studio:sha-d7c40e1",       lastDeploy: "5m ago" },
      { name: "forge-api",   version: "v2.15.1-sha.d7c40e1", status: "deploying",replicas: "0/1", image: "ghcr.io/cerebro/forge-api:sha-d7c40e1",    lastDeploy: "now" },
      { name: "platform-api",version: "v2.15.0",             status: "healthy",  replicas: "1/1", image: "ghcr.io/cerebro/platform-api:v2.15.0",      lastDeploy: "45m ago" },
      { name: "ai-gateway",  version: "v2.15.0",             status: "degraded", replicas: "0/1", image: "ghcr.io/cerebro/ai-gateway:v2.15.0",        lastDeploy: "1h ago" },
      { name: "ml-svc",      version: "v2.14.0",             status: "healthy",  replicas: "1/1", image: "ghcr.io/cerebro/ml-svc:v2.14.0",            lastDeploy: "2d ago" },
    ],
  },
];

const SERVICE_STATUS_CONFIG: Record<string, { icon: React.ReactNode; badge: string }> = {
  healthy:   { icon: <CheckCircle2 size={12} className="text-green-400" />,                        badge: "bg-green-500/10 text-green-400 border-green-500/20" },
  deploying: { icon: <RefreshCw size={12} className="text-blue-400 animate-spin" />,               badge: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  degraded:  { icon: <AlertTriangle size={12} className="text-amber-400" />,                       badge: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  failed:    { icon: <XCircle size={12} className="text-red-400" />,                               badge: "bg-red-500/10 text-red-400 border-red-500/20" },
};

const RECENT_PROMOTIONS = [
  { from: "Staging",  to: "Production", version: "v2.14.3", actor: "phil",             when: "2h ago",   status: "success" },
  { from: "Dev",      to: "Staging",    version: "v2.15.0", actor: "github-actions",   when: "45m ago",  status: "success" },
  { from: "Dev",      to: "Staging",    version: "v2.15.1", actor: "phil",             when: "5m ago",   status: "in_progress" },
];

export default function DeploymentsPage() {
  const [expanded, setExpanded] = useState<string>("Production");

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Rocket size={18} className="text-blue-400" />
          <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs">Environments</Badge>
        </div>
        <h1 className="text-2xl font-space font-bold text-text-primary">Deployments & Environments</h1>
        <p className="text-text-secondary text-sm mt-1">Live deployment status across all environments. Promote, rollback, and inspect service versions.</p>
      </div>

      {/* Promotion flow */}
      <Card className="p-5 border-teal-500/20">
        <h2 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4">Promotion Pipeline</h2>
        <div className="flex items-center gap-3 flex-wrap">
          {["Development", "Staging", "Production"].map((env, i) => (
            <React.Fragment key={env}>
              <div className="flex flex-col items-center gap-1">
                <div className={`px-4 py-2 rounded-xl border text-xs font-bold ${
                  env === "Production" ? "bg-green-500/10 border-green-500/30 text-green-400" :
                  env === "Staging"    ? "bg-blue-500/10 border-blue-500/30 text-blue-400" :
                                        "bg-amber-500/10 border-amber-500/30 text-amber-400"
                }`}>{env}</div>
              </div>
              {i < 2 && (
                <div className="flex flex-col items-center gap-1">
                  <Button variant="secondary" size="sm" className="gap-1 text-[10px] h-7">
                    Promote <ArrowRight size={10} />
                  </Button>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Recent Promotions</h3>
          {RECENT_PROMOTIONS.map((p, i) => (
            <div key={i} className="flex items-center gap-3 text-[10px] text-text-secondary">
              {p.status === "success"     ? <CheckCircle2 size={10} className="text-green-400" /> :
               p.status === "in_progress" ? <RefreshCw size={10} className="text-blue-400 animate-spin" /> :
                                            <XCircle size={10} className="text-red-400" />}
              <span className="text-text-primary font-semibold">{p.version}</span>
              <span>{p.from} → {p.to}</span>
              <span className="text-text-muted">by {p.actor}</span>
              <span className="text-text-muted ml-auto">{p.when}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Environment accordions */}
      <div className="space-y-3">
        {ENVIRONMENTS.map((env) => {
          const isExpanded = expanded === env.name;
          const degradedCount = env.services.filter(s => s.status === "degraded" || s.status === "failed").length;
          const deployingCount = env.services.filter(s => s.status === "deploying").length;

          return (
            <Card key={env.name} className={`overflow-hidden ${isExpanded ? env.border : ""}`}>
              <button
                className="w-full px-5 py-4 flex items-center gap-3 text-left hover:bg-surface-elevated/30 transition-colors"
                onClick={() => setExpanded(isExpanded ? "" : env.name)}
              >
                <Layers size={16} className={env.color} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-text-primary">{env.name}</span>
                    <span className="text-[10px] text-text-muted font-mono">{env.cluster}</span>
                    {degradedCount > 0 && <Badge className="text-[9px] bg-amber-500/10 text-amber-400 border-amber-500/20">{degradedCount} degraded</Badge>}
                    {deployingCount > 0 && <Badge className="text-[9px] bg-blue-500/10 text-blue-400 border-blue-500/20">{deployingCount} deploying</Badge>}
                  </div>
                </div>
                <span className="text-[10px] text-text-muted">{env.services.length} services</span>
                {isExpanded ? <ChevronDown size={14} className="text-text-muted" /> : <ChevronRight size={14} className="text-text-muted" />}
              </button>

              {isExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  className="border-t border-border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border bg-surface-elevated/30">
                          {["Service", "Version", "Status", "Replicas", "Last Deploy", "Actions"].map(h => (
                            <th key={h} className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {env.services.map((svc, i) => {
                          const cfg = SERVICE_STATUS_CONFIG[svc.status] ?? SERVICE_STATUS_CONFIG.healthy;
                          return (
                            <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                              className="border-b border-border/50 hover:bg-surface-elevated/20 transition-colors">
                              <td className="px-4 py-3 font-bold text-text-primary">{svc.name}</td>
                              <td className="px-4 py-3 font-mono text-text-muted text-[10px] max-w-[200px] truncate">{svc.version}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-semibold ${cfg.badge}`}>
                                  {cfg.icon} {svc.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-mono text-[11px]">
                                <span className={svc.replicas.split("/")[0] === svc.replicas.split("/")[1] ? "text-green-400" : "text-amber-400"}>
                                  {svc.replicas}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-text-muted text-[10px]">{svc.lastDeploy}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1">
                                  <Button variant="ghost" size="sm" className="h-6 text-[9px] gap-0.5 text-text-secondary hover:text-teal-400">
                                    <RotateCcw size={9} /> Rollback
                                  </Button>
                                  {svc.status === "degraded" && (
                                    <Button variant="ghost" size="sm" className="h-6 text-[9px] gap-0.5 text-amber-400">
                                      <Zap size={9} /> Heal
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
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
