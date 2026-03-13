import { 
  Home, 
  FileText, 
  Settings, 
  Github, 
  LogOut, 
  Hash, 
  Share2,
  Kanban,
  ChevronDown,
  Plus,
  X,
  Building2,
  User2,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/shared/utils/cn';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useWorkspaceStore } from '@/features/workspace/store/useWorkspaceStore';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { name: 'Dashboard', path: '/', icon: Home },
      { name: 'All Notes', path: '/editor', icon: FileText },
      { name: 'Tags', path: '/tags', icon: Hash },
      { name: 'Knowledge Graph', path: '/graph', icon: Share2 },
      { name: 'Projects', path: '/projects', icon: Kanban },
    ],
  },
  {
    label: 'Integrations',
    items: [
      { name: 'GitHub', path: '/github', icon: Github },
    ],
  },
  {
    label: 'System',
    items: [
      { name: 'Settings', path: '/settings', icon: Settings },
    ],
  },
];

export const Sidebar = () => {
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const { workspaces, activeWorkspace, selectWorkspace } = useWorkspaceStore();
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsType, setNewWsType] = useState<'solo' | 'team'>('solo');

  const handleCreateWorkspace = () => {
    if (!newWsName.trim()) { toast.error('Workspace name is required'); return; }
    toast.success(`Workspace "${newWsName}" created!`);
    setNewWsName('');
    setNewWsType('solo');
    setIsCreateOpen(false);
  };

  const NavLink = ({ item }: { item: { name: string; path: string; icon: any } }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path || 
      (item.path !== '/' && location.pathname.startsWith(item.path));
    return (
      <Link
        to={item.path}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        )}
      >
        <Icon
          size={17}
          className={cn(
            'shrink-0 transition-colors',
            isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
          )}
        />
        <span className="truncate">{item.name}</span>
        {isActive && (
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
        )}
      </Link>
    );
  };

  return (
    <>
    <aside className="w-64 bg-card border-r border-border flex flex-col h-full shrink-0">
      
      {/* Workspace Switcher */}
      <div className="p-4 border-b border-border relative">
        <button
          className="w-full flex items-center justify-between p-2.5 hover:bg-accent rounded-xl cursor-pointer transition-all group border border-transparent hover:border-border"
          onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0 text-sm">
              {activeWorkspace?.name.charAt(0).toUpperCase() || 'W'}
            </div>
            <div className="truncate text-left">
              <p className="text-sm font-semibold text-foreground truncate leading-tight">
                {activeWorkspace?.name || 'Select Workspace'}
              </p>
              <p className="text-[11px] text-muted-foreground capitalize">
                {activeWorkspace?.role || 'Member'}
              </p>
            </div>
          </div>
          <ChevronDown
            size={15}
            className={cn(
              'text-muted-foreground transition-transform shrink-0 ml-1',
              isWorkspaceOpen && 'rotate-180'
            )}
          />
        </button>

        {/* Workspace Dropdown */}
        <AnimatePresence>
          {isWorkspaceOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.13, ease: 'easeOut' }}
              className="absolute top-[72px] left-3 right-3 bg-popover border border-border rounded-xl shadow-xl py-1.5 z-50 overflow-hidden"
            >
              {['solo', 'team'].map(type => {
                const filtered = workspaces.filter(ws => ws.type === type);
                if (filtered.length === 0) return null;
                return (
                  <div key={type}>
                    <p className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      {type === 'solo' ? 'Personal' : 'Team'}
                    </p>
                    {filtered.map(ws => (
                      <button
                        key={ws.id}
                        className={cn(
                          'w-full px-3 py-2 text-sm text-left hover:bg-accent transition-colors flex items-center justify-between gap-2',
                          activeWorkspace?.id === ws.id
                            ? 'text-primary font-semibold'
                            : 'text-foreground/80'
                        )}
                        onClick={() => {
                          selectWorkspace(ws.id);
                          setIsWorkspaceOpen(false);
                        }}
                      >
                        <span className="truncate">{ws.name}</span>
                        {activeWorkspace?.id === ws.id && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                );
              })}
              <div className="h-px bg-border my-1" />
              <button
                className="w-full px-3 py-2 text-sm text-primary hover:bg-accent transition-colors flex items-center gap-2"
                onClick={() => { setIsWorkspaceOpen(false); setIsCreateOpen(true); }}
              >
                <Plus size={14} /> Create Workspace
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 flex flex-col gap-4 px-3 overflow-y-auto">
        {NAV_SECTIONS.map(section => (
          <div key={section.label}>
            <p className="px-3 mb-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map(item => (
                <NavLink key={item.path} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>

    {/* Create Workspace Modal */}
    <AnimatePresence>
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm">
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
                  className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  Create
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
