"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  FileCode2, Sparkles, Play, ChevronRight, CheckCircle2,
  Loader2, Terminal, Clock, Package, Copy, Server, Globe, Smartphone, Monitor,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { StatCard } from "../../components/ui/StatCard";
import { useCodegen } from "@/lib/forge/hooks";
import { useForgeProject } from "@/lib/forge/hooks";

export default function CodeGenerationPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const { project } = useForgeProject(projectId ?? "");
  const { state, start } = useCodegen(projectId ?? "");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  const fileList = Object.entries(state.files);
  const doneFiles = state.events.filter(e => e.type === "file_complete").length;
  const totalLines = fileList.reduce((s, [, c]) => s + c.split("\n").length, 0);

  const handleStart = () => {
    const stop = start();
    stopRef.current = stop;
  };

  const selectedContent = selectedFile ? (state.files[selectedFile] ?? "") : "";
  const [frameworks_, setFrameworks] = useState(frameworks);
  const [running, setRunning] = useState(true);
  const [copied, setCopied] = useState(false);

  const toggleFramework = (i: number) => {
  const [copied, setCopied] = useState(false);

  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <FileCode2 size={20} className="text-amber-400" />
          <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs">Code Generation Engine</Badge>
          <Badge variant="secondary" className="text-xs">Phase 5</Badge>
        </div>
        <h1 className="text-3xl font-space font-bold text-text-primary">Code Generation Engine</h1>
        <p className="text-text-secondary mt-1">
          Multi-framework production code generation orchestrated by specialized AI agents.
          {project && <span className="text-amber-400 ml-1">— {project.name}</span>}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Files Generated" value={String(doneFiles)}                                   change="complete"          icon={FileCode2} trend="up" />
        <StatCard label="Lines of Code"   value={totalLines > 1000 ? `${(totalLines/1000).toFixed(1)}K` : String(totalLines)} change="generated" icon={Terminal} trend="up" />
        <StatCard label="Active Agent"    value={state.activeAgent ?? "—"}                            change="running"           icon={Package}   trend="up" />
        <StatCard label="Status"          value={state.done ? "Done" : state.running ? "Building" : "Ready"} change={state.error ? "Error" : ""} icon={Sparkles} trend="up" />
      </div>

      {/* Start Button */}
      {!state.running && !state.done && (
        <Button
          onClick={handleStart}
          disabled={!projectId}
          className="gap-2 bg-amber-500 hover:bg-amber-600 text-black font-bold disabled:opacity-50"
        >
          <Play size={14} fill="currentColor" /> Start Code Generation
        </Button>
      )}

      {/* Error */}
      {state.error && (
        <Card className="p-4 border-red-500/20 bg-red-500/5">
          <p className="text-sm text-red-400">{state.error}</p>
        </Card>
      )}

      {/* Live event log */}
      {(state.running || state.done) && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Generation Pipeline</h2>
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
            {state.events
              .filter(e => e.type !== "chunk")
              .slice(-20)
              .map((e, i) => (
                <div key={i} className={`flex items-center gap-3 px-4 py-2 rounded-lg border text-xs transition-all ${
                  e.type === "file_complete"  ? "border-green-500/20 bg-green-500/5 text-green-400" :
                  e.type === "agent_start"    ? "border-amber-500/30 bg-amber-500/10 text-amber-400" :
                  e.type === "error"          ? "border-red-500/20 bg-red-500/5 text-red-400" :
                  e.type === "done"           ? "border-violet-500/20 bg-violet-500/10 text-violet-400" :
                  "border-border text-text-muted"
                }`}>
                  {e.type === "file_complete" ? <CheckCircle2 size={12} className="shrink-0" /> :
                   e.type === "agent_start"   ? <Loader2 size={12} className="animate-spin shrink-0" /> :
                   <Clock size={12} className="shrink-0" />
                  }
                  <span>
                    {e.type === "agent_start"   && `${e.agentType} agent started`}
                    {e.type === "file_complete" && `✓ ${e.filePath}`}
                    {e.type === "phase_complete" && `${e.agentType} phase complete`}
                    {e.type === "done"           && "Code generation complete"}
                    {e.type === "error"          && `Error: ${e.error}`}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Generated Files */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Generated Files</h2>
            <span className="text-xs text-text-muted">{doneFiles} complete</span>
          </div>
          <Card className="p-0 overflow-hidden divide-y divide-border max-h-96 overflow-y-auto">
            {fileList.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-text-muted">
                Files will appear here as they are generated.
              </div>
            ) : fileList.map(([path, content], i) => {
              const isSelected = selectedFile === path;
              const lines = content.split("\n").length;
              const isGenerating = state.activeAgent !== null &&
                state.events.some(e => e.type === "chunk" && e.filePath === path);
              return (
                <button
                  key={i}
                  onClick={() => setSelectedFile(path)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                    isSelected ? "bg-amber-500/5" : "hover:bg-surface-elevated/50"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {isGenerating
                      ? <Loader2 size={14} className="animate-spin text-amber-400 shrink-0" />
                      : <CheckCircle2 size={14} className="text-green-400 shrink-0" />
                    }
                    <p className="text-xs font-mono text-text-secondary truncate">{path}</p>
                  </div>
                  <span className="text-[10px] text-text-muted shrink-0 ml-2">{lines}L</span>
                </button>
              );
            })}
          </Card>
        </div>

        {/* Code Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Code Preview</h2>
            {selectedFile && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => {
                  navigator.clipboard.writeText(selectedContent);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? <CheckCircle2 size={12} className="text-green-400" /> : <Copy size={12} />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            )}
          </div>
          <Card className="p-0 overflow-hidden border-border">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-surface-elevated/50">
              <Terminal size={13} className="text-amber-400" />
              <span className="text-xs font-mono text-text-muted truncate">
                {selectedFile ?? "Select a file to preview"}
              </span>
            </div>
            <pre className="p-4 text-xs font-mono text-text-secondary overflow-auto leading-relaxed max-h-96">
              <code>{selectedContent || (state.running ? "Generating..." : "No file selected.")}</code>
            </pre>
          </Card>
        </div>
      </div>

      {state.done && (
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => window.location.href = `/app/forge/testing?projectId=${projectId}`}
            className="gap-2 bg-amber-500 hover:bg-amber-600 text-black font-bold"
          >
            <ChevronRight size={16} /> Proceed to Testing
          </Button>
        </div>
      )}
    </div>
  );
}
