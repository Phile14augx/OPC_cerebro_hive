import React from "react";
import { Activity, ShieldCheck, TrendingUp, ChevronRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";

export function RightPanel() {
  return (
    <aside className="w-full flex flex-col gap-6">
      
      {/* System Insights */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted px-1 flex items-center gap-2">
          <TrendingUp size={14} /> AI Insights
        </h3>
        <Card className="p-4 border-l-4 border-l-purple-500 hover:border-border hover:border-l-purple-400 transition-colors">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h4 className="text-sm font-bold text-text-primary">Optimization Available</h4>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                Your "Sales Copilot" agent has a 12% higher token usage than average. We recommend switching to Claude 3.5 Haiku to reduce costs.
              </p>
              <Button variant="link" size="sm" className="px-0 h-auto mt-2 text-purple-400">View Recommendation</Button>
            </div>
          </div>
        </Card>
      </div>

      {/* System Status */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted px-1 flex items-center gap-2">
          <ShieldCheck size={14} /> System Status
        </h3>
        <Card className="p-4 flex flex-col gap-3 hover:border-primary-accent/40 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm font-bold text-text-primary">All Systems Operational</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary">OpenAI API</span>
              <span className="text-green-400">99.98%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary">Anthropic API</span>
              <span className="text-green-400">100%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary">Vector Database</span>
              <span className="text-yellow-400">Degraded</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted px-1 flex items-center gap-2">
          <Activity size={14} /> Activity Stream
        </h3>
        <div className="space-y-4 px-1">
          <div className="flex gap-3 relative before:absolute before:left-[11px] before:top-6 before:bottom-[-16px] before:w-px before:bg-border last:before:hidden">
            <div className="w-6 h-6 rounded-full bg-green-400/10 border border-green-400/20 flex items-center justify-center shrink-0 z-10">
              <CheckCircle2 size={12} className="text-green-400" />
            </div>
            <div className="pb-4">
              <p className="text-sm text-text-primary font-medium">Deployment Successful</p>
              <p className="text-xs text-text-secondary mt-0.5">HR Knowledge Base finished syncing.</p>
              <span className="text-[10px] font-bold text-text-muted mt-1 block">10m ago</span>
            </div>
          </div>

          <div className="flex gap-3 relative before:absolute before:left-[11px] before:top-6 before:bottom-[-16px] before:w-px before:bg-border last:before:hidden">
            <div className="w-6 h-6 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center shrink-0 z-10">
              <AlertTriangle size={12} className="text-yellow-400" />
            </div>
            <div className="pb-4">
              <p className="text-sm text-text-primary font-medium">Policy Violation</p>
              <p className="text-xs text-text-secondary mt-0.5">Attempt to export PII blocked by Data Guard.</p>
              <span className="text-[10px] font-bold text-text-muted mt-1 block">1h ago</span>
            </div>
          </div>
        </div>
      </div>
      
    </aside>
  );
}
