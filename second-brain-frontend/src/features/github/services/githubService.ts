export interface GithubRepository {
  id: string;
  name: string;
  fullName: string;
  description: string;
  language: string;
  stargazersCount: number;
  updatedAt: string;
  synced: boolean;
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
  connect: async (): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.setItem('github_token', 'mock_token_123');
        resolve(true);
      }, 1000);
    });
  },

  disconnect: async (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.removeItem('github_token');
        resolve();
      }, 500);
    });
  },

  isConnected: (): boolean => {
    return !!localStorage.getItem('github_token');
  },

  getRepositories: async (): Promise<GithubRepository[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'repo1',
            name: 'second-brain-api',
            fullName: 'developer/second-brain-api',
            description: 'Backend Node.js server for the Second Brain platform',
            language: 'TypeScript',
            stargazersCount: 142,
            updatedAt: new Date().toISOString(),
            synced: true
          },
          {
            id: 'repo2',
            name: 'phishguard-ai',
            fullName: 'developer/phishguard-ai',
            description: 'Real-time phishing detection ecosystem',
            language: 'Python',
            stargazersCount: 89,
            updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            synced: false
          },
          {
            id: 'repo3',
            name: 'legacy-auth-service',
            fullName: 'developer/legacy-auth-service',
            description: 'Old JWT validation server',
            language: 'Go',
            stargazersCount: 12,
            updatedAt: new Date(Date.now() - 86400000 * 45).toISOString(),
            synced: false
          }
        ]);
      }, 600);
    });
  },
  
  syncRepository: async (repoId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Repository ${repoId} synced to workspace.`);
        resolve(true);
      }, 800);
    });
  },

  getRepoCommits: async (_repoId: string): Promise<GithubCommit[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            sha: 'a1b2c3d4e5f6',
            message: 'feat(ai): Implement knowledge extraction engine',
            author: 'Developer',
            date: new Date().toISOString(),
            addedFiles: 3, modifiedFiles: 5, removedFiles: 0
          },
          {
            sha: 'f87e6d5c4b3a',
            message: 'refactor: Move to feature-based architecture',
            author: 'Developer',
            date: new Date(Date.now() - 86400000).toISOString(),
            addedFiles: 12, modifiedFiles: 42, removedFiles: 8
          },
          {
            sha: '9c8b7a6f5e4d',
            message: 'fix(auth): Revolve JWT invalidation bug',
            author: 'Colleague',
            date: new Date(Date.now() - 86400000 * 3).toISOString(),
            addedFiles: 0, modifiedFiles: 2, removedFiles: 0
          }
        ]);
      }, 600);
    });
  }
};
