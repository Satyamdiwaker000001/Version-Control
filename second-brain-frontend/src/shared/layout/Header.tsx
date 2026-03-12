import { Sun, Moon, Bell, Search, Command } from 'lucide-react';
import { useThemeContext } from '@/shared/contexts/ThemeContext';
import { useAuthContext } from '@/shared/contexts/AuthContext';
import { motion } from 'framer-motion';
import { cn } from '@/shared/utils/cn';

export const Header = ({ onOpenCommand }: { onOpenCommand: () => void }) => {
  const { isDarkMode, setTheme } = useThemeContext();
  const { user } = useAuthContext();

  // Mock real-time user presences
  const mockPresence = [
    { id: 'u2', name: 'Alex Johnson', color: 'bg-blue-500' },
    { id: 'u3', name: 'Sarah Chen', color: 'bg-emerald-500' }
  ];

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toLowerCase().includes('mac');

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="h-14 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6 transition-colors relative z-20 gap-6"
    >
      {/* Left: Search and command palette */}
      <div className="flex-1 flex items-center gap-3 min-w-0">
        {/* Global Search */}
        <div 
          className="relative flex-1 max-w-md hidden sm:block cursor-pointer group"
          onClick={onOpenCommand}
        >
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={16} className="text-zinc-400 group-hover:text-indigo-500 transition-colors" />
          </div>
          <div className="flex items-center w-full rounded-md border border-zinc-200 dark:border-zinc-800 py-1.5 pl-10 pr-3 text-sm leading-6 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            Search notes, commands, or tags...
          </div>
        </div>

        {/* Mobile Search Icon */}
        <button className="sm:hidden p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors">
          <Search size={18} />
        </button>
      </div>
      
      {/* Right: Actions and info */}
      <div className="flex items-center gap-1 sm:gap-3">
        {/* Real-Time Presence Indicators */}
        <div className="hidden lg:flex items-center">
          <div className="flex items-center relative mr-3 pl-3 border-l border-zinc-200 dark:border-zinc-800">
             <div className="flex -space-x-2">
               {mockPresence.map((p) => (
                 <div 
                   key={p.id} 
                   className={cn(
                     'w-7 h-7 rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center text-[10px] font-bold text-white z-${20-i}',
                     p.color
                   )}
                   title={p.name}
                 >
                   {p.name.charAt(0)}
                 </div>
               ))}
             </div>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50 text-xs">
             <span className="relative flex h-1.5 w-1.5">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
             </span>
             <span className="font-medium hidden sm:inline">Live</span>
          </div>
        </div>

        {/* Command Palette Shortcut (hidden, shown on keyboard focus in search) */}
        <button 
          onClick={onOpenCommand}
          className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Command palette"
        >
          <Command size={14} className="text-zinc-500" />
          <kbd className="text-[10px] font-semibold text-zinc-500">
            {isMac ? '⌘' : 'Ctrl'} K
          </kbd>
        </button>

        {/* Theme toggle */}
        <button 
          onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
          className="p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
          aria-label="Toggle Dark Mode"
          title="Toggle dark mode"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        
        {/* Notifications */}
        <button 
          className="p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors relative"
          title="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 border border-white dark:border-zinc-900"></span>
        </button>
        
        {/* Separator */}
        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700 mx-1"></div>
        
        {/* User profile */}
        <button className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-semibold text-xs border border-indigo-200 dark:border-indigo-800">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {user?.name?.split(' ')[0] || 'User'}
            </span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
              {user?.email?.split('@')[0] || 'user'}
            </span>
          </div>
        </button>
      </div>
    </motion.header>
  );
};
