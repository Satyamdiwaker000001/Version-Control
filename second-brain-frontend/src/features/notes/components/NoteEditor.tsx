import { useState } from 'react';
import { useNoteStore } from '@/features/notes/store/useNoteStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { Save, GitCommit, Settings2, PlaySquare } from 'lucide-react';
import { toast } from 'sonner';

export const NoteEditor = ({ noteId }: { noteId: string }) => {
  const note = useNoteStore(state => state.notes.find(n => n.id === noteId));
  const updateNote = useNoteStore(state => state.updateNote);
  const { token } = useAuthStore();
  
  const [content, setContent] = useState(note?.content ?? '');
  const [commitMessage, setCommitMessage] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);

  if (!note) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-zinc-950 text-zinc-500">
        <PlaySquare size={48} className="text-zinc-200 dark:text-zinc-800 mb-4" />
        <p>Select a note from the explorer to view its contents.</p>
      </div>
    );
  }

  const handleSave = () => {
    if (content === note.content) return; // No changes
    setIsCommitting(true);
  };

  const confirmCommit = () => {
    if (!token) {
      toast.error('Authentication required');
      return;
    }
    updateNote(note.id, content, commitMessage || 'Update content', 'mockUserId', token);
    toast.success('Version committed to history', {
      description: `Commit "${commitMessage || 'Update content'}" created successfully.`
    });
    setIsCommitting(false);
    setCommitMessage('');
  };

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-zinc-950 relative overflow-hidden">
      
      {/* Editor Top Bar */}
      <div className="h-14 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 z-10">
        <div className="flex items-center gap-3">
          <input 
            type="text" 
            defaultValue={note.title}
            className="text-lg font-bold text-zinc-900 dark:text-white bg-transparent border-none focus:outline-none focus:ring-0 w-[400px] truncate"
          />
        </div>
        
        <div className="flex items-center gap-2">
          {content !== note.content && (
            <span className="text-xs font-medium text-amber-500 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-md animate-pulse">
              Unsaved changes
            </span>
          )}
          <button 
            className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
            title="Editor Settings"
          >
            <Settings2 size={16} />
          </button>
          <button 
            onClick={handleSave}
            disabled={content === note.content}
            className="ml-2 flex items-center gap-2 px-3 py-1.5 bg-indigo-600 disabled:bg-indigo-300 disabled:cursor-not-allowed hover:bg-indigo-500 text-white text-sm font-medium rounded-md shadow-sm transition-colors"
          >
            <Save size={14} /> Commit
          </button>
        </div>
      </div>

      {/* Commit Message Flyout */}
      {isCommitting && (
        <div className="absolute top-14 right-6 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-xl rounded-b-lg p-4 z-20 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-zinc-900 dark:text-white">
            <GitCommit size={16} className="text-indigo-500" /> New Version Commit
          </div>
          <textarea
            autoFocus
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder="Describe your changes..."
            className="w-full text-sm p-3 border border-zinc-200 dark:border-zinc-700 rounded-md bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-indigo-500 focus:border-indigo-500"
            rows={3}
          />
          <div className="flex justify-end gap-2 mt-3">
            <button 
              onClick={() => setIsCommitting(false)}
              className="px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={confirmCommit}
              className="px-3 py-1.5 text-xs font-medium bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-md transition-colors shadow-sm"
            >
              Save Version
            </button>
          </div>
        </div>
      )}

      {/* Markdown Text Area */}
      <div className="flex-1 overflow-y-auto w-full p-8 sm:px-16 lg:px-24">
        <textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full min-h-full resize-none text-zinc-800 dark:text-zinc-300 bg-transparent border-none focus:ring-0 leading-relaxed font-mono text-sm sm:text-base outline-none"
          placeholder="Start typing your knowledge document..."
        />
      </div>
      
    </div>
  );
};
