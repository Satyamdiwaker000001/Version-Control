import { 
  Home, 
  FileText, 
  Settings, 
  Github, 
  Hash, 
  Share2,
  Kanban,
  MessageSquare,
  PanelLeft,
  PanelLeftClose
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/shared/utils/cn';
import { useProjectStore } from '@/features/projects/store/useProjectStore';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_SECTIONS = [
  {
    label: 'Navigation',
    items: [
      { name: 'Dashboard', path: '/', icon: Home },
      { name: 'All Notes', path: '/editor', icon: FileText },
      { name: 'Tags', path: '/tags', icon: Hash },
      { name: 'Knowledge Graph', path: '/graph', icon: Share2 },
      { name: 'Projects', path: '/projects', icon: Kanban },
      { name: 'Chat', path: '/chat', icon: MessageSquare },
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

export const Sidebar = ({ 
  isCollapsed = false,
  onToggle
}: { 
  isCollapsed?: boolean;
  onToggle?: () => void;
}) => {
  const location = useLocation();

  const NavLink = ({ item }: { item: { name: string; path: string; icon: React.ElementType } }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path || 
      (item.path !== '/' && location.pathname.startsWith(item.path));
    return (
      <Link
        to={item.path}
        title={`Navigate to ${item.name}`}
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
        {!isCollapsed && <span className="truncate">{item.name}</span>}
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
    <aside className={cn(
      "bg-card flex flex-col h-full shrink-0 transition-all duration-300 relative",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Navigation */}
      <nav className="flex-1 py-8 flex flex-col gap-6 px-3 overflow-y-auto">
        {NAV_SECTIONS.map(section => (
          <div key={section.label} className="group/section">
            <div className={cn(
              "px-3 mb-2 flex items-center justify-between",
              isCollapsed && "justify-center"
            )}>
              {!isCollapsed && (
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                  {section.label}
                </p>
              )}
              {section.label === 'Navigation' && (
                <button
                  onClick={onToggle}
                  className={cn(
                    "p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground rounded-md transition-colors",
                    !isCollapsed && "opacity-0 group-hover/section:opacity-100"
                  )}
                  title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {isCollapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
                </button>
              )}
            </div>
            <div className="space-y-0.5">
              {section.items.map(item => (
                <NavLink key={item.path} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Projects Section */}
      {!isCollapsed && (
        <div className="px-6 pb-8 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Projects</p>
            <button className="p-1 hover:text-primary transition-colors hover:bg-accent rounded">
              <Plus size={12} />
            </button>
          </div>
          <ProjectList />
        </div>
      )}
    </aside>
  );
};

const ProjectList = () => {
  const { projects, activeProjectId, setActiveProject } = useProjectStore();
  
  return (
    <div className="space-y-1">
      {projects.map(project => (
        <div
          key={project.id}
          onClick={() => setActiveProject(project.id)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all",
            activeProjectId === project.id 
              ? "bg-primary/10 text-primary border-l-2 border-primary" 
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="truncate">{project.name}</span>
        </div>
      ))}
      {projects.length === 0 && (
        <p className="text-[10px] text-muted-foreground italic px-3">No projects yet</p>
      )}
    </div>
  );
};
