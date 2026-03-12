import { Request, Response } from "express";
import { z } from "zod";
import { workspaceService } from "../services/workspaceService";
import { AppError } from "../types";

// Validation schemas
const CreateWorkspaceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["solo", "team"]),
  description: z.string().optional(),
});

const UpdateWorkspaceSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  avatar: z.string().optional(),
});

const AddMemberSchema = z.object({
  email: z.string().email("Invalid email"),
  role: z.enum(["member", "admin"]).optional(),
});

export const workspaceController = {
  // Create new workspace
  createWorkspace: async (req: any, res: Response) => {
    try {
      const userId = req.userId;
      const input = CreateWorkspaceSchema.parse(req.body);

      const workspace = await workspaceService.createWorkspace(userId, input);

      res.status(201).json({
        success: true,
        data: workspace,
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

  // Get workspace by ID
  getWorkspace: async (req: any, res: Response) => {
    try {
      const { workspaceId } = req.params;
      const userId = req.userId;

      const workspace = await workspaceService.getWorkspaceById(workspaceId, userId);

      res.json({
        success: true,
        data: workspace,
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

  // Get all user workspaces
  listWorkspaces: async (req: any, res: Response) => {
    try {
      const userId = req.userId;
      const workspaces = await workspaceService.getUserWorkspaces(userId);

      res.json({
        success: true,
        data: workspaces,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      });
    }
  },

  // Update workspace
  updateWorkspace: async (req: any, res: Response) => {
    try {
      const { workspaceId } = req.params;
      const userId = req.userId;
      const input = UpdateWorkspaceSchema.parse(req.body);

      const workspace = await workspaceService.updateWorkspace(workspaceId, userId, input);

      res.json({
        success: true,
        data: workspace,
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

  // Get workspace members
  getMembers: async (req: any, res: Response) => {
    try {
      const { workspaceId } = req.params;
      const userId = req.userId;

      const members = await workspaceService.getMembers(workspaceId, userId);

      res.json({
        success: true,
        data: members,
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

  // Add member
  addMember: async (req: any, res: Response) => {
    try {
      const { workspaceId } = req.params;
      const userId = req.userId;
      const { email, role } = AddMemberSchema.parse(req.body);

      const member = await workspaceService.addMember(workspaceId, userId, email, role);

      res.status(201).json({
        success: true,
        data: member,
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

  // Remove member
  removeMember: async (req: any, res: Response) => {
    try {
      const { workspaceId, memberId } = req.params;
      const userId = req.userId;

      await workspaceService.removeMember(workspaceId, userId, memberId);

      res.json({
        success: true,
        message: "Member removed successfully",
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
