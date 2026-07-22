import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ThemeConfig {
  theme: 'light' | 'dark' | 'system';
  accent: 'blue' | 'purple' | 'emerald' | 'rose' | 'amber';
  density: 'compact' | 'comfortable' | 'spacious';
  motion: 'reduced' | 'full';
  layout: 'fluid' | 'boxed';
  radius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  typography: 'inter' | 'roboto' | 'system';
}

interface ThemeContextType extends ThemeConfig {
  setThemeConfig: (config: Partial<ThemeConfig>) => void;
}

const defaultTheme: ThemeConfig = {
  theme: 'dark',
  accent: 'blue',
  density: 'comfortable',
  motion: 'full',
  layout: 'fluid',
  radius: 'md',
  typography: 'inter',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<ThemeConfig>(defaultTheme);

  const setThemeConfig = (updates: Partial<ThemeConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(config.theme === 'system' ? 'dark' : config.theme);
    root.setAttribute('data-accent', config.accent);
    root.setAttribute('data-density', config.density);
    root.setAttribute('data-radius', config.radius);
  }, [config]);

  return (
    <ThemeContext.Provider value={{ ...config, setThemeConfig }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
