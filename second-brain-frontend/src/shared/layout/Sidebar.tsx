import { 
  Home, 
  FileText, 
  Settings, 
  Github, 
  Hash, 
  Share2,
  Kanban,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/shared/utils/cn';
import { motion } from 'framer-motion';

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
      { name: 'Settings', path: '/settings/appearance', icon: Settings },
    ],
  },
];

export const Sidebar = () => {
  const location = useLocation();

  const NavLink = ({ item }: { item: { name: string; path: string; icon: React.ElementType } }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path || 
      (item.path !== '/' && location.pathname.startsWith(item.path));
    return (
      <Link
        to={item.path}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group relative',
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
          <motion.div
            layoutId="active-indicator"
            className="absolute left-0 w-1 h-5 bg-primary rounded-r-full"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </Link>
    );
  };

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-full shrink-0">
      {/* Navigation */}
      <nav className="flex-1 py-8 flex flex-col gap-6 px-3 overflow-y-auto">
        {NAV_SECTIONS.map(section => (
          <div key={section.label}>
            <p className="px-3 mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
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
    </aside>
  );
};
