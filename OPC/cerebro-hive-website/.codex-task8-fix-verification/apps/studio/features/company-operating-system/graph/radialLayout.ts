import type { OperatingGraphSnapshot, OperatingNode } from "@cerebro/shared-types";

export interface BrainViewport {
  width: number;
  height: number;
}

export interface PositionedOperatingNode extends OperatingNode {
  position: { x: number; y: number };
}

const byStableId = <T extends { id: string }>(left: T, right: T) =>
  left.id.localeCompare(right.id);

const withinViewport = (value: number, maximum: number) =>
  Math.min(maximum, Math.max(0, value));

const polarPosition = (
  center: { x: number; y: number },
  radius: number,
  angle: number,
  viewport: BrainViewport,
) => ({
  x: withinViewport(
    Math.round((center.x + Math.cos(angle) * radius) * 100) / 100,
    viewport.width,
  ),
  y: withinViewport(
    Math.round((center.y + Math.sin(angle) * radius) * 100) / 100,
    viewport.height,
  ),
});

const distribute = <T>(items: readonly T[], callback: (item: T, index: number, angle: number) => void) => {
  const count = items.length;
  items.forEach((item, index) => callback(item, index, -Math.PI / 2 + (index / Math.max(count, 1)) * Math.PI * 2));
};

/** Generates stable graph positions from persisted entity IDs. */
export function layoutCompanyBrain(
  snapshot: OperatingGraphSnapshot,
  viewport: BrainViewport,
): PositionedOperatingNode[] {
  const width = Number.isFinite(viewport.width) ? Math.max(0, viewport.width) : 0;
  const height = Number.isFinite(viewport.height) ? Math.max(0, viewport.height) : 0;
  const boundedViewport = { width, height };
  const center = { x: width / 2, y: height / 2 };
  const maximumRadius = Math.min(width, height) / 2;
  const ringSpacing = Math.min(160, maximumRadius / 3);
  const systems = snapshot.nodes.filter((node) => node.type === "system").sort(byStableId);
  const departmentCandidates = snapshot.nodes
    .filter((node) => node.type === "department")
    .sort(byStableId);
  const core = systems[0] ?? departmentCandidates[0] ?? [...snapshot.nodes].sort(byStableId)[0];
  const departments = departmentCandidates;
  const agentNodes = snapshot.nodes.filter((node) => node.type === "agent" && node.id !== core?.id);
  const resourceNodes = snapshot.nodes.filter(
    (node) => node.type !== "department" && node.type !== "agent" && node.id !== core?.id,
  );
  const positioned: PositionedOperatingNode[] = [];
  const departmentAngles = new Map<string, number>();

  if (core && core.type !== "department") {
    positioned.push({ ...core, position: center });
  }

  distribute(departments, (department, _index, angle) => {
    departmentAngles.set(department.id, angle);
    positioned.push({
      ...department,
      position:
        department.id === core?.id
          ? center
          : polarPosition(center, ringSpacing, angle, boundedViewport),
    });
  });

  const positionOwnedNodes = (nodes: OperatingNode[], radius: number) => {
    for (const department of departments) {
      const owned = nodes
        .filter((node) => node.departmentId === department.id)
        .sort(byStableId);
      const departmentAngle = departmentAngles.get(department.id)!;
      const arc = Math.min(Math.PI / 3, Math.PI * 2 / Math.max(departments.length, 1) * 0.8);

      owned.forEach((node, index) => {
        const ratio = (index + 1) / (owned.length + 1) - 0.5;
        positioned.push({
          ...node,
          position: polarPosition(center, radius, departmentAngle + ratio * arc, boundedViewport),
        });
      });
    }
  };

  positionOwnedNodes(agentNodes, Math.min(maximumRadius, ringSpacing * 2));
  positionOwnedNodes(resourceNodes, Math.min(maximumRadius, ringSpacing * 3));

  const unowned = [...agentNodes, ...resourceNodes]
    .filter((node) => !node.departmentId || !departmentAngles.has(node.departmentId))
    .sort(byStableId);
  distribute(unowned, (node, _index, angle) => {
    positioned.push({
      ...node,
      position: polarPosition(
        center,
        Math.min(maximumRadius, ringSpacing * 3),
        angle,
        boundedViewport,
      ),
    });
  });

  return positioned;
}
