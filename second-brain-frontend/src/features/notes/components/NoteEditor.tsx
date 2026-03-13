import { useState, useEffect, useRef, useMemo } from 'react';
import { useNoteStore, MOCK_TEAM_MEMBERS } from '@/features/notes/store/useNoteStore';
import { useWorkspaceStore } from '@/features/workspace/store/useWorkspaceStore';
import { 
  Save, GitCommit, MoreHorizontal, Share2, Clock, 
  Sparkles, Plus, Lock, PanelRight, 
  PanelRightClose, Pin, Hash, ChevronRight,
  Trash2
} from 'lucide-react';
import { useTagStore } from '@/features/tags/store/useTagStore';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/utils/cn';
import { formatDistanceToNow } from 'date-fns';

interface NoteEditorProps {
  noteId: string | null;
  onTogglePanel: () => void;
  isPanelOpen: boolean;
  onSelectNote?: (id: string) => void;
}

export const NoteEditor = ({ noteId, onTogglePanel, isPanelOpen, onSelectNote }: NoteEditorProps) => {
  const note = useNoteStore(state => state.notes.find(n => n.id === noteId));
  const updateNote = useNoteStore(state => state.updateNote);
  const deleteNote = useNoteStore(state => state.deleteNote);
  const renameNote = useNoteStore(state => state.renameNote);
  const togglePin = useNoteStore(state => state.togglePin);
  const teamActivity = useNoteStore(state => state.teamActivity);

  const activeWorkspace = useWorkspaceStore(state => state.activeWorkspace);
  const isTeam = activeWorkspace?.type === 'team';

  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [tagSearch, setTagSearch] = useState('');

  const { tags: globalTags, loadTags } = useTagStore();

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  const isDirty = useMemo(() => {
    if (!note) return false;
    return content !== note.content || title !== note.title;
  }, [content, title, note]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // State reset is handled by key prop in parent (NoteEditorPage.tsx)

  const handleTitleBlur = () => {
    if (note && title !== note.title) {
      renameNote(note.id, title);
      toast.success('Note renamed');
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  if (!noteId || !note) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center text-muted-foreground h-full px-4 sm:px-6">
        <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-2xl sm:rounded-3xl bg-accent flex items-center justify-center mb-6">
          <GitCommit size={32} className="text-primary opacity-30" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2 tracking-tight text-center">
          {isTeam ? 'Select a shared page' : 'Select a note'}
        </h2>
        <p className="text-xs sm:text-sm text-center max-w-[240px] sm:max-w-xs text-muted-foreground">
          {isTeam
            ? 'Pick a shared page from the team tree on the left, or create a new one.'
            : 'Pick a note from the explorer on the left, or start a new one.'}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-6 gap-2 premium-shadow"
          onClick={() => {
            const id = `n${Date.now()}`;
            useNoteStore.getState().createNote({
              title: 'Untitled Note',
              content: '',
              tags: [],
              workspaceId: activeWorkspace?.id || 'ws1',
              userId: 'u1',
              backlinks: [],
              isPinned: false
            });
            if (onSelectNote) onSelectNote(id);
          }}
        >
          <Plus size={14} /> New Page
        </Button>
      </div>
    );
  }

  const lastActivity = isTeam
    ? teamActivity
        .filter(a => a.noteId === note.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
    : null;

  const creator = isTeam ? MOCK_TEAM_MEMBERS.find(m => m.id === note.userId) : null;
  const lastEditor = lastActivity
    ? MOCK_TEAM_MEMBERS.find(m => m.id === lastActivity.authorId)
    : creator;

  const handleAddTag = (tagName: string) => {
    if (tagName.trim() && note) {
      useNoteStore.getState().addTag(note.id, tagName.trim());
      setNewTag('');
      setTagSearch('');
      setIsAddingTag(false);
      toast.success('Tag added');
    }
  };

  const handleRemoveTag = (tag: string) => {
    if (note) {
      useNoteStore.getState().removeTag(note.id, tag);
      toast.success('Tag removed');
    }
  };

  const handleSave = () => {
    if (!isDirty) return;
    setIsCommitting(true);
  };

  const confirmCommit = async () => {
    try {
      await updateNote(note.id, content, commitMessage || 'Update content', 'u1');
      toast.success('Version saved to history');
      setIsCommitting(false);
      setCommitMessage('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save version');
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this note?')) {
      deleteNote(note.id);
      if (onSelectNote) onSelectNote('');
      toast.success('Note deleted');
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/share/${note.id}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy share link');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background h-full overflow-hidden relative">
      <div className="h-12 flex items-center justify-between px-4 shrink-0 border-b border-border/50">
        <div className="flex items-center gap-1 text-[11px] sm:text-[13px] text-muted-foreground min-w-0 flex-1 mr-2">
          <span className="hover:bg-accent px-1.5 py-0.5 rounded cursor-pointer transition-colors shrink-0 hidden md:block truncate">
            {activeWorkspace?.name || 'Workspace'}
          </span>
          <ChevronRight size={12} className="text-border shrink-0 hidden md:block" />
          <span className="px-1.5 py-0.5 rounded truncate text-foreground/80 font-medium">
            {title || 'Untitled'}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <div className="hidden sm:flex items-center px-2">
            <span
              className={cn(
                'items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full transition-all flex mb-0',
                isDirty
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              )}
            >
              <Clock size={10} />
              {isDirty ? 'UNSAVED' : 'SAVED'}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1">
            {isTeam && (
              <div className="hidden md:flex -space-x-1.5 mx-2">
                {MOCK_TEAM_MEMBERS.slice(0, 3).map(m => (
                  <div
                    key={m.id}
                    title={`${m.name} — viewing`}
                    className="w-7 h-7 rounded-full border-2 border-background text-[10px] font-bold text-white flex items-center justify-center cursor-default"
                    style={{ backgroundColor: m.color }}
                  >
                    {m.initials[0]}
                  </div>
                ))}
              </div>
            )}

            <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-muted-foreground" onClick={handleShare}>
              <Share2 size={16} /> Share
            </Button>
            <Button
              variant="ghost" size="sm"
              className="h-9 w-9 text-muted-foreground"
              onClick={() => togglePin(note.id)}
            >
              <Pin size={16} className={cn(note.isPinned && 'fill-amber-500 text-amber-500')} />
            </Button>
            <Button variant="ghost" size="sm" className="h-9 w-9 text-primary opacity-70">
              <Sparkles size={16} />
            </Button>
            <div className="w-px h-4 bg-border mx-1" />
            <Button
              variant={isDirty ? 'default' : 'ghost'}
              size="sm"
              onClick={handleSave}
              disabled={!isDirty}
              className="h-9 gap-2"
            >
              <Save size={16} />
              <span className="hidden sm:inline">Commit</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 text-muted-foreground"
              onClick={onTogglePanel}
            >
              {isPanelOpen ? <PanelRightClose size={16} /> : <PanelRight size={16} />}
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground" onClick={handleDelete}>
              <Trash2 size={16} />
            </Button>
          </div>

          <div className="flex sm:hidden items-center gap-1">
             <Button variant={isDirty ? 'default' : 'ghost'} size="sm" onClick={handleSave} disabled={!isDirty} className="h-8 w-8 p-0">
                <Save size={16} />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onTogglePanel}>
                {isPanelOpen ? <PanelRightClose size={16} /> : <PanelRight size={16} />}
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground" onClick={handleShare}>
                <MoreHorizontal size={18} />
              </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto w-full">
        <div className="max-w-3xl mx-auto px-6 sm:px-12 pt-12 pb-32">
          <div className="mb-4 opacity-0 hover:opacity-100 transition-opacity group flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg border-2 border-dashed border-border flex items-center justify-center hover:border-primary/50 hover:bg-accent transition-all cursor-pointer text-muted-foreground">
              <Plus size={18} />
            </div>
          </div>

          <textarea
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            rows={1}
            placeholder="Untitled"
            className="w-full text-4xl sm:text-5xl font-extrabold text-foreground bg-transparent border-none focus:ring-0 resize-none outline-none mb-6 placeholder:text-muted-foreground/20 leading-[1.1]"
            style={{ minHeight: '1.2em' }}
          />

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-8 text-sm text-muted-foreground/60 border-b border-border/40 pb-4">
            {isTeam && creator ? (
              <>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ backgroundColor: creator.color }}>
                    {creator.initials[0]}
                  </div>
                  <span className="text-xs" style={{ color: creator.color }}>{creator.name}</span>
                </div>
                {lastEditor && lastEditor.id !== creator.id && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ backgroundColor: lastEditor.color }}>
                      {lastEditor.initials[0]}
                    </div>
                    <span className="text-xs text-muted-foreground/60">
                      last edited by <span className="font-semibold" style={{ color: lastEditor.color }}>{lastEditor.name}</span>
                    </span>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-accent cursor-pointer transition-colors">
                  <Lock size={13} />
                  <span>Private</span>
                </div>
                <span className="text-xs text-muted-foreground/40">
                  Edited {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                </span>
              </>
            )}

            <div className="flex items-center gap-1.5 min-w-0">
              <Hash size={12} className="text-muted-foreground/40 shrink-0" />
              <div className="flex gap-1 flex-wrap items-center">
                {note.tags.map(t => {
                  const tagInfo = globalTags.find(gt => gt.name === t);
                  return (
                    <span 
                      key={t} 
                      className="group/tag inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full font-bold transition-all border shrink-0"
                      style={{ 
                        backgroundColor: (tagInfo?.color || '#8b5cf6') + '15', 
                        color: tagInfo?.color || '#8b5cf6',
                        borderColor: (tagInfo?.color || '#8b5cf6') + '30'
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tagInfo?.color || '#8b5cf6' }} />
                      {t}
                      <button 
                        onClick={() => handleRemoveTag(t)}
                        className="opacity-0 group-hover/tag:opacity-100 p-0.5 hover:bg-black/5 rounded-full transition-all"
                      >
                        <Plus size={10} className="rotate-45" />
                      </button>
                    </span>
                  );
                })}
                
                {isAddingTag ? (
                  <div className="relative animate-in fade-in zoom-in-95 duration-200">
                    <input
                      autoFocus
                      value={tagSearch}
                      onChange={e => setTagSearch(e.target.value)}
                      placeholder="Search tags..."
                      className="text-[11px] bg-accent/50 border border-border rounded-full px-3 py-1 outline-none w-32 focus:w-40 transition-all shadow-sm"
                    />
                    <div className="absolute top-full left-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-2xl z-[100] overflow-hidden max-h-60 overflow-y-auto premium-shadow">
                      <div className="p-1.5 space-y-0.5">
                        {globalTags
                          .filter(t => t.name.toLowerCase().includes(tagSearch.toLowerCase()) && !note.tags.includes(t.name))
                          .map(t => (
                            <button
                              key={t.id}
                              onClick={() => handleAddTag(t.name)}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-accent rounded-lg transition-colors text-left"
                            >
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                              <span className="text-xs font-medium text-foreground">{t.name}</span>
                            </button>
                          ))}
                        {globalTags.filter(t => t.name.toLowerCase().includes(tagSearch.toLowerCase()) && !note.tags.includes(t.name)).length === 0 && (
                          <div className="px-3 py-2 text-[10px] text-muted-foreground text-center italic">
                            {tagSearch ? 'No matching tags' : 'No tags available'}
                          </div>
                        )}
                      </div>
                      <div className="bg-muted/30 p-1.5 border-t border-border">
                         <button 
                           onClick={() => { setIsAddingTag(false); setTagSearch(''); }}
                           className="w-full py-1 text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors uppercase tracking-tight"
                         >
                           Close
                         </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsAddingTag(true)}
                    className="p-1 hover:bg-accent rounded-full text-muted-foreground/40 hover:text-primary transition-all"
                  >
                    <Plus size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <textarea
            ref={textareaRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full min-h-[400px] resize-none text-foreground bg-transparent border-none focus:ring-0 leading-relaxed text-base sm:text-[17px] outline-none placeholder:text-muted-foreground/20 pb-40 font-[inherit]"
            placeholder="Start writing..."
          />
        </div>
      </div>

      <AnimatePresence>
        {isCommitting && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-background/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="w-full max-w-md bg-card border border-border shadow-2xl rounded-2xl overflow-hidden"
            >
              <div className="p-6">
                <h3 className="font-bold text-lg mb-4">Save version</h3>
                <textarea
                  autoFocus
                  value={commitMessage}
                  onChange={e => setCommitMessage(e.target.value)}
                  placeholder="What changed?"
                  className="w-full h-24 p-4 rounded-xl bg-accent/50 border border-border text-sm outline-none resize-none"
                />
                <div className="flex gap-3 mt-4">
                  <Button variant="ghost" className="flex-1" onClick={() => setIsCommitting(false)}>Cancel</Button>
                  <Button className="flex-1 premium-shadow" onClick={confirmCommit}>Save</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
