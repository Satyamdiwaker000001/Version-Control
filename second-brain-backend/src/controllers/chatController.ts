import { Request, Response } from "express";
import { z } from "zod";
import { chatService } from "../services/chatService";
import { AppError } from "../types";

const CreateChannelSchema = z.object({
  name: z.string().min(1, "Channel name required"),
  description: z.string().optional(),
  isPrivate: z.boolean().optional(),
});

const CreateMessageSchema = z.object({
  content: z.string().min(1, "Message content required"),
  parentMessageId: z.string().optional(),
});

export const chatController = {
  // ============================================
  // CHANNEL OPERATIONS
  // ============================================

  // Create channel
  createChannel: async (req: any, res: Response) => {
    try {
      const { workspaceId } = req.params;
      const userId = req.userId;
      const input = CreateChannelSchema.parse(req.body);

      const channel = await chatService.createChannel(workspaceId, userId, input);

      res.status(201).json({
        success: true,
        data: channel,
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

  // List channels
  listChannels: async (req: any, res: Response) => {
    try {
      const { workspaceId } = req.params;
      const userId = req.userId;

      const channels = await chatService.getWorkspaceChannels(workspaceId, userId);

      res.json({
        success: true,
        data: channels,
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

  // Delete channel
  deleteChannel: async (req: any, res: Response) => {
    try {
      const { channelId } = req.params;
      const userId = req.userId;

      await chatService.deleteChannel(channelId, userId);

      res.json({
        success: true,
        message: "Channel deleted successfully",
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

  // ============================================
  // MESSAGE OPERATIONS
  // ============================================

  // Send message
  sendMessage: async (req: any, res: Response) => {
    try {
      const { workspaceId, channelId } = req.params;
      const { noteId } = req.query;
      const userId = req.userId;
      const input = CreateMessageSchema.parse(req.body);

      const message = await chatService.sendMessage(
        workspaceId,
        channelId || null,
        noteId || null,
        userId,
        input
      );

      res.status(201).json({
        success: true,
        data: message,
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

  // Get messages
  getMessages: async (req: any, res: Response) => {
    try {
      const { channelId } = req.params;
      const userId = req.userId;
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 50;

      const result = await chatService.getChannelMessages(channelId, userId, page, pageSize);

      res.json({
        success: true,
        data: result,
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

  // Get message replies
  getReplies: async (req: any, res: Response) => {
    try {
      const { messageId } = req.params;
      const userId = req.userId;

      const replies = await chatService.getMessageReplies(messageId, userId);

      res.json({
        success: true,
        data: replies,
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

  // Edit message
  editMessage: async (req: any, res: Response) => {
    try {
      const { messageId } = req.params;
      const { content } = req.body;
      const userId = req.userId;

      if (!content) {
        return res.status(400).json({
          success: false,
          error: "VALIDATION_ERROR",
          message: "Content is required",
        });
      }

      const message = await chatService.editMessage(messageId, userId, content);

      res.json({
        success: true,
        data: message,
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

  // Delete message
  deleteMessage: async (req: any, res: Response) => {
    try {
      const { messageId } = req.params;
      const userId = req.userId;

      await chatService.deleteMessage(messageId, userId);

      res.json({
        success: true,
        message: "Message deleted successfully",
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

  // Add reaction
  addReaction: async (req: any, res: Response) => {
    try {
      const { messageId } = req.params;
      const { emoji } = req.body;
      const userId = req.userId;

      if (!emoji) {
        return res.status(400).json({
          success: false,
          error: "VALIDATION_ERROR",
          message: "Emoji is required",
        });
      }

      const message = await chatService.addReaction(messageId, userId, emoji);

      res.json({
        success: true,
        data: message,
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

  // Remove reaction
  removeReaction: async (req: any, res: Response) => {
    try {
      const { messageId } = req.params;
      const { emoji } = req.body;
      const userId = req.userId;

      if (!emoji) {
        return res.status(400).json({
          success: false,
          error: "VALIDATION_ERROR",
          message: "Emoji is required",
        });
      }

      const message = await chatService.removeReaction(messageId, userId, emoji);

      res.json({
        success: true,
        data: message,
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
