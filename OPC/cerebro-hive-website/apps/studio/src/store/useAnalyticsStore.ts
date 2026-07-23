import { create } from 'zustand';

export type AnalyticsView = 'overview' | 'metrics' | 'traces' | 'logs' | 'costs' | 'models' | 'providers' | 'agents' | 'workflows' | 'alerts';

interface AnalyticsStoreState {
  activeView: AnalyticsView;
  selectedTraceId: string | null;
  
  setActiveView: (view: AnalyticsView) => void;
  setSelectedTraceId: (id: string | null) => void;
}

export const useAnalyticsStore = create<AnalyticsStoreState>((set) => ({
  activeView: 'overview',
  selectedTraceId: null,
  
  setActiveView: (view) => set({ activeView: view }),
  setSelectedTraceId: (id) => set({ selectedTraceId: id }),
}));
