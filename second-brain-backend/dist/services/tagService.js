"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tagService = void 0;
const prisma_1 = require("../lib/prisma");
exports.tagService = {
    // Create a new tag
    async createTag(input) {
        return prisma_1.prisma.tag.create({
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
    async getTagsByWorkspace(workspaceId) {
        const tags = await prisma_1.prisma.tag.findMany({
            where: { workspaceId },
            include: {
                _count: { select: { notes: true } }
            },
            orderBy: { name: 'asc' }
        });
        return tags.map((tag) => ({
            ...tag,
            noteCount: tag._count.notes
        }));
    },
    // Get a single tag
    async getTagById(tagId) {
        return prisma_1.prisma.tag.findUnique({ where: { id: tagId } });
    },
    // Update a tag
    async updateTag(tagId, input) {
        return prisma_1.prisma.tag.update({
            where: { id: tagId },
            data: {
                ...(input.name && { name: input.name }),
                ...(input.color && { color: input.color }),
                ...(input.description !== undefined && { description: input.description })
            }
        });
    },
    // Delete a tag
    async deleteTag(tagId) {
        await prisma_1.prisma.tag.delete({ where: { id: tagId } });
    },
    // Verify tag belongs to workspace
    async verifyTagOwnership(tagId, workspaceId) {
        const tag = await prisma_1.prisma.tag.findUnique({ where: { id: tagId } });
        return tag?.workspaceId === workspaceId;
    }
};
