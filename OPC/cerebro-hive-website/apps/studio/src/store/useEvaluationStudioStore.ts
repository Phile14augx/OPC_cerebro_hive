import { create } from 'zustand';

export type EvaluationView = 'overview' | 'profiles' | 'datasets' | 'evaluators' | 'runs' | 'experiments' | 'reports';

interface EvaluationStudioState {
  activeView: EvaluationView;
  selectedProfileId: string | null;
  selectedDatasetId: string | null;
  selectedRunId: string | null;
  selectedExperimentId: string | null;
  
  setActiveView: (view: EvaluationView) => void;
  setSelectedProfileId: (id: string | null) => void;
  setSelectedDatasetId: (id: string | null) => void;
  setSelectedRunId: (id: string | null) => void;
  setSelectedExperimentId: (id: string | null) => void;
}

export const useEvaluationStudioStore = create<EvaluationStudioState>((set) => ({
  activeView: 'runs',
  selectedProfileId: null,
  selectedDatasetId: null,
  selectedRunId: null,
  selectedExperimentId: null,
  
  setActiveView: (view) => set({ activeView: view }),
  setSelectedProfileId: (id) => set({ selectedProfileId: id }),
  setSelectedDatasetId: (id) => set({ selectedDatasetId: id }),
  setSelectedRunId: (id) => set({ selectedRunId: id }),
  setSelectedExperimentId: (id) => set({ selectedExperimentId: id }),
}));
