import type { Edge, Node } from "@xyflow/react";
import type { OperatingGraphSnapshot } from "@cerebro/shared-types";

import type { PositionedOperatingNode } from "./radialLayout";

export interface OperatingFlowNodeData extends Record<string, unknown> {
  entityId: string;
  entityType: PositionedOperatingNode["type"];
  label: string;
  status: PositionedOperatingNode["status"];
  departmentId: string | null;
  detailUrl: string;
}

export interface OperatingSemanticEdgeData extends Record<string, unknown> {
  relationship: OperatingGraphSnapshot["edges"][number]["relationship"];
  status: OperatingGraphSnapshot["edges"][number]["status"];
  intensity: number;
  lastActivityAt: string | null;
}

export function toReactFlowGraph(
  snapshot: OperatingGraphSnapshot,
  positions: readonly PositionedOperatingNode[],
): { nodes: Node<OperatingFlowNodeData>[]; edges: Edge<OperatingSemanticEdgeData>[] } {
  const positionById = new Map(positions.map((positioned) => [positioned.id, positioned.position]));

  return {
    nodes: snapshot.nodes
      .slice()
      .sort((left, right) => left.id.localeCompare(right.id))
      .flatMap((entity) => {
        const position = positionById.get(entity.id);
        if (!position) return [];

        return [{
          id: entity.id,
          type: `operating-${entity.type}`,
          position,
          data: {
            entityId: entity.id,
            entityType: entity.type,
            label: entity.label,
            status: entity.status,
            departmentId: entity.departmentId,
            detailUrl: entity.detailUrl,
          },
        }];
      }),
    edges: snapshot.edges
      .slice()
      .sort((left, right) => left.id.localeCompare(right.id))
      .map((relationship) => ({
        id: relationship.id,
        source: relationship.source,
        target: relationship.target,
        type: "operating-semantic",
        animated: true,
        data: {
          relationship: relationship.relationship,
          status: relationship.status,
          intensity: relationship.intensity,
          lastActivityAt: relationship.lastActivityAt,
        },
      })),
  };
}
