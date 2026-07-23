import { create } from 'zustand';

type WorkflowTab = 'canvas' | 'simulate' | 'trace';

interface WorkflowStudioState {
  selectedWorkflowId: string | null;
  activeTab: WorkflowTab;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  
  setSelectedWorkflowId: (id: string | null) => void;
  setActiveTab: (tab: WorkflowTab) => void;
  setSelectedNodeId: (id: string | null) => void;
  setSelectedEdgeId: (id: string | null) => void;
}

export const useWorkflowStudioStore = create<WorkflowStudioState>((set) => ({
  selectedWorkflowId: null,
  activeTab: 'canvas',
  selectedNodeId: null,
  selectedEdgeId: null,
  
  setSelectedWorkflowId: (id) => set({ selectedWorkflowId: id }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedNodeId: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
  setSelectedEdgeId: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),
}));
