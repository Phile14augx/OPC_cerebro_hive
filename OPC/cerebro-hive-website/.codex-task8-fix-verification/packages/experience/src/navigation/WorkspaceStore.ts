
import { create } from 'zustand';

export interface WorkspaceState {
  activeModule: string | null;
  sidebarExpanded: boolean;
  breadcrumbs: Array<{ label: string; path: string }>;
  
  // Semantic actions
  openWorkspace: (moduleId: string) => void;
  toggleSidebar: () => void;
  pinSidebar: (pinned: boolean) => void;
  setBreadcrumbs: (crumbs: Array<{ label: string; path: string }>) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeModule: null,
  sidebarExpanded: true,
  breadcrumbs: [],

  openWorkspace: (moduleId) => set({ activeModule: moduleId }),
  toggleSidebar: () => set((state) => ({ sidebarExpanded: !state.sidebarExpanded })),
  pinSidebar: (pinned) => set({ sidebarExpanded: pinned }),
  setBreadcrumbs: (crumbs) => set({ breadcrumbs: crumbs }),
}));
