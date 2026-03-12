import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspaceContext } from '@/shared/contexts/WorkspaceContext';
import { tagService, type Tag } from '@/features/tags/services/tagService';
import { LoadingSpinner } from '@/shared/ui/LoadingSpinner';
import { ErrorState } from '@/shared/ui/ErrorState';

const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#0ea5e9', // sky
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#d946ef', // fuchsia
  '#ec4899', // pink
];

interface EditingTag {
  id: string;
  name: string;
  color: string;
}

export const TagsPage = () => {
  const { activeWorkspace } = useWorkspaceContext();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTag, setEditingTag] = useState<EditingTag | null>(null);
  const [newTag, setNewTag] = useState({ name: '', color: '#3b82f6' });

  useEffect(() => {
    if (!activeWorkspace) return;
    
    const loadTags = async () => {
      try {
        setLoading(true);
        setError(null);
        const tagsData = await tagService.getTags(activeWorkspace.id);
        setTags(tagsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tags');
      } finally {
        setLoading(false);
      }
    };

    loadTags();
  }, [activeWorkspace]);

  const handleCreateTag = async () => {
    if (!activeWorkspace || !newTag.name.trim()) return;
    
    try {
      const createdTag = await tagService.createTag({
        workspaceId: activeWorkspace.id,
        name: newTag.name,
        color: newTag.color,
      });
      setTags([...tags, createdTag]);
      setNewTag({ name: '', color: '#3b82f6' });
      setShowCreateForm(false);
    } catch (err) {
      setError('Failed to create tag');
    }
  };

  const handleUpdateTag = async () => {
    if (!activeWorkspace || !editingTag) return;
    
    try {
      const updatedTag = await tagService.updateTag(activeWorkspace.id, editingTag.id, {
        name: editingTag.name,
        color: editingTag.color,
      });
      setTags(tags.map(t => t.id === editingTag.id ? updatedTag : t));
      setEditingTag(null);
    } catch (err) {
      setError('Failed to update tag');
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!activeWorkspace) return;
    
    try {
      await tagService.deleteTag(activeWorkspace.id, tagId);
      setTags(tags.filter(t => t.id !== tagId));
    } catch (err) {
      setError('Failed to delete tag');
    }
  };

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!activeWorkspace) {
    return <ErrorState title="No workspace selected" description="Please select a workspace first" />;
  }

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Tags</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Create and manage tags for organizing your notes</p>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
        >
          <Plus size={18} />
          New Tag
        </button>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4"
          >
            <h3 className="font-semibold text-zinc-900 dark:text-white">Create New Tag</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Tag name..."
                value={newTag.name}
                onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Color</label>
                <div className="grid grid-cols-7 gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewTag({ ...newTag, color })}
                      className={`w-8 h-8 rounded-lg border-2 transition-all ${
                        newTag.color === color
                          ? 'border-zinc-900 dark:border-white'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewTag({ name: '', color: '#3b82f6' });
                }}
                className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTag}
                disabled={!newTag.name.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-400 text-white rounded-lg transition-colors"
              >
                Create
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tags List */}
      <div className="flex-1 overflow-y-auto">
        {loading && <LoadingSpinner />}
        
        {!loading && error && <ErrorState title="Error" description={error} />}
        
        {!loading && !error && filteredTags.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">
                {tags.length === 0 ? 'No tags yet' : 'No matching tags'}
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                {tags.length === 0 ? 'Create your first tag to organize your notes' : 'Try adjusting your search'}
              </p>
            </div>
          </div>
        )}

        {!loading && !error && filteredTags.length > 0 && (
          <AnimatePresence>
            <div className="space-y-2">
              {filteredTags.map((tag) => (
                <motion.div
                  key={tag.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors group"
                >
                  {editingTag?.id === tag.id ? (
                    <>
                      {/* Edit mode */}
                      <input
                        type="text"
                        value={editingTag.name}
                        onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                        className="flex-1 px-3 py-1 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <div className="flex gap-1">
                        {PRESET_COLORS.map((color) => (
                          <button
                            key={color}
                            onClick={() => setEditingTag({ ...editingTag, color })}
                            className={`w-6 h-6 rounded border-2 transition-all ${
                              editingTag.color === color
                                ? 'border-zinc-900 dark:border-white'
                                : 'border-transparent'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <button
                        onClick={handleUpdateTag}
                        className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 rounded transition-colors"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => setEditingTag(null)}
                        className="p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      {/* View mode */}
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: tag.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-zinc-900 dark:text-white">{tag.name}</h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {tag.noteCount} {tag.noteCount === 1 ? 'note' : 'notes'}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingTag({ id: tag.id, name: tag.name, color: tag.color })}
                          className="p-1 text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteTag(tag.id)}
                          className="p-1 text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default TagsPage;
