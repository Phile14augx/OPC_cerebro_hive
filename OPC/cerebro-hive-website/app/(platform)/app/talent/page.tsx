"use client";

import React from "react";
import { 
  Users, Bot, Target, FileStack, TrendingUp, CheckCircle2, 
  ChevronRight, Calendar, Search, Filter, MoreVertical, Star
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { StatCard } from "../components/ui/StatCard";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../components/ui/Table";

export default function TalentDashboard() {
  const metrics = [
    { label: "Active Candidates", value: "248", change: "+12 this week", icon: Users, trend: "up" as const },
    { label: "AI Evaluations Pending", value: "14", change: "Processing...", icon: Bot, trend: "neutral" as const },
    { label: "Avg. Assessment Score", value: "78.4", change: "+2.1% vs last month", icon: Target, trend: "up" as const },
    { label: "Offers Extended", value: "8", change: "2 accepted", icon: CheckCircle2, trend: "up" as const },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-space font-bold text-text-primary">Hiring Pipeline</h1>
          <p className="text-text-secondary mt-1">Manage technical assessments and AI-driven candidate evaluations.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary">Campaign Settings</Button>
          <Button className="gap-2">
            Create Assessment
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
        {/* Active Pipeline (Data Grid) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Recent Assessments</h2>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="h-8 text-xs text-text-muted"><Filter size={14} className="mr-2"/> Filter</Button>
              <Button variant="ghost" size="sm" className="h-8 text-xs text-text-muted"><Search size={14} className="mr-2"/> Search</Button>
            </div>
          </div>
          <Card className="overflow-hidden p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Candidate</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>AI Score</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: "Sarah Jenkins", email: "sarah.j@example.com", role: "Senior Backend Eng", score: "92", status: "Review", hl: "Code" },
                  { name: "Michael Chang", email: "m.chang@example.com", role: "AI Solutions Architect", score: "88", status: "Evaluating", hl: "Arch" },
                  { name: "Elena Rodriguez", email: "elena.r@example.com", role: "Frontend Developer", score: "95", status: "Offer", hl: "React" },
                  { name: "David Kim", email: "dkim99@example.com", role: "Data Engineer", score: "74", status: "Rejected", hl: "SQL" },
                ].map((candidate, i) => (
                  <TableRow key={i} className="group">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-elevated border border-border flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold">{candidate.name.charAt(0)}</span>
                        </div>
                        <div>
                          <Link href={`/app/talent/candidates/${candidate.name.toLowerCase().replace(' ', '-')}`} className="font-bold text-text-primary text-sm hover:text-primary-accent transition-colors">
                            {candidate.name}
                          </Link>
                          <p className="text-xs text-text-secondary mt-0.5">{candidate.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-text-primary">{candidate.role}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "font-bold text-sm",
                          parseInt(candidate.score) >= 90 ? "text-green-400" : parseInt(candidate.score) >= 80 ? "text-blue-400" : "text-yellow-400"
                        )}>{candidate.score}</span>
                        <Badge variant="secondary" className="px-1.5 py-0 h-4 text-[10px]">Top {candidate.hl}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={
                        candidate.status === 'Offer' ? 'success' : 
                        candidate.status === 'Review' ? 'secondary' : 
                        candidate.status === 'Rejected' ? 'destructive' : 'warning'
                      }>
                        {candidate.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Right Panel: Upcoming Interviews & Analytics */}
        <div className="space-y-8">
          
          {/* Upcoming Interviews */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted px-1">Upcoming Interviews</h2>
            <Card className="p-4 space-y-4">
              {[
                { time: "Today, 2:00 PM", name: "Sarah Jenkins", type: "System Design", color: "text-purple-400" },
                { time: "Tomorrow, 10:00 AM", name: "Elena Rodriguez", type: "Culture Fit", color: "text-blue-400" },
              ].map((interview, i) => (
                <div key={i} className="flex gap-3 items-start border-b border-border/50 pb-3 last:border-0 last:pb-0">
                  <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar size={14} className={interview.color} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">{interview.name}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{interview.type} • {interview.time}</p>
                  </div>
                </div>
              ))}
              <Button variant="secondary" className="w-full text-xs">View Calendar</Button>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted px-1">Quick Links</h2>
            <div className="flex flex-col gap-2">
              <Link href="/app/talent/builder">
                <Card className="flex items-center justify-between p-3 hover:border-primary-accent/40 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-elevated border border-border flex items-center justify-center">
                      <Target size={14} className="text-text-primary group-hover:text-primary-accent transition-colors" />
                    </div>
                    <span className="text-sm font-bold text-text-primary">Assessment Builder</span>
                  </div>
                  <ChevronRight size={16} className="text-text-muted group-hover:text-primary-accent transition-colors" />
                </Card>
              </Link>
              <Link href="/app/talent/questions">
                <Card className="flex items-center justify-between p-3 hover:border-primary-accent/40 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-elevated border border-border flex items-center justify-center">
                      <FileStack size={14} className="text-text-primary group-hover:text-primary-accent transition-colors" />
                    </div>
                    <span className="text-sm font-bold text-text-primary">Question Bank</span>
                  </div>
                  <ChevronRight size={16} className="text-text-muted group-hover:text-primary-accent transition-colors" />
                </Card>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
