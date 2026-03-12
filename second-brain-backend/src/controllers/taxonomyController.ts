import { Request, Response } from "express";
import { z } from "zod";
import { tagService } from "../services/tagService";
import { AppError } from "../types";

const CreateTagSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().optional(),
  emoji: z.string().optional(),
  description: z.string().optional(),
});

const UpdateTagSchema = z.object({
  name: z.string().optional(),
  color: z.string().optional(),
  emoji: z.string().optional(),
  description: z.string().optional(),
});

export const taxonomyController = {
  // Create tag
  createTag: async (req: any, res: Response) => {
    try {
      const { workspaceId } = req.params;
      const userId = req.userId;
      const input = CreateTagSchema.parse(req.body);

      const tag = await tagService.createTag(workspaceId, userId, input);

      res.status(201).json({
        success: true,
        data: tag,
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

  // Get tag
  getTag: async (req: any, res: Response) => {
    try {
      const { tagId } = req.params;
      const userId = req.userId;

      const tag = await tagService.getTagById(tagId, userId);

      res.json({
        success: true,
        data: tag,
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

  // List tags
  listTags: async (req: any, res: Response) => {
    try {
      const { workspaceId } = req.params;
      const userId = req.userId;

      const tags = await tagService.getWorkspaceTags(workspaceId, userId);

      res.json({
        success: true,
        data: tags,
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

  // Update tag
  updateTag: async (req: any, res: Response) => {
    try {
      const { tagId } = req.params;
      const userId = req.userId;
      const input = UpdateTagSchema.parse(req.body);

      const tag = await tagService.updateTag(tagId, userId, input);

      res.json({
        success: true,
        data: tag,
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

  // Delete tag
  deleteTag: async (req: any, res: Response) => {
    try {
      const { tagId } = req.params;
      const userId = req.userId;

      await tagService.deleteTag(tagId, userId);

      res.json({
        success: true,
        message: "Tag deleted successfully",
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
