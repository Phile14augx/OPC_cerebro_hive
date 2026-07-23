"use client";

import React, { useState } from "react";
import {
  ServerCog, Sparkles, CheckCircle2, Loader2, Server,
  Database, Shield, Zap, GitBranch, ChevronRight, Package,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { StatCard } from "../../components/ui/StatCard";
import { useSearchParams, useRouter } from "next/navigation";
import { useForgeProject } from "@/lib/forge/hooks";

const runtimes = [
  { name: "NestJS",      lang: "TypeScript",  selected: true  },
  { name: "Spring Boot", lang: "Java / Kotlin",selected: false },
  { name: "FastAPI",     lang: "Python",       selected: false },
  { name: "Go / Gin",    lang: "Go",           selected: false },
  { name: ".NET Core",   lang: "C#",           selected: false },
  { name: "Django",      lang: "Python",       selected: false },
  { name: "Laravel",     lang: "PHP",          selected: false },
];

const generatedModules = [
  { name: "Auth Module",         files: 8,  pattern: "JWT + Refresh tokens" },
  { name: "Patient Module",      files: 12, pattern: "CRUD + business rules" },
  { name: "Appointment Module",  files: 10, pattern: "Booking state machine" },
  { name: "Billing Module",      files: 14, pattern: "Invoice + payments" },
  { name: "Notification Module", files: 6,  pattern: "Queue + email/SMS" },
];

export default function BackendStudioPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get("projectId") ?? "";
  const { project } = useForgeProject(projectId);
  const [selected, setSelected] = useState(0);
  const [building, setBuilding] = useState(false);

  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <ServerCog size={20} className="text-purple-400" />
          <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs">Backend Studio</Badge>
          {project && <Badge variant="secondary" className="text-xs">{project.name}</Badge>}
        </div>
        <h1 className="text-3xl font-space font-bold text-text-primary">Backend Studio</h1>
        <p className="text-text-secondary mt-1">
          AI generates production-ready backend services — controllers, services, repositories, DTOs, guards, and tests.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Services"    value="8"    change="Microservices"    icon={Server}    trend="up" />
        <StatCard label="Endpoints"   value="84"   change="REST + GraphQL"   icon={Zap}       trend="up" />
        <StatCard label="Test Cover"  value="87%"  change="Auto-generated"   icon={CheckCircle2} trend="up" />
        <StatCard label="Modules"     value="24"   change="NestJS modules"   icon={Package}   trend="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Runtime Selector */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Runtime</h2>
          <div className="space-y-2">
            {runtimes.map((r, i) => (
              <button key={i} onClick={() => setSelected(i)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all ${i === selected ? "bg-purple-500/10 border-purple-500/30 text-purple-400 font-bold" : "bg-surface border-border text-text-secondary hover:bg-surface-elevated"}`}>
                <span>{r.name}</span>
                <span className="text-xs opacity-60">{r.lang}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Generated Modules */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Generated Modules</h2>
            <Button
              onClick={() => { setBuilding(true); setTimeout(() => setBuilding(false), 2500); }}
              disabled={building}
              className="gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold h-8 text-xs"
            >
              {building ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {building ? "Generating..." : "Generate Backend"}
            </Button>
          </div>
          <div className="space-y-3">
            {generatedModules.map((mod, i) => (
              <Card key={i} className="p-5 border-purple-500/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                      <ServerCog size={14} className="text-purple-400" />
                    </div>
                    <h3 className="font-bold text-text-primary text-sm">{mod.name}</h3>
                  </div>
                  <Badge variant="success" className="text-[10px]"><CheckCircle2 size={9} className="mr-1" /> Generated</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-text-muted">
                  <span>{mod.files} files</span>
                  <span className="text-purple-400">{mod.pattern}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
