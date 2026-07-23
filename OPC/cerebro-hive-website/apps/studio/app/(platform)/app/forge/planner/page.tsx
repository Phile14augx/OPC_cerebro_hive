"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Brain, Sparkles, Play, ChevronRight, FolderKanban,
  FileText, Network, GitMerge, Calendar, Users, Target,
  CheckCircle2, Clock, ArrowRight, Loader2, Plus,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { StatCard } from "../../components/ui/StatCard";
import { useForgeActions, useForgeProject } from "@/lib/forge/hooks";
import { forgeApi } from "@/lib/forge/api-client";
import type { ForgePlan } from "@cerebro/workflow";

const planningPhases = [
  { label: "Business Understanding",   icon: Target,       key: "business"  },
  { label: "Requirement Extraction",   icon: FileText,     key: "extraction" },
  { label: "Knowledge Graph",          icon: Network,      key: "knowledge"  },
  { label: "Feature Graph",            icon: GitMerge,     key: "feature"    },
  { label: "Task Graph",               icon: FolderKanban, key: "task"       },
  { label: "Development Plan",         icon: Calendar,     key: "plan"       },
];

export default function AIPlannerPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  const { project } = useForgeProject(projectId ?? "");
  const { running, error, runPlanner } = useForgeActions(projectId ?? "");

  const [prompt, setPrompt] = useState("");
  const [plan, setPlan] = useState<ForgePlan | null>(null);
  const [phasesDone, setPhasesDone] = useState(0);

  // Pre-fill prompt from project
  useEffect(() => {
    if (project?.prompt && !prompt) setPrompt(project.prompt);
    if (project?.planJson) setPlan(project.planJson as ForgePlan);
  }, [project]);

  const handlePlan = async () => {
    if (!projectId || !prompt.trim()) return;
    setPhasesDone(0);
    // Animate phases while waiting for AI
    const interval = setInterval(() => setPhasesDone(n => Math.min(n + 1, planningPhases.length - 1)), 400);
    const result = await runPlanner(prompt);
    clearInterval(interval);
    setPhasesDone(planningPhases.length);
    if (result) setPlan(result);
  };

  const planned = plan !== null;

  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Brain size={20} className="text-violet-400" />
          <Badge className="bg-violet-500/10 text-violet-400 border border-violet-500/20 text-xs">AI Planner</Badge>
        </div>
        <h1 className="text-3xl font-space font-bold text-text-primary">AI Planner</h1>
        <p className="text-text-secondary mt-1">Describe your software idea. Cerebro produces a complete project plan.</p>
      </div>

      {/* Input */}
      <Card className="p-0 overflow-hidden border-violet-500/20">
        <div className="flex items-center gap-4 px-6 py-4">
          <Brain size={20} className="text-violet-400 shrink-0" />
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='Describe your software idea...'
            className="flex-1 bg-transparent border-none focus:outline-none text-text-primary placeholder:text-text-muted text-base font-medium"
          />
          <Button
            onClick={handlePlan}
            disabled={running || !projectId}
            className="gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold disabled:opacity-50"
          >
            {running ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {running ? "Planning..." : "Generate Plan"}
          </Button>
        </div>
        <div className="border-t border-border bg-surface-elevated/30 px-6 py-3 flex flex-wrap gap-2">
          {["Hospital ERP", "Airline Booking", "SaaS CRM", "E-Commerce", "Banking App", "School LMS"].map(s => (
            <button key={s} onClick={() => setPrompt(`Build a ${s}`)}
              className="text-xs px-3 py-1 rounded-lg bg-background border border-border text-text-secondary hover:text-violet-400 hover:border-violet-500/30 transition-colors">
              {s}
            </button>
          ))}
        </div>
      </Card>

      {/* Planning Phases Pipeline */}
      {(running || planned) && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted px-1">Requirement Intelligence Engine</h2>
          <div className="flex flex-wrap gap-3">
            {planningPhases.map((phase, i) => {
              const isDone = i < phasesDone;
              const isActive = running && i === phasesDone;
              return (
                <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                  isActive
                    ? "border-violet-500/30 bg-violet-500/10 text-violet-400 animate-pulse"
                    : isDone
                    ? "border-green-500/20 bg-green-500/10 text-green-400"
                    : "border-border bg-surface text-text-muted"
                }`}>
                  {isActive
                    ? <Loader2 size={14} className="animate-spin" />
                    : isDone
                    ? <CheckCircle2 size={14} />
                    : <Clock size={14} />
                  }
                  {phase.label}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Generated Plan */}
      {planned && !running && plan && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

          {/* Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="User Stories"  value={String(plan.totalStories)}      change={`Across ${plan.modules.length} modules`} icon={FileText}  trend="up" />
            <StatCard label="API Endpoints" value={String(plan.totalApis)}         change="REST + GraphQL"                         icon={Network}   trend="up" />
            <StatCard label="Actors"        value={String(plan.actors.length)}     change="Roles defined"                          icon={Users}     trend="up" />
            <StatCard label="Milestones"    value={String(plan.milestones.length)} change={`~${plan.milestones.length * 2} weeks`} icon={Calendar}  trend="up" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Modules */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted px-1">Feature Graph — Modules</h2>
              <div className="space-y-3">
                {plan.modules.map((mod, i) => (
                  <Card key={i} className="p-4 hover:border-violet-500/20 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-text-primary text-sm">{mod.name}</h3>
                        <p className="text-xs text-text-muted mt-0.5">{mod.storyCount} user stories &middot; {mod.apiCount} APIs</p>
                        {mod.description && <p className="text-xs text-text-muted mt-1 truncate max-w-md">{mod.description}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={mod.priority === "critical" ? "destructive" : mod.priority === "high" ? "warning" : "secondary"}>
                          {mod.priority}
                        </Badge>
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                          Design <ArrowRight size={10} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {/* Actors */}
              <div className="space-y-3">
                <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted px-1">Actors & Permissions</h2>
                <Card className="p-4 space-y-2">
                  {plan.actors.map((actor, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div className="w-6 h-6 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                        <span className="text-[9px] font-bold text-violet-400">{actor.charAt(0)}</span>
                      </div>
                      <span className="text-text-secondary">{actor}</span>
                    </div>
                  ))}
                </Card>
              </div>

              {/* Milestones */}
              <div className="space-y-3">
                <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted px-1">Project Timeline</h2>
                <Card className="p-4 space-y-3">
                  {plan.milestones.map((m, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[9px] font-bold text-violet-400">{i + 1}</span>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-text-primary">{m.title}</p>
                        <p className="text-[10px] text-text-muted">{m.weekLabel}</p>
                      </div>
                    </div>
                  ))}
                </Card>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              onClick={() => window.location.href = `/app/forge/requirements?projectId=${projectId}`}
              className="gap-2 bg-violet-600 hover:bg-violet-700 text-white"
            >
              <ChevronRight size={16} /> Proceed to Requirements Studio
            </Button>
            <Button variant="ghost" className="gap-2 text-text-muted" onClick={handlePlan}>
              Regenerate Plan
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
