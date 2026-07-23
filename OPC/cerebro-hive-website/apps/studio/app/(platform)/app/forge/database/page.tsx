"use client";

import React, { useState } from "react";
import {
  Database, Sparkles, CheckCircle2, Loader2, GitMerge,
  Link2, Shield, Zap, ChevronRight, Download,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { StatCard } from "../../components/ui/StatCard";
import { useSearchParams, useRouter } from "next/navigation";
import { useForgeProject } from "@/lib/forge/hooks";

const engines = [
  { name: "PostgreSQL",    type: "Relational",   selected: true },
  { name: "MySQL",         type: "Relational",   selected: false },
  { name: "MongoDB",       type: "Document",     selected: false },
  { name: "Redis",         type: "Cache / KV",   selected: true },
  { name: "Elasticsearch", type: "Search",       selected: false },
  { name: "Neo4j",         type: "Graph",        selected: false },
  { name: "pgvector",      type: "Vector",       selected: true },
];

const entities = [
  { name: "Patient",       fields: 18, relations: ["Doctor", "Appointment", "Invoice"], pk: "UUID" },
  { name: "Doctor",        fields: 14, relations: ["Patient", "Appointment", "Ward"],   pk: "UUID" },
  { name: "Appointment",   fields: 12, relations: ["Patient", "Doctor"],                pk: "UUID" },
  { name: "Invoice",       fields: 16, relations: ["Patient", "Payment"],               pk: "UUID" },
  { name: "Medication",    fields: 10, relations: ["Prescription", "Inventory"],        pk: "UUID" },
  { name: "LabTest",       fields: 8,  relations: ["Patient", "LabResult"],             pk: "UUID" },
];

export default function DatabaseStudioPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get("projectId") ?? "";
  const { project } = useForgeProject(projectId);
  const [engines_, setEngines] = useState(engines);
  const [generating, setGenerating] = useState(false);

  const toggle = (i: number) => setEngines(prev => prev.map((e, idx) => idx === i ? { ...e, selected: !e.selected } : e));

  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Database size={20} className="text-teal-400" />
          <Badge className="bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs">Database Studio</Badge>
          <Badge variant="secondary" className="text-xs">Phase 11</Badge>
          {project && <Badge variant="secondary" className="text-xs">{project.name}</Badge>}
        </div>
        <h1 className="text-3xl font-space font-bold text-text-primary">Database Studio</h1>
        <p className="text-text-secondary mt-1">
          AI designs schemas, ER diagrams, indexes, constraints, migrations, and seed data.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Entities"    value="24"  change="Domain objects"    icon={Database}     trend="up" />
        <StatCard label="Relations"   value="38"  change="FK constraints"    icon={Link2}        trend="up" />
        <StatCard label="Migrations"  value="12"  change="TypeORM generated" icon={GitMerge}     trend="up" />
        <StatCard label="Indexes"     value="29"  change="Performance tuned" icon={Zap}          trend="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Engine Selector */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Database Engines</h2>
          <div className="space-y-2">
            {engines_.map((e, i) => (
              <button key={i} onClick={() => toggle(i)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all ${e.selected ? "bg-teal-500/10 border-teal-500/30 text-teal-400 font-bold" : "bg-surface border-border text-text-secondary hover:bg-surface-elevated"}`}>
                <span>{e.name}</span>
                <span className="text-xs opacity-60">{e.type}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Entity Viewer */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Domain Entities</h2>
            <Button
              onClick={() => { setGenerating(true); setTimeout(() => setGenerating(false), 2000); }}
              disabled={generating}
              className="gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold h-8 text-xs"
            >
              {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {generating ? "Generating..." : "Generate Schema"}
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {entities.map((entity, i) => (
              <Card key={i} className="p-4 hover:border-teal-500/20 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                      <Database size={12} className="text-teal-400" />
                    </div>
                    <h3 className="font-bold text-text-primary text-sm">{entity.name}</h3>
                  </div>
                  <Badge variant="secondary" className="text-[9px]">{entity.pk}</Badge>
                </div>
                <p className="text-xs text-text-muted mb-2">{entity.fields} fields</p>
                <div className="flex flex-wrap gap-1">
                  {entity.relations.map((r, j) => (
                    <span key={j} className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center gap-1">
                      <Link2 size={8} /> {r}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="gap-2 text-xs h-8"><Download size={12} /> Export Migrations</Button>
            <Button variant="secondary" className="gap-2 text-xs h-8"><GitMerge size={12} /> ER Diagram</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
