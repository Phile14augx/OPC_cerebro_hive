import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeDefinition, themes } from './theme-metadata';

interface ThemeContextType {
  currentTheme: ThemeDefinition;
  setTheme: (themeId: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children, defaultTheme = 'dark' }: { children: React.ReactNode, defaultTheme?: string }) {
  const [themeId, setThemeId] = useState(defaultTheme);

  useEffect(() => {
    // Inject the data-theme attribute on the root html element so CSS variable selectors match
    const root = window.document.documentElement;
    root.setAttribute('data-theme', themeId);
  }, [themeId]);

  const value = {
    currentTheme: themes[themeId] || themes.dark,
    setTheme: setThemeId
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
