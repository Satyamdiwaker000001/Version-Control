// Workspace Service
import { PrismaClient } from "@prisma/client";
import {
  Workspace,
  WorkspaceMember,
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
  AppError,
} from "../types";

const prisma = new PrismaClient();

export const workspaceService = {
  // Create new workspace
  async createWorkspace(
    userId: string,
    input: CreateWorkspaceInput
  ): Promise<Workspace> {
    const slug = input.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .substring(0, 30);

    const workspace = await prisma.workspace.create({
      data: {
        name: input.name,
        slug: `${slug}-${Date.now()}`,
        type: input.type,
        description: input.description,
        members: {
          create: {
            userId,
            role: "owner",
          },
        },
      },
    });

    return this.formatWorkspace(workspace);
  },

  // Get workspace by ID
  async getWorkspaceById(workspaceId: string, userId: string): Promise<Workspace> {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: {
          where: { userId },
        },
      },
    });

    if (!workspace || workspace.members.length === 0) {
      throw new AppError(
        403,
        "WORKSPACE_NOT_FOUND",
        "Workspace not found or access denied"
      );
    }

    return this.formatWorkspace(workspace);
  },

  // Get all workspaces for user
  async getUserWorkspaces(userId: string): Promise<Workspace[]> {
    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
    });

    return workspaces.map((ws) => this.formatWorkspace(ws));
  },

  // Update workspace
  async updateWorkspace(
    workspaceId: string,
    userId: string,
    input: UpdateWorkspaceInput
  ): Promise<Workspace> {
    // Verify user is owner
    const member = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: { userId, workspaceId },
      },
    });

    if (!member || member.role !== "owner") {
      throw new AppError(
        403,
        "FORBIDDEN",
        "Only workspace owner can update settings"
      );
    }

    const workspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: input,
    });

    return this.formatWorkspace(workspace);
  },

  // Get workspace members
  async getMembers(
    workspaceId: string,
    userId: string
  ): Promise<(WorkspaceMember & { user?: any })[]> {
    // Verify user is member
    const member = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: { userId, workspaceId },
      },
    });

    if (!member) {
      throw new AppError(403, "FORBIDDEN", "Access denied");
    }

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            githubUsername: true,
          },
        },
      },
    });

    return members;
  },

  // Add member to workspace
  async addMember(
    workspaceId: string,
    userId: string,
    newMemberEmail: string,
    role: string = "member"
  ): Promise<WorkspaceMember> {
    // Verify user is admin/owner
    const member = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: { userId, workspaceId },
      },
    });

    if (!member || !["owner", "admin"].includes(member.role)) {
      throw new AppError(403, "FORBIDDEN", "Only admins can add members");
    }

    // Find user by email
    const newUser = await prisma.user.findUnique({
      where: { email: newMemberEmail },
    });

    if (!newUser) {
      throw new AppError(404, "USER_NOT_FOUND", "User not found");
    }

    // Check if already member
    const existingMember = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: { userId: newUser.id, workspaceId },
      },
    });

    if (existingMember) {
      throw new AppError(400, "ALREADY_MEMBER", "User is already a member");
    }

    const workspaceMember = await prisma.workspaceMember.create({
      data: {
        userId: newUser.id,
        workspaceId,
        role,
      },
    });

    return workspaceMember;
  },

  // Remove member from workspace
  async removeMember(
    workspaceId: string,
    userId: string,
    memberToRemoveId: string
  ): Promise<void> {
    // Verify user is admin/owner
    const member = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: { userId, workspaceId },
      },
    });

    if (!member || !["owner", "admin"].includes(member.role)) {
      throw new AppError(403, "FORBIDDEN", "Only admins can remove members");
    }

    // Don't allow removing the last owner
    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId, role: "owner" },
    });

    if (members.length === 1 && members[0].userId === memberToRemoveId) {
      throw new AppError(
        400,
        "CANNOT_REMOVE_LAST_OWNER",
        "Cannot remove the last owner"
      );
    }

    await prisma.workspaceMember.delete({
      where: {
        userId_workspaceId: { userId: memberToRemoveId, workspaceId },
      },
    });
  },

  // Helper function to format workspace
  private formatWorkspace(workspace: any): Workspace {
    return {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      type: workspace.type,
      avatar: workspace.avatar,
      description: workspace.description,
      githubOwner: workspace.githubOwner,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
    };
  },
};
