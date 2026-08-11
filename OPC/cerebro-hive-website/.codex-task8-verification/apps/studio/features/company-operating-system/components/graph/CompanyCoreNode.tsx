"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";

import type { OperatingFlowNodeData } from "../../graph/toReactFlow";

export function CompanyCoreNode({ data, selected }: NodeProps) {
  const node = data as unknown as OperatingFlowNodeData;
  return (
    <div
      className="company-os-core rounded-full border border-[var(--company-os-border-focus)] bg-[var(--company-os-panel)] px-6 py-5 text-center shadow-[0_0_36px_color-mix(in_srgb,var(--company-os-border-focus),transparent_65%)] motion-reduce:animate-none"
      data-selected={selected ? "true" : "false"}
      data-status={node.status}
    >
      <Handle className="opacity-0" position={Position.Top} type="target" />
      <span className="font-plex text-xs font-semibold uppercase tracking-[0.16em]">{node.label}</span>
      <Handle className="opacity-0" position={Position.Bottom} type="source" />
    </div>
  );
}
