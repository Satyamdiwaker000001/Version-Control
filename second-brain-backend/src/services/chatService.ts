// Chat Service (Channels & Messages)
import { PrismaClient } from "@prisma/client";
import {
  Channel,
  Message,
  CreateChannelInput,
  CreateMessageInput,
  AppError,
  PaginatedResponse,
} from "../types";

const prisma = new PrismaClient();

export const chatService = {
  // ============================================
  // CHANNEL OPERATIONS
  // ============================================

  // Create new channel
  async createChannel(
    workspaceId: string,
    userId: string,
    input: CreateChannelInput
  ): Promise<Channel> {
    // Verify user is workspace member
    const member = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: { userId, workspaceId },
      },
    });

    if (!member) {
      throw new AppError(403, "FORBIDDEN", "Access denied");
    }

    // Check if channel name already exists
    const existingChannel = await prisma.channel.findUnique({
      where: {
        workspaceId_name: { workspaceId, name: input.name },
      },
    });

    if (existingChannel) {
      throw new AppError(400, "CHANNEL_EXISTS", "Channel already exists");
    }

    const channel = await prisma.channel.create({
      data: {
        workspaceId,
        name: input.name,
        description: input.description,
        isPrivate: input.isPrivate || false,
      },
    });

    return this.formatChannel(channel);
  },

  // Get channel by ID
  async getChannelById(channelId: string, userId: string): Promise<Channel> {
    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
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

    if (!channel || channel.workspace.members.length === 0) {
      throw new AppError(404, "CHANNEL_NOT_FOUND", "Channel not found");
    }

    return this.formatChannel(channel);
  },

  // Get all channels in workspace
  async getWorkspaceChannels(workspaceId: string, userId: string): Promise<Channel[]> {
    // Verify user is workspace member
    const member = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: { userId, workspaceId },
      },
    });

    if (!member) {
      throw new AppError(403, "FORBIDDEN", "Access denied");
    }

    const channels = await prisma.channel.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "asc" },
    });

    return channels.map((channel) => this.formatChannel(channel));
  },

  // Delete channel
  async deleteChannel(channelId: string, userId: string): Promise<void> {
    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
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

    if (!channel) {
      throw new AppError(404, "CHANNEL_NOT_FOUND", "Channel not found");
    }

    // Only workspace owners can delete channels
    const member = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: { userId, workspaceId: channel.workspaceId },
      },
    });

    if (!member || member.role !== "owner") {
      throw new AppError(403, "FORBIDDEN", "Only workspace owner can delete channels");
    }

    // Delete all messages in channel first
    await prisma.message.deleteMany({
      where: { channelId },
    });

    await prisma.channel.delete({
      where: { id: channelId },
    });
  },

  // ============================================
  // MESSAGE OPERATIONS
  // ============================================

  // Send message
  async sendMessage(
    workspaceId: string,
    channelId: string | null,
    noteId: string | null,
    userId: string,
    input: CreateMessageInput
  ): Promise<Message> {
    // Verify user is workspace member
    const member = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: { userId, workspaceId },
      },
    });

    if (!member) {
      throw new AppError(403, "FORBIDDEN", "Access denied");
    }

    // If channel message, verify channel exists
    if (channelId) {
      const channel = await prisma.channel.findUnique({
        where: { id: channelId },
      });

      if (!channel || channel.workspaceId !== workspaceId) {
        throw new AppError(404, "CHANNEL_NOT_FOUND", "Channel not found");
      }
    }

    // If note message, verify note exists
    if (noteId) {
      const note = await prisma.note.findUnique({
        where: { id: noteId },
      });

      if (!note || note.workspaceId !== workspaceId) {
        throw new AppError(404, "NOTE_NOT_FOUND", "Note not found");
      }
    }

    const message = await prisma.message.create({
      data: {
        workspaceId,
        channelId,
        noteId,
        userId,
        content: input.content,
        parentMessageId: input.parentMessageId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return this.formatMessage(message);
  },

  // Get channel messages
  async getChannelMessages(
    channelId: string,
    userId: string,
    page: number = 1,
    pageSize: number = 50
  ): Promise<PaginatedResponse<Message>> {
    // Verify channel exists and user has access
    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
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

    if (!channel || channel.workspace.members.length === 0) {
      throw new AppError(404, "CHANNEL_NOT_FOUND", "Channel not found");
    }

    const total = await prisma.message.count({
      where: { channelId, parentMessageId: null }, // Only top-level messages
    });

    const messages = await prisma.message.findMany({
      where: { channelId, parentMessageId: null },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "asc" },
    });

    return {
      items: messages.map((msg) => this.formatMessage(msg)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },

  // Get message replies (threads)
  async getMessageReplies(
    messageId: string,
    userId: string
  ): Promise<Message[]> {
    const parentMessage = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        channel: {
          include: {
            workspace: {
              include: {
                members: {
                  where: { userId },
                },
              },
            },
          },
        },
      },
    });

    if (!parentMessage || parentMessage.channel?.workspace.members.length === 0) {
      throw new AppError(404, "MESSAGE_NOT_FOUND", "Message not found");
    }

    const replies = await prisma.message.findMany({
      where: { parentMessageId: messageId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return replies.map((msg) => this.formatMessage(msg));
  },

  // Edit message
  async editMessage(
    messageId: string,
    userId: string,
    newContent: string
  ): Promise<Message> {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new AppError(404, "MESSAGE_NOT_FOUND", "Message not found");
    }

    if (message.userId !== userId) {
      throw new AppError(403, "FORBIDDEN", "You can only edit your own messages");
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { content: newContent },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return this.formatMessage(updatedMessage);
  },

  // Delete message
  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new AppError(404, "MESSAGE_NOT_FOUND", "Message not found");
    }

    if (message.userId !== userId) {
      throw new AppError(403, "FORBIDDEN", "You can only delete your own messages");
    }

    // Delete replies first
    await prisma.message.deleteMany({
      where: { parentMessageId: messageId },
    });

    await prisma.message.delete({
      where: { id: messageId },
    });
  },

  // Add reaction to message
  async addReaction(
    messageId: string,
    userId: string,
    emoji: string
  ): Promise<Message> {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new AppError(404, "MESSAGE_NOT_FOUND", "Message not found");
    }

    const reactions = message.reactions ? JSON.parse(message.reactions) : {};

    if (!reactions[emoji]) {
      reactions[emoji] = [];
    }

    if (!reactions[emoji].includes(userId)) {
      reactions[emoji].push(userId);
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { reactions: JSON.stringify(reactions) },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return this.formatMessage(updatedMessage);
  },

  // Remove reaction from message
  async removeReaction(
    messageId: string,
    userId: string,
    emoji: string
  ): Promise<Message> {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new AppError(404, "MESSAGE_NOT_FOUND", "Message not found");
    }

    const reactions = message.reactions ? JSON.parse(message.reactions) : {};

    if (reactions[emoji]) {
      reactions[emoji] = reactions[emoji].filter((uid: string) => uid !== userId);
      if (reactions[emoji].length === 0) {
        delete reactions[emoji];
      }
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { reactions: Object.keys(reactions).length > 0 ? JSON.stringify(reactions) : null },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return this.formatMessage(updatedMessage);
  },

  // Helper functions
  private formatChannel(channel: any): Channel {
    return {
      id: channel.id,
      workspaceId: channel.workspaceId,
      name: channel.name,
      description: channel.description,
      isPrivate: channel.isPrivate,
      createdAt: channel.createdAt,
      updatedAt: channel.updatedAt,
    };
  },

  private formatMessage(message: any): Message {
    return {
      id: message.id,
      workspaceId: message.workspaceId,
      channelId: message.channelId,
      noteId: message.noteId,
      userId: message.userId,
      content: message.content,
      parentMessageId: message.parentMessageId,
      reactions: message.reactions ? JSON.parse(message.reactions) : null,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      author: message.author,
    };
  },
};
