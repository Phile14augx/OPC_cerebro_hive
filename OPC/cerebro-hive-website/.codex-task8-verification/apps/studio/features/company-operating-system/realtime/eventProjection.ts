import type { OperatingGraphSnapshot, OperatingStatus } from "@cerebro/shared-types";

export interface OperatingEventProjection { id: string; event: string; data: { targetId?: string; status?: OperatingStatus }; }

/** Applies only safe graph status deltas; unknown/missing entities remain untouched. */
export function projectOperatingEvent(snapshot: OperatingGraphSnapshot, event: OperatingEventProjection): OperatingGraphSnapshot {
  const targetId = event.data.targetId;
  const status = event.data.status;
  if (!targetId || !status) return snapshot;
  return { ...snapshot, generatedAt: new Date().toISOString(), nodes: snapshot.nodes.map((node) => node.id === targetId ? { ...node, status } : node) };
}
