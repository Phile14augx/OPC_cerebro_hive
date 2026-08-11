import { TopologyData } from "../../../app/platform/hiveforge/core/engine/graph/ResourceGraphService";

interface Props {
  topology: TopologyData;
}

export function TopologyVisualizer({ topology }: Props) {
  // A simplistic DOM visualization of the Graph.
  // In a real application, we would use a library like react-flow or D3 here.
  
  return (
    <div className="relative w-full h-[400px] border border-border bg-surface/30 rounded-xl overflow-hidden p-6">
      <div className="absolute top-4 left-4 text-xs font-bold text-text-secondary tracking-widest uppercase">
        Live Topology Graph
      </div>
      
      <div className="mt-8 flex flex-wrap gap-8 items-center justify-center h-full">
        {topology.nodes.map(node => (
          <div key={node.id} className="relative group">
            <div className="flex flex-col items-center justify-center w-32 h-32 bg-surface border border-border rounded-full hover:border-primary-accent transition-colors z-10 relative shadow-lg">
              <span className="text-2xl mb-2">{node.metadata?.provider?.includes("db") || node.metadata?.provider?.includes("rds") ? "🗄️" : node.type === "Deployment" ? "⚡" : "📦"}</span>
              <span className="text-xs font-medium text-text-primary text-center px-2">{node.metadata?.name || node.id}</span>
              <span className="text-[10px] text-text-secondary">{node.type}</span>
            </div>
          </div>
        ))}
        
        {topology.nodes.length === 0 && (
          <div className="text-text-secondary">No topology data available.</div>
        )}
      </div>

      {/* Render Edges (Mock visual representation) */}
      <div className="absolute bottom-4 left-4 text-[10px] text-text-secondary">
        Edges detected: {topology.edges.length}
      </div>
    </div>
  );
}
