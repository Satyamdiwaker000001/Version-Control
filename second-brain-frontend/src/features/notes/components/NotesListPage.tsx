import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Trash2, Share2, Clock, Tag as TagIcon, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/utils/cn';
import { useWorkspaceContext } from '@/shared/contexts/WorkspaceContext';
import { noteService, type Note } from '@/features/notes/services/noteService';
import { tagService, type Tag } from '@/features/tags/services/tagService';
import { LoadingSpinner } from '@/shared/ui/LoadingSpinner';
import { ErrorState } from '@/shared/ui/ErrorState';

export const NotesListPage = () => {
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspaceContext();
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    if (!activeWorkspace) return;
    
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load notes and tags in parallel
        const [notesData, tagsData] = await Promise.all([
          noteService.getNotes(activeWorkspace.id, {
            tags: selectedTags.length > 0 ? selectedTags : undefined,
            search: searchQuery || undefined,
          }),
          tagService.getTags(activeWorkspace.id),
        ]);
        
        setNotes(notesData);
        setTags(tagsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load notes');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeWorkspace, searchQuery, selectedTags]);

  const handleDeleteNote = async (noteId: string) => {
    if (!activeWorkspace) return;
    try {
      await noteService.deleteNote(activeWorkspace.id, noteId);
      setNotes(notes.filter(n => n.id !== noteId));
    } catch {
      setError('Failed to delete note');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.includes(new Date().getFullYear().toString()) ? undefined : 'numeric',
    });
  };

  if (!activeWorkspace) {
    return <ErrorState title="No workspace selected" description="Please select a workspace first" />;
  }

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Notes</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Manage and organize your knowledge base</p>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Search and filters */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={() => navigate('/editor')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
          >
            <Plus size={18} />
            New Note
          </button>
        </div>

        {/* Tag filters */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => {
                  setSelectedTags(
                    selectedTags.includes(tag.id)
                      ? selectedTags.filter(t => t !== tag.id)
                      : [...selectedTags, tag.id]
                  );
                }}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-colors border',
                  selectedTags.includes(tag.id)
                    ? 'bg-opacity-100 border-opacity-100'
                    : 'bg-opacity-0 border-opacity-50 hover:bg-opacity-10'
                )}
                style={{
                  backgroundColor: selectedTags.includes(tag.id) ? tag.color : 'transparent',
                  borderColor: tag.color,
                  color: selectedTags.includes(tag.id) ? 'white' : tag.color,
                }}
              >
                {tag.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notes Grid/List */}
      <div className="flex-1 overflow-y-auto">
        {loading && <LoadingSpinner />}
        
        {!loading && error && <ErrorState title="Error" description={error} />}
        
        {!loading && !error && notes.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <FileText size={48} className="text-zinc-400" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">No notes yet</h3>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">Create your first note to get started</p>
              <button
                onClick={() => navigate('/editor')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                Create Note
              </button>
            </div>
          </div>
        )}

        {!loading && !error && notes.length > 0 && (
          <AnimatePresence>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors cursor-pointer"
                  onClick={() => navigate(`/editor/${note.id}`)}
                >
                  {/* Title */}
                  <h3 className="font-semibold text-zinc-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {note.title}
                  </h3>

                  {/* Description */}
                  {note.description && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-2">
                      {note.description}
                    </p>
                  )}

                  {/* Tags */}
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {note.tags.slice(0, 3).map((tag) => {
                        const tagData = tags.find(t => t.id === tag);
                        return (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: tagData?.color || '#999' }}
                          >
                            <TagIcon size={12} />
                            {tagData?.name || 'Unknown'}
                          </span>
                        );
                      })}
                      {note.tags.length > 3 && (
                        <span className="text-xs text-zinc-500 px-2 py-1">
                          +{note.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatDate(note.updatedAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      v{note.versionCount}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/editor/${note.id}`);
                      }}
                      className="flex-1 px-2 py-1 text-xs rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Share logic
                      }}
                      className="p-1 text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      title="Share"
                    >
                      <Share2 size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(note.id);
                      }}
                      className="p-1 text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default NotesListPage;
