/**
 * Nexarch — Live Topology
 * Interactive graph of agents, missions, tools and their relationships.
 * Uses @xyflow/react (React Flow) which is already in the monorepo.
 */
"use client";

import { useEffect, useState, useCallback } from "react";
import { Network, RefreshCw, Info } from "lucide-react";

// React Flow is loaded dynamically to avoid SSR issues
let ReactFlow: any = null;
let Background: any = null;
let Controls: any = null;
let MiniMap: any = null;
let MarkerType: any = null;

// ── Node factories ───────────────────────────────────────────

function agentNode(agent: any, x: number, y: number) {
  const isActive = (agent.instances ?? []).some((i: any) =>
    ["running", "queued"].includes(i.state)
  );
  return {
    id:       agent.id,
    type:     "default",
    position: { x, y },
    data: {
      label: (
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? "bg-emerald-400 animate-pulse" : "bg-gray-600"}`} />
            <span className="text-xs font-semibold text-white leading-tight">{agent.name}</span>
          </div>
          <span className="text-[10px] text-gray-500 block mt-0.5">{agent.type}</span>
        </div>
      ),
    },
    style: {
      background: isActive ? "rgba(16, 185, 129, 0.08)" : "rgba(31, 41, 55, 0.95)",
      border:     `1px solid ${isActive ? "rgba(16, 185, 129, 0.4)" : "rgba(75, 85, 99, 0.5)"}`,
      borderRadius: 8,
      padding:    "8px 12px",
      color:      "#fff",
      minWidth:   140,
    },
  };
}

function missionNode(mission: any, x: number, y: number) {
  const color = mission.status === "running" ? "#7c3aed" : mission.status === "completed" ? "#2563eb" : "#4b5563";
  return {
    id:       `msn_${mission.id}`,
    type:     "default",
    position: { x, y },
    data: {
      label: (
        <div>
          <span className="text-[10px] font-semibold text-violet-400 block">MISSION</span>
          <span className="text-xs text-white font-medium leading-tight">{mission.title}</span>
          <span className={`text-[10px] block mt-0.5 ${mission.status === "running" ? "text-emerald-400" : "text-gray-500"}`}>
            {mission.status}
          </span>
        </div>
      ),
    },
    style: {
      background: `${color}22`,
      border:     `1px solid ${color}60`,
      borderRadius: 8,
      padding:    "8px 12px",
      color:      "#fff",
      minWidth:   140,
    },
  };
}

function toolNode(tool: any, x: number, y: number) {
  return {
    id:       `tool_${tool.id}`,
    type:     "default",
    position: { x, y },
    data: {
      label: (
        <div>
          <span className="text-[10px] font-semibold text-cyan-500 block">TOOL</span>
          <span className="text-xs text-gray-300">{tool.name}</span>
        </div>
      ),
    },
    style: {
      background: "rgba(6, 182, 212, 0.06)",
      border:     "1px solid rgba(6, 182, 212, 0.25)",
      borderRadius: 8,
      padding:    "8px 12px",
      color:      "#fff",
      minWidth:   110,
    },
  };
}

export default function TopologyPage() {
  const [nodes, setNodes]   = useState<any[]>([]);
  const [edges, setEdges]   = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [rfLoaded, setRfLoaded] = useState(false);
  const [error, setError]   = useState("");

  // Dynamically import React Flow to avoid SSR issues
  useEffect(() => {
    import("@xyflow/react").then(mod => {
      ReactFlow  = mod.ReactFlow;
      Background = mod.Background;
      Controls   = mod.Controls;
      MiniMap    = mod.MiniMap;
      MarkerType = mod.MarkerType;
      setRfLoaded(true);
    }).catch(() => {
      setError("React Flow not available. Install @xyflow/react to enable the topology view.");
    });
  }, []);

  const buildGraph = useCallback(async () => {
    try {
      const [aRes, mRes, tRes] = await Promise.all([
        fetch("/api/nexarch/agents").then(r => r.json()),
        fetch("/api/nexarch/missions").then(r => r.json()),
        fetch("/api/nexarch/tools").then(r => r.json()),
      ]);

      const agents:   any[] = aRes.data ?? [];
      const missions: any[] = (mRes.data ?? []).filter((m: any) => m.status === "running");
      const tools:    any[] = (tRes.data ?? []).slice(0, 8);

      const newNodes: any[] = [];
      const newEdges: any[] = [];
      const edgeSet = new Set<string>();

      const addEdge = (source: string, target: string, label?: string) => {
        const key = `${source}→${target}`;
        if (edgeSet.has(key)) return;
        edgeSet.add(key);
        newEdges.push({
          id:           key,
          source,
          target,
          label,
          animated:     true,
          style:        { stroke: "#7c3aed44" },
          labelStyle:   { fill: "#6b7280", fontSize: 10 },
        });
      };

      // Layout: missions on left, agents in centre, tools on right
      missions.forEach((m: any, i: number) => {
        newNodes.push(missionNode(m, 50, i * 140 + 50));
      });

      agents.forEach((a: any, i: number) => {
        const col = Math.floor(i / 4);
        const row = i % 4;
        newNodes.push(agentNode(a, 320 + col * 200, row * 140 + 50));
        // Connect agents to their missions
        (a.instances ?? []).forEach((inst: any) => {
          if (inst.missionId) {
            const msnKey = `msn_${inst.missionId}`;
            if (missions.some(m => `msn_${m.id}` === msnKey)) {
              addEdge(msnKey, a.id, "assigns");
            }
          }
        });
        // Tool permissions
        (a.toolPermissions ?? []).forEach((toolId: string) => {
          const tNode = `tool_${toolId}`;
          if (tools.some(t => `tool_${t.id}` === tNode)) {
            addEdge(a.id, tNode, "uses");
          }
        });
      });

      const toolColStart = 320 + Math.ceil(agents.length / 4) * 200 + 80;
      tools.forEach((t: any, i: number) => {
        newNodes.push(toolNode(t, toolColStart, i * 100 + 50));
      });

      setNodes(newNodes);
      setEdges(newEdges);
      setLoaded(true);
    } catch (err) {
      setError(String(err));
    }
  }, []);

  useEffect(() => { buildGraph(); }, [buildGraph]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-violet-400" />
          <div>
            <h1 className="text-sm font-bold text-white">Live Topology</h1>
            <p className="text-xs text-gray-500">Real-time agent relationship graph</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded border border-violet-700 bg-violet-900/20" /> Mission</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded border border-gray-600 bg-gray-800" /> Agent</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded border border-cyan-700 bg-cyan-900/20" /> Tool</span>
          </div>
          <button
            onClick={buildGraph}
            className="p-1.5 rounded hover:bg-gray-800 text-gray-500 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Graph */}
      <div className="flex-1 relative">
        {error ? (
          <div className="flex items-center justify-center h-full flex-col gap-3">
            <Network className="w-12 h-12 text-gray-700" />
            <div className="text-center">
              <p className="text-gray-400 text-sm">{error}</p>
              {error.includes("not available") && (
                <code className="text-xs text-gray-600 mt-2 block">pnpm add @xyflow/react</code>
              )}
            </div>
          </div>
        ) : !rfLoaded ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-gray-500 text-sm">Loading topology engine…</span>
          </div>
        ) : !loaded ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-gray-500 text-sm">Building graph…</span>
          </div>
        ) : ReactFlow ? (
          <div className="w-full h-full">
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@xyflow/react@12/dist/style.css" />
            <ReactFlow
              nodes={nodes}
              edges={edges}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              attributionPosition="bottom-right"
              style={{ background: "#030712" }}
            >
              <Background color="#1f2937" gap={20} />
              <Controls style={{ background: "#111827", border: "1px solid #374151", color: "#9ca3af" }} />
              <MiniMap
                style={{ background: "#111827", border: "1px solid #374151" }}
                nodeColor={(n: any) => {
                  if (n.id?.startsWith("msn_")) return "#7c3aed";
                  if (n.id?.startsWith("tool_")) return "#0891b2";
                  return "#4b5563";
                }}
              />
            </ReactFlow>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <Info className="w-8 h-8 text-gray-700" />
            <p className="text-gray-500 text-sm">React Flow could not be initialised.</p>
          </div>
        )}
      </div>
    </div>
  );
}
