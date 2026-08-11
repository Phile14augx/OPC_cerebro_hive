import { create } from 'zustand';
import { ExecutiveMetrics } from '@/lib/trust/mock-sdk';

interface ExecutiveState {
  metrics: ExecutiveMetrics | null;
  isLoading: boolean;
  setMetrics: (metrics: ExecutiveMetrics) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useExecutiveStore = create<ExecutiveState>((set) => ({
  metrics: null,
  isLoading: true,
  setMetrics: (metrics) => set({ metrics, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
