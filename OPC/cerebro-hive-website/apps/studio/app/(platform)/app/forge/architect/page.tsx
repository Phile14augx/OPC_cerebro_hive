"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Layers3, Sparkles, ChevronRight, Server, Network,
  CheckCircle2, Loader2, Code2, ArrowRight,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { useForgeActions, useForgeProject } from "@/lib/forge/hooks";
import type { ForgeArchitecture } from "@cerebro/workflow";

const PATTERN_LABELS: Record<string, string> = {
  microservices: "Microservices",
  monolith:      "Monolith",
  ddd:           "Domain-Driven Design",
  cqrs:          "CQRS",
  event_driven:  "Event-Driven",
  hexagonal:     "Hexagonal",
  clean:         "Clean Architecture",
};

export default function ArchitectureStudioPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  const { project } = useForgeProject(projectId ?? "");
  const { running, error, runArchitect } = useForgeActions(projectId ?? "");

  const [architecture, setArchitecture] = useState<ForgeArchitecture | null>(null);

  // Load persisted architecture from project
  useEffect(() => {
    if (project?.archJson) {
      setArchitecture(project.archJson as unknown as ForgeArchitecture);
    }
  }, [project]);

  const handleDesign = async () => {
    if (!projectId) return;
    const result = await runArchitect();
    if (result) setArchitecture(result);
  };

  const generated = architecture !== null;

  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Layers3 size={20} className="text-cyan-400" />
          <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs">Architecture Studio</Badge>
          <Badge variant="secondary" className="text-xs">Phase 3</Badge>
        </div>
        <h1 className="text-3xl font-space font-bold text-text-primary">Architecture Studio</h1>
        <p className="text-text-secondary mt-1">
          AI designs your complete system architecture — microservices, clean architecture, DDD, event-driven patterns and more.
          {project && <span className="text-cyan-400 ml-1">— {project.name}</span>}
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleDesign}
          disabled={running || !projectId}
          className="gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold disabled:opacity-50"
        >
          {running ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {running ? "Designing..." : generated ? "Redesign Architecture" : "Generate Architecture"}
        </Button>
      </div>

      {error && (
        <Card className="p-4 border-red-500/20 bg-red-500/5">
          <p className="text-sm text-red-400">{error}</p>
        </Card>
      )}

      {running && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <Loader2 size={40} className="animate-spin text-cyan-400 mx-auto" />
            <p className="text-text-secondary font-medium">Designing system architecture...</p>
            <p className="text-text-muted text-sm">Selecting patterns, designing services, generating ADRs</p>
          </div>
        </div>
      )}

      {generated && !running && architecture && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">

          {/* Pattern Badge */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-muted">Architecture pattern:</span>
            <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
              {PATTERN_LABELS[architecture.pattern] ?? architecture.pattern}
            </Badge>
          </div>

          {/* Visual Architecture Diagram */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">System Architecture</h2>
            <Card className="p-6 border-cyan-500/10">
              <div className="space-y-6">
                {/* Presentation Layer */}
                <div className="text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-3">Presentation Layer</p>
                  <div className="flex justify-center gap-4 flex-wrap">
                    {(architecture.techStack?.frontend ?? []).slice(0, 3).map((c, i) => (
                      <div key={i} className="px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs font-bold text-cyan-400">{c}</div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-center"><ArrowRight size={16} className="text-text-muted rotate-90" /></div>
                {/* API Gateway (first service or gateway) */}
                <div className="text-center">
                  {(() => {
                    const gw = architecture.services.find(s => s.name.toLowerCase().includes("gateway") || s.port === 3000);
                    return gw ? (
                      <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-sm font-bold text-violet-400">
                        <Network size={16} /> {gw.name} (:{gw.port})
                      </div>
                    ) : null;
                  })()}
                </div>
                <div className="flex justify-center"><ArrowRight size={16} className="text-text-muted rotate-90" /></div>
                {/* Microservices */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-3 text-center">Services Layer</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {architecture.services
                      .filter(s => !s.name.toLowerCase().includes("gateway"))
                      .slice(0, 8)
                      .map((s, i) => (
                        <div key={i} className="p-3 rounded-xl bg-surface-elevated border border-border text-center">
                          <Server size={14} className="text-cyan-400 mx-auto mb-1" />
                          <p className="text-[10px] font-bold text-text-primary truncate">{s.name}</p>
                          <p className="text-[9px] text-text-muted">:{s.port}</p>
                        </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-center"><ArrowRight size={16} className="text-text-muted rotate-90" /></div>
                {/* Data Layer */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-3 text-center">Data Layer</p>
                  <div className="flex justify-center gap-4 flex-wrap">
                    {(architecture.techStack?.database ?? []).slice(0, 5).map((d, i) => (
                      <div key={i} className="px-3 py-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-xs font-bold text-teal-400">{d}</div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Service Registry Table */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Service Registry</h2>
            <Card className="overflow-hidden p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface-elevated/30">
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-text-muted">Service</th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-text-muted">Port</th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-text-muted">Database</th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-text-muted">Runtime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {architecture.services.map((s, i) => (
                    <tr key={i} className="hover:bg-surface-elevated/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Server size={14} className="text-cyan-400 shrink-0" />
                          <span className="text-sm font-mono font-bold text-text-primary">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary font-mono">:{s.port}</td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{s.database ?? "—"}</td>
                      <td className="px-4 py-3"><Badge variant="info" className="text-[10px]">{s.runtime}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>

          {/* Tech Stack */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Technology Selection</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {Object.entries(architecture.techStack).map(([layer, techs], i) => (
                <Card key={i} className="p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-3 capitalize">{layer}</p>
                  <div className="space-y-1.5">
                    {techs.map((t, j) => (
                      <div key={j} className="flex items-center gap-2 text-xs">
                        <CheckCircle2 size={11} className="text-cyan-400 shrink-0" />
                        <span className="text-text-secondary">{t}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* ADRs */}
          {architecture.decisions.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Architecture Decision Records</h2>
              <div className="space-y-3">
                {architecture.decisions.map((d, i) => (
                  <Card key={i} className="p-4 border-cyan-500/10">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-bold text-text-primary text-sm">{d.title}</h3>
                      <Badge variant="success" className="text-[10px] shrink-0">{d.status}</Badge>
                    </div>
                    <p className="text-xs text-text-muted mb-1"><span className="font-semibold text-text-secondary">Context:</span> {d.context}</p>
                    <p className="text-xs text-text-muted"><span className="font-semibold text-text-secondary">Decision:</span> {d.decision}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Folder Structure */}
          {architecture.folderStructure && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Folder Structure</h2>
              <Card className="p-4">
                <pre className="text-xs font-mono text-text-secondary whitespace-pre-wrap leading-relaxed">{architecture.folderStructure}</pre>
              </Card>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => window.location.href = `/app/forge/codegen?projectId=${projectId}`}
              className="gap-2 bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              <ChevronRight size={16} /> Proceed to Code Generation
            </Button>
            <Button variant="secondary" className="gap-2" onClick={handleDesign} disabled={running}>
              <Code2 size={16} /> Redesign
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
