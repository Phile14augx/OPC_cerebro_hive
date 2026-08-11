"use client";

import type { DemoMode } from "@cerebro/shared-types";
import { useEffect, useState } from "react";

import { CompanyBrainCanvas } from "../components/graph/CompanyBrainCanvas";
import { OperatingCommandBar } from "../components/command/OperatingCommandBar";
import { EntityInspector } from "../components/inspector/EntityInspector";
import { OperatingSystemShell } from "../components/shell/OperatingSystemShell";
import { BrainInitialReveal } from "../components/states/BrainInitialReveal";
import { OperatingEmptyState } from "../components/states/OperatingEmptyState";
import { OperatingErrorState } from "../components/states/OperatingErrorState";
import { OperatingPermissionState } from "../components/states/OperatingPermissionState";
import { useOperatingGraph } from "../data/queries";
import { operatingSystemClient } from "../data/client";
import { useOperatingWorkspaceStore } from "../workspace/store";
import { useOperatingEvents } from "../realtime/useOperatingEvents";

export function CompanyBrainScreen({ mode = "live" }: { mode?: DemoMode }) {
  const query = useOperatingGraph(mode);
  const inspectorId = useOperatingWorkspaceStore((state) => state.inspectorId);
  const setInspectorId = useOperatingWorkspaceStore((state) => state.setInspectorId);
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof operatingSystemClient.getEntityDetail>> | null>(null);
  useOperatingEvents(mode);
  useEffect(() => { const node = query.data?.data.nodes.find((item) => item.id === inspectorId); if (!node) { setDetail(null); return; } let active = true; void operatingSystemClient.getEntityDetail(node.type, node.id).then((value) => { if (active) setDetail(value); }).catch(() => { if (active) setDetail(null); }); return () => { active = false; }; }, [inspectorId, query.data]);
  if (query.isPending) return <BrainInitialReveal />;
  if (query.isError && isPermissionError(query.error)) return <OperatingPermissionState />;
  if (query.isError) return <OperatingErrorState error={query.error} onRetry={() => query.refetch()} />;
  if (query.data.data.nodes.length === 0) return <OperatingEmptyState actionHref="/app/agents" entity="organization graph" />;
  const selectedNode = query.data.data.nodes.find((node) => node.id === inspectorId);
  return <OperatingSystemShell mode={mode} header={<OperatingCommandBar />} inspector={detail?.data ? <EntityInspector detail={detail.data} onClose={() => { setInspectorId(null); const node = document.querySelector<HTMLElement>(`[data-id="${inspectorId}"]`); node?.focus(); }} /> : undefined} status={selectedNode ? `Inspecting ${selectedNode.label}` : "Live operating graph"}><CompanyBrainCanvas snapshot={query.data.data} /></OperatingSystemShell>;
}

function isPermissionError(error: unknown) {
  return error instanceof Error && "status" in error && (error.status === 401 || error.status === 403);
}
