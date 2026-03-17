import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNoteStore } from '@/features/notes/store/useNoteStore';
import { useTagStore } from '@/features/tags/store/useTagStore';
import { useWorkspaceStore } from '@/features/workspace/store/useWorkspaceStore';
import { useProjectStore } from '@/features/projects/store/useProjectStore';
import {
  FileText, Plus, Search,
  ArrowDownAZ, Calendar, MoreHorizontal,
  Trash2, Edit3
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Note } from '@/shared/types';

interface NoteTreeProps {
  onSelectNote: (id: string) => void;
  selectedId?: string | null;
}

const NoteItem = ({ 
  note, 
  isActive, 
  onSelect, 
  activity, 
  author, 
  isTeam 
}: { 
  note: Note; 
  isActive: boolean; 
  onSelect: (id: string) => void;
  activity: any;
  author: any;
  isTeam: boolean;
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this note?')) {
      useNoteStore.getState().deleteNote(note.id);
      toast.success('Note deleted');
    }
  };

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newTitle = prompt('Enter new title:', note.title);
    if (newTitle && newTitle !== note.title) {
      useNoteStore.getState().renameNote(note.id, newTitle);
      toast.success('Note renamed');
    }
    setIsMenuOpen(false);
  };

  return (
    <div
      onClick={() => onSelect(note.id)}
      className={cn(
        'flex flex-col px-3 py-2 rounded-lg cursor-pointer transition-all group relative',
        isActive
          ? 'bg-primary/10 text-foreground'
          : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
      )}
    >
      <div className="flex items-center gap-2">
        <FileText
          size={13}
          className={cn(
            'shrink-0 transition-colors',
            isActive ? 'text-primary' : 'text-muted-foreground/50 group-hover:text-muted-foreground'
          )}
        />
        <span className={cn('text-sm truncate flex-1', isActive && 'font-semibold')}>
          {note.title}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
             onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
             className="p-1 hover:bg-accent rounded text-muted-foreground transition-colors"
          >
            <MoreHorizontal size={12} />
          </button>
        </div>
        {isActive && !isMenuOpen && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
      </div>

      {isMenuOpen && (
        <div className="absolute right-2 top-8 z-50 bg-card border border-border shadow-xl rounded-lg py-1 min-w-[120px]">
           <button onClick={handleRename} className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] hover:bg-accent transition-colors text-left">
             <Edit3 size={12} /> Rename
           </button>
           <button onClick={handleDelete} className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] hover:bg-destructive/10 text-destructive transition-colors text-left">
             <Trash2 size={12} /> Delete
           </button>
        </div>
      )}

      {isTeam && (
        <div className="flex items-center gap-2 mt-1 pl-5">
          {activity ? (
            <span className="text-[10px] text-muted-foreground/60 truncate">
              {activity.authorName.split(' ')[0]} · {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
            </span>
          ) : author ? (
            <span className="text-[10px] text-muted-foreground/60 truncate">{author.name.split(' ')[0]}</span>
          ) : null}
        </div>
      )}
    </div>
  );
};

export const NoteTree = ({ onSelectNote, selectedId }: NoteTreeProps) => {
  const allNotes = useNoteStore(state => state.notes);
  const teamActivity = useNoteStore(state => state.teamActivity);
  const { tags, loadTags } = useTagStore();
  const activeWorkspace = useWorkspaceStore(state => state.activeWorkspace);
  const isTeam = activeWorkspace?.type === 'team';

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'alpha'>('date');
  const [searchParams] = useSearchParams();
  const activeTagFilter = searchParams.get('tag');

  useEffect(() => {
    if (tags.length === 0) loadTags();
  }, [tags.length, loadTags]);

  const filteredNotes = useMemo(() => {
    return allNotes
      .filter(n => n.workspaceId === activeWorkspace?.id)
      .filter(n => n.title.toLowerCase().includes(search.toLowerCase()))
      .filter(n => activeTagFilter ? n.tags.includes(activeTagFilter) : true)
      .sort((a, b) => {
        if (sortBy === 'date') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        return a.title.localeCompare(b.title);
      });
  }, [allNotes, activeWorkspace, search, activeTagFilter, sortBy]);

  const pinnedNotes = useMemo(() => filteredNotes.filter(n => n.isPinned), [filteredNotes]);
  const otherNotes = useMemo(() => filteredNotes.filter(n => !n.isPinned), [filteredNotes]);

  const getLastActivity = (noteId: string) => {
    const activities = [...teamActivity].filter(a => a.noteId === noteId);
    if (activities.length === 0) return undefined;
    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  };

  return (
    <div className="w-64 border-r border-border bg-background flex flex-col h-full overflow-hidden select-none">
      <div className="px-4 pt-4 pb-3 space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">
            {isTeam ? `${activeWorkspace?.name} (Team)` : activeWorkspace?.name || 'Workspace'}
          </span>
          <div className="flex items-center gap-0.5">
            <button onClick={() => setSortBy(sortBy === 'date' ? 'alpha' : 'date')} className="p-1 hover:text-primary rounded" title="Sort">
              {sortBy === 'date' ? <Calendar size={12} /> : <ArrowDownAZ size={12} />}
            </button>
            <button 
              onClick={() => {
                const activeProjectId = useProjectStore.getState().activeProjectId;
                if (!activeProjectId) {
                  toast.error('Please create or select a project first');
                  return;
                }
                const id = `n${Date.now()}`;
                useNoteStore.getState().createNote({
                  title: 'Untitled Note', content: '', tags: [], workspaceId: activeProjectId
                });
                onSelectNote(id);
              }}
              className="p-1 hover:text-primary rounded"
              title="New Note"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input type="text" placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)} className="w-full h-8 pl-8 pr-3 text-xs bg-accent/40 border-none rounded-lg outline-none" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-4">
        {allNotes.filter(n => n.workspaceId === activeWorkspace?.id).length === 0 ? (
          <div className="px-3 py-10 text-center">
            <p className="text-xs text-muted-foreground leading-relaxed">
              No active knowledge. Start by creating a note or linking a repository.
            </p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="px-3 py-10 text-center">
            <p className="text-xs text-muted-foreground leading-relaxed">
              No matches found. Try broadening your keywords.
            </p>
          </div>
        ) : (
          <>
            {pinnedNotes.length > 0 && (
              <div>
                <p className="px-3 py-1 text-[10px] font-bold text-muted-foreground/60 uppercase">Starred</p>
                {pinnedNotes.map(note => (
                  <NoteItem key={note.id} note={note} isActive={selectedId === note.id} onSelect={onSelectNote} activity={isTeam ? getLastActivity(note.id) : null} author={null} isTeam={isTeam} />
                ))}
              </div>
            )}
            <div>
              <p className="px-3 py-1 text-[10px] font-bold text-muted-foreground/60 uppercase">{isTeam ? 'Shared' : 'Private'}</p>
              {otherNotes.map(note => (
                <NoteItem key={note.id} note={note} isActive={selectedId === note.id} onSelect={onSelectNote} activity={isTeam ? getLastActivity(note.id) : null} author={null} isTeam={isTeam} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
