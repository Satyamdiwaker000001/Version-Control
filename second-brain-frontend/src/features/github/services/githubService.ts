import apiClient, { type ApiResponse } from '@/shared/api/apiClient';

export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  followers: number;
  public_repos: number;
}

export interface GithubRepository {
  id: string;
  name: string;
  fullName: string;
  description: string;
  language: string;
  stargazersCount: number;
  updatedAt: string;
  synced: boolean;
  html_url: string;
}

export interface GithubCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
  addedFiles: number;
  modifiedFiles: number;
  removedFiles: number;
}

export const githubService = {
  connect: async (): Promise<void> => {
    const response = await apiClient.get<ApiResponse<{ authUrl: string }>>('/github/auth/url');
    if (response.data.success && response.data.data?.authUrl) {
      window.location.href = response.data.data.authUrl;
    } else {
      throw new Error(response.data.message || 'Failed to get auth URL');
    }
  },

  disconnect: async (): Promise<void> => {
    // Implement disconnect if backend supports it, otherwise just clear state
    // localStorage.removeItem('github_token'); // Backend handles token now
  },

  isConnected: async (): Promise<boolean> => {
    try {
      const response = await apiClient.get<ApiResponse<any>>('/github/profile');
      return response.data.success;
    } catch {
      return false;
    }
  },

  getProfile: async (): Promise<GitHubUser> => {
    const response = await apiClient.get<ApiResponse<GitHubUser>>('/github/profile');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch GitHub profile');
  },

  getRepositories: async (): Promise<GithubRepository[]> => {
    const response = await apiClient.get<ApiResponse<any[]>>('/github/repositories');
    if (response.data.success && response.data.data) {
      return response.data.data.map(repo => ({
        id: repo.id.toString(),
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description || '',
        language: repo.language || 'Unknown',
        stargazersCount: repo.stargazers_count,
        updatedAt: repo.updated_at,
        synced: false, // Default to false unless we have a way to check
        html_url: repo.html_url,
      }));
    }
    throw new Error(response.data.message || 'Failed to fetch repositories');
  },
  
  syncRepository: async (repoId: string): Promise<boolean> => {
    // This part might need a backend endpoint for syncing
    return true;
  },

  getRepoCommits: async (owner: string, repo: string): Promise<GithubCommit[]> => {
    const response = await apiClient.get<ApiResponse<any[]>>(`/github/commits/${owner}/${repo}`);
    if (response.data.success && response.data.data) {
      return response.data.data.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author.name,
        date: commit.commit.author.date,
        addedFiles: commit.stats?.additions || 0,
        modifiedFiles: (commit.stats?.total || 0) - (commit.stats?.additions || 0) - (commit.stats?.deletions || 0),
        removedFiles: commit.stats?.deletions || 0,
      }));
    }
    throw new Error(response.data.message || 'Failed to fetch commits');
  }
};
