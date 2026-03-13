import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Bell, Search, X, Settings, LogOut, User, ChevronRight, Menu } from 'lucide-react';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useNotificationStore } from '@/features/notifications/store/useNotificationStore';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/utils/cn';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export const Header = ({ 
  onOpenCommand, 
  onToggleMobileSidebar 
}: { 
  onOpenCommand: () => void;
  onToggleMobileSidebar: () => void;
}) => {
  const { isDarkMode, setTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const { 
    notifications, unreadCount, fetchNotifications, 
    markAsRead, markAllAsRead 
  } = useNotificationStore();
  const navigate = useNavigate();

  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const mockPresence = [
    { id: 'u2', initial: 'A', color: '#3b82f6' },
    { id: 'u3', initial: 'S', color: '#10b981' },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="h-14 bg-card border-b border-border flex items-center justify-between px-4 sm:px-6 transition-colors z-20 shrink-0 relative"
    >
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 -ml-2 text-muted-foreground hover:bg-accent hover:text-foreground rounded-lg transition-colors"
          title="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            onClick={onOpenCommand}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg border border-border bg-background/50 hover:bg-accent text-muted-foreground hover:text-foreground transition-all text-sm group"
          >
            <Search size={15} className="shrink-0" />
            <span className="flex-1 text-left line-clamp-1">Search notes, commands...</span>
            <kbd className="hidden sm:flex items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium shrink-0">
              <span>⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Mobile Search Icon */}
        <button
          onClick={onOpenCommand}
          className="md:hidden p-2 text-muted-foreground hover:bg-accent hover:text-foreground rounded-lg transition-colors"
          title="Search"
        >
          <Search size={18} />
        </button>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">

        {/* Live presence */}
        <div className="hidden md:flex items-center gap-3 mr-2">
          <div className="flex -space-x-2">
            {mockPresence.map(p => (
              <div
                key={p.id}
                className="w-7 h-7 rounded-full border-2 border-card flex items-center justify-center text-[10px] font-bold text-white"
                style={{ backgroundColor: p.color }}
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
          onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
          className="p-2 text-muted-foreground hover:bg-accent hover:text-foreground rounded-lg transition-colors"
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen(v => !v); setUserOpen(false); }}
            className="p-2 text-muted-foreground hover:bg-accent hover:text-foreground rounded-lg transition-colors relative"
            title="Notifications"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-destructive text-[9px] font-bold text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.13 }}
                className="absolute right-0 top-full mt-2 w-[calc(100vw-32px)] sm:w-80 max-w-sm bg-popover border border-border rounded-xl shadow-2xl overflow-hidden z-50"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <h3 className="font-bold text-sm text-foreground">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-[11px] text-primary font-semibold hover:underline">
                        Mark all read
                      </button>
                    )}
                    <button onClick={() => setNotifOpen(false)} className="text-muted-foreground hover:text-foreground">
                      <X size={14} />
                    </button>
                  </div>
                </div>
                <div className="divide-y divide-border max-h-[60vh] overflow-y-auto">
                  {notifications.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={cn(
                        'px-4 py-3 cursor-pointer hover:bg-accent/50 transition-colors',
                        !notif.read && 'bg-primary/5'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />}
                        <div className={cn('flex-1', notif.read && 'pl-3.5')}>
                          <p className="text-[12px] text-foreground leading-relaxed">{notif.text}</p>
                          <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                            {formatDistanceToNow(new Date(notif.time), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      No notifications yet.
                    </div>
                  )}
                </div>
                <div className="px-4 py-2.5 border-t border-border">
                  <button className="text-xs text-primary font-semibold hover:underline w-full text-center">
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-px h-5 bg-border mx-0.5" />

        {/* User menu */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => { setUserOpen(v => !v); setNotifOpen(false); }}
            className="flex items-center gap-2 cursor-pointer hover:bg-accent rounded-lg px-2 py-1.5 transition-colors"
            title="Account menu"
          >
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden text-primary font-semibold text-xs border border-primary/30">
              {user?.avatar ? (
                <img src={user.avatar} alt="User Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.email?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <span className="text-sm font-medium text-foreground hidden md:block">
              {user?.name || user?.email?.split('@')[0] || 'User'}
            </span>
          </button>

          <AnimatePresence>
            {userOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.13 }}
                className="absolute right-0 top-full mt-2 w-56 bg-popover border border-border rounded-xl shadow-2xl overflow-hidden z-50"
              >
                {/* User info */}
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-foreground">
                    {user?.name || user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>

                {[
                  { label: 'Profile', icon: User, action: () => { navigate('/settings/profile'); setUserOpen(false); } },
                  { label: 'Settings', icon: Settings, action: () => { navigate('/settings/appearance'); setUserOpen(false); } },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon size={15} className="text-muted-foreground" />
                      {item.label}
                    </div>
                    <ChevronRight size={13} className="text-muted-foreground/0 group-hover:text-muted-foreground transition-colors" />
                  </button>
                ))}

                <div className="h-px bg-border my-1" />
                <button
                  onClick={() => { logout(); setUserOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
};
