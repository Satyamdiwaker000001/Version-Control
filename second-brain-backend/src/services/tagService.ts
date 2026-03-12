// Tag Service
import { PrismaClient } from "@prisma/client";
import {
  Tag,
  CreateTagInput,
  UpdateTagInput,
  AppError,
} from "../types";

const prisma = new PrismaClient();

export const tagService = {
  // Create new tag
  async createTag(
    workspaceId: string,
    userId: string,
    input: CreateTagInput
  ): Promise<Tag> {
    // Verify user is workspace member
    const member = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: { userId, workspaceId },
      },
    });

    if (!member) {
      throw new AppError(403, "FORBIDDEN", "Access denied");
    }

    // Check if tag name already exists in workspace
    const existingTag = await prisma.tag.findUnique({
      where: {
        workspaceId_name: { workspaceId, name: input.name },
      },
    });

    if (existingTag) {
      throw new AppError(400, "TAG_EXISTS", "Tag with this name already exists");
    }

    const tag = await prisma.tag.create({
      data: {
        workspaceId,
        name: input.name,
        color: input.color || "#6366F1",
        emoji: input.emoji,
        description: input.description,
      },
    });

    return this.formatTag(tag);
  },

  // Get tag by ID
  async getTagById(tagId: string, userId: string): Promise<Tag> {
    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
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

    if (!tag || tag.workspace.members.length === 0) {
      throw new AppError(404, "TAG_NOT_FOUND", "Tag not found");
    }

    return this.formatTag(tag);
  },

  // Get all tags in workspace
  async getWorkspaceTags(workspaceId: string, userId: string): Promise<Tag[]> {
    // Verify user is workspace member
    const member = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: { userId, workspaceId },
      },
    });

    if (!member) {
      throw new AppError(403, "FORBIDDEN", "Access denied");
    }

    const tags = await prisma.tag.findMany({
      where: { workspaceId },
      orderBy: { name: "asc" },
    });

    return tags.map((tag) => this.formatTag(tag));
  },

  // Update tag
  async updateTag(
    tagId: string,
    userId: string,
    input: UpdateTagInput
  ): Promise<Tag> {
    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
      include: {
        workspace: {
          include: {
            members: {
              where: { userId, role: "owner" },
            },
          },
        },
      },
    });

    if (!tag) {
      throw new AppError(404, "TAG_NOT_FOUND", "Tag not found");
    }

    // Only workspace owners/admins can update tags
    const member = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: { userId, workspaceId: tag.workspaceId },
      },
    });

    if (!member || !["owner", "admin"].includes(member.role)) {
      throw new AppError(
        403,
        "FORBIDDEN",
        "Only workspace admins can modify tags"
      );
    }

    // Check if new name conflicts
    if (input.name && input.name !== tag.name) {
      const existingTag = await prisma.tag.findUnique({
        where: {
          workspaceId_name: { workspaceId: tag.workspaceId, name: input.name },
        },
      });

      if (existingTag) {
        throw new AppError(400, "TAG_EXISTS", "Tag with this name already exists");
      }
    }

    const updatedTag = await prisma.tag.update({
      where: { id: tagId },
      data: {
        name: input.name,
        color: input.color,
        emoji: input.emoji,
        description: input.description,
      },
    });

    return this.formatTag(updatedTag);
  },

  // Delete tag
  async deleteTag(tagId: string, userId: string): Promise<void> {
    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
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

    if (!tag) {
      throw new AppError(404, "TAG_NOT_FOUND", "Tag not found");
    }

    // Only workspace owners/admins can delete tags
    const member = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: { userId, workspaceId: tag.workspaceId },
      },
    });

    if (!member || !["owner", "admin"].includes(member.role)) {
      throw new AppError(
        403,
        "FORBIDDEN",
        "Only workspace admins can delete tags"
      );
    }

    // Delete tag and remove associations
    await prisma.noteTag.deleteMany({
      where: { tagId },
    });

    await prisma.tag.delete({
      where: { id: tagId },
    });
  },

  // Helper function
  private formatTag(tag: any): Tag {
    return {
      id: tag.id,
      workspaceId: tag.workspaceId,
      name: tag.name,
      color: tag.color,
      emoji: tag.emoji,
      description: tag.description,
      createdAt: tag.createdAt,
    };
  },
};
