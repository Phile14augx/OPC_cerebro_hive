"use client";

import { Background, BackgroundVariant, MiniMap, ReactFlow, ReactFlowProvider, useReactFlow, type Edge, type Node } from "@xyflow/react";
import type { OperatingGraphSnapshot } from "@cerebro/shared-types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { OperatingFlowNodeData, OperatingSemanticEdgeData } from "../../graph/toReactFlow";
import { layoutCompanyBrain } from "../../graph/radialLayout";
import { createOperatingSearchIndex } from "../../graph/searchIndex";
import { toReactFlowGraph } from "../../graph/toReactFlow";
import { useOperatingWorkspaceStore } from "../../workspace/store";
import { AccessibleEntityTree } from "./AccessibleEntityTree";
import { CompanyCoreNode } from "./CompanyCoreNode";
import { DepartmentNode } from "./DepartmentNode";
import { EntityNode } from "./EntityNode";
import { GraphSearch } from "./GraphSearch";
import { GraphToolbar } from "./GraphToolbar";
import { SemanticEdge } from "./SemanticEdge";

const nodeTypes = { companyCore: CompanyCoreNode, department: DepartmentNode, entity: EntityNode };
const edgeTypes = { semantic: SemanticEdge };

function FlowControls({ onFit }: { onFit: () => void }) {
  const { fitView, setCenter, zoomIn, zoomOut } = useReactFlow();
  const labelsVisible = useOperatingWorkspaceStore((state) => state.labelsVisible);
  const edgesVisible = useOperatingWorkspaceStore((state) => state.edgesVisible);
  const fullscreen = useOperatingWorkspaceStore((state) => state.fullscreen);
  const setLabelsVisible = useOperatingWorkspaceStore((state) => state.setLabelsVisible);
  const setEdgesVisible = useOperatingWorkspaceStore((state) => state.setEdgesVisible);
  const setFullscreen = useOperatingWorkspaceStore((state) => state.setFullscreen);
  return <GraphToolbar edgesVisible={edgesVisible} fullscreen={fullscreen} labelsVisible={labelsVisible} onCenter={() => setCenter(600, 400, { zoom: 1 })} onEdgesVisible={setEdgesVisible} onFit={() => { fitView({ padding: 0.2 }); onFit(); }} onFullscreen={() => setFullscreen(!fullscreen)} onLabelsVisible={setLabelsVisible} onZoomIn={() => zoomIn()} onZoomOut={() => zoomOut()} />;
}

