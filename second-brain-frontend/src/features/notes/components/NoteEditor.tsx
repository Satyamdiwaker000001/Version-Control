import { useState, useEffect, useMemo } from 'react';
import { useNoteStore } from '@/features/notes/store/useNoteStore';
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

// ─── Rich Text Editor imports ────────────────────────────────────────────
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import ImageExt from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { EditorContent } from '@tiptap/react';
import { EditorToolbar } from './EditorToolbar';
import { EmojiPicker } from './EmojiPicker';
import { LinkInsertDialog } from './LinkInsertDialog';
import { useFileAttachment } from './FileAttachment';
import { FileViewerWithComments } from './FileViewerWithComments';
import { CollaborationIndicator } from './CollaborationIndicator';
import { useCollaboration } from '../hooks/useCollaboration';
import './editor-styles.css';

interface NoteEditorProps {
  noteId: string | null;
  onTogglePanel: () => void;
  isPanelOpen: boolean;
  onSelectNote?: (id: string) => void;
  onAiClick?: () => void;
}

export const NoteEditor = ({ noteId, onTogglePanel, isPanelOpen, onSelectNote, onAiClick }: NoteEditorProps) => {
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
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [tagSearch, setTagSearch] = useState('');

  // ─── Rich Editor State ─────────────────────────────────────────────────
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [pdfAttachments, setPdfAttachments] = useState<Array<{ dataUrl: string; fileName: string; fileSize: number }>>([]);
  const [csvAttachments, setCsvAttachments] = useState<Array<{ dataUrl: string; fileName: string; fileSize: number }>>([]);
  const [excelAttachments, setExcelAttachments] = useState<Array<{ dataUrl: string; fileName: string; fileSize: number }>>([]);

  // ─── Collaboration State ─────────────────────────────────────────
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [onlineUsersCount, setOnlineUsersCount] = useState(0);

  // Initialize collaboration hook
  const collaboration = useCollaboration({
    userId: 'current-user',
    userName: 'You'
  });

  // Sync collaboration state
  useEffect(() => {
    setIsLiveMode(collaboration.isLiveMode);
    setOnlineUsersCount(collaboration.onlineUsers.length);
  }, [collaboration.isLiveMode, collaboration.onlineUsers]);

  const handleGoLive = () => {
    collaboration.toggleLiveMode();
  };

  const { tags: globalTags, loadTags } = useTagStore();

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  // ─── TipTap Editor Instance ────────────────────────────────────────────
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: { HTMLAttributes: { class: 'code-block' } },
      }),
      Link.configure({
        openOnClick: true,
        autolink: true,
        HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
      }),
      ImageExt.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: { class: 'editor-image' },
      }),
      Placeholder.configure({ placeholder: 'Start writing...' }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: note?.content || '',
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
      },
      handleDrop: (view, event, _slice, moved) => {
        if (!moved && event.dataTransfer?.files.length) {
          const files = Array.from(event.dataTransfer.files);
          files.forEach(file => {
            if (file.type.startsWith('image/')) {
              const reader = new FileReader();
              reader.onload = () => {
                const src = reader.result as string;
                view.dispatch(view.state.tr.replaceSelectionWith(
                  view.state.schema.nodes.image.create({ src })
                ));
              };
              reader.readAsDataURL(file);
            }
          });
          return true;
        }
        return false;
      },
      handlePaste: (view, event) => {
        const items = Array.from(event.clipboardData?.items || []);
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            event.preventDefault();
            const file = item.getAsFile();
            if (!file) continue;
            const reader = new FileReader();
            reader.onload = () => {
              const src = reader.result as string;
              view.dispatch(view.state.tr.replaceSelectionWith(
                view.state.schema.nodes.image.create({ src })
              ));
            };
            reader.readAsDataURL(file);
            return true;
          }
        }
        return false;
      },
    },
  });

  // Sync content when switching notes
  useEffect(() => {
    if (note && editor) {
      const currentHTML = editor.getHTML();
      if (note.content !== currentHTML) {
        editor.commands.setContent(note.content || '');
        setContent(note.content || '');
      }
      setTitle(note.title || '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId, note?.id]);

  // ─── File Attachment Handler ───────────────────────────────────────────
  const { openFilePicker, openImagePicker, fileInputRef, imageInputRef, handleFileChange, handleImageChange } = useFileAttachment({
    onInsertHTML: (html: string) => {
      editor?.chain().focus().insertContent(html).run();
    },
    onInsertImage: (src: string, alt?: string) => {
      editor?.chain().focus().setImage({ src, alt: alt || '' }).run();
    },
    onPDFAttach: (dataUrl: string, fileName: string, fileSize: number) => {
      setPdfAttachments(prev => [...prev, { dataUrl, fileName, fileSize }]);
    },
    onCSVAttach: (dataUrl: string, fileName: string, fileSize: number) => {
      setCsvAttachments(prev => [...prev, { dataUrl, fileName, fileSize }]);
    },
    onExcelAttach: (dataUrl: string, fileName: string, fileSize: number) => {
      setExcelAttachments(prev => [...prev, { dataUrl, fileName, fileSize }]);
    },
  });

  const isDirty = useMemo(() => {
    if (!note) return false;
    return content !== note.content || title !== note.title;
  }, [content, title, note]);

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
          title="Create a new note"
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

  const creator = null; // No mock authors
  const lastEditor_member = null;

  const handleAddTag = (tagName: string) => {
    if (tagName.trim() && note) {
      useNoteStore.getState().addTag(note.id, tagName.trim());
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
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message || 'Failed to save version');
      } else {
        toast.error('Failed to save version');
      }
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
    } catch {
      toast.error('Failed to copy share link');
    }
  };

  const handleAiSuggest = () => {
    if (onAiClick) onAiClick();
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'AI is analyzing your note...',
        success: 'AI Suggested: Try adding a summary section for better clarity.',
        error: 'AI failed to generate suggestions',
      }
    );
  };

  const handleAddBlock = () => {
    editor?.chain().focus().insertContent('<h2>New Section</h2><p>Start writing here...</p>').run();
    toast.info('New section block added');
  };

  // ─── Emoji Insert ──────────────────────────────────────────────────────
  const handleEmojiSelect = (emoji: string) => {
    editor?.chain().focus().insertContent(emoji).run();
  };

  // ─── Link Insert ───────────────────────────────────────────────────────
  const handleLinkInsert = (url: string, text: string) => {
    if (editor) {
      const { from, to } = editor.state.selection;
      const hasSelection = from !== to;
      if (hasSelection) {
        editor.chain().focus().setLink({ href: url }).run();
      } else {
        editor.chain().focus().insertContent(`<a href="${url}" target="_blank">${text}</a>`).run();
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background h-full overflow-hidden relative">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.pptx,image/*"
        onChange={handleFileChange}
        className="hidden"
        multiple
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
        multiple
      />

      {/* ─── Top Header Bar ─────────────────────────────────────────────── */}
      <div className="h-12 flex items-center justify-between px-4 shrink-0 border-b border-border/50">
        <div className="flex items-center gap-1 text-[11px] sm:text-[13px] text-muted-foreground min-w-0 flex-1 mr-4 overflow-hidden">
          {!isPanelOpen && (
            <>
              <span className="hover:bg-accent px-1.5 py-0.5 rounded cursor-pointer transition-colors shrink-0 hidden lg:block truncate max-w-[100px]">
                {activeWorkspace?.name || 'Workspace'}
              </span>
              <ChevronRight size={12} className="text-border shrink-0 hidden lg:block" />
            </>
          )}
          <span className="px-1.5 py-0.5 rounded truncate text-foreground font-extrabold flex-1 min-w-0">
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
            {/* Team viewing indicator removed or replaced with dynamic logic later */}

            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9 gap-1.5 text-muted-foreground" 
              onClick={handleShare}
              title="Share this note"
            >
              <Share2 size={16} /> Share
            </Button>
            <Button
              variant="ghost" size="sm"
              className="h-9 w-9 text-muted-foreground"
              onClick={() => {
                togglePin(note.id);
                toast.info(note.isPinned ? 'Note unpinned' : 'Note pinned');
              }}
              title={note.isPinned ? "Unpin note" : "Pin note"}
            >
              <Pin size={16} className={cn(note.isPinned && 'fill-amber-500 text-amber-500')} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9 w-9 text-primary opacity-70"
              onClick={handleAiSuggest}
              title="AI Assistant Suggestion"
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
              title="Save version history (Commit)"
            >
              <Save size={16} />
              <span className="hidden sm:inline">Commit</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 text-muted-foreground hover:bg-accent rounded-lg"
              onClick={onTogglePanel}
              title={isPanelOpen ? "Close side panel" : "Open side panel"}
            >
              {isPanelOpen ? <PanelRightClose size={18} /> : <PanelRight size={18} />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 text-muted-foreground" 
              onClick={handleDelete}
              title="Delete this note"
            >
              <Trash2 size={16} />
            </Button>
          </div>

          <div className="flex sm:hidden items-center gap-1">
             <Button 
               variant={isDirty ? 'default' : 'ghost'} 
               size="sm" 
               onClick={handleSave} 
               disabled={!isDirty} 
               className="h-8 w-8 p-0"
               title="Commit changes"
             >
                <Save size={16} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={onTogglePanel}
                title="Toggle sidebar"
              >
                {isPanelOpen ? <PanelRightClose size={16} /> : <PanelRight size={16} />}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 text-muted-foreground" 
                onClick={handleShare}
                title="Share note"
              >
                <MoreHorizontal size={18} />
              </Button>
          </div>
        </div>
      </div>

      {/* ─── Editor Toolbar ─────────────────────────────────────────────── */}
      <div className="relative">
        <EditorToolbar
          editor={editor}
          onEmojiClick={() => setShowEmojiPicker(prev => !prev)}
          onLinkClick={() => setShowLinkDialog(true)}
          onImageClick={openImagePicker}
          onFileClick={openFilePicker}
          onGoLiveClick={handleGoLive}
          isLiveMode={isLiveMode}
          onlineUsersCount={onlineUsersCount}
        />
        <EmojiPicker
          isOpen={showEmojiPicker}
          onClose={() => setShowEmojiPicker(false)}
          onSelect={handleEmojiSelect}
        />
      </div>

      {/* ─── Editor Content Area ────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto w-full">
        <div className="max-w-3xl mx-auto px-6 sm:px-12 pt-12 pb-32">
          <div className="mb-4 opacity-0 hover:opacity-100 transition-opacity group flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg border-2 border-dashed border-border flex items-center justify-center hover:border-primary/50 hover:bg-accent transition-all cursor-pointer text-muted-foreground"
              onClick={handleAddBlock}
              title="Add new content block"
            >
              <Plus size={18} />
            </div>
          </div>

          <textarea
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={() => {
              if (note && title !== note.title) {
                renameNote(note.id, title);
                toast.success('Note renamed');
              }
            }}
            rows={1}
            placeholder="Untitled"
            className="w-full text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground bg-transparent border-none focus:ring-0 resize-none outline-none mb-6 placeholder:text-muted-foreground/20 leading-[1.1] transition-all"
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
                {lastEditor_member && lastEditor_member.id !== creator.id && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ backgroundColor: lastEditor_member.color }}>
                      {lastEditor_member.initials[0]}
                    </div>
                    <span className="text-xs text-muted-foreground/60">
                      last edited by <span className="font-semibold" style={{ color: lastEditor_member.color }}>{lastEditor_member.name}</span>
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
                        title={`Remove tag: ${t}`}
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
                    title="Add new tag"
                  >
                    <Plus size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ─── TipTap Rich Text Editor ─────────────────────────────────── */}
          {editor && <EditorContent editor={editor} />}

          {/* ─── File Attachments ─────────────────────────────────────────── */}
          {pdfAttachments.map((pdf, i) => (
            <FileViewerWithComments
              key={`pdf-${i}`}
              fileType="pdf"
              dataUrl={pdf.dataUrl}
              fileName={pdf.fileName}
              fileSize={pdf.fileSize}
              onClose={() => setPdfAttachments(prev => prev.filter((_, idx) => idx !== i))}
            />
          ))}
          {csvAttachments.map((csv, i) => (
            <FileViewerWithComments
              key={`csv-${i}`}
              fileType="csv"
              dataUrl={csv.dataUrl}
              fileName={csv.fileName}
              fileSize={csv.fileSize}
              onClose={() => setCsvAttachments(prev => prev.filter((_, idx) => idx !== i))}
            />
          ))}
          {excelAttachments.map((excel, i) => (
            <FileViewerWithComments
              key={`excel-${i}`}
              fileType="excel"
              dataUrl={excel.dataUrl}
              fileName={excel.fileName}
              fileSize={excel.fileSize}
              onClose={() => setExcelAttachments(prev => prev.filter((_, idx) => idx !== i))}
            />
          ))}
        </div>
      </div>

      {/* ─── Link Insert Dialog ─────────────────────────────────── */}
      <LinkInsertDialog
        isOpen={showLinkDialog}
        onClose={() => setShowLinkDialog(false)}
        onInsert={handleLinkInsert}
        initialText={editor?.state.selection.empty ? '' : editor?.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to) || ''}
      />
      
      {/* ─── Collaboration Indicator ─────────────────────────────────── */}
      {isLiveMode && (
        <CollaborationIndicator
          fileName={note?.title || 'Untitled'}
          isLiveMode={isLiveMode}
          onToggleLiveMode={handleGoLive}
        />
      )}
      
      {/* ─── Commit Modal ───────────────────────────────────────── */}
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
