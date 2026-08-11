import { create } from 'zustand';
import { Alert } from '@/lib/trust/mock-sdk';

interface AlertsState {
  alerts: Alert[];
  isLoading: boolean;
  setAlerts: (alerts: Alert[]) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAlertsStore = create<AlertsState>((set) => ({
  alerts: [],
  isLoading: true,
  setAlerts: (alerts) => set({ alerts, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
