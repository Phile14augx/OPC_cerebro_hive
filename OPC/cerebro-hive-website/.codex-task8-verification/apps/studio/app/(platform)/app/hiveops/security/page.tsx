"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield, AlertTriangle, CheckCircle2, XCircle, Info,
  ScanSearch, Lock, Package, FileCode2, Container, FileText,
  ExternalLink, ChevronDown, ChevronRight, RefreshCw,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";

type Severity = "critical" | "high" | "medium" | "low" | "info";

interface Finding {
  id: string;
  scanner: string;
  severity: Severity;
  title: string;
  file?: string;
  package?: string;
  version?: string;
  fixVersion?: string;
  cve?: string;
  description: string;
  autoFixable: boolean;
}

const FINDINGS: Finding[] = [
  {
    id: "f001", scanner: "Trivy", severity: "high",
    title: "Prototype Pollution in lodash",
    package: "lodash", version: "4.17.15", fixVersion: "4.17.21",
    cve: "CVE-2021-23337",
    description: "Command injection via lodash template method. Upgrade to 4.17.21.",
    autoFixable: true,
  },
  {
    id: "f002", scanner: "Trivy", severity: "high",
    title: "ReDoS vulnerability in semver",
    package: "semver", version: "5.7.1", fixVersion: "5.7.2",
    cve: "CVE-2022-25883",
    description: "Regular expression denial of service via crafted version string.",
    autoFixable: true,
  },
  {
    id: "f003", scanner: "Semgrep", severity: "medium",
    title: "Hardcoded JWT secret in test utility",
    file: "services/forge-api/src/utils/test-helpers.ts",
    description: "JWT signing secret is hardcoded in test file. Move to environment variable.",
    autoFixable: false,
  },
  {
    id: "f004", scanner: "Semgrep", severity: "medium",
    title: "SQL-like injection pattern in raw Prisma query",
    file: "services/platform-api/src/tenants/tenant.repository.ts",
    description: "Dynamic string interpolation in Prisma $queryRaw. Use parameterized queries.",
    autoFixable: false,
  },
  {
    id: "f005", scanner: "Semgrep", severity: "medium",
    title: "Missing rate limiting on auth endpoint",
    file: "apps/studio/app/api/auth/route.ts",
    description: "Authentication endpoint lacks rate limiting middleware.",
    autoFixable: false,
  },
  {
    id: "f006", scanner: "Gitleaks", severity: "info",
    title: "Potential secret in test fixture",
    file: "services/forge-api/src/__tests__/fixtures/auth.ts",
    description: "String matching secret pattern in test fixture. Verify it's a fake test value.",
    autoFixable: false,
  },
  ...Array.from({ length: 4 }, (_, i) => ({
    id: `f-low-${i}`, scanner: ["Trivy", "Semgrep"][i % 2], severity: "low" as Severity,
    title: ["Outdated dependency with known info disclosure", "Missing HSTS header in middleware", "Verbose error response leaks stack trace", "Missing CSP nonce in inline script"][i],
    file: i % 2 === 0 ? `apps/studio/src/middleware/${["cors", "error"][i % 2]}.ts` : undefined,
    package: i % 2 === 1 ? ["express", "axios"][i % 2] : undefined,
    description: "Low severity finding — review and remediate in next sprint.",
    autoFixable: [true, false, true, false][i],
  })),
];

const SCAN_RUNS = [
  { scanner: "Trivy",    icon: Container, lastRun: "6 min ago",  status: "completed", findings: { high: 2, medium: 0, low: 2 } },
  { scanner: "Semgrep",  icon: FileCode2, lastRun: "6 min ago",  status: "completed", findings: { high: 0, medium: 3, low: 2 } },
  { scanner: "Gitleaks", icon: Lock,      lastRun: "6 min ago",  status: "completed", findings: { high: 0, medium: 0, low: 0 } },
  { scanner: "CodeQL",   icon: ScanSearch,lastRun: "Mon 04:00",  status: "completed", findings: { high: 0, medium: 0, low: 0 } },
  { scanner: "Cosign",   icon: Shield,    lastRun: "6 min ago",  status: "completed", findings: { high: 0, medium: 0, low: 0 } },
];

