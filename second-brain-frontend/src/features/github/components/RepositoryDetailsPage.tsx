import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { githubService } from '../services/githubService';
import type { GithubRepository } from '../services/githubService';
import { FileText, ArrowLeft, Star, GitCommit, Search, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNotesContext } from '@/shared/contexts/NotesContext';
import { useWorkspaceContext } from '@/shared/contexts/WorkspaceContext';
import { useAuthContext } from '@/shared/contexts/AuthContext';

export const RepositoryDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [repo, setRepo] = useState<GithubRepository | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { notes, fetchNotes } = useNotesContext();
  const { activeWorkspace } = useWorkspaceContext();
  const { token } = useAuthContext();

  // Get notes associated with this repository
  const repoNotes = useMemo(
    () => notes.filter((n) => n.linkedRepositoryId === id),
    [notes, id],
  );

  useEffect(() => {
    const fetchRepo = async () => {
      setIsLoading(true);
      const repos = await githubService.getRepositories();
      const foundRepo = repos.find(r => r.id === id);
      if (foundRepo) {
        setRepo(foundRepo);
      }
      setIsLoading(false);
    };
    
    if (id) {
      fetchRepo();
    }
  }, [id]);

  useEffect(() => {
    if (!activeWorkspace || !token) return;
    void fetchNotes(activeWorkspace.id, token);
  }, [activeWorkspace, token, fetchNotes]);

  if (isLoading) {
    return <div className="p-8 animate-pulse text-zinc-500">Loading repository details...</div>;
  }

  if (!repo) {
    return <div className="p-8 text-red-500">Repository not found.</div>;
  }

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 max-w-5xl mx-auto w-full pt-4">
      
      {/* Header element */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6 mb-2">
        <div>
          <button 
            onClick={() => navigate('/github')}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 hover:text-zinc-900 border border-zinc-200 dark:border-zinc-700 dark:hover:text-white px-2 py-1 rounded transition-colors mb-4"
          >
            <ArrowLeft size={14} /> Back to Integrations
          </button>
          
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              {repo.name}
            </h1>
            <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
              {repo.language}
            </span>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-xl text-sm">
            {repo.description}
          </p>
          
          <div className="flex items-center gap-4 mt-4 text-xs font-medium text-zinc-500">
             <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-500" /> {repo.stargazersCount} Stars</span>
             <span className="flex items-center gap-1.5"><GitCommit className="w-4 h-4" /> Updated {formatDistanceToNow(new Date(repo.updatedAt))} ago</span>
             <span className="text-zinc-400">{repo.fullName}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="h-10 px-4 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors shadow-md flex items-center gap-2">
            <Plus size={16} /> Document Repo
          </button>
        </div>
      </header>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">Documented Notes</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">{repoNotes.length}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">Knowledge Coverage</p>
          <div className="flex items-end gap-2 mt-1">
             <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">12%</p>
             <p className="text-xs text-zinc-400 mb-1">of files documented</p>
          </div>
        </div>
        <div onClick={() => navigate(`/repository/${repo.id}/commits`)} className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm cursor-pointer hover:border-indigo-500/50 transition-colors group">
          <p className="text-sm font-medium text-zinc-500 group-hover:text-indigo-500 transition-colors">Commit Timeline</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1 flex items-center gap-2">
            View Graph <GitCommit className="text-zinc-400 group-hover:text-indigo-500 transition-colors" />
          </p>
        </div>
      </div>

      {/* Notes List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <FileText className="text-indigo-500" /> Linked Knowledge Notes
          </h2>
          <div className="relative w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input type="text" placeholder="Search repository notes..." className="w-full h-8 pl-8 pr-3 text-xs rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          </div>
        </div>
        
        {repoNotes.length === 0 ? (
          <div className="py-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/20 text-center flex flex-col items-center">
            <FileText className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-3" />
            <h3 className="text-zinc-900 dark:text-zinc-100 font-medium">No notes created yet</h3>
            <p className="text-zinc-500 text-sm mt-1 max-w-sm">
              Link architectural decisions, API documentation, or code logic explanations to this repository.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {repoNotes.map(note => (
              <div 
                key={note.id} 
                onClick={() => navigate(`/editor?noteId=${note.id}`)}
                className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-indigo-500/30 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-2">
                   <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-500 transition-colors line-clamp-1">
                     {note.title}
                   </h3>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4">
                  {note.content.substring(0, 100)}...
                </p>
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <div className="flex gap-2">
                    {note.tags.map((tag, i) => (
                      <span key={i} className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">#{tag}</span>
                    ))}
                  </div>
                  <span>{formatDistanceToNow(new Date(note.updatedAt))} ago</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default RepositoryDetailsPage;
