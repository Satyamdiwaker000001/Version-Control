import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNoteStore } from '@/features/notes/store/useNoteStore';
import { useTagStore } from '@/features/tags/store/useTagStore';
import { useWorkspaceStore } from '@/features/workspace/store/useWorkspaceStore';
import { FileText, ChevronDown, ChevronRight, Plus, Search, Hash, ArrowDownAZ, Calendar, Star } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Button } from '@/shared/ui/Button';

interface NoteTreeProps {
  onSelectNote: (id: string) => void;
  selectedId?: string | null;
}

export const NoteTree = ({ onSelectNote, selectedId }: NoteTreeProps) => {
  const allNotes = useNoteStore(state => state.notes);
  const { tags, loadTags } = useTagStore();
  const activeWorkspace = useWorkspaceStore(state => state.activeWorkspace);
  
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

  return (
    <div className="w-64 border-r border-border bg-background flex flex-col h-full overflow-hidden select-none">
      
      {/* Sidebar Top Search */}
      <div className="p-4 space-y-4">
        <div className="relative group">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Quick search..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-xs bg-accent/30 border border-transparent focus:border-primary/20 focus:bg-background rounded-lg transition-all outline-none placeholder:font-medium"
          />
        </div>

        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-1">
           <span>{activeWorkspace?.name || 'Workspace'}</span>
           <div className="flex items-center gap-1">
              <button 
                onClick={() => setSortBy(sortBy === 'date' ? 'alpha' : 'date')}
                className="hover:text-primary transition-colors p-0.5"
                title={`Sort by ${sortBy === 'date' ? 'Name' : 'Recent'}`}
              >
                {sortBy === 'date' ? <Calendar size={12} /> : <ArrowDownAZ size={12} />}
              </button>
              <button className="hover:text-primary transition-colors p-0.5"><Plus size={12} /></button>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 space-y-6 pb-10">
        
        {/* Pinned Section */}
        {pinnedNotes.length > 0 && (
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 px-3 py-1 text-[11px] font-bold text-muted-foreground/70 uppercase tracking-tighter">
               <Star size={10} className="fill-amber-500 text-amber-500" /> Favorites
            </div>
            {pinnedNotes.map(note => (
                <div 
                  key={note.id}
                  onClick={() => onSelectNote(note.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 text-sm rounded-md cursor-pointer transition-all group",
                    selectedId === note.id 
                      ? "bg-accent text-foreground font-bold" 
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <FileText size={14} className={cn("shrink-0", selectedId === note.id ? "text-primary" : "text-muted-foreground opacity-50")} />
                  <span className="truncate">{note.title}</span>
                </div>
            ))}
          </div>
        )}

        {/* Private Notes Section */}
        <div className="space-y-0.5">
           <div className="flex items-center gap-2 px-3 py-1 text-[11px] font-bold text-muted-foreground/70 uppercase tracking-tighter">
              <ChevronDown size={12} /> Private
           </div>
           {otherNotes.length === 0 ? (
             <div className="px-3 py-2 text-xs text-muted-foreground/40 italic">No notes found</div>
           ) : (
             otherNotes.map(note => (
                <div 
                  key={note.id}
                  onClick={() => onSelectNote(note.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 text-sm rounded-md cursor-pointer transition-all group",
                    selectedId === note.id 
                      ? "bg-accent text-foreground font-bold" 
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <FileText size={14} className={cn("shrink-0", selectedId === note.id ? "text-primary" : "text-muted-foreground opacity-50")} />
                  <span className="truncate">{note.title}</span>
                </div>
             ))
           )}
        </div>

        {/* Tags Section */}
        <div className="space-y-0.5">
          <div 
            onClick={() => setIsTagsOpen(!isTagsOpen)}
            className="flex items-center gap-2 px-3 py-1 text-[11px] font-bold text-muted-foreground/70 uppercase tracking-tighter cursor-pointer hover:bg-accent/50 rounded-md transition-colors"
          >
            {isTagsOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            Tags
          </div>
          
          {isTagsOpen && (
            <div className="space-y-0.5">
               {tags.map(tag => (
                 <div 
                   key={tag.id} 
                   onClick={() => handleTagToggle(tag.name)}
                   className={cn(
                     "flex items-center gap-2 px-3 py-1 text-xs cursor-pointer transition-all rounded-md pl-6",
                     activeTagFilter === tag.name
                       ? "bg-primary/10 text-primary font-bold"
                       : "text-muted-foreground/70 hover:bg-accent/50 hover:text-foreground"
                   )}
                 >
                   <Hash size={12} className={cn(activeTagFilter === tag.name ? "text-primary" : "opacity-40")} />
                   <span className="truncate">{tag.name}</span>
                 </div>
               ))}
            </div>
          )}
        </div>

      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-border bg-accent/10">
         <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-8 text-[11px] font-bold border-dashed hover:border-primary/50 hover:bg-primary/5">
            <Plus size={14} /> NEW PAGE
         </Button>
      </div>
    </div>
  );
};
