
import { create } from 'zustand';
import { StudioGraph, StudioNode, StudioEdge } from '../graph/GraphModel';

interface StudioState {
  graph: StudioGraph;
  addNode: (node: StudioNode) => void;
  addEdge: (edge: StudioEdge) => void;
  updateNodePosition: (id: string, position: { x: number, y: number }) => void;
}

export const useStudioStore = create<StudioState>((set) => ({
  graph: { nodes: [], edges: [] },
  addNode: (node) => set((state) => ({ graph: { ...state.graph, nodes: [...state.graph.nodes, node] } })),
  addEdge: (edge) => set((state) => ({ graph: { ...state.graph, edges: [...state.graph.edges, edge] } })),
  updateNodePosition: (id, position) => set((state) => ({
    graph: {
      ...state.graph,
      nodes: state.graph.nodes.map(n => n.id === id ? { ...n, position } : n)
    }
  }))
}));
