import type { OperatingNodeType, OperatingRelationship } from "@cerebro/shared-types";
import { create, type StateCreator } from "zustand";
import { createStore } from "zustand/vanilla";

import {
  type OperatingWorkspaceUrlState,
  workspaceUrlDefaults,
} from "./urlState";

export interface OperatingWorkspaceState extends OperatingWorkspaceUrlState {
  setSelectedIds(ids: string[]): void;
  setInspectorId(id: string | null): void;
  setFocusId(id: string | null): void;
  setQuery(query: string): void;
  setNodeTypes(nodeTypes: OperatingNodeType[]): void;
  setDepartments(departments: string[]): void;
  setRelationships(relationships: OperatingRelationship[]): void;
  setLabelsVisible(labelsVisible: boolean): void;
  setEdgesVisible(edgesVisible: boolean): void;
  setFullscreen(fullscreen: boolean): void;
  dismissTopLayer(): void;
}

export type OperatingWorkspaceInitialState = Partial<OperatingWorkspaceUrlState> & {
  /** Compatibility for callers selecting one entity at a time. */
  selectedId?: string | null;
};

const initialWorkspaceState = (initial: OperatingWorkspaceInitialState = {}): OperatingWorkspaceUrlState => ({
  ...workspaceUrlDefaults,
  ...initial,
  selectedIds: initial.selectedIds ?? (initial.selectedId ? [initial.selectedId] : workspaceUrlDefaults.selectedIds),
});

const createState = (initial: OperatingWorkspaceInitialState = {}): StateCreator<OperatingWorkspaceState> =>
  (set): OperatingWorkspaceState => ({
    ...initialWorkspaceState(initial),
    setSelectedIds: (selectedIds) => set({ selectedIds }),
    setInspectorId: (inspectorId) => set({ inspectorId }),
    setFocusId: (focusId) => set({ focusId }),
    setQuery: (query) => set({ query }),
    setNodeTypes: (nodeTypes) => set({ nodeTypes }),
    setDepartments: (departments) => set({ departments }),
    setRelationships: (relationships) => set({ relationships }),
    setLabelsVisible: (labelsVisible) => set({ labelsVisible }),
    setEdgesVisible: (edgesVisible) => set({ edgesVisible }),
    setFullscreen: (fullscreen) => set({ fullscreen }),
    dismissTopLayer: () => set((state: OperatingWorkspaceState) => {
      if (state.inspectorId) return { inspectorId: null };
      if (state.focusId) return { focusId: null };
      if (state.selectedIds.length) return { selectedIds: [] };
      if (state.fullscreen) return { fullscreen: false };
      return {};
    }),
  });

export function createOperatingWorkspaceStore(initial?: OperatingWorkspaceInitialState) {
  return createStore<OperatingWorkspaceState>()(createState(initial));
}

export const useOperatingWorkspaceStore = create<OperatingWorkspaceState>()(createState());
