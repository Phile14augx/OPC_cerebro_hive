import React from "react";
import { LivingArchitecture } from "@/components/architecture/LivingArchitecture";

export default function ArchitecturePage() {
  return (
    <div className="flex flex-col gap-12 pb-12 w-full max-w-[1400px] mx-auto">
      <div className="border-b border-border pb-8">
        <h1 className="text-3xl md:text-4xl font-space font-bold text-text-primary mb-4">
          Enterprise Architecture
        </h1>
        <p className="text-lg text-text-secondary max-w-3xl">
          A living digital twin of the CerebroHive platform. Watch how our event-driven infrastructure, Next.js gateway, and AgentOS orchestrator process complex enterprise workflows in real-time.
        </p>
      </div>

      <section className="w-full">
        {/* Render the interactive React Flow visualization */}
        <LivingArchitecture />
      </section>
      
      <section className="border-t border-border pt-12 mt-8">
        <h2 className="text-2xl font-space font-bold text-text-primary mb-6">
          Architectural Paradigms
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl border border-border bg-surface">
            <h4 className="font-bold text-text-primary mb-2">Event-Driven Core</h4>
            <p className="text-sm text-text-secondary">
              Agent-to-agent communication relies on an asynchronous NATS JetStream event bus, allowing for persistent, replayable, and highly concurrent task execution.
            </p>
          </div>
          <div className="p-6 rounded-xl border border-border bg-surface">
            <h4 className="font-bold text-text-primary mb-2">Hybrid Memory</h4>
            <p className="text-sm text-text-secondary">
              The Knowledge Hub is powered by a hybrid architecture combining PostgreSQL relational integrity with high-dimensional vector similarity search.
            </p>
          </div>
          <div className="p-6 rounded-xl border border-border bg-surface">
            <h4 className="font-bold text-text-primary mb-2">Edge Compute</h4>
            <p className="text-sm text-text-secondary">
              Our API gateway is distributed globally across edge nodes to guarantee single-digit millisecond latency for webhooks and UI interactions.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
