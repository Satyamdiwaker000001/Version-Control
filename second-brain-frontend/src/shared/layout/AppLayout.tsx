import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandPalette } from './CommandPalette';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WorkspaceChat from '@/features/chat/components/WorkspaceChat';
import { useWorkspaceStore } from '@/features/workspace/store/useWorkspaceStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

export const AppLayout = () => {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const fetchWorkspaces = useWorkspaceStore(state => state.fetchWorkspaces);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  // Close mobile sidebar on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  // Cmd/Ctrl+K to open command palette
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandOpen(open => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Fetch workspaces on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchWorkspaces();
    }
  }, [isAuthenticated, fetchWorkspaces]);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden font-sans transition-colors selection:bg-primary/30">
      
      {/* ── Top Bar (Full Width) ── */}
      <Header
        onOpenCommand={() => setIsCommandOpen(true)}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(v => !v)}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <motion.div 
          initial={false}
          animate={{ width: isSidebarCollapsed ? 80 : 256 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="hidden lg:flex shrink-0 border-r border-border overflow-hidden bg-card"
        >
          <Sidebar 
            isCollapsed={isSidebarCollapsed} 
            onToggle={() => setIsSidebarCollapsed(v => !v)} 
          />
        </motion.div>

        {/* ── Mobile drawer overlay ── */}
        <AnimatePresence>
          {isMobileSidebarOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 top-16 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
                onClick={() => setIsMobileSidebarOpen(false)}
              />
              {/* Drawer */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed left-0 top-16 bottom-0 z-40 lg:hidden"
              >
                <Sidebar />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Main content area ── */}
        <main className="flex-1 overflow-y-auto w-full p-3 sm:p-5 lg:p-8 2xl:p-10 relative transition-all duration-300 ease-in-out">
          <div className="max-w-screen-2xl mx-auto h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <CommandPalette open={isCommandOpen} setOpen={setIsCommandOpen} />
      <WorkspaceChat />
    </div>
  );
};
