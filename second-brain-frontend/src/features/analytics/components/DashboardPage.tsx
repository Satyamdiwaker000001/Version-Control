import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pin, Clock, GitCommit, FileText, Activity, Hash, Users, Network, Plus, FolderSync, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import type { Note } from '@/shared/types';
import { useNotesContext } from '@/shared/contexts/NotesContext';
import { useWorkspaceContext } from '@/shared/contexts/WorkspaceContext';
import { useAuthContext } from '@/shared/contexts/AuthContext';
import { useTagStore } from '@/features/tags/store/useTagStore';
import { TagBadge } from '@/shared/ui/TagBadge';
import { cn } from '@/shared/utils/cn';
import { LoadingSpinner } from '@/shared/ui/LoadingSpinner';
import { ErrorState } from '@/shared/ui/ErrorState';

export const DashboardPage = () => {
  const { notes, fetchNotes, isLoading: isNotesLoading, error: notesError } = useNotesContext();
  const { tags, loadTags, isLoading: isTagsLoading, error: tagsError } = useTagStore();
  const { token } = useAuthContext();
  const { activeWorkspace: ctxWorkspace, workspaces } = useWorkspaceContext();
  const activeWorkspace = ctxWorkspace || workspaces[0];
  const navigate = useNavigate();
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);

  useEffect(() => {
    if (activeWorkspace && token) {
      fetchNotes(activeWorkspace.id, token);
      loadTags();
    }
  }, [activeWorkspace, token, fetchNotes, loadTags]);

  const pinnedNotes = useMemo(
    () => notes.filter((n: Note) => n.isPinned),
    [notes],
  );

  const recentNotes = useMemo(
    () =>
      [...notes]
        .sort(
          (a: Note, b: Note) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )
        .slice(0, 5),
    [notes],
  );

  const filteredPinnedNotes = useMemo(
    () =>
      activeTagFilter
        ? pinnedNotes.filter((n) => n.tags.includes(activeTagFilter))
        : pinnedNotes,
    [pinnedNotes, activeTagFilter],
  );

  const filteredRecentNotes = useMemo(
    () =>
      activeTagFilter
        ? recentNotes.filter((n) => n.tags.includes(activeTagFilter))
        : recentNotes,
    [recentNotes, activeTagFilter],
  );

  const handleTagClick = (tagName: string) => {
    setActiveTagFilter((current) => (current === tagName ? null : tagName));
  };

  const tagUsage = useMemo(
    () =>
      tags.map((tag) => ({
        ...tag,
        usageCount: notes.filter((note) => note.tags.includes(tag.name)).length,
      })),
    [tags, notes],
  );

  if (isNotesLoading || isTagsLoading) {
    return (
      <LoadingSpinner
        fullPage
        label="Synchronizing your second brain..."
      />
    );
  }

  const error = notesError || tagsError;
  if (error) {
    return (
      <ErrorState
        title="Connection Interrupted"
        error={error}
        onRetry={() => window.location.reload()}
        retryLabel="Retry synchronization"
        fullPage
      />
    );
  }

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Workspace Header Overview */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              {activeWorkspace.role.toUpperCase()}
            </span>
            <span className="text-zinc-500 text-sm">{activeWorkspace.members?.length || 1} Members</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            {activeWorkspace.name}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Here's what is happening in your knowledge base today.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/github')} className="h-9 px-4 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm flex items-center gap-2">
            <FolderSync size={16} /> Repositories
          </button>
          <button onClick={() => navigate('/graph')} className="h-9 px-4 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm items-center gap-2 hidden sm:flex">
            <Share2 size={16} /> Open Graph
          </button>
          <button onClick={() => navigate('/editor?new=true')} className="h-9 px-4 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors shadow-sm shadow-indigo-500/20 flex items-center gap-2">
            <Plus size={16} /> Create Note
          </button>
        </div>
      </header>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between group cursor-default hover:border-indigo-500/30 transition-colors">
          <div>
            <p className="text-sm font-medium text-zinc-500">Total Notes</p>
            <p className="text-3xl font-bold text-zinc-900 dark:text-white mt-1">{notes.length}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
            <FileText size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between group cursor-default hover:border-emerald-500/30 transition-colors">
          <div>
            <p className="text-sm font-medium text-zinc-500">Connections</p>
            <p className="text-3xl font-bold text-zinc-900 dark:text-white mt-1">
               {notes.reduce((acc, note) => acc + note.backlinks.length, 0)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
            <Network size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between group cursor-default hover:border-amber-500/30 transition-colors">
          <div>
            <p className="text-sm font-medium text-zinc-500">Active Tags</p>
            <p className="text-3xl font-bold text-zinc-900 dark:text-white mt-1">{tags.length}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
            <Hash size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between group cursor-default hover:border-blue-500/30 transition-colors">
          <div>
            <p className="text-sm font-medium text-zinc-500">Members</p>
            <p className="text-3xl font-bold text-zinc-900 dark:text-white mt-1">
              {activeWorkspace.type === 'team' ? activeWorkspace.members?.length || 1 : 1}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
            <Users size={20} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Span: Pinned & Recent */}
        <div className="lg:col-span-2 space-y-8">
          {/* Tag Filter Row */}
          {tags.length > 0 && (
            <section className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Hash size={16} className="text-zinc-400" />
                  Tags
                </h2>
                {activeTagFilter && (
                  <button
                    type="button"
                    onClick={() => setActiveTagFilter(null)}
                    className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 underline-offset-2 hover:underline"
                  >
                    Clear filter
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {tagUsage.map((tag) => (
                  <TagBadge
                    key={tag.id}
                    name={tag.name}
                    color={tag.color}
                    count={tag.usageCount}
                    active={activeTagFilter === tag.name}
                    onClick={() => handleTagClick(tag.name)}
                  />
                ))}
              </div>
            </section>
          )}
          
          {/* Pinned Notes Section */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-white">
              <Pin size={18} className="text-zinc-400" /> Pinned Ideas
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredPinnedNotes.length === 0 ? (
                <div className="col-span-full rounded-xl border border-dashed border-zinc-200 bg-zinc-50/60 p-6 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/40">
                  {activeTagFilter
                    ? `No pinned notes found with #${activeTagFilter}.`
                    : 'Pin important notes to keep them easily accessible here.'}
                </div>
              ) : (
                filteredPinnedNotes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => navigate(`/editor?noteId=${note.id}`)}
                    className="group relative cursor-pointer overflow-hidden rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-500/30 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-indigo-500 to-purple-500 opacity-0 transition-opacity group-hover:opacity-100" />
                    <h3 className="mb-2 truncate pr-6 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                      {note.title}
                    </h3>
                    <Pin size={14} className="absolute right-5 top-5 text-indigo-500" />
                    <p className="mb-4 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
                      {note.content.substring(0, 160) || 'No content yet.'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <div className="flex flex-wrap gap-1.5">
                        {note.tags.slice(0, 2).map((tag) => (
                          <TagBadge
                            key={tag}
                            name={tag}
                            color="#a1a1aa"
                            active={activeTagFilter === tag}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTagClick(tag);
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-zinc-500">
                        {note.versionCount} {note.versionCount === 1 ? 'commit' : 'commits'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Recent Notes List */}
          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock size={18} className="text-zinc-400" /> Recently Edited
            </h2>
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {filteredRecentNotes.length === 0 ? (
                <div className="p-8 text-center text-zinc-500">
                  {activeTagFilter
                    ? `No recent notes found with #${activeTagFilter}.`
                    : 'No notes found. Create your first note!'}
                </div>
              ) : filteredRecentNotes.map((note) => (
                <div 
                  key={note.id} 
                  onClick={() => navigate(`/editor?noteId=${note.id}`)}
                  className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 transition-colors shrink-0">
                      <FileText size={18} />
                    </div>
                    <div>
                      <h4 className="font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-500 transition-colors line-clamp-1">{note.title}</h4>
                      <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-2">
                        Updated {formatDistanceToNow(new Date(note.updatedAt))} ago
                        {note.tags.length > 0 && (
                          <>
                            <span>•</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTagClick(note.tags[0]);
                              }}
                              className="inline-flex items-center gap-1 text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                            >
                              <Hash size={10} /> {note.tags[0]}
                            </button>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 text-xs text-zinc-500 shrink-0 pl-4">
                     <span className="flex items-center gap-1 font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded"><GitCommit size={12}/> {note.latestVersionId.substring(0, 7)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Right Span: Activity Timeline */}
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity size={18} className="text-zinc-400" /> Recent Activity
          </h2>
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm h-[500px] overflow-y-auto w-full max-w-sm mx-auto lg:max-w-none">
             <div className="relative pl-6 border-l-2 border-zinc-100 dark:border-zinc-800 space-y-8 pb-4">
                
                {filteredRecentNotes.length === 0 ? (
                  <p className="text-sm text-zinc-500 italic">
                    {activeTagFilter
                      ? `No recent activity for notes tagged #${activeTagFilter}.`
                      : 'No recent activity detected.'}
                  </p>
                ) : filteredRecentNotes.map((note, index) => (
                  <div key={note.id} className="relative">
                    <span className={cn(
                      "absolute -left-[35px] top-1 rounded-full w-5 h-5 border-2 border-white dark:border-zinc-900 flex items-center justify-center",
                      index === 0 ? "bg-indigo-100 dark:bg-indigo-900" : "bg-zinc-100 dark:bg-zinc-800"
                    )}>
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        index === 0 ? "bg-indigo-500" : "bg-zinc-400"
                      )}></div>
                    </span>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 break-words">
                      Updated <span 
                        onClick={() => navigate(`/editor?noteId=${note.id}`)}
                        className="text-indigo-500 cursor-pointer hover:underline"
                      >
                        {note.title}
                      </span>
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {formatDistanceToNow(new Date(note.updatedAt))} ago
                    </p>
                  </div>
                ))}

                <div className="relative">
                  <span className="absolute -left-[35px] top-1 rounded-full w-5 h-5 bg-emerald-100 dark:bg-emerald-900 border-2 border-white dark:border-zinc-900 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  </span>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 break-words">Workspace session started in <span className="font-bold">{activeWorkspace.name}</span></p>
                  <p className="text-xs text-zinc-500 mt-1">Recently</p>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
