"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ScanSearch, Sparkles, AlertTriangle, CheckCircle2, Shield,
  Zap, Code2, Layers, ChevronRight, Loader2,
  FileCode2, AlertCircle,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { StatCard } from "../../components/ui/StatCard";
import { useForgeProject, useForgeActions } from "@/lib/forge/hooks";
import type { ReviewResult, ReviewFinding } from "@/lib/forge/api-client";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  architecture: Layers,
  performance: Zap,
  security: Shield,
  accessibility: CheckCircle2,
  maintainability: Code2,
  code_quality: ScanSearch,
};

const SEVERITY_VARIANT: Record<string, "destructive" | "warning" | "info" | "secondary"> = {
  critical: "destructive",
  high: "warning",
  medium: "info",
  low: "secondary",
  info: "secondary",
};

const GRADE_COLOR: Record<string, string> = {
  A: "text-green-400", B: "text-lime-400", C: "text-amber-400",
  D: "text-orange-400", F: "text-red-400",
};

export default function AICodeReviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get("projectId") ?? "";

  const { project } = useForgeProject(projectId);
  const { running, error, runReview } = useForgeActions(projectId);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [fixing, setFixing] = useState<number | null>(null);

  const handleReview = async () => {
    const res = await runReview();
    if (res) setResult(res);
  };

  const hasRun = result !== null;
  const overallScore = result?.overallScore ?? 0;
  const grade = result?.grade ?? "—";
  const findings: ReviewFinding[] = result?.findings ?? [];
  const autoFixable = result?.autoFixableCount ?? 0;
  const categories = result?.categories ?? {};

  const criticalCount = findings.filter(f => f.severity === "critical").length;
  const highCount = findings.filter(f => f.severity === "high").length;

  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <ScanSearch size={20} className="text-yellow-400" />
          <Badge className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs">AI Code Review</Badge>
          {project && <Badge variant="secondary" className="text-xs">{project.name}</Badge>}
        </div>
        <h1 className="text-3xl font-space font-bold text-text-primary">AI Code Review Agent</h1>
        <p className="text-text-secondary mt-1">
          Deep analysis across architecture, performance, accessibility, security, scalability, and SOLID principles.
        </p>
      </div>

      {/* Error */}
      {error && (
        <Card className="p-4 border-red-500/20 bg-red-500/5 flex items-center gap-3">
          <AlertTriangle size={16} className="text-red-400 shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </Card>
      )}

      {/* Score Card */}
      <Card className="p-6 border-yellow-500/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2" className="text-surface-elevated" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2.5"
                  strokeDasharray={`${overallScore} ${100 - overallScore}`}
                  className="text-yellow-400" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-space font-bold text-text-primary">{hasRun ? overallScore : "—"}</span>
              </div>
            </div>
            <div>
              <h2 className={`text-2xl font-space font-bold ${hasRun ? (GRADE_COLOR[grade[0]] ?? "text-text-primary") : "text-text-muted"}`}>
                {hasRun ? grade : "—"}
              </h2>
              <p className="text-text-secondary text-sm">Overall Code Quality</p>
              {hasRun && (
                <p className="text-text-muted text-xs mt-1">
                  {findings.length} findings · {criticalCount} critical · {highCount} high · {autoFixable} auto-fixable
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleReview}
              disabled={running || !projectId}
              className="gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
            >
              {running ? <Loader2 size={14} className="animate-spin" /> : <ScanSearch size={14} />}
              {running ? "Scanning…" : hasRun ? "Re-scan Codebase" : "Scan Codebase"}
            </Button>
            {hasRun && autoFixable > 0 && (
              <Button variant="secondary" className="gap-2">
                <Sparkles size={14} /> Auto-fix {autoFixable} Issues
              </Button>
            )}
          </div>
        </div>
      </Card>

      {!hasRun && !running && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
          <ScanSearch size={40} className="mx-auto text-text-muted mb-4" />
          <p className="text-text-secondary text-sm">
            Click <span className="text-yellow-400 font-semibold">Scan Codebase</span> to run Security + Architect agents in parallel and get deep code analysis.
          </p>
        </motion.div>
      )}

      {running && (
        <Card className="p-8 flex flex-col items-center gap-4 border-yellow-500/20 bg-yellow-500/5">
          <Loader2 size={32} className="animate-spin text-yellow-400" />
          <p className="text-sm text-yellow-400 font-semibold">Security + Architect agents scanning in parallel…</p>
          <p className="text-xs text-text-muted">Analyzing architecture, performance, security, accessibility, and code quality</p>
        </Card>
      )}

      {hasRun && (
        <>
          {/* Category Scores */}
          {Object.keys(categories).length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(categories).map(([cat, score], i) => {
                const Icon = CATEGORY_ICONS[cat.toLowerCase()] ?? Code2;
                return (
                  <Card key={i} className="p-4 text-center">
                    <Icon size={18} className="mx-auto mb-2 text-yellow-400" />
                    <div className="text-2xl font-space font-bold text-text-primary">{score}</div>
                    <div className="text-[10px] text-text-muted mt-0.5 capitalize">{cat.replace(/_/g, " ")}</div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Findings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">
                Review Findings ({findings.length})
              </h2>
              <div className="flex gap-2">
                {["critical", "high", "medium", "low"].map(s => (
                  <Badge key={s} variant={SEVERITY_VARIANT[s]} className="text-[10px] capitalize">{s}</Badge>
                ))}
              </div>
            </div>
            {findings.length === 0 ? (
              <Card className="p-6 text-center border-green-500/20 bg-green-500/5">
                <CheckCircle2 size={20} className="mx-auto text-green-400 mb-2" />
                <p className="text-xs text-green-400 font-semibold">No issues found — excellent code quality!</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {findings.map((finding, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                    <Card className={`p-5 ${finding.severity === "critical" ? "border-red-500/20" : finding.severity === "high" ? "border-amber-500/20" : ""}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={SEVERITY_VARIANT[finding.severity]} className="text-[10px] capitalize">{finding.severity}</Badge>
                            <Badge variant="secondary" className="text-[10px]">{finding.category}</Badge>
                            {finding.autoFixable && (
                              <Badge className="text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Auto-fixable</Badge>
                            )}
                          </div>
                          <h3 className="font-bold text-text-primary text-sm mb-1">{finding.message}</h3>
                          <p className="text-xs font-mono text-text-muted mb-2">
                            {finding.file}{finding.line ? `:${finding.line}` : ""}
                          </p>
                          {finding.suggestion && (
                            <div className="flex items-start gap-2 text-xs text-text-secondary bg-surface-elevated/50 rounded-lg px-3 py-2 border border-border">
                              <Sparkles size={12} className="text-yellow-400 shrink-0 mt-0.5" />
                              <span><strong className="text-text-primary">Fix:</strong> {finding.suggestion}</span>
                            </div>
                          )}
                        </div>
                        {finding.autoFixable && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="shrink-0 gap-1 text-xs h-8 text-yellow-400 hover:text-yellow-300"
                            onClick={() => { setFixing(i); setTimeout(() => setFixing(null), 2000); }}
                          >
                            {fixing === i ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                            {fixing === i ? "Fixing…" : "Auto-fix"}
                          </Button>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <div className="flex flex-wrap gap-3">
        <Button
          className="gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
          disabled={!hasRun}
          onClick={() => router.push(`/app/forge/docs?projectId=${projectId}`)}
        >
          <ChevronRight size={16} /> Proceed to Documentation
        </Button>
        {hasRun && (
          <Button variant="secondary" className="gap-2"><FileCode2 size={16} /> Generate Report</Button>
        )}
      </div>
    </div>
  );
}
