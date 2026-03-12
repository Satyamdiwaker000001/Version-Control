import { apiClient } from '@/shared/api/apiClient';

export interface GitHubRepository {
  id: string;
  name: string;
  owner: string;
  url: string;
  description?: string;
  stars: number;
  forks: number;
  language?: string;
  isPrivate: boolean;
  connectedAt: string;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

export interface GitHubBranch {
  name: string;
  isDefault: boolean;
  latestCommit: GitHubCommit;
}

export interface GitHubIssue {
  number: number;
  title: string;
  state: 'open' | 'closed';
  author: string;
  createdAt: string;
  url: string;
  labels: string[];
}

export interface ConnectGitHubInput {
  workspaceId: string;
  owner: string;
  repo: string;
}

export const githubService = {
  // Connect a GitHub repository to workspace
  async connectRepository(input: ConnectGitHubInput): Promise<GitHubRepository> {
    return apiClient.post<GitHubRepository>(
      `/workspaces/${input.workspaceId}/github/repositories`,
      { owner: input.owner, repo: input.repo }
    );
  },

  // Fetch connected repositories
  async getRepositories(workspaceId: string): Promise<GitHubRepository[]> {
    return apiClient.get<GitHubRepository[]>(`/workspaces/${workspaceId}/github/repositories`);
  },

  // Fetch a single repository
  async getRepository(workspaceId: string, repoId: string): Promise<GitHubRepository> {
    return apiClient.get<GitHubRepository>(
      `/workspaces/${workspaceId}/github/repositories/${repoId}`
    );
  },

  // Get repository commits
  async getCommits(workspaceId: string, repoId: string, limit: number = 20): Promise<GitHubCommit[]> {
    return apiClient.get<GitHubCommit[]>(
      `/workspaces/${workspaceId}/github/repositories/${repoId}/commits?limit=${limit}`
    );
  },

  // Get repository branches
  async getBranches(workspaceId: string, repoId: string): Promise<GitHubBranch[]> {
    return apiClient.get<GitHubBranch[]>(
      `/workspaces/${workspaceId}/github/repositories/${repoId}/branches`
    );
  },

  // Get repository issues
  async getIssues(workspaceId: string, repoId: string, state: 'open' | 'closed' | 'all' = 'open'): Promise<GitHubIssue[]> {
    return apiClient.get<GitHubIssue[]>(
      `/workspaces/${workspaceId}/github/repositories/${repoId}/issues?state=${state}`
    );
  },

  // Disconnect a repository
  async disconnectRepository(workspaceId: string, repoId: string): Promise<void> {
    await apiClient.delete(
      `/workspaces/${workspaceId}/github/repositories/${repoId}`
    );
  },

  // Search GitHub repositories
  async searchRepositories(query: string, limit: number = 10): Promise<any[]> {
    return apiClient.get<any[]>(`/github/search/repositories?q=${query}&limit=${limit}`);
  },

  // Get GitHub user info
  async getUserInfo(): Promise<any> {
    return apiClient.get('/github/user');
  },
};
