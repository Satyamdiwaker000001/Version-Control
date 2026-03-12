import { prisma } from '../lib/prisma';
import type { Message } from '@prisma/client';

export interface CreateMessageInput {
  workspaceId: string;
  userId: string;
  content: string;
}

export interface MessageWithAuthor extends Message {
  author: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  };
}

export const chatService = {
  // Send a message
  async sendMessage(input: CreateMessageInput): Promise<MessageWithAuthor> {
    const message = await prisma.message.create({
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
  async getMessages(workspaceId: string, limit: number = 50): Promise<MessageWithAuthor[]> {
    return prisma.message.findMany({
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
  async getMessagesPaginated(
    workspaceId: string,
    limit: number = 50,
    cursor?: string
  ): Promise<MessageWithAuthor[]> {
    return prisma.message.findMany({
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
  async getMessageById(messageId: string): Promise<MessageWithAuthor | null> {
    return prisma.message.findUnique({
      where: { id: messageId },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      }
    });
  },

  // Edit a message
  async editMessage(messageId: string, content: string, userId: string): Promise<MessageWithAuthor> {
    return prisma.message.update({
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
  async deleteMessage(messageId: string): Promise<void> {
    await prisma.message.delete({ where: { id: messageId } });
  },

  // Verify message ownership
  async verifyMessageOwnership(messageId: string, userId: string): Promise<boolean> {
    const message = await prisma.message.findUnique({ where: { id: messageId } });
    return message?.userId === userId;
  },

  // Get message count in workspace
  async getMessageCount(workspaceId: string): Promise<number> {
    return prisma.message.count({
      where: { workspaceId }
    });
  }
};
