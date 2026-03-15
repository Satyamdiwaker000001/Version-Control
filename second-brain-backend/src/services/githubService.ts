import { Octokit } from '@octokit/rest';
import axios from 'axios';
import { logger } from '@/utils/logger';

export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  location: string | null;
  blog: string | null;
  company: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  fork: boolean;
  language: string | null;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  default_branch: string;
  pushed_at: string;
  created_at: string;
  updated_at: string;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  author: {
    login: string;
    avatar_url: string;
    html_url: string;
  } | null;
  html_url: string;
  stats: {
    additions: number;
    deletions: number;
    total: number;
  };
  files: Array<{
    filename: string;
    additions: number;
    deletions: number;
    changes: number;
    patch: string;
  }>;
}

export class GitHubService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.GITHUB_CLIENT_ID!;
    this.clientSecret = process.env.GITHUB_CLIENT_SECRET!;
    this.redirectUri = process.env.GITHUB_REDIRECT_URI!;
  }

  public getAuthUrl(): string {
    const scopes = ['user:email', 'repo', 'read:org'];
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: scopes.join(' '),
      response_type: 'code',
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  public async exchangeCodeForToken(code: string): Promise<{ access_token: string; token_type: string; scope: string }> {
    try {
      const response = await axios.post('https://github.com/login/oauth/access_token', {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        redirect_uri: this.redirectUri,
      }, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.data.error) {
        throw new Error(response.data.error_description || 'OAuth exchange failed');
      }

      return response.data;
    } catch (error) {
      logger.error('Failed to exchange code for token:', error);
      throw new Error('Failed to exchange authorization code for access token');
    }
  }

  public async getUserInfo(accessToken: string): Promise<GitHubUser> {
    try {
      const octokit = new Octokit({
        auth: accessToken,
      });

      const { data } = await octokit.rest.users.getAuthenticated();
      
      // Get user email if not public
      if (!data.email) {
        const emails = await octokit.rest.users.listEmailsForAuthenticatedUser();
        const primaryEmail = emails.data.find(email => email.primary && email.verified);
        data.email = primaryEmail?.email || null;
      }

      return data as GitHubUser;
    } catch (error) {
      logger.error('Failed to get GitHub user info:', error);
      throw new Error('Failed to fetch GitHub user information');
    }
  }

  public async getUserRepositories(accessToken: string): Promise<GitHubRepository[]> {
    try {
      const octokit = new Octokit({
        auth: accessToken,
      });

      const repositories: GitHubRepository[] = [];
      let page = 1;
      const perPage = 100;

      while (true) {
        const { data } = await octokit.rest.repos.listForAuthenticatedUser({
          page,
          per_page: perPage,
          sort: 'updated',
          direction: 'desc',
        });

        if (data.length === 0) break;

        repositories.push(...data.map(repo => ({
        ...repo,
        pushed_at: repo.pushed_at || new Date().toISOString(),
        created_at: repo.created_at || new Date().toISOString(),
        updated_at: repo.updated_at || new Date().toISOString(),
      })));
        page++;

        if (data.length < perPage) break;
      }

      return repositories;
    } catch (error) {
      logger.error('Failed to get GitHub repositories:', error);
      throw new Error('Failed to fetch GitHub repositories');
    }
  }

  public async getRepositoryCommits(
    accessToken: string,
    owner: string,
    repo: string,
    since?: string,
    until?: string,
    perPage: number = 100
  ): Promise<GitHubCommit[]> {
    try {
      const octokit = new Octokit({
        auth: accessToken,
      });

      const commits: GitHubCommit[] = [];
      let page = 1;

      while (true) {
        const { data } = await octokit.rest.repos.listCommits({
          owner,
          repo,
          page,
          per_page: perPage,
          since,
          until,
        });

        if (data.length === 0) break;

        // Get detailed commit info including stats
        for (const commit of data) {
          try {
            const { data: detailedCommit } = await octokit.rest.repos.getCommit({
              owner,
              repo,
              ref: commit.sha,
            });
            commits.push(detailedCommit as GitHubCommit);
          } catch (error) {
            // If we can't get detailed info, use basic commit
            commits.push(commit as GitHubCommit);
          }
        }

        page++;

        if (data.length < perPage) break;

        // Avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return commits;
    } catch (error) {
      logger.error('Failed to get repository commits:', error);
      throw new Error('Failed to fetch repository commits');
    }
  }

  public async getRepositoryDetails(
    accessToken: string,
    owner: string,
    repo: string
  ): Promise<GitHubRepository> {
    try {
      const octokit = new Octokit({
        auth: accessToken,
      });

      const { data } = await octokit.rest.repos.get({
        owner,
        repo,
      });

      return data as GitHubRepository;
    } catch (error) {
      logger.error('Failed to get repository details:', error);
      throw new Error('Failed to fetch repository details');
    }
  }

  public async searchRepositories(
    accessToken: string,
    query: string,
    sort: 'stars' | 'forks' | 'updated' = 'updated',
    order: 'asc' | 'desc' = 'desc'
  ): Promise<GitHubRepository[]> {
    try {
      const octokit = new Octokit({
        auth: accessToken,
      });

      const { data } = await octokit.rest.search.repos({
        q: `${query} in:name user:@me`,
        sort,
        order,
        per_page: 100,
      });

      return data.items as GitHubRepository[];
    } catch (error) {
      logger.error('Failed to search repositories:', error);
      throw new Error('Failed to search repositories');
    }
  }

  public async validateToken(accessToken: string): Promise<boolean> {
    try {
      const octokit = new Octokit({
        auth: accessToken,
      });

      await octokit.rest.users.getAuthenticated();
      return true;
    } catch (error) {
      return false;
    }
  }

  public async refreshToken(_refreshToken: string): Promise<{ access_token: string }> {
    // GitHub doesn't support token refresh via OAuth
    // Users need to re-authenticate
    throw new Error('GitHub tokens cannot be refreshed. Please re-authenticate.');
  }

  public async revokeToken(accessToken: string): Promise<void> {
    try {
      await axios.delete('https://api.github.com/applications/grants/' + accessToken, {
        auth: {
          username: this.clientId,
          password: this.clientSecret,
        },
      });
    } catch (error) {
      logger.error('Failed to revoke GitHub token:', error);
      // Don't throw error, just log it
    }
  }
}
