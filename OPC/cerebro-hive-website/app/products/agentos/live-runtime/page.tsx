"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Cpu, Server } from "lucide-react";
import { cn } from "@/lib/utils";
import { AgentOSLiveRuntime } from "@/components/products/agentos/AgentOSLiveRuntime";
import { AgentOSBackendConsole } from "@/components/products/agentos/AgentOSBackendConsole";
import { AgentOSPlatformConsole } from "@/components/products/agentos/AgentOSPlatformConsole";

type Mode = "in-browser" | "backend";

export default function AgentOSLiveRuntimeRoute() {
  const [mode, setMode] = useState<Mode>("in-browser");

  return (
    <div className="bg-background min-h-screen">
      <div className="container-wide pt-10 flex flex-col gap-6">
        <Link href="/products/agentos" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-muted hover:text-text-primary transition-colors w-fit">
          <ArrowLeft size={14} /> Back to AgentOS
        </Link>

        <div className="inline-flex gap-1 p-1 bg-surface border border-border rounded-xl w-fit">
          <button
            onClick={() => setMode("in-browser")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors",
              mode === "in-browser" ? "bg-primary-accent text-text-primary" : "text-text-secondary hover:text-text-primary"
            )}
          >
            <Cpu size={14} /> In-Browser Kernel
          </button>
          <button
            onClick={() => setMode("backend")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors",
              mode === "backend" ? "bg-primary-accent text-text-primary" : "text-text-secondary hover:text-text-primary"
            )}
          >
            <Server size={14} /> Full Backend (agentos/)
          </button>
        </div>

        <p className="text-xs text-text-muted max-w-2xl -mt-2">
          {mode === "in-browser"
            ? "Guard, Reasoning Engine, Planner, Scheduler, Memory Fabric, and Eval run as real deterministic logic in this page — no setup required."
            : "Talks over HTTP to the real Python AgentOS service in this repo's agentos/ folder — agent registry, governance approvals, and traced execution. Requires the backend running locally."}
        </p>
      </div>

      {mode === "in-browser" ? (
        <AgentOSLiveRuntime />
      ) : (
        <div className="section-pad">
          <div className="container-wide">
            <AgentOSBackendConsole />
            <AgentOSPlatformConsole />
          </div>
        </div>
      )}
    </div>
  );
}
