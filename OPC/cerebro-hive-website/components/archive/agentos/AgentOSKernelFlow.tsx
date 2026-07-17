"use client";

import React from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArchitectureCanvas } from "@/components/architecture/ArchitectureCanvas";
import { agentos } from "@/lib/data/products/agentos";

export const AgentOSKernelFlow = () => {
  const { architecture } = agentos;
  if (!architecture) return null;

  return (
    <section className="section-pad border-b border-border bg-surface-elevated">
      <div className="container-wide flex flex-col gap-8">
        <SectionHeading
          label="The Kernel"
          title="User goal in. Governed result out."
          description="A live look at the AI Kernel: the planner builds a task graph, the scheduler hands it to a supervised chain of agents, and every step touches memory, tools, and the LLM gateway under governance."
        />
        <ArchitectureCanvas initialNodes={architecture.nodes} initialEdges={architecture.edges} direction="LR" />
      </div>
    </section>
  );
};
