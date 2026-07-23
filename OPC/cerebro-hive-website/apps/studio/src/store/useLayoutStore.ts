import { create } from 'zustand';

interface LayoutState {
  isSidebarOpen: boolean;
  isInspectorOpen: boolean;
  isBottomPanelOpen: boolean;
  activeSidebarTab: string;
  toggleSidebar: () => void;
  toggleInspector: () => void;
  toggleBottomPanel: () => void;
  setActiveSidebarTab: (tab: string) => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  isSidebarOpen: true,
  isInspectorOpen: false,
  isBottomPanelOpen: false,
  activeSidebarTab: 'explorer',
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleInspector: () => set((state) => ({ isInspectorOpen: !state.isInspectorOpen })),
  toggleBottomPanel: () => set((state) => ({ isBottomPanelOpen: !state.isBottomPanelOpen })),
  setActiveSidebarTab: (tab) => set({ activeSidebarTab: tab }),
}));
