"use client";

import React from "react";
import { 
  Bot, BookOpen, DatabaseZap, LayoutPanelLeft,
  Activity, CheckCircle2, AlertCircle, Plus, Terminal
} from "lucide-react";
import Link from "next/link";
import { StatCard } from "../components/ui/StatCard";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../components/ui/Table";

export default function AIOptionsOverview() {
  const metrics = [
    { label: "Active Agents", value: "18", change: "+3 this week", icon: Bot, trend: "up" as const },
    { label: "Total Completions", value: "1.2M", change: "+12% vs last month", icon: Activity, trend: "up" as const },
    { label: "Vector Embeddings", value: "450K", change: "+24K today", icon: DatabaseZap, trend: "up" as const },
    { label: "Knowledge Health", value: "98%", change: "2 issues found", icon: BookOpen, trend: "down" as const },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-space font-bold text-text-primary">AI Operations</h1>
          <p className="text-text-secondary mt-1">Manage agents, models, and knowledge across your organization.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary">View Analytics</Button>
          <Button className="gap-2">
            <Plus size={16} /> New AI Resource
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, i) => (
          <StatCard key={i} {...metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Agents */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted px-1">Active Agents</h2>
          <Card className="overflow-hidden p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[45%]">Agent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: "Customer Support L1", desc: "Handles initial triage", status: "Running", model: "GPT-4o", requests: "45k/day" },
                  { name: "Internal Knowledge Bot", desc: "Searches Confluence & Jira", status: "Running", model: "Claude 3.5 Sonnet", requests: "2.1k/day" },
                  { name: "Code Review Assistant", desc: "PR analysis and linting", status: "Degraded", model: "GPT-4o", requests: "18k/day" },
                ].map((agent, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-background border border-border flex items-center justify-center shrink-0">
                          <Bot size={14} className="text-primary-accent" />
                        </div>
                        <div>
                          <h4 className="font-bold text-text-primary text-sm">{agent.name}</h4>
                          <p className="text-xs text-text-secondary mt-0.5">{agent.desc}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={agent.status === 'Running' ? 'success' : 'warning'}>
                        {agent.status === 'Running' && <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse mr-1" />}
                        {agent.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-text-secondary bg-background px-2 py-1 border border-border rounded-md">{agent.model}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="link" size="sm">Manage</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted px-1">Quick Actions</h2>
            <div className="flex flex-col gap-2">
              <Link href="/app/ai/studio">
                <Card className="flex items-center justify-between p-4 hover:border-primary-accent/40 transition-colors group">
                  <div className="flex items-center gap-3">
                    <LayoutPanelLeft size={18} className="text-text-primary group-hover:text-primary-accent transition-colors" />
                    <span className="text-sm font-bold text-text-primary">Open AI Studio</span>
                  </div>
                  <ChevronRightIcon size={16} className="text-text-muted group-hover:text-primary-accent transition-colors" />
                </Card>
              </Link>
              <Link href="/app/ai/prompts">
                <Card className="flex items-center justify-between p-4 hover:border-primary-accent/40 transition-colors group">
                  <div className="flex items-center gap-3">
                    <Terminal size={18} className="text-text-primary group-hover:text-primary-accent transition-colors" />
                    <span className="text-sm font-bold text-text-primary">Prompt Library</span>
                  </div>
                  <ChevronRightIcon size={16} className="text-text-muted group-hover:text-primary-accent transition-colors" />
                </Card>
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">System Events</h2>
              <button className="text-xs font-bold text-text-muted hover:text-primary-accent transition-colors">View Logs</button>
            </div>
            <Card className="p-4 space-y-4">
              {[
                { time: "10m ago", msg: "Knowledge Base 'Company Wiki' sync completed", icon: CheckCircle2, color: "text-green-400" },
                { time: "1h ago", msg: "New agent 'Sales Copilot' deployed to Production", icon: Bot, color: "text-blue-400" },
                { time: "2h ago", msg: "Latency spike detected in GPT-4o proxy", icon: AlertCircle, color: "text-yellow-400" },
              ].map((evt, i) => (
                <div key={i} className="flex gap-3">
                  <evt.icon size={14} className={`mt-0.5 shrink-0 ${evt.color}`} />
                  <div>
                    <p className="text-sm text-text-primary">{evt.msg}</p>
                    <span className="text-xs text-text-muted">{evt.time}</span>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronRightIcon({ className, size }: { className?: string, size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
