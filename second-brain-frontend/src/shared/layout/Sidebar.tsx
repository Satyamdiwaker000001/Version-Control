import { Home, FileText, Hash, Share2, Settings, LogOut, Github } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/shared/utils/cn';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useWorkspaceStore } from '@/features/workspace/store/useWorkspaceStore';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { name: 'Dashboard', path: '/', icon: Home },
  { name: 'All Notes', path: '/editor', icon: FileText },
  { name: 'Tags', path: '/tags', icon: Hash },
  { name: 'Graph View', path: '/graph', icon: Share2 },
  { name: 'GitHub Integration', path: '/github', icon: Github },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar = () => {
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspaceStore();
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);

  return (
    <aside className="w-64 bg-zinc-900 dark:bg-zinc-950 border-r border-zinc-800 flex flex-col transition-colors absolute sm:relative z-40 h-full">
      
      {/* Workspace Switcher */}
      <div className="p-4 border-b border-zinc-800">
        <div 
          className="flex items-center justify-between p-2 hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors group relative"
          onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0 shadow-inner">
              {activeWorkspace?.name.charAt(0) || 'W'}
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-zinc-100 truncate group-hover:text-white transition-colors">
                {activeWorkspace?.name || 'Select Workspace'}
              </p>
              <p className="text-xs text-zinc-400 truncate">
                {activeWorkspace?.role === 'owner' ? 'Owner' : 'Member'}
              </p>
            </div>
          </div>
          <svg className={`w-4 h-4 text-zinc-500 transition-transform ${isWorkspaceOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Workspace Dropdown */}
        <AnimatePresence>
          {isWorkspaceOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute top-16 left-4 right-4 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl py-1 z-50 origin-top overflow-hidden"
            >
              <div className="px-3 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider bg-zinc-800/50">Solo Workspaces</div>
              {workspaces.filter(ws => ws.type === 'solo').map(ws => (
                <div 
                  key={ws.id} 
                  className={cn(
                    "px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white cursor-pointer flex items-center justify-between transition-colors",
                    activeWorkspace?.id === ws.id && "bg-zinc-700 font-medium text-white"
                  )}
                  onClick={() => {
                    setActiveWorkspace(ws.id);
                    setIsWorkspaceOpen(false);
                  }}
                >
                  <span>{ws.name}</span>
                  {activeWorkspace?.id === ws.id && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                </div>
              ))}
              <div className="px-3 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider bg-zinc-800/50 border-t border-zinc-700">Team Workspaces</div>
              {workspaces.filter(ws => ws.type === 'team').map(ws => (
                <div 
                  key={ws.id} 
                  className={cn(
                    "px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white cursor-pointer flex items-center justify-between transition-colors",
                    activeWorkspace?.id === ws.id && "bg-zinc-700 font-medium text-white"
                  )}
                  onClick={() => {
                    setActiveWorkspace(ws.id);
                    setIsWorkspaceOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="truncate">{ws.name}</span>
                  </div>
                  {activeWorkspace?.id === ws.id && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />}
                </div>
              ))}
              <div className="h-px bg-zinc-700 my-1"></div>
              <div className="px-3 py-2 text-sm text-indigo-400 hover:bg-zinc-700 hover:text-indigo-300 cursor-pointer flex items-center gap-2 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Create Workspace
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 py-4 flex flex-col gap-1 px-3 overflow-y-auto">
        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 px-3 mt-2">
          Main
        </div>
        {navItems.filter(i => ['Dashboard', 'All Notes', 'Tags', 'Graph View'].includes(i.name)).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all group",
                isActive 
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white" 
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white"
              )}
            >
              <Icon size={18} className={cn(
                "transition-colors",
                isActive ? "text-indigo-500 dark:text-indigo-400" : "text-zinc-400 group-hover:text-zinc-500 dark:group-hover:text-zinc-300"
              )} />
              {item.name}
            </Link>
          );
        })}

        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 px-3 mt-6">
          Integrations
        </div>
        <Link
          to="/github"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all group",
            location.pathname === "/github" 
              ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white" 
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white"
          )}
        >
          <Github size={18} className={cn(
            "transition-colors",
            location.pathname === "/github" ? "text-indigo-500 dark:text-indigo-400" : "text-zinc-400 group-hover:text-zinc-500 dark:group-hover:text-zinc-300"
          )} />
          GitHub Target
        </Link>
        
        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 px-3 mt-6">
          System
        </div>
        <Link
          to="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all group",
            location.pathname === "/settings" 
              ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white" 
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white"
          )}
        >
          <Settings size={18} className={cn(
            "transition-colors",
            location.pathname === "/settings" ? "text-indigo-500 dark:text-indigo-400" : "text-zinc-400 group-hover:text-zinc-500 dark:group-hover:text-zinc-300"
          )} />
          Settings
        </Link>
      </div>
      
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};
