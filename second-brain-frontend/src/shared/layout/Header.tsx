import { Sun, Moon, Bell, Search, Monitor } from 'lucide-react';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { motion } from 'framer-motion';
import { cn } from '@/shared/utils/cn';

export const Header = ({ onOpenCommand }: { onOpenCommand: () => void }) => {
  const { isDarkMode, themeMode, setTheme } = useThemeStore();
  const user = useAuthStore((state) => state.user);

  const mockPresence = [
    { id: 'u2', initial: 'A', color: 'bg-blue-500' },
    { id: 'u3', initial: 'S', color: 'bg-emerald-500' },
  ];

  const cycleTheme = () => {
    const next = isDarkMode ? 'light' : 'dark';
    setTheme(next);
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="h-14 bg-card border-b border-border flex items-center justify-between px-4 sm:px-6 transition-colors z-20 shrink-0"
    >
      {/* Search Bar */}
      <div className="flex-1 max-w-md hidden sm:block">
        <button
          onClick={onOpenCommand}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg border border-border bg-background/50 hover:bg-accent text-muted-foreground hover:text-foreground transition-all text-sm group"
        >
          <Search size={15} className="shrink-0" />
          <span className="flex-1 text-left">Search notes, commands...</span>
          <kbd className="hidden sm:flex items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium">
            <span>⌘</span>K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
        {/* Real-time presence */}
        <div className="hidden md:flex items-center gap-3 mr-2">
          <div className="flex -space-x-2">
            {mockPresence.map((p) => (
              <div
                key={p.id}
                className={cn(
                  'w-7 h-7 rounded-full border-2 border-card flex items-center justify-center text-[10px] font-bold text-white',
                  p.color
                )}
              >
                {p.initial}
              </div>
            ))}
            <div className="w-7 h-7 rounded-full border-2 border-card bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">
              {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider">Live</span>
          </div>
        </div>

        {/* Theme toggle */}
        <button
          onClick={cycleTheme}
          className="p-2 text-muted-foreground hover:bg-accent hover:text-foreground rounded-lg transition-colors"
          aria-label="Toggle theme"
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notifications */}
        <button className="p-2 text-muted-foreground hover:bg-accent hover:text-foreground rounded-lg transition-colors relative">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-destructive" />
        </button>

        <div className="w-px h-5 bg-border mx-0.5" />

        {/* User avatar */}
        <div className="flex items-center gap-2 cursor-pointer hover:bg-accent rounded-lg px-2 py-1.5 transition-colors">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-xs border border-primary/30">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="text-sm font-medium text-foreground hidden md:block">
            {user?.name || user?.email?.split('@')[0] || 'User'}
          </span>
        </div>
      </div>
    </motion.header>
  );
};
