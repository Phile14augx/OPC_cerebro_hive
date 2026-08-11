"use client";

import { getBezierPath, type EdgeProps } from "@xyflow/react";
import type { CSSProperties } from "react";

import type { OperatingSemanticEdgeData } from "../../graph/toReactFlow";

export function SemanticEdge(props: EdgeProps) {
  const [path] = getBezierPath(props);
  const data = props.data as (OperatingSemanticEdgeData & { highlighted?: boolean }) | undefined;
  const highlighted = Boolean(props.selected || data?.highlighted);
  const relationship = data?.relationship ?? "USES";
  const status = data?.status ?? "healthy";
  const intensity = data?.intensity ?? 0;
  const style = {
    "--company-os-edge-intensity": intensity,
    stroke: `var(--company-os-edge-${status}, var(--company-os-edge-${relationship.toLowerCase()}, var(--company-os-border-focus)))`,
    strokeOpacity: Math.max(0.25, Math.min(1, intensity)),
    strokeWidth: highlighted ? "var(--company-os-edge-highlight-width, 2.5px)" : "calc(var(--company-os-edge-width, 1px) * (1 + var(--company-os-edge-intensity)))",
  } as CSSProperties;

  return <path className={`react-flow__edge-path company-os-semantic-edge company-os-semantic-edge--${relationship.toLowerCase()} company-os-semantic-edge--${status}`} d={path} data-highlighted={highlighted ? "true" : "false"} data-relationship={relationship} data-selected={props.selected ? "true" : "false"} data-status={status} fill="none" id={props.id} style={style} />;
}
