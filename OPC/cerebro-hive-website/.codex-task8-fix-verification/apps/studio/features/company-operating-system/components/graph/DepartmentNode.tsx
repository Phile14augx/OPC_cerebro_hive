"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";

import type { OperatingFlowNodeData } from "../../graph/toReactFlow";

export function DepartmentNode({ data, selected }: NodeProps) {
  const node = data as unknown as OperatingFlowNodeData;
  return (
    <div className="min-w-28 border border-[var(--company-os-border)] bg-[var(--company-os-panel)] px-3 py-2 font-plex text-xs font-semibold" data-selected={selected ? "true" : "false"} data-status={node.status}>
      <Handle className="opacity-0" position={Position.Top} type="target" />
      {node.label}
      <Handle className="opacity-0" position={Position.Bottom} type="source" />
    </div>
  );
}
