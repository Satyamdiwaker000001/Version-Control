"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatService = void 0;
const prisma_1 = require("../lib/prisma");
exports.chatService = {
    // Send a message
    async sendMessage(input) {
        const message = await prisma_1.prisma.message.create({
            data: {
                workspaceId: input.workspaceId,
                userId: input.userId,
                content: input.content
            },
            include: {
                author: {
                    select: { id: true, name: true, email: true, avatar: true }
                }
            }
        });
        return message;
    },
    // Get messages in workspace
    async getMessages(workspaceId, limit = 50) {
        return prisma_1.prisma.message.findMany({
            where: { workspaceId },
            include: {
                author: {
                    select: { id: true, name: true, email: true, avatar: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
    },
    // Get paginated messages
    async getMessagesPaginated(workspaceId, limit = 50, cursor) {
        return prisma_1.prisma.message.findMany({
            where: { workspaceId },
            include: {
                author: {
                    select: { id: true, name: true, email: true, avatar: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: cursor } : undefined
        });
    },
    // Get a single message
    async getMessageById(messageId) {
        return prisma_1.prisma.message.findUnique({
            where: { id: messageId },
            include: {
                author: {
                    select: { id: true, name: true, email: true, avatar: true }
                }
            }
        });
    },
    // Edit a message
    async editMessage(messageId, content, userId) {
        return prisma_1.prisma.message.update({
            where: { id: messageId },
            data: {
                content,
                editedBy: userId,
                updatedAt: new Date()
            },
            include: {
                author: {
                    select: { id: true, name: true, email: true, avatar: true }
                }
            }
        });
    },
    // Delete a message
    async deleteMessage(messageId) {
        await prisma_1.prisma.message.delete({ where: { id: messageId } });
    },
    // Verify message ownership
    async verifyMessageOwnership(messageId, userId) {
        const message = await prisma_1.prisma.message.findUnique({ where: { id: messageId } });
        return message?.userId === userId;
    },
    // Get message count in workspace
    async getMessageCount(workspaceId) {
        return prisma_1.prisma.message.count({
            where: { workspaceId }
        });
    }
};
