import { Request, Response } from "express";
import { z } from "zod";
import { noteService } from "../services/noteService";
import { AppError } from "../types";

const CreateNoteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  description: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
});

const UpdateNoteSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  tagIds: z.array(z.string()).optional(),
});

export const noteController = {
  // Create note
  createNote: async (req: any, res: Response) => {
    try {
      const { workspaceId } = req.params;
      const userId = req.userId;
      const input = CreateNoteSchema.parse(req.body);

      const note = await noteService.createNote(workspaceId, userId, input);

      res.status(201).json({
        success: true,
        data: note,
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

  // Get note
  getNote: async (req: any, res: Response) => {
    try {
      const { noteId } = req.params;
      const userId = req.userId;

      const note = await noteService.getNoteById(noteId, userId);

      res.json({
        success: true,
        data: note,
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

  // List workspace notes
  listNotes: async (req: any, res: Response) => {
    try {
      const { workspaceId } = req.params;
      const userId = req.userId;
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const tagId = req.query.tagId;

      const result = await noteService.getWorkspaceNotes(
        workspaceId,
        userId,
        page,
        pageSize,
        tagId
      );

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

  // Update note
  updateNote: async (req: any, res: Response) => {
    try {
      const { noteId } = req.params;
      const userId = req.userId;
      const input = UpdateNoteSchema.parse(req.body);

      const note = await noteService.updateNote(noteId, userId, input);

      res.json({
        success: true,
        data: note,
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

  // Delete note
  deleteNote: async (req: any, res: Response) => {
    try {
      const { noteId } = req.params;
      const userId = req.userId;

      await noteService.deleteNote(noteId, userId);

      res.json({
        success: true,
        message: "Note deleted successfully",
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

  // Get note versions
  getVersions: async (req: any, res: Response) => {
    try {
      const { noteId } = req.params;
      const userId = req.userId;

      const versions = await noteService.getNoteVersions(noteId, userId);

      res.json({
        success: true,
        data: versions,
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

  // Restore version
  restoreVersion: async (req: any, res: Response) => {
    try {
      const { noteId, versionId } = req.params;
      const userId = req.userId;

      const note = await noteService.restoreVersion(noteId, userId, versionId);

      res.json({
        success: true,
        data: note,
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
