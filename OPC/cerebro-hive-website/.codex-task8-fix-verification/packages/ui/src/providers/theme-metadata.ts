export interface ThemeDefinition {
  id: string;
  displayName: string;
  category: 'dark' | 'light';
  supportsGlass: boolean;
  supportsMotion: boolean;
}

export const themes: Record<string, ThemeDefinition> = {
  light: { id: 'light', displayName: 'Light', category: 'light', supportsGlass: false, supportsMotion: true },
  dark: { id: 'dark', displayName: 'Dark', category: 'dark', supportsGlass: true, supportsMotion: true },
  aurora: { id: 'aurora', displayName: 'Aurora', category: 'dark', supportsGlass: true, supportsMotion: true },
  executive: { id: 'executive', displayName: 'Executive', category: 'light', supportsGlass: false, supportsMotion: false },
  blueprint: { id: 'blueprint', displayName: 'Blueprint', category: 'dark', supportsGlass: false, supportsMotion: true },
  graphite: { id: 'graphite', displayName: 'Graphite', category: 'dark', supportsGlass: true, supportsMotion: true },
};
