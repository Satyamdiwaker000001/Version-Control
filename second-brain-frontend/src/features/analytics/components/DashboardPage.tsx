import { useMemo, useEffect } from 'react';
import { useNoteStore } from '@/features/notes/store/useNoteStore';
import type { NoteState } from '@/features/notes/store/useNoteStore';
import { useWorkspaceStore } from '@/features/workspace/store/useWorkspaceStore';
import { useTagStore } from '@/features/tags/store/useTagStore';
import type { Note } from '@/shared/types';
import {
  Pin, Clock, GitCommit, FileText, Activity, Hash,
  Users, Network, Plus, FolderSync, Share2, ArrowRight,
  Pencil, Star, Zap, BookOpen, TrendingUp, GitBranch,
  MessageSquare, UserCheck, CircleDot,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { cn } from '@/shared/utils/cn';
import { motion } from 'framer-motion';

// ─── Animation wrapper ────────────────────────────────────────────────────────
const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: 'easeOut', delay }}
  >
    {children}
  </motion.div>
);

// ─── Author pill ──────────────────────────────────────────────────────────────
const AuthorPill = () => {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary"
    >
      <span
        className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] text-white font-bold bg-primary"
      >
        U
      </span>
      User
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SOLO DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
const SoloDashboard = ({ notes, workspace }: { notes: Note[]; workspace: any }) => {
  const navigate = useNavigate();
  const tags = useTagStore(s => s.tags);
  const pinnedNotes = notes.filter(n => n.isPinned);
  const recentNotes = [...notes]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);
  const totalWords = notes.reduce((acc, n) => acc + n.content.split(' ').length, 0);
  const totalVersions = notes.reduce((acc, n) => acc + n.versionCount, 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero */}
      <FadeIn>
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary/70 uppercase tracking-widest">
              <CircleDot size={10} className="text-primary" /> Personal Space
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              {workspace.name}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
              Your private knowledge garden. Write, explore, grow.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/graph')} 
              className="flex-1 sm:flex-none gap-2"
              title="View your notes in the version tree graph"
            >
              <Share2 size={15} /> Graph
            </Button>
            <Button 
              size="sm" 
              onClick={() => navigate('/editor?new=true')} 
              className="flex-1 sm:flex-none gap-2 premium-shadow"
              title="Create a new note in this workspace"
            >
              <Plus size={15} /> New Note
            </Button>
          </div>
        </header>
      </FadeIn>

      {/* Personal Stats — no Members */}
      <FadeIn delay={0.05}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Notes', value: notes.length, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'Versions', value: totalVersions, icon: GitCommit, color: 'text-violet-500', bg: 'bg-violet-500/10' },
            { label: 'Total Tags', value: tags.length, icon: Hash, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { label: 'Words Written', value: `${(totalWords / 1000).toFixed(1)}k`, icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          ].map((stat, i) => (
            <Card key={i} className="hover:border-primary/30 transition-all cursor-default group">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1 tabular-nums">{stat.value}</p>
                </div>
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110', stat.bg, stat.color)}>
                  <stat.icon size={20} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left — pinned + recent */}
        <div className="lg:col-span-3 space-y-8">

          {/* Pinned */}
          <FadeIn delay={0.1}>
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Star size={18} className="text-amber-500 fill-amber-500" /> Pinned Notes
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pinnedNotes.length === 0 ? (
                  <div className="col-span-full py-10 border-2 border-dashed border-border rounded-xl flex flex-col items-center text-muted-foreground/40 text-sm gap-2">
                    <Pin size={28} />
                    <p>Pin a note to keep it at the top</p>
                  </div>
                ) : pinnedNotes.map(note => (
                  <Card
                    key={note.id}
                    onClick={() => navigate(`/editor?noteId=${note.id}`)}
                    className="group relative cursor-pointer overflow-hidden hover:border-primary/40 hover:shadow-md transition-all"
                  >
                    <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary to-violet-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-sm font-bold group-hover:text-primary transition-colors line-clamp-1">
                          {note.title}
                        </CardTitle>
                        <Pin size={14} className="text-amber-500 fill-amber-500/30 shrink-0 mt-0.5" />
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {note.content.replace(/#+\s/g, '').substring(0, 90)}...
                      </p>
                    </CardHeader>
                    <CardContent className="px-4 pb-3">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        <div className="flex gap-1.5">
                          {note.tags.slice(0, 2).map((t, i) => (
                            <span key={i} className="bg-secondary px-2 py-0.5 rounded-full">#{t}</span>
                          ))}
                        </div>
                        <span className="flex items-center gap-1 text-muted-foreground/60">
                          <GitCommit size={11} /> {note.versionCount}v
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </FadeIn>

          {/* Recent */}
          <FadeIn delay={0.15}>
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Clock size={18} className="text-primary" /> Recently Edited
                </h2>
                <Button variant="ghost" size="sm" className="text-xs text-primary gap-1" onClick={() => navigate('/editor')}>
                  ALL NOTES <ArrowRight size={13} />
                </Button>
              </div>
              <Card className="overflow-hidden">
                <div className="divide-y divide-border">
                  {recentNotes.map(note => (
                    <div
                      key={note.id}
                      onClick={() => navigate(`/editor?noteId=${note.id}`)}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-accent/50 cursor-pointer group transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-primary/15 group-hover:text-primary transition-colors shrink-0">
                        <FileText size={17} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold group-hover:text-primary transition-colors truncate">{note.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Edited {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono bg-secondary px-2 py-0.5 rounded-full text-muted-foreground hidden sm:block">
                          {note.versionCount}v
                        </span>
                        <ArrowRight size={14} className="text-muted-foreground/0 group-hover:text-muted-foreground transition-all translate-x-0 group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </section>
          </FadeIn>
        </div>

        {/* Right — quick actions + writing activity */}
        <div className="lg:col-span-2 space-y-6">
          <FadeIn delay={0.2}>
            <Card>
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Zap size={16} className="text-primary" /> Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-2">
                {[
                  { label: 'Create a new note', icon: Pencil, action: () => navigate('/editor?new=true'), primary: true, tooltip: 'Start writing a new note' },
                  { label: 'Explore Knowledge Graph', icon: Network, action: () => navigate('/graph'), tooltip: 'Visualize note history' },
                  { label: 'Connect a Repository', icon: FolderSync, action: () => navigate('/github'), tooltip: 'Sync with GitHub' },
                  { label: 'Manage Tags', icon: Hash, action: () => navigate('/tags'), tooltip: 'Organize with tags' },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={item.action}
                    title={item.tooltip}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left',
                      item.primary
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 premium-shadow'
                        : 'bg-accent/50 hover:bg-accent text-foreground'
                    )}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </button>
                ))}
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.25}>
            <Card>
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <TrendingUp size={16} className="text-primary" /> Writing Streak
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="flex items-baseline gap-2 mb-3">
                  <p className="text-4xl font-black text-foreground">7</p>
                  <p className="text-sm text-muted-foreground font-medium">day streak 🔥</p>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {useMemo(() => {
                    const intensities = Array.from({ length: 28 }, () => Math.random());
                    return intensities.map((intensity, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-sm"
                        style={{
                          backgroundColor: intensity > 0.6
                            ? `hsl(var(--primary) / ${Math.min(intensity, 1)})`
                            : 'hsl(var(--muted))',
                        }}
                      />
                    ));
                  }, [])}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 text-center">Last 28 days</p>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEAM DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
const TeamDashboard = ({ notes, workspace }: { notes: Note[]; workspace: any }) => {
  const navigate = useNavigate();

  const pinnedNotes = notes.filter(n => n.isPinned);
  const recentNotes = [...notes]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  const connections = notes.reduce((acc, n) => acc + (n.backlinks?.length || 0), 0);


  return (
    <div className="space-y-8 pb-12">
      {/* Hero — team specific */}
      <FadeIn>
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-500/80 uppercase tracking-widest">
              <Users size={10} className="text-blue-500" /> Team Workspace
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              {workspace.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-muted-foreground">
                Collaborative knowledge base
              </p>
              <span className="text-[11px] font-medium text-muted-foreground">
                1 member
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/projects')} 
              className="flex-1 sm:flex-none gap-2"
              title="Open team discussion and projects"
            >
              <MessageSquare size={15} /> Chat
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/graph')} 
              className="flex-1 sm:flex-none gap-2 hidden sm:flex"
              title="View team knowledge graph"
            >
              <Share2 size={15} /> Graph
            </Button>
            <Button 
              size="sm" 
              onClick={() => navigate('/editor?new=true')} 
              className="flex-1 sm:flex-none gap-2 premium-shadow"
              title="Create a new shared note"
            >
              <Plus size={15} /> New Note
            </Button>
          </div>
        </header>
      </FadeIn>

      {/* Team Stats — includes Members */}
      <FadeIn delay={0.05}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Shared Notes', value: notes.length, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'Connections', value: connections, icon: Network, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: 'Active Tags', value: 5, icon: Hash, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { label: 'Members', value: 1, icon: UserCheck, color: 'text-violet-500', bg: 'bg-violet-500/10' },
          ].map((stat, i) => (
            <Card key={i} className="hover:border-primary/30 transition-all cursor-default group">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1 tabular-nums">{stat.value}</p>
                </div>
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110', stat.bg, stat.color)}>
                  <stat.icon size={20} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left — shared notes with author attribution */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Pinned — team notes */}
          {pinnedNotes.length > 0 && (
            <FadeIn delay={0.1}>
              <section>
                <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                  <Star size={18} className="text-amber-500 fill-amber-500" /> Team Pinned
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {pinnedNotes.map(note => (
                    <Card
                      key={note.id}
                      onClick={() => navigate(`/editor?noteId=${note.id}`)}
                      className="group relative cursor-pointer overflow-hidden hover:border-primary/40 hover:shadow-md transition-all"
                    >
                      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-blue-500 to-violet-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-bold group-hover:text-primary transition-colors line-clamp-1">
                          {note.title}
                        </CardTitle>
                        <div className="mt-1.5">
                          <AuthorPill userId={note.userId} />
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5">
                          {note.content.replace(/#+\s/g, '').substring(0, 80)}...
                        </p>
                      </CardHeader>
                      <CardContent className="px-4 pb-3">
                        <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                          <span>Edited {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</span>
                          <span className="flex items-center gap-1"><GitBranch size={10} /> {note.versionCount}v</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            </FadeIn>
          )}

          {/* Recent — with author */}
          <FadeIn delay={0.15}>
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Clock size={18} className="text-primary" /> Recently Changed
                </h2>
                <Button variant="ghost" size="sm" className="text-xs text-primary gap-1" onClick={() => navigate('/editor')}>
                  ALL <ArrowRight size={13} />
                </Button>
              </div>
              <Card className="overflow-hidden">
                <div className="divide-y divide-border">
                  {recentNotes.map(note => {
                    return (
                      <div
                        key={note.id}
                        onClick={() => navigate(`/editor?noteId=${note.id}`)}
                        className="flex items-center gap-4 px-5 py-3.5 hover:bg-accent/50 cursor-pointer group transition-colors"
                      >
                        {/* Author avatar */}
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 bg-primary"
                        >
                          U
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold group-hover:text-primary transition-colors truncate">{note.title}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            <span className="font-medium text-primary">
                              User
                            </span>
                            {' '}· {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-mono bg-secondary px-2 py-0.5 rounded-full text-muted-foreground hidden sm:block">
                            {note.versionCount}v
                          </span>
                          <ArrowRight size={14} className="text-muted-foreground/0 group-hover:text-muted-foreground transition-all" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </section>
          </FadeIn>
        </div>

        {/* Right — live team activity feed */}
        <div className="lg:col-span-2 space-y-6">
          <FadeIn delay={0.2}>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                <Activity size={18} className="text-primary" /> Team Activity
              </h2>
              <Card className="overflow-hidden">
                <div className="px-5 py-10 flex flex-col items-center justify-center text-muted-foreground/40 gap-3">
                  <Activity size={32} />
                  <p className="text-sm">No recent team activity</p>
                </div>
              </Card>
            </div>
          </FadeIn>

          {/* Member status */}
          <FadeIn delay={0.25}>
            <Card>
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Users size={15} className="text-primary" /> Active Members
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-primary">
                    Y
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">You</p>
                    <p className="text-[10px] text-muted-foreground">Owner</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT — routes to the right dashboard
// ═══════════════════════════════════════════════════════════════════════════════
export const DashboardPage = () => {
  const allNotes = useNoteStore((state: NoteState) => state.notes);
  const { workspaces, activeWorkspace: storeActive } = useWorkspaceStore();
  const fetchNotes = useNoteStore((state: NoteState) => state.fetchNotes);
  const activeWorkspace = storeActive || workspaces[0];
  const isTeam = activeWorkspace?.type === 'team';

  useEffect(() => {
    if (activeWorkspace?.id) {
      fetchNotes(activeWorkspace.id);
    }
  }, [activeWorkspace?.id, fetchNotes]);

  const notes = useMemo(
    () => allNotes.filter(n => n.workspaceId === activeWorkspace?.id),
    [allNotes, activeWorkspace]
  );

  if (!activeWorkspace) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Activity className="animate-pulse text-primary" size={32} />
          <p className="text-sm">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-8 pb-10">
      {isTeam
        ? <TeamDashboard notes={notes} workspace={activeWorkspace} />
        : <SoloDashboard notes={notes} workspace={activeWorkspace} />
      }
    </div>
  );
};

export default DashboardPage;
