import { useState, useEffect, useRef } from 'react';
import { useNoteStore } from '@/features/notes/store/useNoteStore';
import { Save, GitCommit, PlaySquare, MoreHorizontal, Share2, Clock, Lock, Sparkles, Plus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/ui/Button';

export const NoteEditor = ({ noteId }: { noteId: string }) => {
  const note = useNoteStore(state => state.notes.find(n => n.id === noteId));
  const updateNote = useNoteStore(state => state.updateNote);
  
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (note) {
      setContent(note.content);
      setTitle(note.title);
    } else {
      setContent('');
      setTitle('');
    }
  }, [note]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  if (!note) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background text-muted-foreground animate-in fade-in duration-500">
        <div className="w-20 h-20 rounded-3xl bg-accent flex items-center justify-center mb-6">
          <PlaySquare size={32} className="text-primary opacity-20" />
        </div>
        <p className="text-sm font-medium">Select a note from the explorer to view its contents.</p>
        <p className="text-xs opacity-50 mt-1">Or press <kbd className="font-sans px-1.5 py-0.5 rounded border border-border bg-muted">⌘+K</kbd> to search</p>
      </div>
    );
  }

  const handleSave = () => {
    if (content === note.content && title === note.title) return;
    setIsCommitting(true);
  };

  const confirmCommit = () => {
    updateNote(note.id, content, commitMessage || 'Update content', 'mockUserId');
    toast.success('Version saved');
    setIsCommitting(false);
    setCommitMessage('');
  };

  return (
    <div className="flex-1 flex flex-col bg-background relative overflow-hidden h-full">
      
      {/* Notion-style Minimal Top Bar */}
      <div className="h-12 flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-1 text-[13px] text-muted-foreground font-medium">
          <span className="hover:bg-accent px-2 py-1 rounded cursor-pointer transition-colors">Workspace</span>
          <span className="opacity-40">/</span>
          <span className="hover:bg-accent px-2 py-1 rounded cursor-pointer transition-colors max-w-[150px] truncate">{title}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <div className="flex items-center mr-2">
             <span className="text-[10px] items-center gap-1 font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full hidden sm:flex">
                <Clock size={10} /> SAVED
             </span>
          </div>
          <Button variant="ghost" size="sm" className="h-8 gap-2 text-muted-foreground">
            <Share2 size={14} /> <span className="hidden md:inline">Share</span>
          </Button>
          <Button variant="ghost" size="sm" className="h-8 text-muted-foreground">
            <Sparkles size={14} className="text-primary" />
          </Button>
          <div className="w-px h-4 bg-border mx-1"></div>
          <Button 
            variant={content !== note.content || title !== note.title ? "default" : "ghost"}
            size="sm" 
            onClick={handleSave}
            disabled={content === note.content && title === note.title}
            className="h-8 gap-2"
          >
            <Save size={14} /> Commit
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <MoreHorizontal size={16} />
          </Button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
        <div className="max-w-3xl mx-auto px-6 sm:px-12 py-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Note Metadata / Status Icon */}
          <div className="mb-4 flex items-center gap-4 text-muted-foreground opacity-50 group">
             <div className="w-12 h-12 rounded-xl border-2 border-dashed border-border flex items-center justify-center hover:border-primary/50 hover:bg-accent transition-all cursor-pointer">
                <Plus size={20} />
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest">Add icon or cover</span>
             </div>
          </div>

          {/* Title Input */}
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            rows={1}
            placeholder="Untitled"
            className="w-full text-4xl sm:text-5xl font-extrabold text-foreground bg-transparent border-none focus:ring-0 resize-none outline-none mb-4 placeholder:opacity-20 leading-tight"
            style={{ minHeight: '1.2em' }}
          />

          <div className="flex items-center gap-4 mb-8 text-sm text-muted-foreground/60 border-b border-border/50 pb-4">
             <div className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-accent cursor-pointer transition-colors">
                <Users size={14} /> <span>3 collaborators</span>
             </div>
             <div className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-accent cursor-pointer transition-colors">
                <Lock size={14} /> <span>Private to Workspace</span>
             </div>
          </div>

          {/* Body Content */}
          <textarea 
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[400px] resize-none text-foreground bg-transparent border-none focus:ring-0 leading-relaxed text-base sm:text-lg outline-none placeholder:opacity-20 pb-40"
            placeholder="Press '/' for commands..."
          />
        </div>
      </div>

      {/* Commit Overlay */}
      <AnimatePresence>
        {isCommitting && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-background/20 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-card border border-border shadow-2xl rounded-2xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <GitCommit size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Save new version</h3>
                    <p className="text-xs text-muted-foreground">Documenting history to GitHub repository</p>
                  </div>
                </div>
                
                <textarea
                  autoFocus
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="What changed in this version?"
                  className="w-full h-24 p-4 rounded-xl bg-accent/50 border border-border text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                />
                
                <div className="flex gap-3 mt-6">
                  <Button variant="ghost" className="flex-1" onClick={() => setIsCommitting(false)}>
                    Discard changes
                  </Button>
                  <Button className="flex-1 premium-shadow" onClick={confirmCommit}>
                    Save to History
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
    </div>
  );
};
