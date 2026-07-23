"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  TestTube2, Sparkles, Play, CheckCircle2, XCircle,
  Clock, Loader2, Shield, Zap, Activity, AlertCircle,
  ChevronRight, Download, RefreshCw, AlertTriangle,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { StatCard } from "../../components/ui/StatCard";
import { useForgeProject, useForgeActions } from "@/lib/forge/hooks";
import type { TestingResult, TestSuite } from "@/lib/forge/api-client";

export default function TestingIntelligencePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get("projectId") ?? "";

  const { project } = useForgeProject(projectId);
  const { running, error, runTesting } = useForgeActions(projectId);
  const [result, setResult] = useState<TestingResult | null>(null);

  const handleRunTests = async () => {
    const res = await runTesting();
    if (res) setResult(res);
  };

  // Derive display data from result or zeros
  const suites: TestSuite[] = result?.testSuites ?? [];
  const totalTests = result?.totalTests ?? 0;
  const passingTests = result?.passingTests ?? 0;
  const failingTests = totalTests - passingTests;
  const coverage = result?.overallCoverage ?? 0;

  // Collect failed test cases from suites
  const failedCases = suites.flatMap(suite =>
    (suite.tests ?? [])
      .filter(t => t.status === "failed")
      .map(t => ({ suite: suite.name, ...t }))
  );

  const hasRun = result !== null;

  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <TestTube2 size={20} className="text-lime-400" />
          <Badge className="bg-lime-500/10 text-lime-400 border border-lime-500/20 text-xs">Testing Intelligence</Badge>
          {project && <Badge variant="secondary" className="text-xs">{project.name}</Badge>}
        </div>
        <h1 className="text-3xl font-space font-bold text-text-primary">Testing Intelligence</h1>
        <p className="text-text-secondary mt-1">
          AI auto-generates unit, integration, E2E, performance, and security test suites.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tests"   value={hasRun ? String(totalTests) : "—"}    change="Auto-generated"              icon={TestTube2}    trend="up" />
        <StatCard label="Passed"        value={hasRun ? String(passingTests) : "—"}  change={hasRun ? `${coverage}% pass rate` : "Run tests first"} icon={CheckCircle2} trend="up" />
        <StatCard label="Failed"        value={hasRun ? String(failingTests) : "—"}  change={hasRun && failingTests > 0 ? "Needs attention" : hasRun ? "All passing" : "Run tests first"} icon={XCircle} trend={failingTests > 0 ? "down" : "up"} />
        <StatCard label="Coverage"      value={hasRun ? `${coverage}%` : "—"}        change="Target: 90%"                 icon={Activity}     trend="up" />
      </div>

      {/* Error */}
      {error && (
        <Card className="p-4 border-red-500/20 bg-red-500/5 flex items-center gap-3">
          <AlertTriangle size={16} className="text-red-400 shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleRunTests}
          disabled={running || !projectId}
          className="gap-2 bg-lime-600 hover:bg-lime-700 text-black font-bold"
        >
          {running ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
          {running ? "Running Tests…" : hasRun ? "Re-run All Tests" : "Run All Tests"}
        </Button>
        {hasRun && failingTests > 0 && (
          <Button variant="secondary" className="gap-2">
            <Sparkles size={14} /> Auto-fix Failures
          </Button>
        )}
        {hasRun && (
          <Button variant="secondary" className="gap-2"><Download size={14} /> Export Report</Button>
        )}
      </div>

      {!hasRun && !running && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <TestTube2 size={40} className="mx-auto text-text-muted mb-4" />
          <p className="text-text-secondary text-sm">
            Click <span className="text-lime-400 font-semibold">Run All Tests</span> to let the AI QA &amp; Security agents generate and execute your full test suite.
          </p>
        </motion.div>
      )}

      {running && (
        <Card className="p-8 flex flex-col items-center gap-4 border-lime-500/20 bg-lime-500/5">
          <Loader2 size={32} className="animate-spin text-lime-400" />
          <p className="text-sm text-lime-400 font-semibold">QA &amp; Security agents running in parallel…</p>
          <p className="text-xs text-text-muted">Generating unit, integration, E2E, performance, and security tests</p>
        </Card>
      )}

      {hasRun && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Test Suites */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Test Suites</h2>
            {suites.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-text-muted text-sm">No test suites generated.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {suites.map((suite, i) => {
                  const passRate = suite.totalTests > 0 ? (suite.passingTests / suite.totalTests) * 100 : 0;
                  return (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                      <Card className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-text-primary text-sm">{suite.name}</h3>
                            <Badge variant="secondary" className="text-[10px]">{suite.framework}</Badge>
                          </div>
                          <Badge
                            variant={suite.status === "passed" ? "success" : suite.status === "failed" ? "destructive" : suite.status === "running" ? "warning" : "secondary"}
                            className="text-[10px]"
                          >
                            {suite.status === "running" && <Loader2 size={8} className="animate-spin mr-1" />}
                            {suite.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-text-muted mb-2">
                          <span className="text-green-400 font-bold">{suite.passingTests} passed</span>
                          {suite.failingTests > 0 && <span className="text-red-400 font-bold">{suite.failingTests} failed</span>}
                          <span>{suite.totalTests} total</span>
                          <span className="text-lime-400">{suite.coverage}% cov</span>
                        </div>
                        <div className="w-full bg-background rounded-full h-1.5 border border-border">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-lime-500 to-green-400 transition-all"
                            style={{ width: `${passRate}%` }}
                          />
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Security Findings */}
            {(result?.securityFindings?.length ?? 0) > 0 && (
              <div className="space-y-3 mt-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Security Findings</h2>
                <Card className="p-4 border-red-500/10 space-y-2">
                  {result!.securityFindings.map((finding, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <AlertCircle size={12} className="text-red-400 shrink-0 mt-0.5" />
                      <span className="text-text-secondary">{finding}</span>
                    </div>
                  ))}
                </Card>
              </div>
            )}
          </div>

          {/* Failed Tests */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">
              Failed Tests {failedCases.length > 0 && `(${failedCases.length})`}
            </h2>
            {failedCases.length === 0 ? (
              <Card className="p-6 text-center border-green-500/20 bg-green-500/5">
                <CheckCircle2 size={20} className="mx-auto text-green-400 mb-2" />
                <p className="text-xs text-green-400 font-semibold">All tests passing!</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {failedCases.map((test, i) => (
                  <Card key={i} className="p-4 border-red-500/10">
                    <div className="flex items-start gap-2 mb-2">
                      <XCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <Badge variant="destructive" className="text-[9px] mb-1">{test.suite}</Badge>
                        <p className="text-xs font-medium text-text-primary leading-relaxed">{test.name}</p>
                        {test.file && <p className="text-[10px] text-text-muted font-mono mt-1">{test.file}</p>}
                        {test.error && <p className="text-[10px] text-red-400/70 font-mono mt-1 truncate">{test.error}</p>}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 text-amber-400 hover:text-amber-300 px-0">
                      <Sparkles size={10} /> Auto-fix
                    </Button>
                  </Card>
                ))}
              </div>
            )}

            {failedCases.length > 0 && (
              <Card className="p-4 border-lime-500/10 bg-lime-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={14} className="text-lime-400" />
                  <h3 className="text-xs font-bold text-lime-400">AI Auto-Fixer</h3>
                </div>
                <p className="text-xs text-text-secondary mb-3">
                  CerebroForge can automatically fix {failedCases.length} failing tests using the AI Repair Agent.
                </p>
                <Button className="w-full gap-2 bg-lime-600 hover:bg-lime-700 text-black font-bold text-xs h-8">
                  <Sparkles size={12} /> Fix All Failures
                </Button>
              </Card>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button
          className="gap-2 bg-lime-600 hover:bg-lime-700 text-black font-bold"
          disabled={!hasRun}
          onClick={() => router.push(`/app/forge/deploy?projectId=${projectId}`)}
        >
          <ChevronRight size={16} /> Proceed to Deployment
        </Button>
        {hasRun && (
          <Button variant="secondary" className="gap-2"><Download size={16} /> Export Test Report</Button>
        )}
      </div>
    </div>
  );
}
