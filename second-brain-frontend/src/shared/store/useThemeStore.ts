import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system' | 'midnight' | 'forest' | 'quartz' | 'emerald' | 'nord' | 'sunset' | 'coffee' | 'crimson' | 'steel';

export interface ThemeState {
  themeMode: ThemeMode;
  isDarkMode: boolean;
  setTheme: (mode: ThemeMode) => void;
  initializeTheme: () => void;
}

const getSystemDark = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;

const THEME_CLASSES: ThemeMode[] = ['light', 'dark', 'midnight', 'forest', 'quartz', 'emerald', 'nord', 'sunset', 'coffee', 'crimson', 'steel'];

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  
  // Remove all theme classes
  THEME_CLASSES.forEach(cls => root.classList.remove(cls));

  if (mode === 'system') {
    const isDark = getSystemDark();
    root.classList.add(isDark ? 'dark' : 'light');
  } else {
    root.classList.add(mode);
  }
}

const storedMode = (localStorage.getItem('theme') as ThemeMode) || 'dark';

const getIsDark = (mode: ThemeMode) => {
  if (mode === 'system') return getSystemDark();
  return ['dark', 'midnight', 'forest', 'nord', 'sunset', 'crimson'].includes(mode);
};

const initialDark = getIsDark(storedMode);
applyTheme(storedMode);

export const useThemeStore = create<ThemeState>((set, get) => ({
  themeMode: storedMode,
  isDarkMode: initialDark,

  setTheme: (mode) => {
    localStorage.setItem('theme', mode);
    const isDark = getIsDark(mode);
    applyTheme(mode);
    set({ themeMode: mode, isDarkMode: isDark });
  },

  initializeTheme: () => {
    const mode = get().themeMode;
    const isDark = getIsDark(mode);
    applyTheme(mode);
    set({ isDarkMode: isDark });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (get().themeMode === 'system') {
        applyTheme('system');
        set({ isDarkMode: e.matches });
      }
    });
  },
}));
