import apiClient, { type ApiResponse } from '@/shared/api/apiClient';
import axios from 'axios';

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
  // Test connection to backend
  testConnection: async (): Promise<boolean> => {
    try {
      console.log('Testing backend connection...');
      
      // Try with full URL first
      const baseURL = 'http://localhost:3001';
      const response = await fetch(`${baseURL}/api/github/test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      console.log('Backend test response:', data);
      return data.success;
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return false;
    }
  },

  connect: async (): Promise<void> => {
    try {
      console.log('Attempting to get GitHub auth URL...');
      
      // First test the connection
      const isBackendConnected = await githubService.testConnection();
      if (!isBackendConnected) {
        throw new Error('Backend server is not responding. Please ensure backend is running on port 3001.');
      }
      
      console.log('Backend connected, getting GitHub auth URL...');
      
      // Use full URL to avoid proxy issues
      const baseURL = 'http://localhost:3001';
      const response = await fetch(`${baseURL}/api/github/auth/url`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      console.log('GitHub auth response:', data);
      
      if (data.success && data.data?.authUrl) {
        console.log('Redirecting to GitHub OAuth URL:', data.data.authUrl);
        window.location.href = data.data.authUrl;
      } else {
        console.error('Failed to get auth URL:', data);
        throw new Error(data.message || 'Failed to get auth URL');
      }
    } catch (error: any) {
      console.error('GitHub connection error:', error);
      
      if (error.message?.includes('Failed to fetch')) {
        throw new Error('Unable to connect to the server. Please check if the backend is running on port 3001.');
      } else {
        throw new Error(error.message || 'Failed to connect to GitHub');
      }
    }
  },

  disconnect: async (): Promise<void> => {
    // Implement disconnect if backend supports it, otherwise just clear state
    // localStorage.removeItem('github_token'); // Backend handles token now
  },

  isConnected: async (): Promise<boolean> => {
    try {
      // First check if user is authenticated
      const token = localStorage.getItem('authToken');
      if (!token) {
        return false;
      }
      
      // Use the new status endpoint to check GitHub connection
      const response = await apiClient.get<ApiResponse<{ connected: boolean }>>('/github/status');
      if (response.data.success && response.data.data) {
        return response.data.data.connected;
      }
      
      return false;
    } catch (error) {
      console.log('GitHub connection check failed:', error);
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
  
  syncRepository: async (_repoId: string, owner: string, name: string): Promise<boolean> => {
    try {
      const response = await apiClient.post<ApiResponse<any>>(`/github/sync/${owner}/${name}`);
      return response.data.success;
    } catch (error) {
      console.error('Failed to sync repository:', error);
      return false;
    }
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
