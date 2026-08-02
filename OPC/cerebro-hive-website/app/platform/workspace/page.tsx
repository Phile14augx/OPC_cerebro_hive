import type { Metadata } from "next";

import { ProductPage, type ProductPanel } from "@/components/platform/ProductPage";

export const metadata: Metadata = {
  title: "HiveWorkspace — CerebroHive Platform",
  description: "HiveWorkspace gives human and agent teams one shared context — shared memory, explicit handoffs, and a full replay of every message and tool call.",
};

const PANELS: ProductPanel[] = [
    {
      title: "Shared context",
      description: "One working memory for every participant.",
      items: [
        "Workspace-scoped HiveMemory namespace",
        "Pinned documents resolved through HiveKnowledge",
        "Live artifact board shared by humans and agents",
        "Context budget management to bound token spend",
      ],
    },
    {
      title: "Handoff protocol",
      description: "How work moves between participants.",
      items: [
        "Explicit task claim, release, and delegation",
        "Agent-to-agent negotiation with recorded rationale",
        "Human approval gates on constitution-flagged actions",
        "Timeout and escalation when a claim goes stale",
      ],
    },
    {
      title: "Governance",
      description: "Oversight without blocking throughput.",
      items: [
        "Per-workspace RBAC for humans and agent principals",
        "Immutable transcript of every message and tool call",
        "Policy evaluation on each agent action",
        "Data-residency scoping per workspace",
      ],
    },
    {
      title: "Replay and review",
      description: "Making autonomous work auditable after the fact.",
      items: [
        "Full session replay with step-through timeline",
        "Diff view of artifacts across the session",
        "Cited provenance for every generated claim",
        "Export to HiveEvaluation as a golden task",
      ],
    },
];

export default function Page() {
  return (
    <ProductPage
      name={"HiveWorkspace™"}
      tier={3}
      headline={"Collaborative environments for multi-agent and human teams"}
      summary={"HiveWorkspace is where people and agents share a single context. It gives a team a durable room with shared memory, explicit handoff protocol, and a full replay of who — human or agent — did what, so autonomous work stays reviewable rather than opaque."}
      panels={PANELS}
    />
  );
}
