import { create } from 'zustand';

type AgentTab = 'configure' | 'test' | 'evaluate' | 'deploy';

interface AgentStudioState {
  selectedAgentId: string | null;
  activeTab: AgentTab;
  
  setSelectedAgentId: (id: string | null) => void;
  setActiveTab: (tab: AgentTab) => void;
}

export const useAgentStudioStore = create<AgentStudioState>((set) => ({
  selectedAgentId: null,
  activeTab: 'configure',
  
  setSelectedAgentId: (id) => set({ selectedAgentId: id }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
