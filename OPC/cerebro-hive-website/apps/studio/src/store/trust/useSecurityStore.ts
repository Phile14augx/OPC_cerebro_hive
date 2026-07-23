import { create } from 'zustand';
import { SecurityPosture, ProviderHealth } from '@/lib/trust/mock-sdk';

interface SecurityState {
  posture: SecurityPosture | null;
  providerHealth: ProviderHealth[];
  isLoading: boolean;
  setPosture: (posture: SecurityPosture) => void;
  setProviderHealth: (health: ProviderHealth[]) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useSecurityStore = create<SecurityState>((set) => ({
  posture: null,
  providerHealth: [],
  isLoading: true,
  setPosture: (posture) => set({ posture, isLoading: false }),
  setProviderHealth: (providerHealth) => set({ providerHealth }),
  setLoading: (isLoading) => set({ isLoading }),
}));
