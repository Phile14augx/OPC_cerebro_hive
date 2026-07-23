"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Truck, Sparkles, Play, CheckCircle2, Cloud, Server,
  GitBranch, Activity, AlertCircle, Loader2, Terminal,
  ChevronRight, Shield, Zap, Globe, Package, AlertTriangle,
  FileCode2, Container,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { StatCard } from "../../components/ui/StatCard";
import { useForgeProject, useForgeActions } from "@/lib/forge/hooks";
import type { DeploymentResult, CIPipelineStep } from "@/lib/forge/api-client";

const INFRA_ICONS: Record<string, React.ElementType> = {
  "AWS EKS": Cloud,
  "GCP GKE": Cloud,
  "Azure AKS": Cloud,
  "DigitalOcean": Server,
  "Self-Hosted K8s": Server,
  "Docker Compose": Package,
};

const ARTIFACT_ICONS: Record<string, React.ElementType> = {
  dockerfile: Container,
  kubernetes: Server,
  terraform: Globe,
  helm: Package,
  ci_pipeline: GitBranch,
};

export default function DeploymentStudioPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get("projectId") ?? "";

  const { project } = useForgeProject(projectId);
  const { running, error, runDeploy } = useForgeActions(projectId);
  const [result, setResult] = useState<DeploymentResult | null>(null);
  const [environment, setEnvironment] = useState("production");

  const handleDeploy = async () => {
    const res = await runDeploy(environment);
    if (res) setResult(res);
  };

  const hasRun = result !== null;

  const pipeline: CIPipelineStep[] = result?.ciPipelineSteps ?? [];
  const artifacts = result?.deploymentArtifacts ?? [];
  const infraTargets = result?.infrastructureTargets ?? [];

  // Metrics
  const dockerFiles = artifacts.filter(a => a.type === "dockerfile").length;
  const k8sFiles = artifacts.filter(a => a.type === "kubernetes").length;
  const tfFiles = artifacts.filter(a => a.type === "terraform").length;

  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Truck size={20} className="text-emerald-400" />
          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs">Deployment Studio</Badge>
          {project && <Badge variant="secondary" className="text-xs">{project.name}</Badge>}
        </div>
        <h1 className="text-3xl font-space font-bold text-text-primary">Deployment Intelligence</h1>
        <p className="text-text-secondary mt-1">
          AI generates Docker, Kubernetes, Terraform, Helm charts, and full CI/CD pipelines. One click to production.
        </p>
      </div>

      {/* Error */}
      {error && (
        <Card className="p-4 border-red-500/20 bg-red-500/5 flex items-center gap-3">
          <AlertTriangle size={16} className="text-red-400 shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={environment}
          onChange={e => setEnvironment(e.target.value)}
          disabled={running}
          className="text-xs bg-surface border border-border rounded-md px-3 py-2 text-text-primary focus:outline-none focus:border-emerald-500/50"
        >
          <option value="development">Development</option>
          <option value="staging">Staging</option>
          <option value="production">Production</option>
        </select>
        <Button
          onClick={handleDeploy}
          disabled={running || !projectId}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
        >
          {running ? <Loader2 size={16} className="animate-spin" /> : <Truck size={16} />}
          {running ? "Generating Deployment…" : hasRun ? "Regenerate" : "Generate Deployment Config"}
        </Button>
      </div>

      {!hasRun && !running && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <Truck size={40} className="mx-auto text-text-muted mb-4" />
          <p className="text-text-secondary text-sm">
            Click <span className="text-emerald-400 font-semibold">Generate Deployment Config</span> to let the DevOps agent create Docker, Kubernetes, Terraform, and CI/CD configs.
          </p>
        </motion.div>
      )}

      {running && (
        <Card className="p-8 flex flex-col items-center gap-4 border-emerald-500/20 bg-emerald-500/5">
          <Loader2 size={32} className="animate-spin text-emerald-400" />
          <p className="text-sm text-emerald-400 font-semibold">DevOps agent generating deployment configs…</p>
          <p className="text-xs text-text-muted">Building Dockerfile, K8s manifests, Terraform, Helm charts, and CI/CD pipeline</p>
        </Card>
      )}

      {hasRun && (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Artifacts"       value={String(artifacts.length)} change="Generated"          icon={FileCode2}  trend="up" />
            <StatCard label="Pipeline Stages" value={String(pipeline.length)}  change="CI/CD steps"       icon={GitBranch}  trend="up" />
            <StatCard label="Infra Targets"   value={String(infraTargets.length)} change="Supported"      icon={Cloud}      trend="up" />
            <StatCard label="Environment"     value={result!.environment}      change="Target"             icon={Globe}      trend="up" />
          </div>

          {/* CI/CD Pipeline */}
          {pipeline.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">CI/CD Pipeline</h2>
                <Badge
                  variant={pipeline.some(s => s.status === "failed") ? "destructive" : pipeline.some(s => s.status === "running") ? "warning" : "success"}
                  className="text-xs"
                >
                  {pipeline.some(s => s.status === "failed") ? "Failed" : pipeline.some(s => s.status === "running") ? "Running" : "Ready"}
                </Badge>
              </div>
              <Card className="p-0 overflow-hidden divide-y divide-border">
                {pipeline.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className={`flex items-center justify-between px-5 py-3 ${step.status === "running" ? "bg-emerald-500/5" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      {step.status === "done"
                        ? <CheckCircle2 size={16} className="text-green-400 shrink-0" />
                        : step.status === "running"
                        ? <Loader2 size={16} className="animate-spin text-emerald-400 shrink-0" />
                        : step.status === "failed"
                        ? <AlertCircle size={16} className="text-red-400 shrink-0" />
                        : <div className="w-4 h-4 rounded-full border-2 border-border shrink-0" />
                      }
                      <div>
                        <p className="text-xs font-bold text-text-muted uppercase tracking-widest">{step.stage}</p>
                        <p className="text-sm text-text-primary">{step.step}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {step.estimatedTime && <span className="text-xs text-text-muted font-mono mr-2">{step.estimatedTime}</span>}
                      {step.status === "running" && <Badge variant="warning" className="text-[10px]">In Progress</Badge>}
                      {step.status === "pending" && <Badge variant="secondary" className="text-[10px]">Queued</Badge>}
                      {step.status === "failed" && <Badge variant="destructive" className="text-[10px]">Failed</Badge>}
                      {step.status === "done" && <Badge variant="success" className="text-[10px]">Done</Badge>}
                    </div>
                  </motion.div>
                ))}
              </Card>
            </div>
          )}

          {/* Generated Artifacts */}
          {artifacts.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Generated Artifacts</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {artifacts.map((artifact, i) => {
                  const Icon = ARTIFACT_ICONS[artifact.type] ?? FileCode2;
                  return (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <Card className="p-4 hover:border-emerald-500/20 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3 mb-2">
                          <Icon size={16} className="text-emerald-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-text-primary truncate">{artifact.name}</p>
                            <p className="text-[10px] text-text-muted font-mono truncate">{artifact.filePath}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-[9px]">{artifact.type.replace("_", " ")}</Badge>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Infrastructure Targets */}
          {infraTargets.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Supported Deployment Targets</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {infraTargets.map((target, i) => {
                  const Icon = INFRA_ICONS[target] ?? Server;
                  return (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                      <Card className="p-4 text-center hover:border-emerald-500/20 transition-colors">
                        <Icon size={20} className="mx-auto mb-2 text-text-muted" />
                        <p className="text-xs font-bold text-text-primary">{target}</p>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      <div className="flex flex-wrap gap-3">
        <Button
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
          disabled={!hasRun}
          onClick={() => router.push(`/app/forge/review?projectId=${projectId}`)}
        >
          <ChevronRight size={16} /> Proceed to Code Review
        </Button>
        {hasRun && (
          <>
            <Button variant="secondary" className="gap-2"><Terminal size={16} /> View K8s Manifests</Button>
            <Button variant="secondary" className="gap-2"><Sparkles size={16} /> Optimize for Cost</Button>
          </>
        )}
      </div>
    </div>
  );
}
