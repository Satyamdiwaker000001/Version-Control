import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeState {
  themeMode: ThemeMode;
  isDarkMode: boolean; // Resolved active theme
  setTheme: (mode: ThemeMode) => void;
  initializeTheme: () => void;
}

const getSystemTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

export const useThemeStore = create<ThemeState>((set, get) => ({
  themeMode: (localStorage.getItem('theme') as ThemeMode) || 'system',
  isDarkMode: false, // Will be computed on init
  
  setTheme: (mode) => {
    localStorage.setItem('theme', mode);
    
    const isDark = mode === 'system' ? getSystemTheme() : mode === 'dark';
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    set({ themeMode: mode, isDarkMode: isDark });
  },

  initializeTheme: () => {
    const mode = get().themeMode;
    const isDark = mode === 'system' ? getSystemTheme() : mode === 'dark';
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    set({ isDarkMode: isDark });

    // Setup system theme listener
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (get().themeMode === 'system') {
        const newIsDark = e.matches;
        if (newIsDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        set({ isDarkMode: newIsDark });
      }
    });
  }
}));
