import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeState {
  themeMode: ThemeMode;
  isDarkMode: boolean;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

const isBrowser = typeof window !== 'undefined';
const isDocumentAvailable = typeof document !== 'undefined';

const getSystemTheme = () => {
  if (!isBrowser || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const getInitialThemeMode = (): ThemeMode => {
  if (!isBrowser) {
    return 'system';
  }
  const stored = window.localStorage.getItem('theme') as ThemeMode | null;
  return stored ?? 'system';
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  themeMode: getInitialThemeMode(),
  isDarkMode: false,

  setTheme: (mode) => {
    if (isBrowser) {
      window.localStorage.setItem('theme', mode);
    }

    const isDark = mode === 'system' ? getSystemTheme() : mode === 'dark';

    if (isDocumentAvailable) {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    set({ themeMode: mode, isDarkMode: isDark });
  },

  toggleTheme: () => {
    const { isDarkMode } = get();
    const nextMode: ThemeMode = isDarkMode ? 'light' : 'dark';
    get().setTheme(nextMode);
  },

  initializeTheme: () => {
    const currentMode = get().themeMode;
    const isDark = currentMode === 'system' ? getSystemTheme() : currentMode === 'dark';

    if (isDocumentAvailable) {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    set({ isDarkMode: isDark });

    if (!isBrowser || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => {
      if (get().themeMode === 'system') {
        const newIsDark = e.matches;
        if (isDocumentAvailable) {
          if (newIsDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
        set({ isDarkMode: newIsDark });
      }
    };

    mediaQuery.addEventListener('change', listener);
  },
}));

