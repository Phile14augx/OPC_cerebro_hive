import { create } from 'zustand';

type PromptTab = 'edit' | 'test' | 'evaluate';

interface PromptStudioState {
  selectedVersionId: string | null;
  activeTab: PromptTab;
  isPreviewMode: boolean;
  testVariables: Record<string, string>;
  
  setSelectedVersionId: (id: string | null) => void;
  setActiveTab: (tab: PromptTab) => void;
  togglePreviewMode: () => void;
  setTestVariable: (key: string, value: string) => void;
}

export const usePromptStudioStore = create<PromptStudioState>((set) => ({
  selectedVersionId: null,
  activeTab: 'edit',
  isPreviewMode: false,
  testVariables: {},
  
  setSelectedVersionId: (id) => set({ selectedVersionId: id }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  togglePreviewMode: () => set((state) => ({ isPreviewMode: !state.isPreviewMode })),
  setTestVariable: (key, value) => 
    set((state) => ({ testVariables: { ...state.testVariables, [key]: value } })),
}));
