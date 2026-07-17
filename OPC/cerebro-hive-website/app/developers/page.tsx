import React from "react";
import Link from "next/link";
import { Terminal, Code2, Zap, ArrowRight, ShieldCheck, Database, FileJson, Blocks } from "lucide-react";

export default function DevelopersPage() {
  return (
    <div className="flex flex-col gap-12 pb-12">
      <div className="border-b border-border pb-8">
        <h1 className="text-3xl md:text-4xl font-space font-bold text-text-primary mb-4">
          Developer Platform
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl">
          Build the future of autonomous enterprise operations. Integrate CerebroHive's AI agents, data pipelines, and ERP systems directly into your applications.
        </p>
      </div>

      {/* Quick Start Cards */}
      <section>
        <h2 className="text-sm uppercase tracking-widest text-text-muted font-bold mb-6">Quick Start</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/developers/api" className="group p-6 rounded-2xl bg-surface border border-border hover:border-primary-accent/50 transition-all hover:shadow-elevated">
            <div className="w-12 h-12 rounded-xl bg-primary-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FileJson className="text-primary-accent" size={24} />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
              REST API <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-primary-accent" />
            </h3>
            <p className="text-sm text-text-secondary">
              Connect to our globally distributed, low-latency API to manage agents, query datasets, and trigger autonomous workflows.
            </p>
          </Link>
          
          <Link href="/developers/architecture" className="group p-6 rounded-2xl bg-surface border border-border hover:border-secondary-accent/50 transition-all hover:shadow-elevated">
            <div className="w-12 h-12 rounded-xl bg-secondary-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Blocks className="text-secondary-accent" size={24} />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
              Architecture <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-secondary-accent" />
            </h3>
            <p className="text-sm text-text-secondary">
              Understand the core paradigms of AgentOS, CerebroSphere, and our event-driven infrastructure.
            </p>
          </Link>
        </div>
      </section>

      {/* SDKs Section */}
      <section>
        <h2 className="text-sm uppercase tracking-widest text-text-muted font-bold mb-6">Official SDKs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl border border-border bg-background flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-text-primary">TypeScript</span>
              <span className="text-[10px] uppercase tracking-widest text-primary-accent font-bold px-2 py-1 rounded bg-primary-accent/10">v2.4.0</span>
            </div>
            <div className="p-3 rounded-lg bg-surface-elevated font-mono text-xs text-text-muted border border-border">
              npm i @cerebrohive/node
            </div>
          </div>
          <div className="p-5 rounded-xl border border-border bg-background flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-text-primary">Python</span>
              <span className="text-[10px] uppercase tracking-widest text-primary-accent font-bold px-2 py-1 rounded bg-primary-accent/10">v1.2.5</span>
            </div>
            <div className="p-3 rounded-lg bg-surface-elevated font-mono text-xs text-text-muted border border-border">
              pip install cerebrohive
            </div>
          </div>
          <div className="p-5 rounded-xl border border-border bg-background flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-text-primary">Go</span>
              <span className="text-[10px] uppercase tracking-widest text-primary-accent font-bold px-2 py-1 rounded bg-primary-accent/10">v1.0.0</span>
            </div>
            <div className="p-3 rounded-lg bg-surface-elevated font-mono text-xs text-text-muted border border-border">
              go get github.com/cerebrohive/go
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-border pt-12">
        <div>
          <ShieldCheck className="text-text-muted mb-4" size={24} />
          <h4 className="font-bold text-text-primary mb-2">Enterprise Security</h4>
          <p className="text-xs text-text-secondary">SOC2 Type II compliant APIs with granular RBAC, short-lived tokens, and mutual TLS.</p>
        </div>
        <div>
          <Zap className="text-text-muted mb-4" size={24} />
          <h4 className="font-bold text-text-primary mb-2">Webhooks & Events</h4>
          <p className="text-xs text-text-secondary">Listen to agent lifecycle events in real-time via high-throughput webhooks or NATS.</p>
        </div>
        <div>
          <Database className="text-text-muted mb-4" size={24} />
          <h4 className="font-bold text-text-primary mb-2">Vector Search</h4>
          <p className="text-xs text-text-secondary">Direct access to the underlying Knowledge Hub vector store for custom RAG implementations.</p>
        </div>
      </section>
    </div>
  );
}
