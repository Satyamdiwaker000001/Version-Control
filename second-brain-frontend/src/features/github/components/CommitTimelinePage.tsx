import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { githubService } from '../services/githubService';
import type { GithubRepository, GithubCommit } from '../services/githubService';
import { ArrowLeft, GitCommit, MessageSquarePlus, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNotesContext } from '@/shared/contexts/NotesContext';

export const CommitTimelinePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [repo, setRepo] = useState<GithubRepository | null>(null);
  const [commits, setCommits] = useState<GithubCommit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { notes } = useNotesContext();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (id) {
        const repos = await githubService.getRepositories();
        const foundRepo = repos.find(r => r.id === id);
        if (foundRepo) setRepo(foundRepo);
        
        const fetchedCommits = await githubService.getRepoCommits();
        setCommits(fetchedCommits);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [id]);

  if (isLoading) {
    return <div className="p-8 animate-pulse text-zinc-500 text-center py-20">Loading commit timeline...</div>;
  }

  if (!repo) {
    return <div className="p-8 text-red-500">Repository not found.</div>;
  }

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 max-w-4xl mx-auto w-full pt-4 relative">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6 mb-2">
        <div>
          <button 
            onClick={() => navigate(`/repository/${repo.id}`)}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 hover:text-zinc-900 border border-zinc-200 dark:border-zinc-700 dark:hover:text-white px-2 py-1 rounded transition-colors mb-4"
          >
            <ArrowLeft size={14} /> Back to Repository
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center border border-indigo-200 dark:border-indigo-800/50">
              <GitCommit className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
                Commit History
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">{repo.fullName}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="relative pl-6 sm:pl-10 pb-20">
        {/* Vertical Timeline Line */}
        <div className="absolute top-4 left-[27px] sm:left-[43px] bottom-0 w-px bg-zinc-200 dark:bg-zinc-800 rounded-full" />
        
        <div className="space-y-10">
          {commits.map((commit) => {
            // Find if any notes are attached to this exact commit
            const attachedNotes = notes.filter(n => n.linkedCommitSha === commit.sha);
            
            return (
              <div key={commit.sha} className="relative group">
                {/* Timeline Node Dot */}
                <div className="absolute -left-[31px] sm:-left-[39px] mt-1.5 w-4 h-4 rounded-full bg-white dark:bg-zinc-950 border-4 border-indigo-500 group-hover:scale-125 transition-transform duration-300 z-10" />
                
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm hover:border-indigo-500/30 transition-colors ml-4 sm:ml-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-start gap-2">
                        {commit.message}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                        <span className="flex items-center gap-1">
                          <User size={14} className="text-zinc-400" /> {commit.author}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                           {commit.sha.substring(0, 7)}
                        </span>
                        <span>{formatDistanceToNow(new Date(commit.date))} ago</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex gap-4 text-xs font-semibold">
                      <span className="text-emerald-600 dark:text-emerald-400">+{commit.addedFiles} additions</span>
                      <span className="text-amber-600 dark:text-amber-400">~{commit.modifiedFiles} modified</span>
                      <span className="text-red-600 dark:text-red-400">-{commit.removedFiles} removed</span>
                    </div>
                    
                    <div className="ml-auto w-px h-6 bg-zinc-200 dark:bg-zinc-800" />
                    
                    <button 
                      onClick={() => navigate('/editor', { state: { linkedCommitSha: commit.sha, linkedRepositoryId: repo.id } })}
                      className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-md"
                    >
                      <MessageSquarePlus size={14} /> Attach Context Note
                    </button>
                  </div>
                  
                  {/* Context Note Expansion Area */}
                  {attachedNotes.length > 0 && (
                    <div className="mt-4 break-words">
                      <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2 pl-1 border-l-2 border-indigo-500">
                        Documented Context
                      </div>
                      <div className="flex flex-col gap-2">
                        {attachedNotes.map(note => (
                          <div key={note.id} className="text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                             <div className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{note.title}</div>
                             <div className="line-clamp-2">{note.content}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CommitTimelinePage;
