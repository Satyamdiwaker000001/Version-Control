import { createContext, useContext, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';

import { useThemeStore } from '@/shared/store/useThemeStore';
import type { ThemeMode } from '@/shared/store/useThemeStore';

interface ThemeContextValue {
  themeMode: ThemeMode;
  isDarkMode: boolean;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const themeMode = useThemeStore((s) => s.themeMode);
  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  const setTheme = useThemeStore((s) => s.setTheme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const initializeTheme = useThemeStore((s) => s.initializeTheme);

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ themeMode, isDarkMode, setTheme, toggleTheme }),
    [themeMode, isDarkMode, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useThemeContext = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return ctx;
};