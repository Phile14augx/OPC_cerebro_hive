"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";

import type { OperatingFlowNodeData } from "../../graph/toReactFlow";

export function EntityNode({ data, selected }: NodeProps) {
  const node = data as unknown as OperatingFlowNodeData;
  return (
    <div className="min-w-24 border border-[var(--company-os-border)] bg-[var(--company-os-panel)] px-2.5 py-2 font-inter text-[11px]" data-selected={selected ? "true" : "false"} data-status={node.status}>
      <Handle className="opacity-0" position={Position.Top} type="target" />
      <span className="block text-[9px] uppercase tracking-[0.12em] text-[var(--company-os-text-muted)]">{node.entityType}</span>
      {node.label}
      <Handle className="opacity-0" position={Position.Bottom} type="source" />
    </div>
  );
}
