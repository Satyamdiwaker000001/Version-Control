import { useState, useMemo } from 'react';
import { useNoteStore } from '@/features/notes/store/useNoteStore';
import type { NoteState } from '@/features/notes/store/useNoteStore';
import { useWorkspaceStore } from '@/features/workspace/store/useWorkspaceStore';
import { GitBranch, Filter, GitCommit, Search, Plus, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/Button';
import { GitGraph, GitCommitData } from './GitGraph';

export const GraphPage = () => {
  const notes = useNoteStore((state: NoteState) => state.notes);
  const teamActivity = useNoteStore((state: NoteState) => state.teamActivity);
  const activeWorkspace = useWorkspaceStore(state => state.activeWorkspace);
  const navigate = useNavigate();
  
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Transform notes and activity into Git-style Commits
  const commitData = useMemo(() => {
    const workspaceNotes = notes.filter(n => n.workspaceId === activeWorkspace?.id);
    
    // Seed data for a more interesting graph
    const baseCommits: GitCommitData[] = [
      {
        id: 'seed-1',
        sha: '7f3a2b1',
        message: 'Initial workspace structure',
        author: { name: 'System', color: '#10b981' },
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        branch: 'master',
        status: 'merged',
        changes: { added: 12, modified: 0, removed: 0 }
      },
      {
        id: 'seed-2',
        sha: 'a1b2c3d',
        message: 'Established core knowledge schemas',
        author: { name: 'System', color: '#10b981' },
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
        branch: 'master',
        status: 'merged',
        changes: { added: 45, modified: 2, removed: 0 }
      },
      {
        id: 'seed-3',
        sha: 'e5f6g7h',
        message: 'Feature exploration: Machine Learning notes',
        author: { name: 'Alex', color: '#3b82f6' },
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        branch: 'machine-learning',
        status: 'active',
        changes: { added: 85, modified: 10, removed: 2 }
      },
      {
        id: 'seed-4',
        sha: 'i9j0k1l',
        message: 'Drafting project roadmap',
        author: { name: 'Sarah', color: '#e67e22' },
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
        branch: 'roadmap',
        status: 'active',
        changes: { added: 20, modified: 5, removed: 0 }
      },
      {
        id: 'seed-5',
        sha: 'q5r6s7t',
        message: 'Synced latest research papers',
        author: { name: 'System', color: '#8b5cf6' },
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        branch: 'research',
        status: 'merged',
        changes: { added: 150, modified: 0, removed: 0 }
      }
    ];

    const noteCommits: GitCommitData[] = workspaceNotes.flatMap((note, index) => {
      const activity = teamActivity.filter(a => a.noteId === note.id);
      
      if (activity.length === 0) {
        return [{
          id: note.id,
          sha: `c${index}${note.id.substring(0, 4)}`,
          message: `Created: ${note.title}`,
          author: { name: 'Me', color: '#6366f1' },
          date: note.createdAt,
          branch: note.tags[0] || 'master',
          status: note.isPinned ? 'active' : 'merged',
          changes: { added: Math.floor(note.content.length / 10) || 5, modified: 0, removed: 0 },
          noteId: note.id
        } as GitCommitData];
      }

      return activity.map((a, aIdx) => ({
        id: `${a.noteId}-${aIdx}`,
        sha: `s${a.timestamp.substring(11, 19).replace(/:/g, '')}`,
        message: a.commitMessage || `${a.action === 'created' ? 'Created' : 'Updated'} ${note.title}`,
        author: { name: a.authorName, color: a.authorColor },
        date: a.timestamp,
        branch: note.tags[0] || 'master',
        status: aIdx === 0 ? 'active' : 'merged',
        changes: {
          added: a.action === 'created' ? 15 : Math.floor(Math.random() * 5),
          modified: a.action === 'edited' ? Math.floor(Math.random() * 10) : 0,
          removed: Math.floor(Math.random() * 2)
        },
        noteId: note.id
      } as GitCommitData));
    });

    const allCommits = [...baseCommits, ...noteCommits];

    // Final filters
    return allCommits
      .filter(c => !activeTag || c.branch === activeTag)
      .filter(c => !searchQuery || c.message.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [notes, teamActivity, activeWorkspace, activeTag, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-background animate-in fade-in duration-700 relative overflow-hidden">
      
      {/* Premium Header */}
      <div className="sticky top-0 z-20 glass border-b border-border p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <GitBranch size={24} className="animate-pulse" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-foreground uppercase">Version Tree</h1>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-[12px] font-bold text-muted-foreground uppercase tracking-widest">
                  {activeWorkspace?.name || 'Local Workspace'}
                </span>
                <div className="w-1 h-1 rounded-full bg-border" />
                <span className="text-[10px] sm:text-[12px] font-mono text-primary animate-pulse">
                  {commitData.length} Commits
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Contextual Help Icon */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-primary transition-colors"
              title="Help: This graph shows your knowledge evolution and note versions over time. Each bubble is a 'Commit' (save) of a note."
            >
              <Info size={18} />
            </Button>

            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input 
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                title="Search commit messages and titles"
                className="w-full pl-10 pr-4 py-2 bg-accent/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <Button size="icon" variant="outline" className="shrink-0 rounded-xl" title="Add a manual entry to the version history">
              <Plus size={18} />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <Button 
            variant={activeTag === null ? "default" : "outline"} 
            size="sm" 
            onClick={() => setActiveTag(null)}
            title="View all branches combined in one timeline"
            className="rounded-full text-[10px] font-bold h-7 uppercase px-4"
          >
            All Branches
          </Button>
          {Array.from(new Set(notes.flatMap(n => n.tags))).map(tag => (
            <Button 
              key={tag}
              variant={activeTag === tag ? "default" : "secondary"} 
              size="sm" 
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className="rounded-full text-[10px] font-bold h-7 uppercase px-4 whitespace-nowrap"
            >
              <GitBranch size={10} className="mr-1" />
              {tag}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {notes.filter(n => n.workspaceId === activeWorkspace?.id).length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mb-4">
              <Plus size={32} className="text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-lg font-bold">No knowledge nodes yet</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Start by creating notes to visualize your knowledge graph.
            </p>
          </div>
        ) : commitData.length > 0 ? (
          <div className="max-w-4xl mx-auto">
            <GitGraph 
              commits={commitData} 
              onCommitClick={(commit) => commit.noteId && navigate(`/editor?noteId=${commit.noteId}`)}
            />
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mb-4">
              <Filter size={32} className="text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-lg font-bold">No history found</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Try adjusting your filters or search query to see the commit tree.
            </p>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-border glass flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            Synced
          </div>
          <div className="flex items-center gap-1.5">
            <GitCommit size={12} />
            {commitData.length} Total Changes
          </div>
        </div>
        <div>
          Last synced: JUST NOW
        </div>
      </div>

    </div>
  );
};

export default GraphPage;
