"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Hammer, Brain, Sparkles, Play, Plus, ChevronRight,
  FileCode2, Layers3, TestTube2, Truck, GitBranch,
  Globe, Smartphone, Monitor, MessageCircle, ServerCog, Database,
  Webhook, PenTool, ScanSearch, BookOpen, ArrowUpRight,
  FolderKanban, Users, Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { StatCard } from "../components/ui/StatCard";
import { useForgeProjects } from "@/lib/forge/hooks";
import { forgeApi } from "@/lib/forge/api-client";

const studioModules = [
  { title: "AI Planner",          href: "/app/forge/planner",      icon: Brain,        description: "Turn ideas into structured project plans",     badge: "Phase 1", color: "text-violet-400", bg: "bg-violet-400/10" },
  { title: "Requirements Studio", href: "/app/forge/requirements",  icon: FileCode2,    description: "Auto-generate PRDs, user stories, schemas",    badge: "Phase 2", color: "text-blue-400",   bg: "bg-blue-400/10" },
  { title: "Architecture Studio", href: "/app/forge/architect",     icon: Layers3,      description: "DDD, microservices, clean architecture design", badge: "Phase 3", color: "text-cyan-400",   bg: "bg-cyan-400/10" },
  { title: "UI/UX Studio",        href: "/app/forge/ui-studio",     icon: PenTool,      description: "Branding, wireframes, design tokens, screens",  badge: "Phase 4", color: "text-pink-400",   bg: "bg-pink-400/10" },
  { title: "Code Generation",     href: "/app/forge/codegen",       icon: Sparkles,     description: "Multi-framework production code generation",    badge: "Phase 5", color: "text-amber-400",  bg: "bg-amber-400/10" },
  { title: "Mobile Studio",       href: "/app/forge/mobile",        icon: Smartphone,   description: "Android, iOS, React Native, Flutter",           badge: "Phase 6", color: "text-green-400",  bg: "bg-green-400/10" },
  { title: "Web Studio",          href: "/app/forge/web",           icon: Globe,        description: "CRM, ERP, SaaS, dashboard generation",         badge: "Phase 7", color: "text-sky-400",    bg: "bg-sky-400/10" },
  { title: "Desktop Studio",      href: "/app/forge/desktop",       icon: Monitor,      description: "Electron, Tauri, .NET MAUI native apps",        badge: "Phase 8", color: "text-orange-400", bg: "bg-orange-400/10" },
  { title: "CerebroBots",         href: "/app/forge/bots",          icon: MessageCircle,description: "WhatsApp, Slack, Teams, Voice bots",            badge: "Phase 9", color: "text-red-400",    bg: "bg-red-400/10" },
  { title: "API Studio",          href: "/app/forge/api",           icon: Webhook,      description: "REST, GraphQL, gRPC, OpenAPI design",           badge: "Phase 10", color: "text-indigo-400", bg: "bg-indigo-400/10" },
  { title: "Database Studio",     href: "/app/forge/database",      icon: Database,     description: "Schema design, migrations, ER diagrams",        badge: "Phase 11", color: "text-teal-400",   bg: "bg-teal-400/10" },
  { title: "Testing Intelligence",href: "/app/forge/testing",       icon: TestTube2,    description: "Unit, E2E, performance, security tests",         badge: "Phase 12", color: "text-lime-400",   bg: "bg-lime-400/10" },
  { title: "AI Code Review",      href: "/app/forge/review",        icon: ScanSearch,   description: "Security, SOLID, performance analysis",         badge: "Phase 13", color: "text-yellow-400", bg: "bg-yellow-400/10" },
  { title: "Deployment Studio",   href: "/app/forge/deploy",        icon: Truck,        description: "Docker, K8s, Terraform, CI/CD pipelines",       badge: "Phase 14", color: "text-emerald-400",bg: "bg-emerald-400/10" },
  { title: "Backend Studio",      href: "/app/forge/backend",       icon: ServerCog,    description: "Spring Boot, .NET, Go, FastAPI, NestJS",        badge: "Core",    color: "text-purple-400", bg: "bg-purple-400/10" },
  { title: "AI Documentation",    href: "/app/forge/docs",          icon: BookOpen,     description: "Auto-generate technical docs & API references",  badge: "Core",    color: "text-rose-400",   bg: "bg-rose-400/10" },
  { title: "Monitoring & Ops",    href: "/app/forge/monitoring",    icon: ArrowUpRight, description: "Uptime, SLOs, alerts, and live service health",   badge: "Phase 15", color: "text-cyan-400",   bg: "bg-cyan-400/10" },
];

