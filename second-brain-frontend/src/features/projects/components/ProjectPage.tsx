import { useState, useMemo } from 'react';
import { useProjectStore } from '../store/useProjectStore';
import type { ProjectTask, ProjectDiscussion } from '../store/useProjectStore';
import { useWorkspaceStore } from '@/features/workspace/store/useWorkspaceStore';
import { 
  Plus, 
  MessageSquare, 
  Kanban, 
  Layout, 
  Search, 
  MoreHorizontal, 
  User, 
  MessageCircle, 
  CheckCircle2, 
  Clock, 
  Circle, 
  Github,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/utils/cn';
import { motion } from 'framer-motion';

export const ProjectPage = () => {
  const activeWorkspace = useWorkspaceStore(state => state.activeWorkspace);
  const { projects, activeProjectId } = useProjectStore();
  const [view, setView] = useState<'kanban' | 'discussions'>('kanban');

  const activeProject = useMemo(() => 
    projects.find(p => p.id === activeProjectId && p.workspaceId === (activeWorkspace?.id || '1')),
  [projects, activeProjectId, activeWorkspace]);

  if (!activeProject) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-4">
        <div className="w-20 h-20 rounded-3xl bg-accent flex items-center justify-center text-primary opacity-20">
          <Layout size={40} />
        </div>
        <h2 className="text-xl font-bold">No project active in this workspace</h2>
        <p className="text-muted-foreground text-sm max-w-xs">Select or create a project to start planning and discussing.</p>
        <Button className="premium-shadow">Create New Project</Button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden animate-in fade-in duration-700">
      
      {/* Project Header */}
      <header className="px-8 py-6 border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
             <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary">
                <Github size={12} /> REPOSITORY CONNECTED
             </div>
             <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
               {activeProject.name} <ChevronDown size={20} className="text-muted-foreground cursor-pointer" />
             </h1>
             <p className="text-muted-foreground text-sm max-w-2xl">{activeProject.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2"><Plus size={16} /> New Issue</Button>
            <Button size="sm" className="premium-shadow">Invite Team</Button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-8 mt-8">
           <button 
             onClick={() => setView('kanban')}
             className={cn(
               "flex items-center gap-2 text-sm font-bold pb-2 border-b-2 transition-all",
               view === 'kanban' ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
             )}
           >
             <Kanban size={16} /> Board
           </button>
           <button 
             onClick={() => setView('discussions')}
             className={cn(
               "flex items-center gap-2 text-sm font-bold pb-2 border-b-2 transition-all",
               view === 'discussions' ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
             )}
           >
             <MessageSquare size={16} /> Discussions
             <span className="bg-secondary px-2 py-0.5 rounded-full text-[10px]">{activeProject.discussions.length}</span>
           </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden">
        {view === 'kanban' ? (
          <KanbanBoard tasks={activeProject.tasks} />
        ) : (
          <DiscussionList discussions={activeProject.discussions} />
        )}
      </main>
    </div>
  );
};

// --- Subcomponents ---

const KanbanBoard = ({ tasks }: { tasks: ProjectTask[] }) => {
  const columns: { id: ProjectTask['status']; label: string; icon: any; color: string }[] = [
    { id: 'todo', label: 'To Do', icon: Circle, color: 'text-zinc-500' },
    { id: 'in-progress', label: 'In Progress', icon: Clock, color: 'text-amber-500' },
    { id: 'done', label: 'Done', icon: CheckCircle2, color: 'text-emerald-500' },
  ];

  return (
    <div className="h-full overflow-x-auto custom-scrollbar p-8">
      <div className="flex gap-6 min-h-full">
        {columns.map(col => (
          <div key={col.id} className="w-80 shrink-0 flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                 <col.icon size={16} className={col.color} />
                 <h3 className="font-extrabold text-sm uppercase tracking-wider">{col.label}</h3>
                 <span className="text-xs text-muted-foreground font-medium pl-1">
                    {tasks.filter(t => t.status === col.id).length}
                 </span>
              </div>
              <button className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-accent">
                 <Plus size={16} />
              </button>
            </div>

            <div className="flex-1 space-y-4">
               {tasks.filter(t => t.status === col.id).map(task => (
                 <motion.div 
                   key={task.id} 
                   layoutId={task.id}
                   className="group bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-grab active:cursor-grabbing"
                 >
                   <div className="flex justify-between items-start mb-2">
                     <span className={cn(
                       "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase",
                       task.priority === 'high' ? "bg-red-500/10 text-red-500" :
                       task.priority === 'medium' ? "bg-amber-500/10 text-amber-500" :
                       "bg-blue-500/10 text-blue-500"
                     )}>
                       {task.priority}
                     </span>
                     <button className="opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal size={14} /></button>
                   </div>
                   <h4 className="font-bold text-sm leading-snug mb-2">{task.title}</h4>
                   <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">{task.description}</p>
                   <div className="flex items-center justify-between">
                     <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full border-2 border-card bg-accent flex items-center justify-center text-[10px] font-bold">JD</div>
                        <div className="w-6 h-6 rounded-full border-2 border-card bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">+2</div>
                     </div>
                     <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-bold">
                        <MessageSquare size={12} /> 3
                     </div>
                   </div>
                 </motion.div>
               ))}
               
               <button className="w-full py-2 flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors border border-dashed border-border rounded-xl hover:bg-primary/5 hover:border-primary/50 group">
                  <Plus size={14} className="group-hover:scale-110 transition-transform" /> New Task
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DiscussionList = ({ discussions }: { discussions: ProjectDiscussion[] }) => {
  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-8 max-w-5xl mx-auto">
      <div className="space-y-6">
         <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold flex items-center gap-2">
               <MessageSquare size={20} className="text-primary" /> General Discussions
            </h2>
            <div className="flex items-center gap-2">
               <div className="relative">
                 <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                 <input 
                   placeholder="Search discussions..." 
                   className="h-9 pl-9 pr-3 text-xs bg-accent/50 border-none rounded-lg w-64 focus:ring-1 focus:ring-primary/20 outline-none"
                 />
               </div>
               <Button size="sm" className="premium-shadow">Start Thread</Button>
            </div>
         </div>

         <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
            {discussions.map(discussion => (
              <div key={discussion.id} className="p-6 hover:bg-accent/30 transition-all cursor-pointer group">
                 <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                       <MessageCircle size={22} />
                    </div>
                    <div className="flex-1 space-y-1">
                       <div className="flex items-center justify-between">
                          <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{discussion.title}</h3>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">#{discussion.id}</span>
                       </div>
                       <p className="text-sm text-muted-foreground line-clamp-1">{discussion.content}</p>
                       <div className="flex items-center gap-4 pt-2">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                             <User size={12} /> <span className="font-bold text-foreground/80">{discussion.author}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                             <Clock size={12} /> <span>{new Date(discussion.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-primary font-bold">
                             <MessageSquare size={12} /> {discussion.replies} replies
                          </div>
                          <div className="flex gap-1 pl-2">
                             {discussion.tags.map(tag => (
                               <span key={tag} className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                                  {tag}
                               </span>
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            ))}
         </div>
         
         <div className="py-10 text-center text-muted-foreground text-sm flex flex-col items-center gap-3">
            <Github size={32} className="opacity-10" />
            <p className="max-w-xs">These discussions are synced with your GitHub repository issues and pull requests.</p>
         </div>
      </div>
    </div>
  );
};