export function CompanyBrainCanvas({ snapshot }: { snapshot: OperatingGraphSnapshot }) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const selectedIds = useOperatingWorkspaceStore((state) => state.selectedIds);
  const query = useOperatingWorkspaceStore((state) => state.query);
  const nodeTypesFilter = useOperatingWorkspaceStore((state) => state.nodeTypes);
  const departments = useOperatingWorkspaceStore((state) => state.departments);
  const relationships = useOperatingWorkspaceStore((state) => state.relationships);
  const labelsVisible = useOperatingWorkspaceStore((state) => state.labelsVisible);
  const edgesVisible = useOperatingWorkspaceStore((state) => state.edgesVisible);
  const fullscreen = useOperatingWorkspaceStore((state) => state.fullscreen);
  const setSelectedIds = useOperatingWorkspaceStore((state) => state.setSelectedIds);
  const setInspectorId = useOperatingWorkspaceStore((state) => state.setInspectorId);
  const setFocusId = useOperatingWorkspaceStore((state) => state.setFocusId);
  const setQuery = useOperatingWorkspaceStore((state) => state.setQuery);
  const setNodeTypes = useOperatingWorkspaceStore((state) => state.setNodeTypes);
  const setDepartments = useOperatingWorkspaceStore((state) => state.setDepartments);
  const setRelationships = useOperatingWorkspaceStore((state) => state.setRelationships);

  const searchIndex = useMemo(() => createOperatingSearchIndex(snapshot.nodes), [snapshot.nodes]);
  const visibleNodeIds = useMemo(() => new Set(searchIndex.search(query)
    .filter((node) => !nodeTypesFilter.length || nodeTypesFilter.includes(node.type))
    .filter((node) => !departments.length || node.type === "system" || (node.departmentId !== null && departments.includes(node.departmentId)) || departments.includes(node.id))
    .map((node) => node.id)), [departments, nodeTypesFilter, query, searchIndex]);
  const graph = useMemo(() => toReactFlowGraph(snapshot, layoutCompanyBrain(snapshot, { width: 1200, height: 800 })), [snapshot]);
  const visibleNodes = useMemo(() => graph.nodes.filter((node) => visibleNodeIds.has(node.id)).map((node) => ({ ...node, type: node.data.entityType === "system" ? "companyCore" : node.data.entityType === "department" ? "department" : "entity", data: { ...node.data, label: labelsVisible ? node.data.label : "" } })), [graph.nodes, labelsVisible, visibleNodeIds]);
  const visibleEdges = useMemo(() => graph.edges.filter((edge) => edgesVisible && visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target) && (!relationships.length || relationships.includes(edge.data?.relationship ?? "USES"))).map((edge) => ({ ...edge, animated: reducedMotion ? false : edge.animated, type: "semantic", selected: selectedIds.includes(edge.source) || selectedIds.includes(edge.target), data: { ...edge.data, highlighted: selectedIds.includes(edge.source) || selectedIds.includes(edge.target) } })), [edgesVisible, graph.edges, reducedMotion, relationships, selectedIds, visibleNodeIds]);

  const select = useCallback((id: string, multi: boolean) => {
    const next = multi ? (selectedIds.includes(id) ? selectedIds.filter((current) => current !== id) : [...selectedIds, id]) : [id];
    setSelectedIds(next);
    setInspectorId(id);
  }, [selectedIds, setInspectorId, setSelectedIds]);

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key === "/" && document.activeElement?.tagName !== "INPUT") { event.preventDefault(); searchRef.current?.focus(); }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const accessibleNodes = snapshot.nodes.filter((node) => visibleNodeIds.has(node.id));
  const hoveredNode = hoveredId ? snapshot.nodes.find((node) => node.id === hoveredId) : null;
  return <div className={`relative h-full min-h-[32rem] w-full ${fullscreen ? "fixed inset-0 z-50 bg-[var(--company-os-canvas)]" : ""}`}>
    <div className="absolute left-3 top-3 z-10 flex flex-wrap items-start gap-2">
      <GraphSearch inputRef={searchRef} onChange={setQuery} query={query} />
      <select aria-label="Filter node category" className="border border-[var(--company-os-border)] bg-[var(--company-os-panel)] p-1.5 font-inter text-xs" onChange={(event) => setNodeTypes(event.target.value ? [event.target.value as typeof nodeTypesFilter[number]] : [])} value={nodeTypesFilter[0] ?? ""}><option value="">All categories</option>{[...new Set(snapshot.nodes.map((node) => node.type))].sort().map((type) => <option key={type} value={type}>{type}</option>)}</select>
      <select aria-label="Filter department" className="border border-[var(--company-os-border)] bg-[var(--company-os-panel)] p-1.5 font-inter text-xs" onChange={(event) => setDepartments(event.target.value ? [event.target.value] : [])} value={departments[0] ?? ""}><option value="">All departments</option>{snapshot.nodes.filter((node) => node.type === "department").map((node) => <option key={node.id} value={node.id}>{node.label}</option>)}</select>
      <select aria-label="Filter relationship" className="border border-[var(--company-os-border)] bg-[var(--company-os-panel)] p-1.5 font-inter text-xs" onChange={(event) => setRelationships(event.target.value ? [event.target.value as typeof relationships[number]] : [])} value={relationships[0] ?? ""}><option value="">All relationships</option>{[...new Set(snapshot.edges.map((edge) => edge.relationship))].sort().map((relationship) => <option key={relationship} value={relationship}>{relationship}</option>)}</select>
    </div>
    <ReactFlowProvider>
      <div className="absolute right-3 top-3 z-10"><FlowControls onFit={() => undefined} /></div>
      <ReactFlow aria-label="Company brain graph" edges={visibleEdges as Edge<OperatingSemanticEdgeData>[]} edgeTypes={edgeTypes} fitView maxZoom={2} minZoom={0.1} multiSelectionKeyCode="Shift" nodes={visibleNodes as Node<OperatingFlowNodeData>[]} nodeTypes={nodeTypes} onNodeClick={(event, node) => select(node.id, event.shiftKey)} onNodeDoubleClick={(_event, node) => { setFocusId(node.id); setInspectorId(node.id); }} onNodeMouseEnter={(_event, node) => setHoveredId(node.id)} onNodeMouseLeave={() => setHoveredId(null)} onPaneClick={() => setSelectedIds([])} panOnDrag selectionOnDrag>
        <Background color="var(--company-os-border)" gap={24} size={1} variant={BackgroundVariant.Dots} />
        {visibleNodes.length > 120 ? <MiniMap /> : null}
      </ReactFlow>
    </ReactFlowProvider>
    {hoveredNode ? <aside aria-label="Entity preview" className="absolute bottom-3 right-3 z-10 border border-[var(--company-os-border-focus)] bg-[var(--company-os-panel)] p-3 font-inter text-xs" role="status"><p className="font-plex font-semibold">{hoveredNode.label}</p><p className="mt-1 text-[var(--company-os-text-muted)]">{hoveredNode.type} · {hoveredNode.status}</p></aside> : null}
    <AccessibleEntityTree nodes={accessibleNodes} onInspect={(id) => { setFocusId(id); setInspectorId(id); }} onPreview={setHoveredId} onSelect={select} selectedIds={selectedIds} />
  </div>;
}
