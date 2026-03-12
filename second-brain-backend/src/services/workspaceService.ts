import { prisma } from '../lib/prisma';
import type { Workspace, WorkspaceMember } from '@prisma/client';

export interface CreateWorkspaceInput {
  userId: string;
  name: string;
  description?: string;
  type: 'personal' | 'team';
}

export interface UpdateWorkspaceInput {
  name?: string;
  description?: string;
  githubOwner?: string;
  githubRepo?: string;
}

export interface WorkspaceWithMembers extends Workspace {
  members: WorkspaceMember[];
  memberCount: number;
}

export const workspaceService = {
  // Create a new workspace
  async createWorkspace(input: CreateWorkspaceInput): Promise<Workspace> {
    const workspace = await prisma.workspace.create({
      data: {
        userId: input.userId,
        name: input.name,
        description: input.description,
        type: input.type
      }
    });

    // Add creator as admin member
    await prisma.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: input.userId,
        role: 'admin'
      }
    });

    return workspace;
  },

  // Get all workspaces for a user
  async getWorkspacesByUser(userId: string): Promise<WorkspaceWithMembers[]> {
    const workspaces = await prisma.workspace.findMany({
      where: {
        OR: [
          { userId }, // Owned workspaces
          { members: { some: { userId } } } // Member of workspaces
        ]
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return workspaces.map((ws: any) => ({
      ...ws,
      memberCount: ws.members.length
    }));
  },

  // Get a single workspace
  async getWorkspaceById(id: string): Promise<Workspace | null> {
    return prisma.workspace.findUnique({ where: { id } });
  },

  // Get workspace with full details
  async getWorkspaceWithDetails(id: string): Promise<WorkspaceWithMembers | null> {
    const workspace = await prisma.workspace.findUnique({
      where: { id },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } }
        }
      }
    });

    if (!workspace) return null;

    return {
      ...workspace,
      memberCount: workspace.members.length
    };
  },

  // Update workspace
  async updateWorkspace(id: string, input: UpdateWorkspaceInput): Promise<Workspace> {
    return prisma.workspace.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.githubOwner && { githubOwner: input.githubOwner }),
        ...(input.githubRepo && { githubRepo: input.githubRepo })
      }
    });
  },

  // Delete workspace
  async deleteWorkspace(id: string): Promise<void> {
    await prisma.workspace.delete({ where: { id } });
  },

  // Verify user access to workspace
  async verifyWorkspaceAccess(workspaceId: string, userId: string): Promise<boolean> {
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId }
      }
    });
    return !!member;
  },

  // Get workspace members
  async getMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    return prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { joinedAt: 'asc' }
    });
  },

  // Add member to workspace
  async addMember(workspaceId: string, userId: string, role: string = 'member'): Promise<WorkspaceMember> {
    return prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId,
        role
      }
    });
  },

  // Update member role
  async updateMemberRole(workspaceId: string, userId: string, role: string): Promise<WorkspaceMember> {
    return prisma.workspaceMember.update({
      where: {
        workspaceId_userId: { workspaceId, userId }
      },
      data: { role }
    });
  },

  // Remove member from workspace
  async removeMember(workspaceId: string, userId: string): Promise<void> {
    await prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: { workspaceId, userId }
      }
    });
  }
};