const SEVERITY_CONFIG: Record<Severity, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
  critical: { color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    icon: <XCircle size={13} className="text-red-400" /> },
  high:     { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: <AlertTriangle size={13} className="text-orange-400" /> },
  medium:   { color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20",  icon: <AlertTriangle size={13} className="text-amber-400" /> },
  low:      { color: "text-text-muted", bg: "bg-surface",       border: "border-border",         icon: <Info size={13} className="text-text-muted" /> },
  info:     { color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20",   icon: <Info size={13} className="text-blue-400" /> },
};

export default function SecurityPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<Severity | "all">("all");
  const [filterScanner, setFilterScanner] = useState<string>("all");

  const totals = {
    critical: FINDINGS.filter(f => f.severity === "critical").length,
    high:     FINDINGS.filter(f => f.severity === "high").length,
    medium:   FINDINGS.filter(f => f.severity === "medium").length,
    low:      FINDINGS.filter(f => f.severity === "low").length,
  };

  const filtered = FINDINGS
    .filter(f => filterSeverity === "all" || f.severity === filterSeverity)
    .filter(f => filterScanner === "all" || f.scanner === filterScanner);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Shield size={18} className="text-red-400" />
          <Badge className="bg-red-500/10 text-red-400 border border-red-500/20 text-xs">DevSecOps</Badge>
        </div>
        <h1 className="text-2xl font-space font-bold text-text-primary">Security Scan Results</h1>
        <p className="text-text-secondary text-sm mt-1">Consolidated findings from Trivy, Semgrep, Gitleaks, and CodeQL.</p>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Critical", count: totals.critical, color: "text-red-400",    border: "border-red-500/20" },
          { label: "High",     count: totals.high,     color: "text-orange-400", border: "border-orange-500/20" },
          { label: "Medium",   count: totals.medium,   color: "text-amber-400",  border: "border-amber-500/20" },
          { label: "Low",      count: totals.low,      color: "text-text-muted", border: "" },
        ].map((s) => (
          <Card key={s.label} className={`p-4 text-center ${s.border}`}>
            <div className={`text-2xl font-space font-bold ${s.color}`}>{s.count}</div>
            <div className="text-[10px] text-text-muted mt-0.5">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Scanner status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {SCAN_RUNS.map((scan) => {
          const Icon = scan.icon;
          const hasFindings = Object.values(scan.findings).some(v => v > 0);
          return (
            <Card key={scan.scanner} className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={13} className={hasFindings ? "text-amber-400" : "text-green-400"} />
                <span className="text-xs font-bold text-text-primary">{scan.scanner}</span>
              </div>
              <div className="text-[9px] text-text-muted mb-1">{scan.lastRun}</div>
              {hasFindings ? (
                <div className="flex gap-1 flex-wrap">
                  {scan.findings.high > 0   && <span className="text-[9px] text-orange-400">{scan.findings.high}H</span>}
                  {scan.findings.medium > 0 && <span className="text-[9px] text-amber-400">{scan.findings.medium}M</span>}
                  {scan.findings.low > 0    && <span className="text-[9px] text-text-muted">{scan.findings.low}L</span>}
                </div>
              ) : (
                <CheckCircle2 size={11} className="text-green-400" />
              )}
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] text-text-muted">Severity:</span>
        {(["all", "high", "medium", "low", "info"] as const).map((s) => (
          <button key={s} onClick={() => setFilterSeverity(s)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-colors capitalize ${
              filterSeverity === s ? "bg-teal-500/15 text-teal-400 border-teal-500/30" : "text-text-secondary border-border hover:border-teal-500/20"
            }`}>
            {s === "all" ? "All" : s}
          </button>
        ))}
        <span className="text-[10px] text-text-muted ml-3">Scanner:</span>
        {["all", "Trivy", "Semgrep", "Gitleaks", "CodeQL"].map((s) => (
          <button key={s} onClick={() => setFilterScanner(s)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-colors ${
              filterScanner === s ? "bg-teal-500/15 text-teal-400 border-teal-500/30" : "text-text-secondary border-border hover:border-teal-500/20"
            }`}>
            {s}
          </button>
        ))}
        <Button variant="secondary" size="sm" className="ml-auto gap-1 text-xs h-7">
          <RefreshCw size={11} /> Re-scan
        </Button>
      </div>

      {/* Findings list */}
      <div className="space-y-2">
        {filtered.map((finding, i) => {
          const cfg = SEVERITY_CONFIG[finding.severity];
          const isExpanded = expanded === finding.id;
          return (
            <motion.div key={finding.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
              <Card className={`overflow-hidden ${isExpanded ? cfg.border : ""}`}>
                <button
                  className="w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-surface-elevated/20 transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : finding.id)}
                >
                  <div className="mt-0.5">{cfg.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border} uppercase`}>
                        {finding.severity}
                      </span>
                      <Badge variant="secondary" className="text-[9px]">{finding.scanner}</Badge>
                      {finding.autoFixable && (
                        <Badge className="text-[9px] bg-teal-500/10 text-teal-400 border border-teal-500/20">Auto-fixable</Badge>
                      )}
                      {finding.cve && (
                        <span className="text-[9px] font-mono text-blue-400">{finding.cve}</span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-text-primary">{finding.title}</p>
                    {(finding.file || finding.package) && (
                      <p className="text-[10px] text-text-muted font-mono mt-0.5">
                        {finding.file ?? `${finding.package}@${finding.version}`}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {finding.autoFixable && (
                      <Button variant="ghost" size="sm" className="h-7 text-[10px] text-teal-400 hover:text-teal-300 gap-1">
                        <CheckCircle2 size={10} /> Fix
                      </Button>
                    )}
                    {isExpanded ? <ChevronDown size={13} className="text-text-muted" /> : <ChevronRight size={13} className="text-text-muted" />}
                  </div>
                </button>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    className={`border-t border-border px-4 py-3 text-xs text-text-secondary ${cfg.bg}`}>
                    <p className="mb-2">{finding.description}</p>
                    {finding.fixVersion && (
                      <p className="text-green-400 font-semibold">
                        Fix: Upgrade <span className="font-mono">{finding.package}</span> from{" "}
                        <span className="font-mono text-red-400">{finding.version}</span> to{" "}
                        <span className="font-mono text-green-400">{finding.fixVersion}</span>
                      </p>
                    )}
                  </motion.div>
                )}
              </Card>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <Card className="p-8 text-center border-green-500/20 bg-green-500/5">
            <CheckCircle2 size={20} className="mx-auto text-green-400 mb-2" />
            <p className="text-xs text-green-400 font-semibold">No findings matching current filters.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
