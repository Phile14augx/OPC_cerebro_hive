import React from "react";
import { CheckCircle2, Activity, Server, Database, Globe2 } from "lucide-react";

export default function StatusPage() {
  const systems = [
    { name: "API Gateway", status: "Operational", uptime: "100%", icon: Globe2 },
    { name: "AgentOS Core", status: "Operational", uptime: "99.98%", icon: Server },
    { name: "PostgreSQL Database", status: "Operational", uptime: "100%", icon: Database },
    { name: "NATS Event Bus", status: "Operational", uptime: "100%", icon: Activity },
    { name: "Knowledge Hub (Vector)", status: "Operational", uptime: "100%", icon: Database },
  ];

  // 90 days of synthetic status history (green dots)
  const historyDays = Array.from({ length: 90 }).map((_, i) => ({
    date: new Date(Date.now() - (89 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: i === 15 ? "Partial Outage" : i === 42 ? "Degraded Performance" : "Operational"
  }));

  return (
    <div className="min-h-screen bg-background pt-12 pb-20">
      <div className="container-wide max-w-4xl">
        
        {/* Header */}
        <div className="flex flex-col items-center justify-center text-center mb-16">
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mb-6 border border-green-500/30">
            <CheckCircle2 size={32} className="text-green-500" />
          </div>
          <h1 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-4">
            All Systems Operational
          </h1>
          <p className="text-text-secondary">
            This is a preview environment. Metrics reflect recent simulated telemetry.
          </p>
        </div>

        {/* Current Status */}
        <div className="bg-surface rounded-2xl border border-border p-6 mb-12 shadow-elevated">
          <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-6">Current Status</h2>
          <div className="flex flex-col gap-4">
            {systems.map((sys) => (
              <div key={sys.name} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background hover:border-border transition-colors">
                <div className="flex items-center gap-4">
                  <sys.icon size={18} className="text-text-muted" />
                  <span className="font-bold text-text-primary">{sys.name}</span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="hidden md:block text-xs font-mono text-text-muted">{sys.uptime} uptime</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" style={{ filter: "drop-shadow(0 0 6px #22c55e)" }} />
                    <span className="text-sm text-green-500 font-medium">{sys.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 90-Day History */}
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-elevated">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">90-Day History</h2>
            <span className="text-xs font-mono text-text-muted">99.98% Uptime</span>
          </div>
          
          <div className="flex flex-col gap-8">
            {systems.map((sys) => (
              <div key={sys.name} className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
                  <span>{sys.name}</span>
                </div>
                {/* Status Bar */}
                <div className="flex gap-1 h-8">
                  {historyDays.map((day, i) => (
                    <div 
                      key={i}
                      title={`${day.date}: ${day.status}`}
                      className={`flex-1 rounded-sm cursor-help transition-opacity hover:opacity-70 ${
                        day.status === "Operational" ? "bg-green-500/80" : 
                        day.status === "Degraded Performance" ? "bg-yellow-500/80" : "bg-red-500/80"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between text-[10px] text-text-muted font-mono mt-1">
                  <span>90 days ago</span>
                  <span>Today</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
