import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { Search, Sparkles, FileText, Hash } from 'lucide-react';

type GlobalSearchResult =
  | { id: string; title: string; type: 'note'; match: string }
  | { id: string; title: string; type: 'tag'; match: string };

export const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [isSemantic, setIsSemantic] = useState(false);
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const isQueryTooShort = query.trim().length < 2;
  const displayResults = isQueryTooShort ? [] : results;

  const handleQueryChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
    } else {
      setIsSearching(true);
    }
  };

  // Mock search function
  useEffect(() => {
    if (isQueryTooShort) {
      return;
    }

    let isActive = true;

    const timeoutId = setTimeout(() => {
      if (!isActive) return;

      const mockResults: GlobalSearchResult[] = [
        { id: '1', title: 'Neural Networks Basics', type: 'note', match: 'Found in title: "Neural Networks"' },
        { id: '2', title: 'Machine Learning Study Guide', type: 'note', match: 'Found in content: "...types of neural networks include..."' },
        { id: '3', title: '#ai', type: 'tag', match: 'Related tag' }
      ];

      if (isSemantic && query.toLowerCase().includes('brain')) {
        mockResults.unshift({
          id: '4',
          title: 'Cognitive Architecture',
          type: 'note',
          match: 'Semantically related to "brain" (94% match)'
        });
      }

      setResults(mockResults);
      setIsSearching(false);
    }, isSemantic ? 800 : 300);

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [query, isSemantic, isQueryTooShort]);

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-zinc-950">
      
      {/* Search Bar Segment */}
      <div className="flex items-center border-b border-zinc-200 dark:border-zinc-800 px-3 relative">
        {isSemantic ? (
          <Sparkles className="mr-2 h-4 w-4 shrink-0 text-fuchsia-500 animate-pulse" />
        ) : (
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        )}
        
        <input
          value={query}
          onChange={handleQueryChange}
          className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-zinc-500"
          placeholder={isSemantic ? "Ask your knowledge base anything natively..." : "Search notes, tags, or content..."}
          autoFocus
        />
        
        {/* Semantic Toggle */}
        <button
          onClick={() => setIsSemantic(!isSemantic)}
          className={`shrink-0 ml-2 px-2 py-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md border transition-colors ${
            isSemantic 
              ? 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-900/30 dark:text-fuchsia-400 dark:border-fuchsia-800/50' 
              : 'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
        >
          {isSemantic && <Sparkles size={12} />}
          AI Search
        </button>
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto p-2">
        {isSearching ? (
           <div className="py-8 flex flex-col items-center justify-center text-zinc-400">
             <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
             <p className="text-sm">{isSemantic ? 'Running semantic vector search...' : 'Searching...'}</p>
           </div>
        ) : displayResults.length > 0 ? (
          <div className="space-y-1">
             <div className="px-2 py-1.5 text-xs font-semibold text-zinc-500">
               {isSemantic ? 'AI Matches' : 'Results'}
             </div>
             {displayResults.map(result => (
               <div 
                 key={result.id}
                 className="flex items-start gap-3 p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors group"
               >
                 <div className="mt-0.5 p-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-md text-zinc-500 group-hover:bg-white dark:group-hover:bg-zinc-700 transition-colors">
                   {result.type === 'tag' ? <Hash size={16} /> : <FileText size={16} />}
                 </div>
                 <div>
                   <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                     {result.title}
                   </h4>
                   <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                     {isSemantic && <Sparkles size={10} className="text-fuchsia-500" />}
                     {result.match}
                   </p>
                 </div>
               </div>
             ))}
          </div>
        ) : query.length > 0 ? (
          <div className="py-8 text-center text-sm text-zinc-500">
            No results found for "{query}".
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-zinc-500">
            Start typing to search your workspace.
          </div>
        )}
      </div>

    </div>
  );
};
