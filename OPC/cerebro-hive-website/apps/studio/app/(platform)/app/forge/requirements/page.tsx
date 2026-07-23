"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText, Sparkles, ChevronRight, Users, Shield,
  Database, Webhook, CheckCircle2, Loader2,
  BookOpen, Target, Download,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { useForgeActions, useForgeProject } from "@/lib/forge/hooks";
import type { ForgeRequirements } from "@cerebro/workflow";

const TAB_CONFIG = [
  { key: "functional",    title: "Functional Requirements",     icon: CheckCircle2, color: "text-green-400",  bg: "bg-green-400/10"  },
  { key: "nonFunctional", title: "Non-Functional Requirements", icon: Shield,       color: "text-violet-400", bg: "bg-violet-400/10" },
  { key: "actors",        title: "Actors",                      icon: Users,        color: "text-amber-400",  bg: "bg-amber-400/10"  },
  { key: "entities",      title: "Database Entities",           icon: Database,     color: "text-cyan-400",   bg: "bg-cyan-400/10"   },
  { key: "apiContracts",  title: "API Contracts",               icon: Webhook,      color: "text-rose-400",   bg: "bg-rose-400/10"   },
  { key: "userStories",   title: "User Stories",                icon: Target,       color: "text-blue-400",   bg: "bg-blue-400/10"   },
] as const;

type TabKey = typeof TAB_CONFIG[number]["key"];

function reqItems(reqs: ForgeRequirements, key: TabKey): string[] {
  switch (key) {
    case "functional":    return reqs.functional;
    case "nonFunctional": return reqs.nonFunctional;
    case "actors":        return reqs.actors.map(a => `${a.name}: ${a.permissions.join(", ")}`);
    case "entities":      return reqs.entities.map(e => `${e.name}: ${e.fields.join(", ")}`);
    case "apiContracts":  return reqs.apiContracts.map(c => `${c.method} ${c.path} — ${c.description}`);
    case "userStories":   return reqs.userStories.map(s => `As a ${s.actor}, I want to ${s.action} so that ${s.benefit}`);
  }
}

export default function RequirementsStudioPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  const { project } = useForgeProject(projectId ?? "");
  const { running, error, runRequirements } = useForgeActions(projectId ?? "");

  const [requirements, setRequirements] = useState<ForgeRequirements | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("functional");

  // Load persisted requirements from project data
  useEffect(() => {
    if (project?.requirements && Array.isArray(project.requirements) && (project.requirements as any[]).length > 0) {
      // Requirements are stored as rows — reconstruct object shape from them
      const rows = project.requirements as Array<{ type: string; title: string }>;
      const reqs: ForgeRequirements = {
        functional:    rows.filter(r => r.type === "functional").map(r => r.title),
        nonFunctional: rows.filter(r => r.type === "non_functional").map(r => r.title),
        actors:        [],
        entities:      [],
        apiContracts:  rows.filter(r => r.type === "api_contract").map(r => {
          const [method, ...rest] = r.title.split(" ");
          return { method, path: rest[0] ?? "", description: rest.slice(1).join(" ").replace(/^— /, "") };
        }),
        userStories:   rows.filter(r => r.type === "user_story").map(r => {
          const match = r.title.match(/^As a (.+?), I want to (.+?) so that (.+)$/);
          return match
            ? { actor: match[1], action: match[2], benefit: match[3] }
            : { actor: "", action: r.title, benefit: "" };
        }),
      };
      setRequirements(reqs);
    }
  }, [project]);

  const handleGenerate = async () => {
    if (!projectId) return;
    const result = await runRequirements();
    if (result) setRequirements(result);
  };

  const generated = requirements !== null;
  const activeConfig = TAB_CONFIG.find(t => t.key === activeTab)!;
  const items = requirements ? reqItems(requirements, activeTab) : [];

  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <FileText size={20} className="text-blue-400" />
          <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs">Requirements Studio</Badge>
          <Badge variant="secondary" className="text-xs">Phase 2</Badge>
        </div>
        <h1 className="text-3xl font-space font-bold text-text-primary">Requirements Studio</h1>
        <p className="text-text-secondary mt-1">
          AI extracts business requirements, user stories, data models, and API contracts from your project plan.
        </p>
      </div>

      {/* Context Banner */}
      <Card className="p-4 border-blue-500/20 bg-blue-500/5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <BookOpen size={16} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">
                {project?.name ?? (projectId ? "Loading..." : "No project selected")}
              </p>
              <p className="text-xs text-text-muted">
                {requirements
                  ? `${requirements.functional.length} functional · ${requirements.userStories.length} stories · ${requirements.apiContracts.length} API contracts`
                  : project?.totalStories
                  ? `${project.totalStories} stories · ${project.totalApis} APIs planned`
                  : "Run requirements generation to extract structured specs"}
              </p>
            </div>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={running || !projectId}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:opacity-50"
          >
            {running ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {running ? "Generating..." : generated ? "Re-generate" : "Generate Requirements"}
          </Button>
        </div>
      </Card>

      {error && (
        <Card className="p-4 border-red-500/20 bg-red-500/5">
          <p className="text-sm text-red-400">{error}</p>
        </Card>
      )}

      {running && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <Loader2 size={40} className="animate-spin text-blue-400 mx-auto" />
            <p className="text-text-secondary font-medium">Extracting requirements...</p>
            <p className="text-text-muted text-sm">Analyzing business context, extracting entities, generating contracts</p>
          </div>
        </div>
      )}

      {generated && !running && requirements && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {TAB_CONFIG.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                  activeTab === tab.key
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    : "text-text-secondary border-border hover:bg-surface hover:text-text-primary"
                }`}
              >
                <tab.icon size={12} />
                {tab.title}
              </button>
            ))}
          </div>

          {/* Active Section */}
          <Card className="p-6 border-blue-500/10">
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-9 h-9 rounded-xl ${activeConfig.bg} flex items-center justify-center`}>
                <activeConfig.icon size={16} className={activeConfig.color} />
              </div>
              <h2 className="font-space font-bold text-text-primary text-lg">{activeConfig.title}</h2>
              <Badge variant="secondary" className="text-xs ml-auto">{items.length} items</Badge>
            </div>
            <div className="space-y-3">
              {items.length === 0 ? (
                <p className="text-text-muted text-sm">No items in this category.</p>
              ) : items.map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 size={14} className="text-blue-400 shrink-0 mt-0.5" />
                  <span className="text-text-secondary leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Overview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TAB_CONFIG.map(tab => (
              <Card
                key={tab.key}
                className="p-4 cursor-pointer hover:border-blue-500/20 transition-colors"
                onClick={() => setActiveTab(tab.key)}
              >
                <div className={`w-8 h-8 rounded-lg ${tab.bg} flex items-center justify-center mb-3`}>
                  <tab.icon size={16} className={tab.color} />
                </div>
                <h3 className="font-bold text-text-primary text-sm mb-1">{tab.title}</h3>
                <p className="text-xs text-text-muted">{reqItems(requirements, tab.key).length} items</p>
              </Card>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              onClick={() => window.location.href = `/app/forge/architect?projectId=${projectId}`}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ChevronRight size={16} /> Proceed to Architecture Studio
            </Button>
            <Button variant="secondary" className="gap-2" onClick={handleGenerate} disabled={running}>
              <Download size={16} /> Re-generate
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
