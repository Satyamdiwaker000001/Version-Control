import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNoteStore, MOCK_TEAM_MEMBERS } from '@/features/notes/store/useNoteStore';
import { useTagStore } from '@/features/tags/store/useTagStore';
import { useWorkspaceStore } from '@/features/workspace/store/useWorkspaceStore';
import {
  FileText, ChevronDown, ChevronRight, Plus, Search,
  Hash, ArrowDownAZ, Calendar, Star,
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Button } from '@/shared/ui/Button';
import { formatDistanceToNow } from 'date-fns';

interface NoteTreeProps {
  onSelectNote: (id: string) => void;
  selectedId?: string | null;
}

export const NoteTree = ({ onSelectNote, selectedId }: NoteTreeProps) => {
  const allNotes = useNoteStore(state => state.notes);
  const teamActivity = useNoteStore(state => state.teamActivity);
  const { tags, loadTags } = useTagStore();
  const activeWorkspace = useWorkspaceStore(state => state.activeWorkspace);
  const isTeam = activeWorkspace?.type === 'team';

  const [isTagsOpen, setIsTagsOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'alpha'>('date');
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTagFilter = searchParams.get('tag');

  useEffect(() => {
    if (tags.length === 0) loadTags();
  }, [tags.length, loadTags]);

  const handleTagToggle = (tagName: string) => {
    if (activeTagFilter === tagName) {
      searchParams.delete('tag');
    } else {
      searchParams.set('tag', tagName);
    }
    setSearchParams(searchParams);
  };

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

  // Get the last activity for a note (for team mode)
  const getLastActivity = (noteId: string) => {
    return teamActivity
      .filter(a => a.noteId === noteId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  };

  const NoteItem = ({ note }: { note: ReturnType<typeof filteredNotes[0]['valueOf']> }) => {
    const isActive = selectedId === note.id;
    const activity = isTeam ? getLastActivity(note.id) : null;
    const author = isTeam ? MOCK_TEAM_MEMBERS.find(m => m.id === note.userId) : null;

    return (
      <div
        onClick={() => onSelectNote(note.id)}
        className={cn(
          'flex flex-col px-3 py-2 rounded-lg cursor-pointer transition-all group',
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
          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
        </div>

        {/* Team mode: author attribution */}
        {isTeam && (
          <div className="flex items-center gap-2 mt-1 pl-5">
            {activity ? (
              <>
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0"
                  style={{ backgroundColor: activity.authorColor }}
                  title={activity.authorName}
                >
                  {activity.authorName[0]}
                </div>
                <span className="text-[10px] text-muted-foreground/60 truncate">
                  <span style={{ color: activity.authorColor }} className="font-semibold">
                    {activity.authorName === 'You' ? 'You' : activity.authorName.split(' ')[0]}
                  </span>
                  {' '}· {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </span>
              </>
            ) : author ? (
              <>
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0"
                  style={{ backgroundColor: author.color }}
                >
                  {author.initials[0]}
                </div>
                <span className="text-[10px] text-muted-foreground/60 truncate" style={{ color: author.color }}>
                  {author.name === 'You' ? 'You' : author.name.split(' ')[0]}
                </span>
              </>
            ) : null}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 border-r border-border bg-background flex flex-col h-full overflow-hidden select-none">

      {/* Header */}
      <div className="px-4 pt-4 pb-3 space-y-3">
        {/* Workspace label */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            {isTeam && (
              <div className="flex -space-x-1 mr-1">
                {MOCK_TEAM_MEMBERS.slice(0, 3).map(m => (
                  <div
                    key={m.id}
                    className="w-4 h-4 rounded-full border border-background flex items-center justify-center text-[7px] font-bold text-white"
                    style={{ backgroundColor: m.color }}
                  />
                ))}
              </div>
            )}
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">
              {isTeam ? `${activeWorkspace?.name} (Team)` : activeWorkspace?.name || 'Workspace'}
            </span>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setSortBy(sortBy === 'date' ? 'alpha' : 'date')}
              className="p-1 hover:text-primary hover:bg-accent rounded transition-colors"
              title={`Sort by ${sortBy === 'date' ? 'name' : 'date'}`}
            >
              {sortBy === 'date' ? <Calendar size={12} /> : <ArrowDownAZ size={12} />}
            </button>
            <button className="p-1 hover:text-primary hover:bg-accent rounded transition-colors">
              <Plus size={12} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-xs bg-accent/40 border border-transparent focus:border-primary/20 focus:bg-background rounded-lg outline-none placeholder:text-muted-foreground/60 transition-all"
          />
        </div>
      </div>

      {/* Note list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-4">

        {/* Pinned */}
        {pinnedNotes.length > 0 && (
          <div>
            <p className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
              <Star size={10} className="fill-amber-500 text-amber-500" /> Starred
            </p>
            {pinnedNotes.map(note => (
              <NoteItem key={note.id} note={note} />
            ))}
          </div>
        )}

        {/* All notes */}
        <div>
          <p className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
            <ChevronDown size={10} /> {isTeam ? 'Shared Pages' : 'Private'}
          </p>
          {otherNotes.length === 0 ? (
            <div className="mx-3 py-6 text-center text-xs text-muted-foreground/40 italic border border-dashed border-border/50 rounded-lg">
              No notes found
            </div>
          ) : (
            otherNotes.map(note => <NoteItem key={note.id} note={note} />)
          )}
        </div>

        {/* Tags */}
        <div>
          <button
            onClick={() => setIsTagsOpen(!isTagsOpen)}
            className="w-full flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest hover:text-muted-foreground transition-colors rounded-md"
          >
            {isTagsOpen ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
            Tags
          </button>

          {isTagsOpen && (
            <div className="space-y-0.5">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => handleTagToggle(tag.name)}
                  className={cn(
                    'w-full flex items-center gap-2 pl-7 pr-3 py-1.5 text-xs rounded-lg transition-all',
                    activeTagFilter === tag.name
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'text-muted-foreground/60 hover:bg-accent/50 hover:text-foreground'
                  )}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  <Hash size={11} className={activeTagFilter === tag.name ? 'text-primary' : 'opacity-40'} />
                  <span className="truncate">{tag.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 pb-3 pt-2 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 h-8 text-[11px] font-bold border-dashed hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
        >
          <Plus size={13} /> New Page
        </Button>
      </div>
    </div>
  );
};
