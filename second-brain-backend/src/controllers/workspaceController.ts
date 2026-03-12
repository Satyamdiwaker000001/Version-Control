import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { AuthRequest } from '../middlewares/authMiddleware';
import { Octokit } from 'octokit';

const linkWorkspaceSchema = z.object({
  name: z.string().min(1),
  githubOwner: z.string().min(1),
  githubRepo: z.string().min(1),
  githubAccessToken: z.string().min(1),
  type: z.enum(['solo', 'team'])
});

export const workspaceController = {
  createLinkedWorkspace: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const body = linkWorkspaceSchema.parse(req.body);

      // Verify if repo is already linked by this user maybe?
      const existing = await prisma.workspace.findFirst({
         where: { userId, githubOwner: body.githubOwner, githubRepo: body.githubRepo }
      });

      if (existing) {
         return res.status(400).json({ error: 'Workspace already linked to this repository.' });
      }

      const workspace = await prisma.workspace.create({
        data: {
          name: body.name,
          type: body.type,
          githubOwner: body.githubOwner,
          githubRepo: body.githubRepo,
          githubAccessToken: body.githubAccessToken,
          userId
        }
      });

      res.status(201).json({ workspace });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  },

  listMyWorkspaces: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const workspaces = await prisma.workspace.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json({ workspaces });
    } catch (e: any) {
      res.status(500).json({ error: 'Server error' });
    }
  },

  listCollaborators: async (req: AuthRequest, res: Response) => {
    try {
      const { workspaceId } = req.params as { workspaceId: string };
      const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });

      if (!workspace || !workspace.githubAccessToken || !workspace.githubOwner || !workspace.githubRepo) {
        return res.status(404).json({ error: 'Workspace config missing' });
      }

      const octokit = new Octokit({ auth: workspace.githubAccessToken });

      const { data } = await octokit.rest.repos.listCollaborators({
         owner: workspace.githubOwner,
         repo: workspace.githubRepo
      });

      const members = data.map((user: any) => ({
         id: user.id.toString(),
         name: user.login,
         avatarUrl: user.avatar_url,
         role: user.permissions?.admin ? 'owner' : (user.permissions?.push ? 'editor' : 'viewer'),
      }));

      res.status(200).json({ members });
    } catch (e: any) {
      res.status(e.status || 500).json({ error: e.message });
    }
  }
};
