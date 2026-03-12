import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronLeft, LogOut, Plus, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { cn } from '@/shared/utils/cn';
import {
  mainNavigation,
  integrationNavigation,
  systemNavigation,
} from '@/shared/config/navigation';
import { useWorkspaceContext } from '@/shared/contexts/WorkspaceContext';
import { useAuthContext } from '@/shared/contexts/AuthContext';

interface SidebarItemProps {
  to: string;
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  active: boolean;
  collapsed?: boolean;
}

const isRouteActive = (pathname: string, targetPath: string) => {
  if (targetPath === '/') {
    return pathname === '/';
  }

  if (pathname === targetPath) return true;

  return pathname.startsWith(`${targetPath}/`);
};

const SidebarItem = ({ to, label, Icon, active, collapsed }: SidebarItemProps) => {
  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all group',
        active
          ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white',
        collapsed && 'justify-center px-2',
      )}
    >
      <Icon
        className={cn(
          'h-5 w-5 flex-shrink-0 transition-colors',
          active
            ? 'text-indigo-500 dark:text-indigo-400'
            : 'text-zinc-400 group-hover:text-zinc-500 dark:group-hover:text-zinc-300',
        )}
      />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
};

export const MainSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspaceContext();
  const { logout } = useAuthContext();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  const sidebarContent = (
    <div
      className={cn(
        'flex h-full flex-col border-r border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 transition-all',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Logo + collapse toggle */}
      <div className="flex items-center justify-between gap-2 border-b border-zinc-200 px-3 py-3 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white shadow-sm">
            SB
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-tight">Second Brain</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Knowledge OS</span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft
            className={cn(
              'h-4 w-4 transition-transform',
              collapsed && 'rotate-180',
            )}
          />
        </button>
      </div>

      {/* Workspace switcher */}
      <div className="border-b border-zinc-200 px-3 py-3 dark:border-zinc-800">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-2 text-left text-sm dark:border-zinc-700 dark:bg-zinc-900',
              'hover:border-indigo-400 hover:bg-white dark:hover:border-indigo-500 dark:hover:bg-zinc-800 transition-colors',
            )}
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white">
              {activeWorkspace?.name?.charAt(0) ?? 'W'}
            </div>
            {!collapsed && (
              <div className="flex min-w-0 flex-col flex-1">
                <span className="truncate text-xs font-semibold">
                  {activeWorkspace?.name ?? 'Select workspace'}
                </span>
                <span className="truncate text-[10px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  {activeWorkspace?.type === 'team' ? 'Team' : 'Personal'}
                </span>
              </div>
            )}
            {!collapsed && <ChevronDown size={14} className="text-zinc-400" />}
          </button>

          {/* Workspace dropdown menu */}
          {showWorkspaceMenu && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg">
              <div className="max-h-48 overflow-y-auto">
                {workspaces.map((ws) => {
                  const isActive = activeWorkspace?.id === ws.id;
                  return (
                    <button
                      key={ws.id}
                      type="button"
                      onClick={() => {
                        setActiveWorkspace(ws.id);
                        setShowWorkspaceMenu(false);
                      }}
                      className={cn(
                        'flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors border-b border-zinc-100 dark:border-zinc-800 last:border-0',
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-950/30'
                          : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                      )}
                    >
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white">
                        {ws.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{ws.name}</p>
                        <p className="text-[10px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                          {ws.type === 'team' ? 'Team' : 'Personal'}
                        </p>
                      </div>
                      {isActive && (
                        <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="border-t border-zinc-200 dark:border-zinc-700 p-2">
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded transition-colors"
                >
                  <Plus size={14} />
                  New workspace
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation sections */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        <div>
          {!collapsed && (
            <div className="mb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
              Main
            </div>
          )}
          <div className="space-y-1">
            {mainNavigation.map((item) => (
              <SidebarItem
                key={item.path}
                to={item.path}
                label={item.name}
                Icon={item.icon}
                active={isRouteActive(location.pathname, item.path)}
                collapsed={collapsed}
              />
            ))}
          </div>
        </div>

        <div>
          {!collapsed && (
            <div className="mb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
              Integrations
            </div>
          )}
          <div className="space-y-1">
            {integrationNavigation.map((item) => (
              <SidebarItem
                key={item.path}
                to={item.path}
                label={item.name}
                Icon={item.icon}
                active={isRouteActive(location.pathname, item.path)}
                collapsed={collapsed}
              />
            ))}
          </div>
        </div>

        <div>
          {!collapsed && (
            <div className="mb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
              System
            </div>
          )}
          <div className="space-y-1">
            {systemNavigation.map((item) => (
              <SidebarItem
                key={item.path}
                to={item.path}
                label={item.name}
                Icon={item.icon}
                active={isRouteActive(location.pathname, item.path)}
                collapsed={collapsed}
              />
            ))}
          </div>
        </div>
      </nav>

      {/* Create Note button */}
      {!collapsed && (
        <div className="border-t border-zinc-200 px-3 py-3 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => navigate('/editor')}
            className="flex w-full items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            <Plus size={16} />
            New Note
          </button>
        </div>
      )}

      {/* Logout */}
      <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
        <button
          type="button"
          onClick={logout}
          className={cn(
            'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-500/10 dark:hover:text-red-400',
            collapsed && 'justify-center px-2',
          )}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden h-full md:block">{sidebarContent}</div>

      {/* Mobile trigger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-3 z-30 inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-700 shadow-sm transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 md:hidden"
        aria-label="Open main menu"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-y-0 left-0 w-72 max-w-full"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            >
              <div className="relative h-full">
                {sidebarContent}
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-600 shadow-sm transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  aria-label="Close main menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
            <button
              type="button"
              className="absolute inset-0 w-full"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MainSidebar;

