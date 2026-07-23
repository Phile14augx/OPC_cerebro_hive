import { create } from 'zustand';
import { ComplianceFramework } from '@/lib/trust/mock-sdk';

interface ComplianceState {
  frameworks: ComplianceFramework[];
  isLoading: boolean;
  setFrameworks: (frameworks: ComplianceFramework[]) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useComplianceStore = create<ComplianceState>((set) => ({
  frameworks: [],
  isLoading: true,
  setFrameworks: (frameworks) => set({ frameworks, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
