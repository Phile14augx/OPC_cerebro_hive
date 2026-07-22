"use client";

import { useEffect, useState } from "react";
import { resourceGraphService, TopologyData, GraphNode, GraphEdge } from "../core/engine/graph/ResourceGraphService";
import { TopologyVisualizer } from "../../../../components/platform/hiveforge/TopologyVisualizer";

export default function InventoryPage() {
  const [topology, setTopology] = useState<TopologyData>({ nodes: [], edges: [] });
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    // Seed some mock data into the Resource Graph for visualization
    const mockApp: GraphNode = { id: "res-app-1", type: "Deployment", metadata: { name: "Hive API", provider: "aws.ecs", state: "Running" } };
    const mockDb: GraphNode = { id: "res-db-1", type: "Resource", metadata: { name: "Primary Database", provider: "aws.rds", state: "Running" } };
    const mockCache: GraphNode = { id: "res-cache-1", type: "Resource", metadata: { name: "Session Cache", provider: "azure.redis", state: "Running" } };
    
    resourceGraphService.addNode(mockApp);
    resourceGraphService.addNode(mockDb);
    resourceGraphService.addNode(mockCache);

    const edge1: GraphEdge = { sourceId: "res-app-1", targetId: "res-db-1", type: "depends_on" };
    const edge2: GraphEdge = { sourceId: "res-app-1", targetId: "res-cache-1", type: "depends_on" };
    
    resourceGraphService.addEdge(edge1);
    resourceGraphService.addEdge(edge2);

    setTopology(resourceGraphService.getTopology());
  }, []);

  const nodes = topology.nodes.filter(n => filter === "All" || (n.metadata && n.metadata.provider.includes(filter.toLowerCase())));

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Multi-Cloud Inventory</h1>
          <p className="text-text-secondary mt-2">
            Unified resource graph and topology across all connected cloud providers.
          </p>
        </div>
        <div className="flex gap-2">
          {["All", "AWS", "Azure"].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded text-xs font-semibold ${filter === f ? "bg-primary-accent text-white" : "bg-surface border border-border text-text-secondary"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Topology Graph */}
      <TopologyVisualizer topology={{ nodes, edges: topology.edges }} />

      {/* Tabular Inventory */}
      <div className="border border-border bg-surface/30 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface/50 text-xs text-text-secondary uppercase tracking-wider">
              <th className="p-4 font-medium">Resource</th>
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium">Provider</th>
              <th className="p-4 font-medium">State</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {nodes.map(node => (
              <tr key={node.id} className="hover:bg-surface/50 transition-colors">
                <td className="p-4">
                  <div className="font-medium text-text-primary">{node.metadata.name}</div>
                  <div className="text-xs text-text-secondary">{node.id}</div>
                </td>
                <td className="p-4 text-sm text-text-secondary">{node.type}</td>
                <td className="p-4">
                  <span className="text-xs bg-surface border border-border px-2 py-1 rounded">
                    {node.metadata.provider}
                  </span>
                </td>
                <td className="p-4">
                  <span className="text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded">
                    {node.metadata.state}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="text-xs text-primary-accent hover:underline">Manage</button>
                </td>
              </tr>
            ))}
            {nodes.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-text-secondary">No resources match the selected filter.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
