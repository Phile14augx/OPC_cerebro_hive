import { BaseEntity } from "./types";
import { platformCapabilities } from "./platform/capabilities";
import { products } from "./products";
import { services } from "./services";
import { researchPrograms } from "./research";

export interface GraphEdge {
  sourceId: string;
  targetId: string;
  relationship: "uses" | "feeds" | "delivers" | "part_of" | "depends_on";
}

export interface GraphData {
  nodes: BaseEntity[];
  edges: GraphEdge[];
}

export const generateEdges = (): GraphEdge[] => {
  const edges: GraphEdge[] = [];
  
  // Products -> Platform (uses)
  products.forEach(p => {
    p.platformCapabilities.forEach(capId => {
      edges.push({ sourceId: p.id, targetId: capId, relationship: "uses" });
    });
  });

  // Services -> Products (delivers)
  services.forEach(s => {
    s.products.forEach(prodId => {
      edges.push({ sourceId: s.id, targetId: prodId, relationship: "delivers" });
    });
  });

  // Research -> Platform (feeds)
  researchPrograms.forEach(r => {
    r.feedsPlatformCapabilities.forEach(capId => {
      edges.push({ sourceId: r.id, targetId: capId, relationship: "feeds" });
    });
  });

  return edges;
};

export const platformGraph: GraphData = {
  nodes: [...platformCapabilities, ...products, ...services, ...researchPrograms],
  edges: generateEdges(),
};

export const getEdgesForNode = (nodeId: string, direction: "in" | "out" | "both" = "both") => {
  return platformGraph.edges.filter(e => {
    if (direction === "in") return e.targetId === nodeId;
    if (direction === "out") return e.sourceId === nodeId;
    return e.sourceId === nodeId || e.targetId === nodeId;
  });
};
