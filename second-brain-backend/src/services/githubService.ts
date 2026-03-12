// GitHub Integration Service
import { PrismaClient } from "@prisma/client";
import { Octokit } from "octokit";
import {
  Repository,
  CreateRepositoryInput,
  AppError,
} from "../types";

const prisma = new PrismaClient();

export const githubService = {
  // Get Octokit instance with token
  getOctokit(accessToken: string): Octokit {
    return new Octokit({
      auth: accessToken,
    });
  },

  // Link GitHub repository to workspace
  async linkRepository(
    workspaceId: string,
    userId: string,
    input: CreateRepositoryInput
  ): Promise<Repository> {
    // Verify user is workspace member
    const member = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: { userId, workspaceId },
      },
    });

    if (!member || !["owner", "admin"].includes(member.role)) {
      throw new AppError(403, "FORBIDDEN", "Only admins can link repositories");
    }

    // Check if repository already linked
    const existingRepo = await prisma.repository.findUnique({
      where: {
        workspaceId_owner_name: {
          workspaceId,
          owner: input.owner,
          name: input.name,
        },
      },
    });

    if (existingRepo) {
      throw new AppError(
        400,
        "REPO_EXISTS",
        "Repository already linked to workspace"
      );
    }

    const repo = await prisma.repository.create({
      data: {
        workspaceId,
        name: input.name,
        owner: input.owner,
        url: input.url,
        description: input.description,
        isPrivate: input.isPrivate || false,
      },
    });

    return this.formatRepository(repo);
  },

  // Get linked repositories
  async getWorkspaceRepositories(
    workspaceId: string,
    userId: string
  ): Promise<Repository[]> {
    // Verify user is workspace member
    const member = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: { userId, workspaceId },
      },
    });

    if (!member) {
      throw new AppError(403, "FORBIDDEN", "Access denied");
    }

    const repos = await prisma.repository.findMany({
      where: { workspaceId },
      orderBy: { name: "asc" },
    });

    return repos.map((repo) => this.formatRepository(repo));
  },

  // Get repository details
  async getRepositoryById(repositoryId: string, userId: string): Promise<Repository> {
    const repo = await prisma.repository.findUnique({
      where: { id: repositoryId },
      include: {
        workspace: {
          include: {
            members: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!repo || repo.workspace.members.length === 0) {
      throw new AppError(404, "REPOSITORY_NOT_FOUND", "Repository not found");
    }

    return this.formatRepository(repo);
  },

  // Unlink repository from workspace
  async unlinkRepository(
    repositoryId: string,
    userId: string
  ): Promise<void> {
    const repo = await prisma.repository.findUnique({
      where: { id: repositoryId },
      include: {
        workspace: {
          include: {
            members: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!repo) {
      throw new AppError(404, "REPOSITORY_NOT_FOUND", "Repository not found");
    }

    // Only workspace owners can unlink
    const member = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: { userId, workspaceId: repo.workspaceId },
      },
    });

    if (!member || member.role !== "owner") {
      throw new AppError(403, "FORBIDDEN", "Only owner can unlink repositories");
    }

    // Delete linked notes
    await prisma.noteRepository.deleteMany({
      where: { repositoryId },
    });

    await prisma.repository.delete({
      where: { id: repositoryId },
    });
  },

  // Get commits from GitHub
  async getCommits(
    owner: string,
    repo: string,
    accessToken: string,
    page: number = 1
  ): Promise<any[]> {
    try {
      const octokit = this.getOctokit(accessToken);

      const response = await octokit.rest.repos.listCommits({
        owner,
        repo,
        page,
        per_page: 20,
      });

      return response.data;
    } catch (error: any) {
      throw new AppError(
        400,
        "GITHUB_ERROR",
        `Failed to fetch commits: ${error.message}`
      );
    }
  },

  // Get branches from GitHub
  async getBranches(
    owner: string,
    repo: string,
    accessToken: string
  ): Promise<any[]> {
    try {
      const octokit = this.getOctokit(accessToken);

      const response = await octokit.rest.repos.listBranches({
        owner,
        repo,
        per_page: 100,
      });

      return response.data;
    } catch (error: any) {
      throw new AppError(
        400,
        "GITHUB_ERROR",
        `Failed to fetch branches: ${error.message}`
      );
    }
  },

  // Get repository issues
  async getIssues(
    owner: string,
    repo: string,
    accessToken: string,
    page: number = 1
  ): Promise<any[]> {
    try {
      const octokit = this.getOctokit(accessToken);

      const response = await octokit.rest.issues.listForRepo({
        owner,
        repo,
        state: "open",
        page,
        per_page: 20,
      });

      return response.data;
    } catch (error: any) {
      throw new AppError(
        400,
        "GITHUB_ERROR",
        `Failed to fetch issues: ${error.message}`
      );
    }
  },

  // Get pull requests
  async getPullRequests(
    owner: string,
    repo: string,
    accessToken: string,
    page: number = 1
  ): Promise<any[]> {
    try {
      const octokit = this.getOctokit(accessToken);

      const response = await octokit.rest.pulls.list({
        owner,
        repo,
        state: "open",
        page,
        per_page: 20,
      });

      return response.data;
    } catch (error: any) {
      throw new AppError(
        400,
        "GITHUB_ERROR",
        `Failed to fetch pull requests: ${error.message}`
      );
    }
  },

  // Get repository info
  async getRepositoryInfo(
    owner: string,
    repo: string,
    accessToken: string
  ): Promise<any> {
    try {
      const octokit = this.getOctokit(accessToken);

      const response = await octokit.rest.repos.get({
        owner,
        repo,
      });

      return response.data;
    } catch (error: any) {
      throw new AppError(
        400,
        "GITHUB_ERROR",
        `Failed to fetch repository info: ${error.message}`
      );
    }
  },

  // Link note to repository
  async linkNoteToRepository(
    noteId: string,
    repositoryId: string,
    userId: string
  ): Promise<void> {
    // Verify note ownership
    const note = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!note || note.userId !== userId) {
      throw new AppError(403, "FORBIDDEN", "Access denied");
    }

    // Verify repository exists
    const repo = await prisma.repository.findUnique({
      where: { id: repositoryId },
    });

    if (!repo || repo.workspaceId !== note.workspaceId) {
      throw new AppError(
        400,
        "INVALID_REPO",
        "Repository not in same workspace"
      );
    }

    // Check if already linked
    const existingLink = await prisma.noteRepository.findUnique({
      where: {
        noteId_repositoryId: { noteId, repositoryId },
      },
    });

    if (existingLink) {
      throw new AppError(400, "ALREADY_LINKED", "Note already linked to repository");
    }

    await prisma.noteRepository.create({
      data: {
        noteId,
        repositoryId,
      },
    });
  },

  // Unlink note from repository
  async unlinkNoteFromRepository(
    noteId: string,
    repositoryId: string,
    userId: string
  ): Promise<void> {
    // Verify note ownership
    const note = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!note || note.userId !== userId) {
      throw new AppError(403, "FORBIDDEN", "Access denied");
    }

    await prisma.noteRepository.delete({
      where: {
        noteId_repositoryId: { noteId, repositoryId },
      },
    });
  },

  // Helper function
  private formatRepository(repo: any): Repository {
    return {
      id: repo.id,
      workspaceId: repo.workspaceId,
      name: repo.name,
      owner: repo.owner,
      url: repo.url,
      description: repo.description,
      isPrivate: repo.isPrivate,
      language: repo.language,
      stars: repo.stars,
      lastSyncedAt: repo.lastSyncedAt,
      createdAt: repo.createdAt,
    };
  },
};