const AGENT_ROSTER = [
  { name: "PM Agent",       role: "Product Manager",    key: "pm" },
  { name: "Arch Agent",     role: "Solution Architect", key: "architect" },
  { name: "UX Agent",       role: "UX Designer",        key: "ux" },
  { name: "Frontend Agent", role: "Frontend Engineer",  key: "frontend" },
  { name: "Backend Agent",  role: "Backend Engineer",   key: "backend" },
  { name: "QA Agent",       role: "QA Engineer",        key: "qa" },
  { name: "DevOps Agent",   role: "DevOps Engineer",    key: "devops" },
  { name: "Security Agent", role: "Security Engineer",  key: "security" },
];

function phaseProgress(phase: string): number {
  const phases = ["idea","planning","requirements","architecture","design","implementation","testing","review","deployment","monitoring"];
  const idx = phases.indexOf(phase);
  return idx < 0 ? 0 : Math.round(((idx + 1) / phases.length) * 100);
}

export default function ForgeDashboard() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [creating, setCreating] = useState(false);
  const { projects, loading } = useForgeProjects();

  // Most recently updated active project — used to inject projectId into studio links
  const contextProject = projects
    .filter(p => !["draft", "deleted"].includes(p.forgeStatus))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
  const contextId = contextProject?.id ?? "";

  const activeProjects = projects.filter(p => !["draft","deleted"].includes(p.forgeStatus));
  const totalAgents = activeProjects.reduce((s, p) => s + p.activeAgents.length, 0);
  const totalModules = projects.reduce((s, p) => s + p.totalModules, 0);
  const totalApis = projects.reduce((s, p) => s + p.totalApis, 0);

  const handleBuild = useCallback(async () => {
    if (!prompt.trim()) return;
    setCreating(true);
    try {
      const project = await forgeApi.projects.create({ name: prompt.slice(0, 80), prompt });
      router.push(`/app/forge/planner?projectId=${project.id}`);
    } finally {
      setCreating(false);
    }
  }, [prompt, router]);

  const handleNewProject = useCallback(async () => {
    setCreating(true);
    try {
      const project = await forgeApi.projects.create({ name: "New Project" });
      router.push(`/app/forge/planner?projectId=${project.id}`);
    } finally {
      setCreating(false);
    }
  }, [router]);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Hammer size={20} className="text-amber-400" />
            </div>
            <Badge variant="warning" className="text-xs">AI Software Factory</Badge>
          </div>
          <h1 className="text-3xl font-space font-bold text-text-primary">CerebroForge™</h1>
          <p className="text-text-secondary mt-1">
            Describe any software. Cerebro designs, builds, tests, and ships it.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="gap-2"><GitBranch size={16} /> Repository Manager</Button>
          <Button
            onClick={handleNewProject}
            disabled={creating}
            className="gap-2 bg-amber-500 hover:bg-amber-600 text-black font-bold"
          >
            {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} New Project
          </Button>
        </div>
      </div>

      {/* AI Build Command Center */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/30 via-orange-500/20 to-red-500/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
        <div className="relative bg-surface border-2 border-amber-500/20 group-hover:border-amber-500/40 rounded-2xl overflow-hidden transition-colors shadow-elevated">
          <div className="flex items-center px-6 py-4 gap-4">
            <Hammer size={22} className="text-amber-400 shrink-0" />
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='e.g. "Build a Hospital ERP with patient management, billing, and doctor scheduling..."'
              className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-text-primary placeholder:text-text-muted text-lg font-medium"
            />
            <Button
              onClick={handleBuild}
              disabled={creating || !prompt.trim()}
              className="shrink-0 h-12 px-6 rounded-xl font-bold text-base gap-2 bg-amber-500 hover:bg-amber-600 text-black disabled:opacity-50"
            >
              {creating ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
              Build
            </Button>
          </div>
          <div className="border-t border-border bg-surface-elevated/30 px-6 py-3 flex flex-wrap gap-2">
            {["Hospital ERP", "Airline Booking App", "SaaS CRM", "E-Commerce Platform", "HR Management System", "Mobile Banking App"].map((s) => (
              <button
                key={s}
                onClick={() => setPrompt(`Build a ${s}`)}
                className="text-xs px-3 py-1.5 rounded-lg bg-background border border-border text-text-secondary hover:text-amber-400 hover:border-amber-500/30 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Projects"   value={loading ? "—" : String(activeProjects.length)} change={`${projects.length} total`}    icon={FolderKanban} trend="up" />
        <StatCard label="AI Agents Running" value={loading ? "—" : String(totalAgents)}           change="across all projects"            icon={Users}        trend="up" />
        <StatCard label="Total Modules"     value={loading ? "—" : String(totalModules)}          change={`${totalApis} API contracts`}   icon={FileCode2}    trend="up" />
        <StatCard label="Projects Built"    value={loading ? "—" : String(projects.filter(p => p.forgeStatus === "generated").length)} change="ready to ship" icon={Truck} trend="up" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Active Builds */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Active Builds</h2>
            <Link href="/app/forge/planner" className="text-xs text-amber-400 hover:underline flex items-center gap-1">
              View All <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {loading ? (
              <Card className="p-8 flex items-center justify-center">
                <Loader2 size={20} className="animate-spin text-amber-400" />
              </Card>
            ) : activeProjects.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-text-muted text-sm">No active builds yet.</p>
                <p className="text-xs text-text-muted mt-1">Describe your app above and click Build.</p>
              </Card>
            ) : activeProjects.slice(0, 5).map((project, i) => {
              const progress = phaseProgress(project.forgePhase);
              const isRunning = project.forgeStatus === "generating" || project.activeAgents.length > 0;
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Card className="p-4 hover:border-amber-500/20 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-text-primary text-sm">{project.name}</h3>
                          <Badge
                            variant={isRunning ? "success" : project.forgeStatus === "generated" ? "info" : "warning"}
                            className="text-[10px] h-4 px-1.5"
                          >
                            {isRunning && <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse mr-1" />}
                            {project.forgeStatus}
                          </Badge>
                        </div>
                        <p className="text-xs text-text-muted mb-3">
                          Phase: <span className="text-text-secondary font-medium">{project.forgePhase}</span>
                          &nbsp;&middot;&nbsp;{project.frameworks.join(", ") || "No stack yet"}
                          {project.activeAgents.length > 0 && <>&nbsp;&middot;&nbsp;<span className="text-amber-400">{project.activeAgents.length} agents</span></>}
                        </p>
                        <div className="w-full bg-background rounded-full h-1.5 border border-border">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-1000"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-text-muted mt-1">{progress}% complete</p>
                      </div>
                      <Link href={`/app/forge/planner?projectId=${project.id}`}>
                        <Button variant="ghost" size="sm" className="shrink-0 gap-1 text-xs h-8">
                          Open <ArrowUpRight size={12} />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Agent Roster */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Agent Roster</h2>
            <Badge variant="success" className="text-[10px]">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse mr-1" />
              6 Online
            </Badge>
          </div>
          <Card className="p-0 overflow-hidden divide-y divide-border">
            {AGENT_ROSTER.map((agent, i) => {
              const runningCount = activeProjects.filter(p => p.activeAgents.includes(agent.key)).length;
              const isActive = runningCount > 0;
              return (
                <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-surface-elevated/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      isActive ? "bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]" :
                      "bg-surface-elevated border border-border"
                    }`} />
                    <div>
                      <p className="text-xs font-bold text-text-primary">{agent.name}</p>
                      <p className="text-[10px] text-text-muted">{agent.role}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-text-secondary font-medium">
                    {isActive ? `${runningCount} active` : "idle"}
                  </span>
                </div>
              );
            })}
          </Card>
        </div>
      </div>

      {/* Studio Modules Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Studio Modules</h2>
          <p className="text-xs text-text-muted">{studioModules.length} capabilities</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {studioModules.map((mod, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link href={contextId ? `${mod.href}?projectId=${contextId}` : mod.href}>
                <Card className="p-5 hover:border-amber-500/20 hover:shadow-md transition-all cursor-pointer group h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${mod.bg} border border-border flex items-center justify-center`}>
                      <mod.icon size={18} className={mod.color} />
                    </div>
                    <Badge variant="secondary" className="text-[10px] px-1.5 h-4">{mod.badge}</Badge>
                  </div>
                  <h3 className="font-bold text-text-primary text-sm group-hover:text-amber-400 transition-colors mb-1">{mod.title}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">{mod.description}</p>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
