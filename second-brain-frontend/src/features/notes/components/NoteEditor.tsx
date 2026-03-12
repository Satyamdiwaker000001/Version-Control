import { useState, useEffect, useRef } from 'react';
import { useNoteStore, MOCK_TEAM_MEMBERS } from '@/features/notes/store/useNoteStore';
import { useWorkspaceStore } from '@/features/workspace/store/useWorkspaceStore';
import {
  Save, GitCommit, MoreHorizontal, Share2, Clock,
  Sparkles, Plus, Users, Lock, PanelRight, PanelRightClose,
  Pin, Hash, ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/utils/cn';
import { formatDistanceToNow } from 'date-fns';

interface NoteEditorProps {
  noteId: string | null;
  onTogglePanel: () => void;
  isPanelOpen: boolean;
}

export const NoteEditor = ({ noteId, onTogglePanel, isPanelOpen }: NoteEditorProps) => {
  const note = useNoteStore(state => state.notes.find(n => n.id === noteId));
  const updateNote = useNoteStore(state => state.updateNote);
  const togglePin = useNoteStore(state => state.togglePin);
  const teamActivity = useNoteStore(state => state.teamActivity);

  const activeWorkspace = useWorkspaceStore(state => state.activeWorkspace);
  const isTeam = activeWorkspace?.type === 'team';

  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (note) {
      setContent(note.content);
      setTitle(note.title);
      setIsDirty(false);
    } else {
      setContent('');
      setTitle('');
    }
  }, [note?.id]);

  // Track unsaved changes
  useEffect(() => {
    if (note) {
      setIsDirty(content !== note.content || title !== note.title);
    }
  }, [content, title, note]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  // No note selected — empty state
  if (!noteId || !note) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center text-muted-foreground h-full px-6">
        <div className="w-20 h-20 rounded-3xl bg-accent flex items-center justify-center mb-6">
          <GitCommit size={32} className="text-primary opacity-30" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2 tracking-tight">
          {isTeam ? 'Select a shared page' : 'Select a note'}
        </h2>
        <p className="text-sm text-center max-w-xs text-muted-foreground">
          {isTeam
            ? 'Pick a shared page from the team tree on the left, or create a new one.'
            : 'Pick a note from the explorer on the left, or start a new one.'}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-6 gap-2"
        >
          <Plus size={14} /> New Page
        </Button>
        <p className="mt-3 text-xs text-muted-foreground/50">
          or press <kbd className="font-sans px-1.5 py-0.5 rounded border border-border bg-muted">⌘K</kbd> to search
        </p>
      </div>
    );
  }

  // ─── Author info for this note ────────────────────────────────────────────
  const lastActivity = isTeam
    ? teamActivity
        .filter(a => a.noteId === note.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
    : null;

  const creator = isTeam ? MOCK_TEAM_MEMBERS.find(m => m.id === note.userId) : null;
  const lastEditor = lastActivity
    ? MOCK_TEAM_MEMBERS.find(m => m.id === lastActivity.authorId)
    : creator;

  const handleSave = () => {
    if (!isDirty) return;
    setIsCommitting(true);
  };

  const confirmCommit = () => {
    updateNote(note.id, content, commitMessage || 'Update content', 'u1');
    toast.success('Version saved to history', {
      description: commitMessage || 'Changes committed.',
    });
    setIsCommitting(false);
    setCommitMessage('');
    setIsDirty(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-background h-full overflow-hidden relative">

      {/* ─── Editor Top Bar ─────────────────────────────────────────────────── */}
      <div className="h-12 flex items-center justify-between px-4 shrink-0 border-b border-border/50">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-[13px] text-muted-foreground min-w-0">
          <span className="hover:bg-accent px-2 py-1 rounded cursor-pointer transition-colors shrink-0 hidden sm:block">
            {activeWorkspace?.name || 'Workspace'}
          </span>
          <ChevronRight size={14} className="text-border shrink-0 hidden sm:block" />
          <span className="px-2 py-1 rounded max-w-[200px] truncate text-foreground/80 text-[13px] font-medium">
            {title || 'Untitled'}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Autosave indicator */}
          <span
            className={cn(
              'items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full hidden sm:flex transition-all',
              isDirty
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            )}
          >
            <Clock size={10} />
            {isDirty ? 'UNSAVED' : 'SAVED'}
          </span>

          {/* Team: who's viewing */}
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

          <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-muted-foreground hidden sm:flex" title="Share this note">
            <Share2 size={16} /> Share
          </Button>
          <Button
            variant="ghost" size="sm"
            className="h-9 w-9 text-muted-foreground"
            onClick={() => togglePin(note.id)}
            title={note.isPinned ? 'Unpin note' : 'Pin / Star note'}
          >
            <Pin size={16} className={cn(note.isPinned && 'fill-amber-500 text-amber-500')} />
          </Button>
          <Button
            variant="ghost" size="sm"
            className="h-9 w-9 text-primary opacity-70 hover:opacity-100"
            title="Knowledge Engine — AI assistant"
          >
            <Sparkles size={16} />
          </Button>
          <div className="w-px h-4 bg-border mx-1" />
          <Button
            variant={isDirty ? 'default' : 'ghost'}
            size="sm"
            onClick={handleSave}
            disabled={!isDirty}
            className="h-9 gap-2"
            title="Commit — save a new version"
          >
            <Save size={16} />
            <span className="hidden sm:inline">Commit</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 text-muted-foreground"
            onClick={onTogglePanel}
            title={isPanelOpen ? 'Hide details panel' : 'Show details panel'}
          >
            {isPanelOpen ? <PanelRightClose size={16} /> : <PanelRight size={16} />}
          </Button>
          <Button
            variant="ghost" size="icon"
            className="h-9 w-9 text-muted-foreground"
            title="More options"
          >
            <MoreHorizontal size={16} />
          </Button>
        </div>
      </div>

      {/* ─── Scrollable Editor Area ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto w-full">
        <div className="max-w-3xl mx-auto px-6 sm:px-12 pt-12 pb-32">

          {/* Icon / cover placeholder */}
          <div className="mb-4 opacity-0 hover:opacity-100 transition-opacity group flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg border-2 border-dashed border-border flex items-center justify-center hover:border-primary/50 hover:bg-accent transition-all cursor-pointer text-muted-foreground">
              <Plus size={18} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/40">
              Add icon or cover
            </span>
          </div>

          {/* Title */}
          <textarea
            value={title}
            onChange={e => setTitle(e.target.value)}
            rows={1}
            placeholder="Untitled"
            className="w-full text-4xl sm:text-5xl font-extrabold text-foreground bg-transparent border-none focus:ring-0 resize-none outline-none mb-3 placeholder:text-muted-foreground/20 leading-tight"
            style={{ minHeight: '1.2em' }}
          />

          {/* Note meta row — adapts to solo/team */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-8 text-sm text-muted-foreground/60 border-b border-border/40 pb-4">
            {isTeam && creator ? (
              <>
                {/* Created by */}
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                    style={{ backgroundColor: creator.color }}
                  >
                    {creator.initials[0]}
                  </div>
                  <span className="text-xs" style={{ color: creator.color }}>
                    {creator.name}
                  </span>
                  <span className="text-xs text-muted-foreground/40">created</span>
                </div>

                {/* Last edited by */}
                {lastEditor && lastEditor.id !== creator.id && (
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                      style={{ backgroundColor: lastEditor.color }}
                    >
                      {lastEditor.initials[0]}
                    </div>
                    <span className="text-xs text-muted-foreground/60">
                      last edited by{' '}
                      <span className="font-semibold" style={{ color: lastEditor.color }}>
                        {lastEditor.name}
                      </span>
                      {' '}· {formatDistanceToNow(new Date(lastActivity!.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                )}

                {/* Active collaborators */}
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-accent cursor-pointer transition-colors">
                  <Users size={13} />
                  <span>{MOCK_TEAM_MEMBERS.length} collaborators</span>
                </div>
              </>
            ) : (
              <>
                {/* Solo: just privacy + last edited */}
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-accent cursor-pointer transition-colors">
                  <Lock size={13} />
                  <span>Private</span>
                </div>
                <span className="text-xs text-muted-foreground/40">
                  Edited {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                </span>
              </>
            )}

            {/* Tags */}
            {note.tags.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Hash size={12} className="text-muted-foreground/40" />
                <div className="flex gap-1 flex-wrap">
                  {note.tags.map(t => (
                    <span key={t} className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Body content */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full min-h-[400px] resize-none text-foreground bg-transparent border-none focus:ring-0 leading-relaxed text-base sm:text-[17px] outline-none placeholder:text-muted-foreground/20 pb-40 font-[inherit]"
            placeholder="Start writing... Press '/' for commands"
          />
        </div>
      </div>

      {/* ─── Commit Modal ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isCommitting && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-background/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-md bg-card border border-border shadow-2xl rounded-2xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <GitCommit size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Save new version</h3>
                    <p className="text-xs text-muted-foreground">
                      {isTeam
                        ? 'This version will be visible to all team members'
                        : 'Documenting history to your repository'}
                    </p>
                  </div>
                </div>

                {/* Team: show who's saving */}
                {isTeam && (
                  <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-accent/50 border border-border">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: MOCK_TEAM_MEMBERS[0].color }}
                    >
                      Y
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">You</p>
                      <p className="text-[10px] text-muted-foreground">Saving as author</p>
                    </div>
                  </div>
                )}

                <textarea
                  autoFocus
                  value={commitMessage}
                  onChange={e => setCommitMessage(e.target.value)}
                  placeholder="What changed in this version? (optional)"
                  className="w-full h-24 p-4 rounded-xl bg-accent/50 border border-border text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none placeholder:text-muted-foreground/40"
                />

                <div className="flex gap-3 mt-4">
                  <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={() => setIsCommitting(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 premium-shadow gap-2"
                    onClick={confirmCommit}
                  >
                    <GitCommit size={14} /> Save to History
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
