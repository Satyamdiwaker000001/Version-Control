import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeState {
  themeMode: ThemeMode;
  isDarkMode: boolean;
  setTheme: (mode: ThemeMode) => void;
  initializeTheme: () => void;
}

const getSystemDark = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;

function applyTheme(isDark: boolean) {
  if (isDark) {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  }
}

const storedMode = (localStorage.getItem('theme') as ThemeMode) || 'dark';
const initialDark = storedMode === 'system' ? getSystemDark() : storedMode === 'dark';
applyTheme(initialDark);

export const useThemeStore = create<ThemeState>((set, get) => ({
  themeMode: storedMode,
  isDarkMode: initialDark,

  setTheme: (mode) => {
    localStorage.setItem('theme', mode);
    const isDark = mode === 'system' ? getSystemDark() : mode === 'dark';
    applyTheme(isDark);
    set({ themeMode: mode, isDarkMode: isDark });
  },

  initializeTheme: () => {
    const mode = get().themeMode;
    const isDark = mode === 'system' ? getSystemDark() : mode === 'dark';
    applyTheme(isDark);
    set({ isDarkMode: isDark });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (get().themeMode === 'system') {
        applyTheme(e.matches);
        set({ isDarkMode: e.matches });
      }
    });
  },
}));
