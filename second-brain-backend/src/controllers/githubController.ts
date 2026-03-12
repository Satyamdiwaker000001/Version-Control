import { Request, Response } from "express";
import axios from "axios";
import { z } from "zod";
import { githubService } from "../services/githubService";
import { AppError } from "../types";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "dummy_client_id";
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "dummy_client_secret";

const LinkRepositorySchema = z.object({
  name: z.string().min(1, "Repository name required"),
  owner: z.string().min(1, "Repository owner required"),
  url: z.string().url("Invalid URL"),
  description: z.string().optional(),
  isPrivate: z.boolean().optional(),
});

export const githubController = {
  // Initiate OAuth flow
  authorize: (req: Request, res: Response) => {
    const redirectUri = `${process.env.FRONTEND_URL || "http://localhost:3000"}/github/callback`;
    const scope = "repo,user";
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=${scope}`;

    res.json({ success: true, data: { url: authUrl } });
  },

  // Exchange code for token
  exchangeToken: async (req: Request, res: Response) => {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({
          success: false,
          error: "Code is required",
        });
      }

      const response = await axios.post(
        "https://github.com/login/oauth/access_token",
        {
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
        },
        {
          headers: { Accept: "application/json" },
        }
      );

      const accessToken = response.data.access_token;
      if (!accessToken) {
        return res.status(400).json({
          success: false,
          error: "Failed to retrieve access token",
        });
      }

      res.json({
        success: true,
        data: { access_token: accessToken },
      });
    } catch (e: any) {
      res.status(500).json({
        success: false,
        error: e.message || "GitHub OAuth failed",
      });
    }
  },

  // Link repository to workspace
  linkRepository: async (req: any, res: Response) => {
    try {
      const { workspaceId } = req.params;
      const userId = req.userId;
      const input = LinkRepositorySchema.parse(req.body);

      const repo = await githubService.linkRepository(workspaceId, userId, input);

      res.status(201).json({
        success: true,
        data: repo,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: "VALIDATION_ERROR",
          details: error.errors,
        });
      }

      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.code,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      });
    }
  },

  // Get workspace repositories
  listRepositories: async (req: any, res: Response) => {
    try {
      const { workspaceId } = req.params;
      const userId = req.userId;

      const repos = await githubService.getWorkspaceRepositories(workspaceId, userId);

      res.json({
        success: true,
        data: repos,
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.code,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      });
    }
  },

  // Get repository
  getRepository: async (req: any, res: Response) => {
    try {
      const { repositoryId } = req.params;
      const userId = req.userId;

      const repo = await githubService.getRepositoryById(repositoryId, userId);

      res.json({
        success: true,
        data: repo,
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.code,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      });
    }
  },

  // Unlink repository
  unlinkRepository: async (req: any, res: Response) => {
    try {
      const { repositoryId } = req.params;
      const userId = req.userId;

      await githubService.unlinkRepository(repositoryId, userId);

      res.json({
        success: true,
        message: "Repository unlinked successfully",
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.code,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      });
    }
  },

  // Get commits
  getCommits: async (req: any, res: Response) => {
    try {
      const { owner, repo } = req.params;
      const page = parseInt(req.query.page) || 1;

      // Get workspace to get access token
      const workspaceId = req.query.workspaceId;
      const userId = req.userId;

      const repos = await githubService.getWorkspaceRepositories(workspaceId, userId);
      const linkedRepo = repos.find((r) => r.owner === owner && r.name === repo);

      if (!linkedRepo) {
        throw new AppError(404, "REPO_NOT_FOUND", "Repository not linked to workspace");
      }

      // Get a valid access token from workspace (would need to be stored)
      const workspace = await (await import("@prisma/client")).PrismaClient().workspace.findUnique({
        where: { id: workspaceId },
      });

      if (!workspace?.githubAccessToken) {
        throw new AppError(400, "NO_TOKEN", "GitHub access token not configured");
      }

      const commits = await githubService.getCommits(owner, repo, workspace.githubAccessToken, page);

      res.json({
        success: true,
        data: commits,
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.code,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      });
    }
  },

  // Get branches
  getBranches: async (req: any, res: Response) => {
    try {
      const { owner, repo } = req.params;
      const workspaceId = req.query.workspaceId;
      const userId = req.userId;

      const repos = await githubService.getWorkspaceRepositories(workspaceId, userId);
      const linkedRepo = repos.find((r) => r.owner === owner && r.name === repo);

      if (!linkedRepo) {
        throw new AppError(404, "REPO_NOT_FOUND", "Repository not linked to workspace");
      }

      const workspace = await (await import("@prisma/client")).PrismaClient().workspace.findUnique({
        where: { id: workspaceId },
      });

      if (!workspace?.githubAccessToken) {
        throw new AppError(400, "NO_TOKEN", "GitHub access token not configured");
      }

      const branches = await githubService.getBranches(owner, repo, workspace.githubAccessToken);

      res.json({
        success: true,
        data: branches,
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.code,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      });
    }
  },
};
