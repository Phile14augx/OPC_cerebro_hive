"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Cpu, Server } from "lucide-react";
import { cn } from "@/lib/utils";
import { AgentOSLiveRuntime } from "@/components/platform/live-runtime/AgentOSLiveRuntime";
import { AgentOSBackendGate } from "@/components/platform/live-runtime/AgentOSBackendGate";

type Mode = "kernel" | "backend";

export default function LiveRuntimePage() {
  const [mode, setMode] = useState<Mode>("kernel");

  return (
    <main className="bg-background min-h-screen">
      <section className="border-b border-border pt-32 pb-10">
        <div className="container-wide">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-accent/10 border border-primary-accent/30 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary-accent">AgentOS — Live Runtime</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-4">Two real, independent runtimes</h1>
          <p className="text-text-secondary max-w-2xl font-inter mb-8">
            Choose between the deterministic in-browser kernel (runs entirely in this page, no server round-trip) and the
            full Python backend service (a separate FastAPI app with its own database, governance engine, and observability
            stack). Neither is a mockup — both execute your input for real.
          </p>

          <div className="inline-flex p-1 rounded-lg bg-surface border border-border gap-1">
            <button
              onClick={() => setMode("kernel")}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-md text-xs font-bold uppercase tracking-widest transition-colors",
                mode === "kernel" ? "bg-primary-accent text-text-primary" : "text-text-secondary hover:text-text-primary"
              )}
            >
              <Cpu size={14} /> In-Browser Kernel
            </button>
            <button
              onClick={() => setMode("backend")}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-md text-xs font-bold uppercase tracking-widest transition-colors",
                mode === "backend" ? "bg-primary-accent text-text-primary" : "text-text-secondary hover:text-text-primary"
              )}
            >
              <Server size={14} /> Full Backend
            </button>
          </div>
        </div>
      </section>

      <motion.div key={mode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        {mode === "kernel" ? (
          <AgentOSLiveRuntime />
        ) : (
          <section className="section-pad container-wide">
            <AgentOSBackendGate />
          </section>
        )}
      </motion.div>
    </main>
  );
}
