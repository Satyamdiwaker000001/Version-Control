import { Sun, Moon, Bell, Search } from 'lucide-react';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { motion } from 'framer-motion';

export const Header = ({ onOpenCommand }: { onOpenCommand: () => void }) => {
  const { isDarkMode, setTheme } = useThemeStore();
  const user = useAuthStore((state) => state.user);

  // Mock real-time user presences
  const mockPresence = [
    { id: 'u2', name: 'Alex Johnson', color: 'bg-blue-500' },
    { id: 'u3', name: 'Sarah Chen', color: 'bg-emerald-500' }
  ];

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="h-14 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6 transition-colors relative z-20"
    >
      <div className="flex-1 flex items-center">
        <div 
          className="relative w-full max-w-md hidden sm:block cursor-pointer group"
          onClick={onOpenCommand}
        >
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={16} className="text-zinc-400 group-hover:text-indigo-500 transition-colors" />
          </div>
          <div className="flex items-center w-full rounded-md border border-zinc-200 dark:border-zinc-800 py-1.5 pl-10 pr-3 text-sm leading-6 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            Search commands, notes, or tags...
            <kbd className="ml-auto flex items-center gap-1 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-1.5 font-mono text-[10px] font-medium text-zinc-500 opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4 ml-4">
        {/* Real-Time Presence Indicators */}
        <div className="hidden md:flex items-center mr-4">
          <div className="flex items-center relative mr-2">
             <div className="flex -space-x-2">
               {mockPresence.map((p, i) => (
                 <div key={p.id} className={`w-7 h-7 rounded-full border-2 border-white dark:border-zinc-900 ${p.color} flex items-center justify-center text-[10px] font-bold text-white z-${20-i}`}>
                   {p.name.charAt(0)}
                 </div>
               ))}
               <div className={`w-7 h-7 rounded-full border-2 border-white dark:border-zinc-900 bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white z-0`}>
                 {user?.name?.charAt(0) || 'U'}
               </div>
             </div>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50">
             <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
             </span>
             <span className="text-[10px] font-medium uppercase tracking-wider">Live Editing</span>
          </div>
        </div>

        <button 
          onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
          className="p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
          aria-label="Toggle Dark Mode"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        
        <button className="p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white dark:border-zinc-900"></span>
        </button>
        
        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700 mx-1"></div>
        
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-semibold text-xs border border-indigo-200 dark:border-indigo-800">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hidden md:block">
            {user?.email?.split('@')[0] || 'User'}
          </span>
        </div>
      </div>
    </motion.header>
  );
};
