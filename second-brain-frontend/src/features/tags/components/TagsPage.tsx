import { useEffect, useMemo } from 'react';
import { useTagStore } from '../store/useTagStore';
import { useNoteStore } from '@/features/notes/store/useNoteStore';
import { Hash, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TagsPage = () => {
  const { tags, loadTags, isLoading } = useTagStore();
  const notes = useNoteStore(state => state.notes);
  const navigate = useNavigate();

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  // Aggregate tag usage
  const tagMetrics = useMemo(() => {
    return tags.map(tag => {
      const relatedNotes = notes.filter(note => note.tags.includes(tag.name));
      return {
        ...tag,
        usageCount: relatedNotes.length,
        latestNoteDate: relatedNotes.length > 0 
          ? Math.max(...relatedNotes.map(n => new Date(n.updatedAt).getTime()))
          : null
      };
    }).sort((a, b) => b.usageCount - a.usageCount);
  }, [tags, notes]);

  const handleTagClick = (tagName: string) => {
    navigate(`/editor?tag=${encodeURIComponent(tagName)}`);
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 max-w-5xl mx-auto w-full pt-4">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
              KNOWLEDGE LABELS
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
            Labels
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-xl text-sm">
            Labels are applied to notes to help organize and filter your knowledge base.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
           <div className="relative flex-1 md:w-64">
             <Hash className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
             <input type="text" placeholder="Search labels..." className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 dark:text-zinc-100 transition-colors" />
           </div>
           <button className="h-10 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm flex items-center gap-2 text-sm font-semibold shrink-0">
              New label
           </button>
        </div>
      </header>

      {/* Main Tag Grid */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm">
        <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-sm font-semibold text-zinc-900 dark:text-white">
           <span>{tagMetrics.length} labels</span>
           <span className="text-zinc-500 font-normal">Sort: Alphabetically</span>
        </div>
      {isLoading ? (
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-white dark:bg-zinc-900 px-4 py-3 animate-pulse">
              <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
            </div>
          ))}
        </div>
      ) : tagMetrics.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/20 p-12 text-center mt-4">
           <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
             <Hash className="w-8 h-8 text-zinc-400" />
           </div>
           <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">No Tags Created</h3>
           <p className="text-zinc-500 dark:text-zinc-400 max-w-sm">
             Create tags to start organizing your knowledge into distinct categories.
           </p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {tagMetrics.map(tag => (
            <div 
              key={tag.id} 
              className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
            >
              <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                 {/* GitHub Style Pill */}
                 <button 
                   onClick={() => handleTagClick(tag.name)}
                   className="w-fit flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold hover:opacity-80 transition-opacity whitespace-nowrap"
                   style={{ 
                     backgroundColor: tag.color.includes('bg-') ? undefined : tag.color, // Fallback if old tailwind classes
                     border: '1px solid rgba(0,0,0,0.1)'
                   }}
                 >
                   {/* Handle legacy Tailwind colors if present, otherwise assume hex */}
                   {tag.color.includes('bg-') ? (
                     <span className={`w-3 h-3 rounded-full ${tag.color}`}></span>
                   ) : (
                     <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }}></span>
                   )}
                   <span className={tag.color.includes('bg-') ? "text-zinc-700 dark:text-zinc-300" : ""} style={{ color: tag.color.includes('bg-') ? undefined : tag.color }}>
                     {tag.name}
                   </span>
                 </button>

                 <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate hidden md:block">
                   Knowledge organization tag for {tag.name}-related notes.
                 </p>
              </div>
              
              <div className="flex items-center gap-6 shrink-0 text-sm">
                 <button 
                   onClick={() => handleTagClick(tag.name)}
                   className="text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium flex items-center gap-1"
                 >
                   <FileText size={14} /> {tag.usageCount} {tag.usageCount === 1 ? 'note' : 'notes'}
                 </button>

                 <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors font-medium">Edit</button>
                   <button className="text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium">Delete</button>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default TagsPage;
