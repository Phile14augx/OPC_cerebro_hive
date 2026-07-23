import { create } from 'zustand';
import { RiskItem, AISafetyMetrics } from '@/lib/trust/mock-sdk';

interface RiskState {
  risks: RiskItem[];
  safetyMetrics: AISafetyMetrics | null;
  isLoading: boolean;
  setRisks: (risks: RiskItem[]) => void;
  setSafetyMetrics: (metrics: AISafetyMetrics) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useRiskStore = create<RiskState>((set) => ({
  risks: [],
  safetyMetrics: null,
  isLoading: true,
  setRisks: (risks) => set({ risks, isLoading: false }),
  setSafetyMetrics: (safetyMetrics) => set({ safetyMetrics }),
  setLoading: (isLoading) => set({ isLoading }),
}));
