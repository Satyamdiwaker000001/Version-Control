import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNoteStore } from '@/features/notes/store/useNoteStore';
import { useTagStore } from '@/features/tags/store/useTagStore';
import { FileText, ChevronDown, ChevronRight, Plus, Search, Folder, Hash, ArrowDownAZ, Calendar } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface NoteTreeProps {
  onSelectNote: (id: string) => void;
  selectedId?: string | null;
}

export const NoteTree = ({ onSelectNote, selectedId }: NoteTreeProps) => {
  const notes = useNoteStore(state => state.notes);
  const { tags, loadTags } = useTagStore();
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

  const filteredNotes = notes
    .filter(n => n.title.toLowerCase().includes(search.toLowerCase()))
    .filter(n => activeTagFilter ? n.tags.includes(activeTagFilter) : true)
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      return a.title.localeCompare(b.title);
    });

  return (
    <div className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex flex-col h-full overflow-hidden">
      
      {/* Explorer Header */}
      <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">
            Explorer 
          </h2>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setSortBy(sortBy === 'date' ? 'alpha' : 'date')}
              className="hover:bg-zinc-200 dark:hover:bg-zinc-800 p-1 rounded transition-colors text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              title={`Sort by ${sortBy === 'date' ? 'Alphabetical' : 'Recent'}`}
            >
              {sortBy === 'date' ? <Calendar size={14} /> : <ArrowDownAZ size={14} />}
            </button>
            <button className="hover:bg-zinc-200 dark:hover:bg-zinc-800 p-1 rounded transition-colors text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
              <Plus size={14} />
            </button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Filter files..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-8 pl-7 pr-3 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        
        {/* Workspace Notes Folder Mock */}
        <div>
          <div className="flex items-center gap-1.5 px-2 py-1 text-sm font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded transition-colors group">
            <ChevronDown size={14} className="text-zinc-400" />
            <Folder size={14} className="text-indigo-500" fill="currentColor" fillOpacity={0.2} />
            <span className="truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Workspace Notes</span>
          </div>
          
          <div className="ml-5 mt-1 space-y-0.5 border-l border-zinc-200 dark:border-zinc-800 pl-2">
             {filteredNotes.length === 0 ? (
               <div className="text-xs text-zinc-400 italic py-2 px-2">No notes found.</div>
             ) : (
               filteredNotes.map(note => (
                 <div 
                   key={note.id}
                   onClick={() => onSelectNote(note.id)}
                   className={cn(
                     "flex items-center gap-2 px-2 py-1.5 text-sm rounded cursor-pointer transition-colors",
                     selectedId === note.id 
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 font-medium" 
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200"
                   )}
                 >
                   <FileText size={14} className={cn("shrink-0", selectedId === note.id ? "text-indigo-500" : "text-zinc-400")} />
                   <span className="truncate">{note.title}</span>
                 </div>
               ))
             )}
          </div>
        </div>

        {/* Tags Folder Mock */}
        <div>
          <div 
            onClick={() => setIsTagsOpen(!isTagsOpen)}
            className="flex items-center gap-1.5 px-2 py-1 text-sm font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded transition-colors"
          >
            {isTagsOpen ? <ChevronDown size={14} className="text-zinc-400" /> : <ChevronRight size={14} className="text-zinc-400" />}
            <span className="truncate">Tags</span>
          </div>
          
          {isTagsOpen && (
            <div className="ml-5 mt-1 space-y-0.5 border-l border-zinc-200 dark:border-zinc-800 pl-2">
               {tags.length === 0 ? (
                 <div className="text-xs text-zinc-400 italic py-2 px-2 animate-pulse">Loading tags...</div>
               ) : (
                 tags.map(tag => (
                   <div 
                     key={tag.id} 
                     onClick={() => handleTagToggle(tag.name)}
                     className={cn(
                       "flex items-center gap-2 px-2 py-1 text-xs cursor-pointer transition-colors rounded",
                       activeTagFilter === tag.name
                         ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 font-medium"
                         : "text-zinc-500 dark:text-zinc-400 hover:text-indigo-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                     )}
                   >
                     <Hash size={12} className={cn(activeTagFilter === tag.name ? "text-indigo-500" : "text-zinc-400")} />
                     <span className="truncate">{tag.name}</span>
                   </div>
                 ))
               )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
