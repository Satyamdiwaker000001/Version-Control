import { useState, useEffect } from 'react';
import { githubService, type GitHubUser } from '../services/githubService';
import { Users, BookOpen } from 'lucide-react';

export const GithubProfileCard = () => {
  const [profile, setProfile] = useState<GitHubUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await githubService.getProfile();
        setProfile(data);
      } catch (error) {
        console.error('Failed to fetch GitHub profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 mb-8 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-800"></div>
          <div className="flex-1">
            <div className="h-5 w-32 bg-zinc-200 dark:bg-zinc-800 rounded mb-2"></div>
            <div className="h-4 w-48 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm mb-8 transition-all hover:border-indigo-500/30">
      <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
          <img 
            src={profile.avatar_url} 
            alt={profile.login} 
            className="w-24 h-24 rounded-2xl border-4 border-white dark:border-zinc-800 shadow-md object-cover"
          />
          
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{profile.name || profile.login}</h2>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium">@{profile.login}</p>
              </div>
              
              <div className="flex items-center gap-4 text-sm font-medium">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span>{profile.public_repos} Repos</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300">
                  <Users className="w-4 h-4 text-emerald-500" />
                  <span>{profile.followers} Followers</span>
                </div>
              </div>
            </div>
            
            {profile.bio && (
              <p className="text-zinc-600 dark:text-zinc-300 mb-4 max-w-2xl text-sm leading-relaxed">
                {profile.bio}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
