import { useState, useEffect } from 'react';
import { githubService } from '../services/githubService';
import type { GithubRepository } from '../services/githubService';
import { Github, RefreshCw, FolderGit2, Star, Plus, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { GithubInsightsDashboard } from './GithubInsightsDashboard';
import { GithubProfileCard } from './GithubProfileCard';

export const GithubConnectPage = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [repositories, setRepositories] = useState<GithubRepository[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkConnection = async () => {
      setIsCheckingAuth(true);
      const connected = await githubService.isConnected();
      setIsConnected(connected);
      setIsCheckingAuth(false);
    };
    checkConnection();
  }, []);

  const loadRepositories = async () => {
    setIsLoadingRepos(true);
    try {
      const repos = await githubService.getRepositories();
      setRepositories(repos);
    } catch (error) {
      console.error('Failed to load repositories:', error);
    } finally {
      setIsLoadingRepos(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      loadRepositories();
    }
  }, [isConnected]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await githubService.connect();
      // Redirect happens in githubService.connect()
    } catch (error) {
      console.error('Connection failed:', error);
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await githubService.disconnect();
    setIsConnected(false);
    setRepositories([]);
  };

  const handleSync = async (repoId: string) => {
    await githubService.syncRepository(repoId);
    setRepositories(repos => repos.map(r => 
      r.id === repoId ? { ...r, synced: true } : r
    ));
  };

  if (isCheckingAuth) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-500 dark:text-zinc-400">Checking GitHub connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 max-w-5xl mx-auto w-full pt-4">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
              INTEGRATIONS
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
            <Github className="w-8 h-8" />
            GitHub Connection
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
            Link your repositories to write Contextual Knowledge documentation directly on top of your source code and commit history.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {!isConnected ? (
            <button 
              onClick={handleConnect}
              disabled={isConnecting}
              className="h-10 px-6 rounded-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-lg flex items-center gap-2"
            >
              {isConnecting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4" />}
              {isConnecting ? 'Connecting...' : 'Connect GitHub'}
            </button>
          ) : (
             <button 
              onClick={handleDisconnect}
              className="h-10 px-6 rounded-md bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-900/50 text-sm font-semibold transition-colors"
            >
              Disconnect Account
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      {isConnected && (
        <div className="space-y-6">
          <GithubProfileCard />
          <GithubInsightsDashboard />
          
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <FolderGit2 className="text-indigo-500" />
              Your Repositories
            </h2>
            <button 
              onClick={loadRepositories}
              className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingRepos ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingRepos ? (
              [1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 h-48 animate-pulse"></div>
              ))
            ) : repositories.length === 0 ? (
              <div className="col-span-full py-12 text-center text-zinc-500 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl">
                No repositories found on this account.
              </div>
            ) : (
              repositories.map(repo => (
                <div key={repo.id} className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col group hover:border-indigo-500/50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                     <div>
                       <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-500 transition-colors">
                         {repo.name}
                       </h3>
                       <p className="text-xs text-zinc-400 truncate max-w-[200px] mt-0.5">{repo.fullName}</p>
                     </div>
                     <span className="flex items-center gap-1 text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full">
                       <Star className="w-3 h-3 text-amber-500" /> {repo.stargazersCount}
                     </span>
                  </div>
                  
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 flex-1 line-clamp-2 mb-4">
                    {repo.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                       <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                       <span className="text-xs text-zinc-500 font-medium">{repo.language}</span>
                    </div>
                    <span className="text-xs text-zinc-400">
                      Updated {formatDistanceToNow(new Date(repo.updatedAt))} ago
                    </span>
                  </div>

                  <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    {repo.synced ? (
                      <button 
                        onClick={() => navigate(`/repository/${repo.id}`)}
                        className="w-full h-9 rounded-md bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-sm font-medium border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-2 transition-colors cursor-pointer group/btn"
                      >
                        ✓ Synced <ArrowRight className="w-4 h-4 text-emerald-500 opacity-0 -ml-4 group-hover/btn:opacity-100 group-hover/btn:ml-0 transition-all" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleSync(repo.id)}
                        className="w-full h-9 rounded-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> Sync Repository
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {!isConnected && (
         <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/20 p-12 text-center mt-8">
           <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
             <Github className="w-8 h-8 text-zinc-400" />
           </div>
           <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">No Account Connected</h3>
           <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mb-6">
             Authenticate with your GitHub account to import repositories and start assigning knowledge notes to your code.
           </p>
           <button 
              onClick={handleConnect}
              disabled={isConnecting}
              className="h-10 px-6 rounded-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-lg"
            >
              {isConnecting ? 'Connecting...' : 'Connect GitHub'}
            </button>
         </div>
      )}

    </div>
  );
};

export default GithubConnectPage;
