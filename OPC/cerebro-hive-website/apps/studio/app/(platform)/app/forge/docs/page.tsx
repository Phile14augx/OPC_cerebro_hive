"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen, Sparkles, CheckCircle2, Loader2, FileText,
  Globe, Code2, Users, ChevronRight, Download, ExternalLink,
  AlertTriangle, Activity,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { StatCard } from "../../components/ui/StatCard";
import { useForgeProject, useForgeActions } from "@/lib/forge/hooks";
import type { DocsResult, DocSection } from "@/lib/forge/api-client";

const SECTION_ICONS: Record<string, React.ElementType> = {
  api_reference: Globe,
  architecture: Code2,
  user_manual: Users,
  onboarding: FileText,
  runbook: FileText,
  changelog: FileText,
};

const SECTION_COLORS: Record<string, string> = {
  api_reference: "text-blue-400",
  architecture: "text-cyan-400",
  user_manual: "text-violet-400",
  onboarding: "text-emerald-400",
  runbook: "text-amber-400",
  changelog: "text-rose-400",
};

export default function AIDocumentationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get("projectId") ?? "";

  const { project } = useForgeProject(projectId);
  const { running, error, runDocs } = useForgeActions(projectId);
  const [result, setResult] = useState<DocsResult | null>(null);
  const [selected, setSelected] = useState<DocSection | null>(null);

  const handleGenerate = async () => {
    const res = await runDocs();
    if (res) { setResult(res); setSelected(res.sections[0] ?? null); }
  };

  const hasRun = result !== null;
  const sections: DocSection[] = result?.sections ?? [];
  const totalWords = result?.totalWordCount ?? 0;

  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <BookOpen size={20} className="text-rose-400" />
          <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs">AI Documentation</Badge>
          {project && <Badge variant="secondary" className="text-xs">{project.name}</Badge>}
        </div>
        <h1 className="text-3xl font-space font-bold text-text-primary">AI Documentation Agent</h1>
        <p className="text-text-secondary mt-1">
          Automatically generates API references, architecture guides, user manuals, and developer docs from your codebase.
        </p>
      </div>

      {/* Error */}
      {error && (
        <Card className="p-4 border-red-500/20 bg-red-500/5 flex items-center gap-3">
          <AlertTriangle size={16} className="text-red-400 shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </Card>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Doc Sections" value={hasRun ? String(sections.length) : "—"} change="Auto-generated"   icon={FileText}     trend="up" />
        <StatCard label="Total Words"  value={hasRun ? String(totalWords) : "—"}       change="All sections"     icon={BookOpen}     trend="up" />
        <StatCard label="Status"       value={hasRun ? "Complete" : "Pending"}          change={hasRun ? "All generated" : "Not yet run"} icon={CheckCircle2} trend="up" />
        <StatCard label="Languages"    value="4"                                         change="i18n ready"       icon={Globe}        trend="up" />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleGenerate}
          disabled={running || !projectId}
          className="gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold"
        >
          {running ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {running ? "Generating Docs…" : hasRun ? "Regenerate Docs" : "Generate All Documentation"}
        </Button>
        {hasRun && (
          <>
            <Button variant="secondary" className="gap-2"><Download size={14} /> Export as PDF</Button>
            <Button variant="secondary" className="gap-2"><ExternalLink size={14} /> Publish to Docs Site</Button>
          </>
        )}
      </div>

      {!hasRun && !running && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
          <BookOpen size={40} className="mx-auto text-text-muted mb-4" />
          <p className="text-text-secondary text-sm">
            Click <span className="text-rose-400 font-semibold">Generate All Documentation</span> to let the Docs agent write API references, architecture guides, and developer onboarding docs.
          </p>
        </motion.div>
      )}

      {running && (
        <Card className="p-8 flex flex-col items-center gap-4 border-rose-500/20 bg-rose-500/5">
          <Loader2 size={32} className="animate-spin text-rose-400" />
          <p className="text-sm text-rose-400 font-semibold">Docs agent generating all documentation…</p>
          <p className="text-xs text-text-muted">Writing API reference, architecture guide, onboarding, runbook, and changelog</p>
        </Card>
      )}

      {hasRun && sections.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Section List */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Generated Sections</h2>
            {sections.map((section, i) => {
              const Icon = SECTION_ICONS[section.type] ?? FileText;
              const color = SECTION_COLORS[section.type] ?? "text-rose-400";
              const isSelected = selected?.type === section.type;
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card
                    className={`p-4 cursor-pointer transition-colors ${isSelected ? "border-rose-500/30 bg-rose-500/5" : "hover:border-rose-500/20"}`}
                    onClick={() => setSelected(section)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                        <Icon size={14} className={color} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-text-primary truncate">{section.title}</p>
                        <p className="text-[10px] text-text-muted mt-0.5">{section.wordCount.toLocaleString()} words</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Doc Preview */}
          {selected && (
            <motion.div key={selected.type} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-2">
              <Card className="p-6 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-text-primary">{selected.title}</h3>
                  <Badge variant="secondary" className="text-[10px]">{selected.wordCount} words</Badge>
                </div>
                <div className="prose prose-invert prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-xs text-text-secondary font-mono leading-relaxed overflow-auto max-h-96 bg-surface-elevated rounded-lg p-4 border border-border">
                    {selected.content}
                  </pre>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button
          className="gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold"
          onClick={() => router.push(`/app/forge?projectId=${projectId}`)}
        >
          <CheckCircle2 size={16} /> Back to Dashboard
        </Button>
        {hasRun && (
          <>
            <Button
              variant="secondary"
              className="gap-2"
              onClick={() => router.push(`/app/forge/repos?projectId=${projectId}`)}
            >
              <ChevronRight size={16} /> View Repository
            </Button>
            <Button
              className="gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
              onClick={() => router.push(`/app/forge/monitoring?projectId=${projectId}`)}
            >
              <Activity size={16} /> Open Monitoring
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
