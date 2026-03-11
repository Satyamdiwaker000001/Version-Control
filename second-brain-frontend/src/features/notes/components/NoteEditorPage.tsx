import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { NoteTree } from './NoteTree';
import { NoteEditor } from './NoteEditor';
import { NoteMetadataPanel } from '@/features/notes/components/NoteMetadataPanel';
import { AIPanel } from '@/features/ai/components/AIPanel';
import { Activity } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export const NoteEditorPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentNoteId = searchParams.get('noteId');
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  const handleSelectNote = (id: string) => {
    setSearchParams({ noteId: id });
  };

  return (
    <div className="flex h-full -m-2 sm:-m-6 lg:-m-8 bg-white dark:bg-zinc-950 font-sans border-t border-zinc-200 dark:border-zinc-800 animate-in fade-in duration-500 overflow-hidden">
      
      {/* Pane 1: Document Tree (Left Sidebar) */}
      <div className="hidden md:block shrink-0">
        <NoteTree 
          selectedId={currentNoteId}
          onSelectNote={handleSelectNote}
        />
      </div>

      {/* Pane 2: Editor (Center) */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {currentNoteId ? (
           <NoteEditor noteId={currentNoteId} />
        ) : (
           <div className="flex-1 flex flex-col justify-center items-center text-zinc-500 bg-zinc-50 dark:bg-zinc-950/50">
             <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 flex items-center justify-center mb-4 shadow-sm border border-indigo-100 dark:border-indigo-800">
               <Activity size={32} />
             </div>
             <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2 tracking-tight">Knowledge Engineering Workspace</h2>
             <p className="text-sm max-w-sm text-center">Select a note from the explorer or create a new branch to start building your knowledge base.</p>
             <button className="mt-6 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm">
               Cmd+K to explore
             </button>
           </div>
        )}

        {/* Toggle Right Panel Button */}
        {currentNoteId && (
          <button 
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            className="absolute top-4 right-4 z-40 p-1.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-md transition-colors border border-zinc-200 dark:border-zinc-800 shadow-sm"
          >
            <Activity size={16} className={cn("transition-transform", rightPanelOpen && "rotate-180")} />
          </button>
        )}
      </div>

      {/* Pane 3: Metadata & Timeline & AI (Right Sidebar) */}
      {currentNoteId && rightPanelOpen && (
         <div className="hidden lg:flex flex-col shrink-0 animate-in slide-in-from-right-8 duration-300 h-full">
           <div className="flex-1 min-h-[50%]">
             <NoteMetadataPanel noteId={currentNoteId} />
           </div>
           <div className="h-px bg-zinc-200 dark:bg-zinc-800"></div>
           <div className="flex-1 min-h-[30%]">
             <AIPanel noteId={currentNoteId} />
           </div>
         </div>
      )}

    </div>
  );
};

export default NoteEditorPage;
