import { create } from 'zustand';
import { AuditEvent } from '@/lib/trust/mock-sdk';

interface AuditState {
  events: AuditEvent[];
  isLoading: boolean;
  setEvents: (events: AuditEvent[]) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuditStore = create<AuditState>((set) => ({
  events: [],
  isLoading: true,
  setEvents: (events) => set({ events, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
