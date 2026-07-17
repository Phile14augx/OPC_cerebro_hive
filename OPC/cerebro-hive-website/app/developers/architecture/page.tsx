import React from "react";
import { Layers, Server, Network } from "lucide-react";

export default function ArchitecturePage() {
  return (
    <div className="flex flex-col gap-12 pb-12">
      <div className="border-b border-border pb-8">
        <h1 className="text-3xl md:text-4xl font-space font-bold text-text-primary mb-4">
          Enterprise Architecture
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl">
          Understand how CerebroHive's platform is designed for scale, resilience, and autonomous decision-making across complex enterprise environments.
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-space font-bold text-text-primary mb-6 flex items-center gap-2">
          <Layers size={20} className="text-primary-accent" /> High-Level Topology
        </h2>
        
        <div className="p-8 rounded-2xl bg-surface-elevated border border-border mb-6 flex justify-center overflow-x-auto">
          <pre className="font-mono text-xs text-text-secondary whitespace-pre">
{`
┌───────────────────────┐      ┌─────────────────────────┐
│                       │      │                         │
│  Client Applications  │◄────►│  API Gateway (Next.js)  │
│  (Web, Mobile, CLI)   │      │  Auth, Rate Limiting    │
│                       │      │                         │
└───────────────────────┘      └───────────┬─────────────┘
                                           │
                                           ▼
┌────────────────────────────────────────────────────────┐
│                                                        │
│  AgentOS Core (Go)                                     │
│  - Task Orchestration                                  │
│  - Context Memory (Vector DB)                          │
│  - Multi-Agent Communication                           │
│                                                        │
└───────────┬──────────────────────────────┬─────────────┘
            │                              │
            ▼                              ▼
┌───────────────────────┐      ┌─────────────────────────┐
│                       │      │                         │
│  Event Bus (NATS)     │◄────►│  Enterprise Integrations│
│  Pub/Sub & Queues     │      │  (ERP, CRM, Legacy)     │
│                       │      │                         │
└───────────────────────┘      └─────────────────────────┘
`}
          </pre>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border border-border bg-surface">
            <h4 className="font-bold text-text-primary mb-2 flex items-center gap-2">
              <Server size={16} className="text-primary-accent" /> Edge Compute
            </h4>
            <p className="text-sm text-text-secondary">
              Our API gateway is distributed globally across edge nodes to guarantee single-digit millisecond latency for webhooks and UI interactions.
            </p>
          </div>
          <div className="p-6 rounded-xl border border-border bg-surface">
            <h4 className="font-bold text-text-primary mb-2 flex items-center gap-2">
              <Network size={16} className="text-secondary-accent" /> Event-Driven Core
            </h4>
            <p className="text-sm text-text-secondary">
              Agent-to-agent communication relies on an asynchronous NATS JetStream event bus, allowing for persistent, replayable, and highly concurrent task execution.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-border pt-12">
        <h2 className="text-2xl font-space font-bold text-text-primary mb-4">
          Data Architecture
        </h2>
        <p className="text-sm text-text-secondary mb-8">
          The Knowledge Hub is powered by a hybrid architecture combining relational integrity with vector similarity search.
        </p>
        
        <div className="space-y-6">
          <div className="flex gap-4 p-5 rounded-xl border border-border bg-background">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <span className="font-bold text-blue-400 font-mono">SQL</span>
            </div>
            <div>
              <h4 className="font-bold text-text-primary mb-1">PostgreSQL</h4>
              <p className="text-xs text-text-secondary">Stores relational data: user accounts, agent configurations, RBAC permissions, and audit logs. Ensures strong consistency for critical operations.</p>
            </div>
          </div>
          
          <div className="flex gap-4 p-5 rounded-xl border border-border bg-background">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
              <span className="font-bold text-green-400 font-mono">VDB</span>
            </div>
            <div>
              <h4 className="font-bold text-text-primary mb-1">Vector Store</h4>
              <p className="text-xs text-text-secondary">Handles high-dimensional embeddings for enterprise documents, enabling semantic search and context injection for RAG pipelines.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
