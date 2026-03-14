import { useState, useRef, useEffect } from 'react';
import { 
  Sun, Moon, Bell, Search, X, Settings, LogOut, 
  User, ChevronRight, Menu, Building2, User2, Plus, Check
} from 'lucide-react';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useNotificationStore } from '@/features/notifications/store/useNotificationStore';
import { useWorkspaceStore } from '@/features/workspace/store/useWorkspaceStore';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/utils/cn';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { NoeticLogo } from '@/shared/ui/NoeticLogo';

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
  const { 
    workspaces, activeWorkspace, selectWorkspace, createWorkspace, isLoading 
  } = useWorkspaceStore();
  const navigate = useNavigate();

  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsType, setNewWsType] = useState<'solo' | 'team'>('solo');

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

  const handleCreateWorkspace = async () => {
    if (!newWsName.trim()) { toast.error('Workspace name is required'); return; }
    try {
      await createWorkspace({ name: newWsName, type: newWsType });
      toast.success(`Workspace "${newWsName}" created!`);
      setNewWsName('');
      setNewWsType('solo');
      setIsCreateOpen(false);
      setUserOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create workspace');
    }
  };

  return (
    <>
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-full h-16 bg-card border-b border-border flex items-center justify-between px-4 sm:px-6 transition-colors z-40 shrink-0 relative"
    >
      <div className="flex items-center gap-4 lg:gap-8">
        {/* Mobile menu toggle */}
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 -ml-2 text-muted-foreground hover:bg-accent hover:text-foreground rounded-lg transition-colors"
          title="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Logo and Name */}
        <div 
          onClick={() => navigate('/')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="flex items-center justify-center shrink-0">
            <NoeticLogo className="w-9 h-9 text-primary transition-all duration-300 group-hover:scale-110" />
          </div>
          <span className="font-extrabold text-2xl tracking-tighter text-foreground group-hover:text-primary transition-all duration-300 hidden sm:block">
            NOETIC
          </span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            onClick={onOpenCommand}
            title="Search notes and commands (⌘K)"
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
                    <button onClick={() => setNotifOpen(false)} title="Close notifications" className="text-muted-foreground hover:text-foreground">
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
                  <button 
                    className="text-xs text-primary font-semibold hover:underline w-full text-center"
                    title="View full notification center"
                  >
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-px h-5 bg-border mx-0.5" />

        {/* User menu & Workspace Switcher */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => { setUserOpen(v => !v); setNotifOpen(false); }}
            className="flex items-center gap-2 cursor-pointer hover:bg-accent rounded-lg px-2 py-1.5 transition-colors"
            title="Account menu"
          >
            <div className="flex items-center gap-2 mr-1">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground shadow-sm">
                {activeWorkspace?.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-muted-foreground hidden sm:block max-w-[80px] truncate uppercase tracking-tighter">
                {activeWorkspace?.name}
              </span>
            </div>
            <div className="w-px h-4 bg-border mx-1 hidden sm:block" />
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden text-primary font-semibold text-xs border border-primary/30 ml-1">
              {user?.avatar ? (
                <img src={user.avatar} alt="User Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.email?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <ChevronRight size={13} className={cn("text-muted-foreground transition-transform", userOpen && "rotate-90")} />
          </button>

          <AnimatePresence>
            {userOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.13 }}
                className="absolute right-0 top-full mt-2 w-64 bg-popover border border-border rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col"
              >
                {/* User info */}
                <div className="px-4 py-3 border-b border-border bg-muted/20">
                  <p className="text-sm font-bold text-foreground leading-tight">
                    {user?.name || user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">{user?.email}</p>
                </div>

                {/* Workspace Switcher in Dropdown */}
                <div className="p-1.5 border-b border-border">
                  <p className="px-2.5 py-1.5 text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.15em]">Workspaces</p>
                  <div className="max-h-48 overflow-y-auto space-y-0.5">
                    {workspaces.map(ws => (
                      <button
                        key={ws.id}
                        onClick={() => { selectWorkspace(ws.id); setUserOpen(false); }}
                        className={cn(
                          "w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-colors group",
                          activeWorkspace?.id === ws.id ? "bg-primary/5 text-primary" : "hover:bg-accent text-foreground/80"
                        )}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className={cn(
                            "w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold shrink-0",
                            activeWorkspace?.id === ws.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          )}>
                            {ws.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-semibold truncate">{ws.name}</span>
                        </div>
                        {activeWorkspace?.id === ws.id && <Check size={12} strokeWidth={3} />}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setIsCreateOpen(true)}
                    title="Open workspace creation wizard"
                    className="w-full flex items-center gap-2 px-2.5 py-2 mt-1 rounded-lg text-xs font-bold text-primary hover:bg-primary/10 transition-colors"
                  >
                    <Plus size={14} /> Create New Workspace
                  </button>
                </div>

                <div className="p-1.5">
                  {[
                    { label: 'Profile Settings', icon: User, action: () => { navigate('/settings/profile'); setUserOpen(false); } },
                    { label: 'Account Appearance', icon: Settings, action: () => { navigate('/settings/appearance'); setUserOpen(false); } },
                  ].map(item => (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold text-foreground hover:bg-accent transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <item.icon size={15} className="text-muted-foreground" />
                        {item.label}
                      </div>
                      <ChevronRight size={13} className="text-muted-foreground/0 group-hover:text-muted-foreground transition-colors" />
                    </button>
                  ))}
                </div>

                <div className="h-px bg-border my-0.5" />
                <div className="p-1.5">
                  <button
                    onClick={() => { logout(); setUserOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-bold text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>

    {/* Create Workspace Modal */}
    <AnimatePresence>
      {isCreateOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
              <h3 className="font-bold text-foreground">New Workspace</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-widest">Name</label>
                <input
                  autoFocus
                  type="text"
                  value={newWsName}
                  onChange={e => setNewWsName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreateWorkspace()}
                  placeholder="e.g. Research Lab"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-widest">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['solo', 'team'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setNewWsType(type)}
                      className={cn(
                        'flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all capitalize',
                        newWsType === type
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/30'
                      )}
                    >
                      {type === 'solo' ? <User2 size={15} /> : <Building2 size={15} />}
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1 py-2 rounded-lg bg-accent text-foreground text-sm font-semibold hover:bg-accent/70 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateWorkspace}
                  disabled={isLoading}
                  className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
};
