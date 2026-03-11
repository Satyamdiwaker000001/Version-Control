import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandPalette } from './CommandPalette';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WorkspaceChat from '@/features/chat/components/WorkspaceChat';

export const AppLayout = () => {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden font-sans transition-colors selection:bg-indigo-500/30">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenCommand={() => setIsCommandOpen(true)} />
        <main className="flex-1 overflow-y-auto w-full p-2 sm:p-6 lg:p-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <CommandPalette open={isCommandOpen} setOpen={setIsCommandOpen} />
      <WorkspaceChat />
    </div>
  );
};
