"use client";

import React from "react";
import {
  GitBranch, GitCommit, GitMerge, CheckCircle2,
  Clock, Users, Plus, ChevronRight, Loader2, ExternalLink,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { StatCard } from "../../components/ui/StatCard";
import { useSearchParams, useRouter } from "next/navigation";
import { useForgeProject } from "@/lib/forge/hooks";

const repos = [
  { name: "hospital-erp-web",     lang: "TypeScript", branch: "main", commits: 148, open_prs: 3, status: "active" },
  { name: "hospital-erp-api",     lang: "TypeScript", branch: "main", commits: 213, open_prs: 1, status: "active" },
  { name: "hospital-erp-mobile",  lang: "TypeScript", branch: "dev",  commits: 67,  open_prs: 0, status: "active" },
  { name: "hospital-erp-infra",   lang: "HCL",        branch: "main", commits: 34,  open_prs: 0, status: "idle" },
];

const recentCommits = [
  { sha: "a3f8c1d", msg: "feat(patient): add biometric enrollment flow",       author: "Backend Agent",  time: "2m ago" },
  { sha: "b7e2f4a", msg: "fix(billing): correct insurance claim validation",    author: "QA Agent",       time: "8m ago" },
  { sha: "c1d9e3b", msg: "feat(ui): responsive appointment booking screen",     author: "Frontend Agent", time: "14m ago" },
  { sha: "d4f6a2c", msg: "chore: update docker-compose for lab-service",        author: "DevOps Agent",   time: "31m ago" },
  { sha: "e8b1c5d", msg: "test(patient): add E2E tests for patient registration",author: "QA Agent",      time: "1h ago" },
];

export default function RepositoryManagerPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get("projectId") ?? "";
  const { project } = useForgeProject(projectId);
  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <GitBranch size={20} className="text-slate-400" />
          <Badge className="bg-slate-500/10 text-slate-400 border border-slate-500/20 text-xs">Repository Manager</Badge>
          {project && <Badge variant="secondary" className="text-xs">{project.name}</Badge>}
        </div>
        <h1 className="text-3xl font-space font-bold text-text-primary">Repository Manager</h1>
        <p className="text-text-secondary mt-1">
          All generated code is automatically committed to versioned repositories. Track progress across all agents.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Repositories"  value="4"    change="This project"    icon={GitBranch} trend="up" />
        <StatCard label="Total Commits" value="462"  change="By AI agents"    icon={GitCommit} trend="up" />
        <StatCard label="Open PRs"      value="4"    change="Awaiting review" icon={GitMerge}  trend="up" />
        <StatCard label="Contributors"  value="8"    change="AI agents"       icon={Users}     trend="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Repositories */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Repositories</h2>
            <Button variant="secondary" size="sm" className="gap-1 h-7 text-xs">
              <Plus size={12} /> New Repo
            </Button>
          </div>
          <div className="space-y-3">
            {repos.map((repo, i) => (
              <Card key={i} className="p-4 hover:border-slate-500/20 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <GitBranch size={14} className="text-slate-400" />
                    <h3 className="font-bold text-text-primary text-sm font-mono">{repo.name}</h3>
                  </div>
                  <Badge variant={repo.status === "active" ? "success" : "secondary"} className="text-[10px]">
                    {repo.status === "active" && <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse mr-1" />}
                    {repo.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-text-muted">
                  <span className="text-slate-400 font-bold">{repo.lang}</span>
                  <span className="flex items-center gap-1"><GitBranch size={10} /> {repo.branch}</span>
                  <span className="flex items-center gap-1"><GitCommit size={10} /> {repo.commits}</span>
                  {repo.open_prs > 0 && <span className="flex items-center gap-1 text-amber-400"><GitMerge size={10} /> {repo.open_prs} PRs</span>}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 px-2">
                    <ExternalLink size={10} /> Open
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 px-2">
                    <GitMerge size={10} /> PRs
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Commits */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Recent Commits</h2>
          <Card className="p-0 overflow-hidden divide-y divide-border">
            {recentCommits.map((commit, i) => (
              <div key={i} className="px-4 py-3 hover:bg-surface-elevated/30 transition-colors">
                <div className="flex items-start gap-3">
                  <GitCommit size={14} className="text-slate-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text-primary truncate">{commit.msg}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono text-slate-400">{commit.sha}</span>
                      <span className="text-[10px] text-text-muted">{commit.author}</span>
                      <span className="text-[10px] text-text-muted ml-auto">{commit.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
