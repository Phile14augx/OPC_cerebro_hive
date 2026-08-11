
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PlatformPreferences {
  appearance: {
    theme: 'light' | 'dark' | 'aurora' | 'executive' | 'blueprint' | 'graphite';
    density: 'comfortable' | 'compact' | 'dense';
    fontScaling: number;
    motionReduction: boolean;
  };
  workspace: {
    sidebarBehavior: 'pinned' | 'floating' | 'collapsed';
    defaultDashboard: string;
  };
  accessibility: {
    highContrast: boolean;
    keyboardNavigation: boolean;
  };
  experimental: {
    betaFeatures: boolean;
    debugMode: boolean;
  };
}

const defaultPreferences: PlatformPreferences = {
  appearance: { theme: 'dark', density: 'comfortable', fontScaling: 100, motionReduction: false },
  workspace: { sidebarBehavior: 'pinned', defaultDashboard: 'mission-control' },
  accessibility: { highContrast: false, keyboardNavigation: true },
  experimental: { betaFeatures: false, debugMode: false }
};

interface PreferenceStore extends PlatformPreferences {
  updateAppearance: (overrides: Partial<PlatformPreferences['appearance']>) => void;
  updateWorkspace: (overrides: Partial<PlatformPreferences['workspace']>) => void;
}

export const usePreferenceService = create<PreferenceStore>()(
  persist(
    (set) => ({
      ...defaultPreferences,
      updateAppearance: (overrides) => set((state) => ({ appearance: { ...state.appearance, ...overrides } })),
      updateWorkspace: (overrides) => set((state) => ({ workspace: { ...state.workspace, ...overrides } }))
    }),
    { name: 'cerebro-preferences' }
  )
);
