import { useNoteStore } from '@/features/notes/store/useNoteStore';
import type { NoteState } from '@/features/notes/store/useNoteStore';
import { useWorkspaceStore } from '@/features/workspace/store/useWorkspaceStore';
import { useTagStore } from '@/features/tags/store/useTagStore';
import type { Note } from '@/shared/types';
import { Pin, Clock, GitCommit, FileText, Activity, Hash, Users, Network, Plus, FolderSync, Share2, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/Card';
import { cn } from '@/shared/utils/cn';

export const DashboardPage = () => {
  const allNotes = useNoteStore((state: NoteState) => state.notes);
  const tags = useTagStore((state) => state.tags);
  const { workspaces, activeWorkspace: storeActiveWorkspace } = useWorkspaceStore();
  const activeWorkspace = storeActiveWorkspace || workspaces[0];
  const navigate = useNavigate();

  const notes = allNotes.filter(n => n.workspaceId === activeWorkspace?.id);
  const pinnedNotes = notes.filter((n: Note) => n.isPinned);
  const recentNotes = [...notes]
    .sort((a: Note, b: Note) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  if (!activeWorkspace) {
    return (
      <div className="h-full flex items-center justify-center">
        <Activity className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Workspace Header Overview */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
              {activeWorkspace.role || 'MEMBER'}
            </span>
            <span className="text-muted-foreground text-xs font-medium">
              {activeWorkspace.type === 'team' ? 'Team Workspace' : 'Personal Space'}
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            {activeWorkspace.name}
          </h1>
          <p className="text-muted-foreground max-w-lg">
            Welcome back. Your knowledge ecosystem is synchronized and ready for deep work.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/github')} className="gap-2">
            <FolderSync size={16} /> <span className="hidden sm:inline">Repositories</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/graph')} className="gap-2 hidden sm:flex">
            <Share2 size={16} /> <span>Open Graph</span>
          </Button>
          <Button size="sm" onClick={() => navigate('/editor?new=true')} className="gap-2 premium-shadow">
            <Plus size={16} /> <span>Create Note</span>
          </Button>
        </div>
      </header>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Notes', value: notes.length, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Connections', value: notes.reduce((acc, note) => acc + (note.backlinks?.length || 0), 0), icon: Network, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Active Tags', value: tags.length, icon: Hash, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Members', value: activeWorkspace.type === 'team' ? 3 : 1, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
        ].map((stat, i) => (
          <Card key={i} className="group cursor-default hover:border-primary/50 transition-all">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold mt-1 tabular-nums">{stat.value}</p>
              </div>
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                <stat.icon size={24} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Span: Pinned & Recent */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Pinned Notes Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Pin size={20} className="text-primary" /> Pinned Ideas
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pinnedNotes.length === 0 ? (
                <div className="col-span-full py-12 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground opacity-50">
                   <Pin size={32} className="mb-2" />
                   <p>No pinned notes yet</p>
                </div>
              ) : pinnedNotes.map((note: Note) => (
                <Card key={note.id} onClick={() => navigate(`/editor?noteId=${note.id}`)} className="group relative cursor-pointer overflow-hidden hover:border-primary/30">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <CardHeader className="p-5">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1">{note.title}</CardTitle>
                      <Pin size={16} className="text-primary shrink-0" />
                    </div>
                    <CardDescription className="line-clamp-2 mt-2">
                      {note.content.substring(0, 100)}...
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 pt-0">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      <div className="flex gap-2">
                        {note.tags.slice(0, 2).map((tag: string, i: number) => (
                          <span key={i} className="bg-secondary px-2 py-1 rounded">#{tag}</span>
                        ))}
                      </div>
                      <span className="flex items-center gap-1"><GitCommit size={12} /> {note.versionCount} VERSIONS</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Recent Notes List */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Clock size={20} className="text-primary" /> Recently Edited
              </h2>
              <Button variant="ghost" size="sm" className="text-xs text-primary font-bold hover:bg-primary/10">
                VIEW ALL <ArrowRight size={14} className="ml-1" />
              </Button>
            </div>
            <Card className="overflow-hidden">
              <div className="divide-y divide-border">
                {recentNotes.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground">No notes found. Create your first note!</div>
                ) : recentNotes.map((note: Note) => (
                  <div 
                    key={note.id} 
                    onClick={() => navigate(`/editor?noteId=${note.id}`)}
                    className="p-4 hover:bg-accent/50 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-colors shrink-0">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">{note.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 uppercase tracking-wide font-bold">
                          {formatDistanceToNow(new Date(note.updatedAt))} AGO
                          {note.tags.length > 0 && (
                            <>
                              <span className="text-border">•</span>
                              <span className="flex items-center gap-1 text-primary/80"><Hash size={10} /> {note.tags[0]}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-3">
                       <span className="text-[10px] font-mono font-bold bg-secondary px-2 py-1 rounded-full text-muted-foreground">{note.latestVersionId.substring(0, 7)}</span>
                       <ArrowRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </section>

        </div>

        {/* Right Span: Activity Timeline */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Activity size={20} className="text-primary" /> Global Feed
          </h2>
          <Card className="h-[600px] overflow-hidden flex flex-col">
            <CardContent className="p-6 overflow-y-auto w-full">
               <div className="relative pl-6 border-l-2 border-border space-y-8 pb-4">
                  {[
                    { type: 'commit', content: "You committed 'v4' to ", target: "Neural Networks Basics", time: '2 hours ago', bg: 'bg-primary' },
                    { type: 'member', content: "Alex joined workspace ", target: activeWorkspace.name, time: '5 hours ago', bg: 'bg-emerald-500' },
                    { type: 'create', content: "You created note ", target: "Transformer Architecture", time: '2 days ago', bg: 'bg-blue-500' },
                    { type: 'github', content: "Connected repository ", target: "frontend-v2", time: '3 days ago', bg: 'bg-amber-500' },
                  ].map((item, i) => (
                    <div key={i} className="relative">
                      <span className={cn("absolute -left-[35px] top-1 rounded-full w-5 h-5 border-[3px] border-background flex items-center justify-center", item.bg)}>
                        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                      </span>
                      <p className="text-sm font-medium leading-relaxed">
                        {item.content} 
                        <span className="text-primary font-bold cursor-pointer hover:underline">{item.target}</span>
                      </p>
                      <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-wider">{item.time}</p>
                    </div>
                  ))}
               </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;

