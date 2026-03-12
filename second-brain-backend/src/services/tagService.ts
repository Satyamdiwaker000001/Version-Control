import { prisma } from '../lib/prisma';
import type { Tag } from '@prisma/client';

export interface CreateTagInput {
  workspaceId: string;
  userId: string;
  name: string;
  color: string;
  description?: string;
}

export interface UpdateTagInput {
  name?: string;
  color?: string;
  description?: string;
}

export const tagService = {
  // Create a new tag
  async createTag(input: CreateTagInput): Promise<Tag> {
    return prisma.tag.create({
      data: {
        workspaceId: input.workspaceId,
        userId: input.userId,
        name: input.name,
        color: input.color,
        description: input.description
      }
    });
  },

  // Get all tags in workspace
  async getTagsByWorkspace(workspaceId: string): Promise<(Tag & { noteCount: number })[]> {
    const tags = await prisma.tag.findMany({
      where: { workspaceId },
      include: {
        _count: { select: { notes: true } }
      },
      orderBy: { name: 'asc' }
    });

    return tags.map((tag: any) => ({
      ...tag,
      noteCount: tag._count.notes
    }));
  },

  // Get a single tag
  async getTagById(tagId: string): Promise<Tag | null> {
    return prisma.tag.findUnique({ where: { id: tagId } });
  },

  // Update a tag
  async updateTag(tagId: string, input: UpdateTagInput): Promise<Tag> {
    return prisma.tag.update({
      where: { id: tagId },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.color && { color: input.color }),
        ...(input.description !== undefined && { description: input.description })
      }
    });
  },

  // Delete a tag
  async deleteTag(tagId: string): Promise<void> {
    await prisma.tag.delete({ where: { id: tagId } });
  },

  // Verify tag belongs to workspace
  async verifyTagOwnership(tagId: string, workspaceId: string): Promise<boolean> {
    const tag = await prisma.tag.findUnique({ where: { id: tagId } });
    return tag?.workspaceId === workspaceId;
  }
};
