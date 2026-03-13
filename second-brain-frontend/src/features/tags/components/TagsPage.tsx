import { useEffect, useMemo, useState } from 'react';
import { useTagStore } from '../store/useTagStore';
import { useNoteStore } from '@/features/notes/store/useNoteStore';
import { Hash, FileText, Plus, X, Trash2, Pencil, ArrowUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/shared/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

const TAG_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'];

export const TagsPage = () => {
  const { tags, loadTags, isLoading, createTag, deleteTag } = useTagStore();
  const notes = useNoteStore(state => state.notes);
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'usage' | 'alpha'>('usage');
  const [isNewLabelOpen, setIsNewLabelOpen] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState(TAG_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => { loadTags(); }, [loadTags]);

  const tagMetrics = useMemo(() => {
    return tags
      .map(tag => {
        // Find notes that contain this tag name in their tags array
        const relatedNotesCount = notes.reduce((count, n) => {
          return count + (n.tags.some(tn => tn.toLowerCase() === tag.name.toLowerCase()) ? 1 : 0);
        }, 0);
        return { ...tag, usageCount: relatedNotesCount };
      })
      .filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => sortBy === 'alpha' ? a.name.localeCompare(b.name) : b.usageCount - a.usageCount);
  }, [tags, notes, search, sortBy]);

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) { toast.error('Label name cannot be empty'); return; }
    try {
      await createTag(newLabelName, newLabelColor);
      toast.success(`Tag "${newLabelName}" created`);
      setNewLabelName('');
      setNewLabelColor(TAG_COLORS[0]);
      setIsNewLabelOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create tag');
    }
  };

  const handleDelete = async (tag: { id: string, name: string }) => {
    if (!confirm(`Are you sure you want to delete tag "${tag.name}"?`)) return;
    try {
      await deleteTag(tag.id);
      toast.success(`Tag "${tag.name}" deleted`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete tag');
    }
  };

  return (
    <div className="h-full overflow-y-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-8 pb-12">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-primary/70 uppercase tracking-widest">Knowledge Labels</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mt-1">Tags</h1>
            <p className="text-muted-foreground mt-1 text-sm max-w-md">
              Organize your notes into distinct categories for better discoverability.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tags..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all w-full sm:w-44 focus:sm:w-56 placeholder:text-muted-foreground/50"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setSortBy(s => s === 'usage' ? 'alpha' : 'usage')}
                title={`Sort by ${sortBy === 'usage' ? 'name' : 'usage count'}`}
                className="h-10 w-10 flex items-center justify-center rounded-lg border border-border hover:bg-accent transition-colors text-muted-foreground hover:text-foreground shrink-0"
              >
                <ArrowUpDown size={16} />
              </button>
              <button
                onClick={() => setIsNewLabelOpen(true)}
                className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 premium-shadow shrink-0 whitespace-nowrap"
              >
                <Plus size={16} /> <span className="hidden sm:inline">New Tag</span><span className="sm:hidden">New</span>
              </button>
            </div>
          </div>
        </header>

        {/* Tags table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-muted/30 px-5 py-3 border-b border-border flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">{tagMetrics.length} tags</span>
            <span className="text-xs text-muted-foreground font-medium">
              Sorted by: {sortBy === 'alpha' ? 'Alphabetically' : 'Most Used'}
            </span>
          </div>

          {isLoading ? (
            <div className="divide-y divide-border">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-16 px-5 py-3 animate-pulse flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-muted" />
                  <div className="h-5 w-28 bg-muted rounded-full" />
                </div>
              ))}
            </div>
          ) : tagMetrics.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-muted-foreground/40 gap-3">
              <Hash size={40} />
              <p className="font-medium">{search ? 'No tags match your search' : 'No tags yet'}</p>
              {!search && <button onClick={() => setIsNewLabelOpen(true)} className="text-sm text-primary font-semibold hover:underline">Create your first tag</button>}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {tagMetrics.map(tag => (
                <div
                  key={tag.id}
                  className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-accent/40 transition-colors group"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <button
                      onClick={() => navigate(`/editor?tag=${encodeURIComponent(tag.name)}`)}
                      className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold hover:opacity-80 transition-opacity shrink-0"
                      style={{ backgroundColor: tag.color + '20', color: tag.color, border: `1px solid ${tag.color}40` }}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tag.color }} />
                      {tag.name}
                    </button>
                    <p className="text-sm text-muted-foreground truncate hidden md:block">
                      Knowledge label for {tag.name}-related notes.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                    <button
                      onClick={() => navigate(`/editor?tag=${encodeURIComponent(tag.name)}`)}
                      className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                    >
                      <FileText size={14} className="shrink-0" />
                      {tag.usageCount} <span className="hidden sm:inline">{tag.usageCount === 1 ? 'note' : 'notes'}</span>
                    </button>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setNewLabelName(tag.name); setNewLabelColor(tag.color); setEditingId(tag.id); setIsNewLabelOpen(true); }}
                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                        title="Edit tag"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(tag)}
                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        title="Delete tag"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Tag Modal */}
      <AnimatePresence>
        {isNewLabelOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
                <h3 className="font-bold text-foreground">{editingId ? 'Edit Tag' : 'New Tag'}</h3>
                <button
                  onClick={() => { setIsNewLabelOpen(false); setEditingId(null); setNewLabelName(''); }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-widest">Tag Name</label>
                  <input
                    autoFocus
                    type="text"
                    value={newLabelName}
                    onChange={e => setNewLabelName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCreateLabel()}
                    placeholder="e.g. machine-learning"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-widest">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {TAG_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setNewLabelColor(c)}
                        className={cn('w-7 h-7 rounded-full transition-all', newLabelColor === c && 'ring-2 ring-offset-2 ring-offset-card ring-foreground')}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: newLabelColor + '20', color: newLabelColor, border: `1px solid ${newLabelColor}40` }}>
                    {newLabelName || 'preview'}
                  </span>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => { setIsNewLabelOpen(false); setEditingId(null); setNewLabelName(''); }}
                    className="flex-1 py-2 rounded-lg bg-accent text-foreground text-sm font-semibold hover:bg-accent/70 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateLabel}
                    className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                  >
                    {editingId ? 'Save Changes' : 'Create Tag'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TagsPage;
