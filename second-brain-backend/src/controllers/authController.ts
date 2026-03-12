import { Request, Response } from "express";
import { z } from "zod";
import { authService } from "../services/authService";
import { AppError } from "../types";

// Validation schemas
const LoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const RegisterSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export const authController = {
  // Register new user
  register: async (req: Request, res: Response) => {
    try {
      const input = RegisterSchema.parse(req.body);
      const result = await authService.register(input);

      res.status(201).json({
        success: true,
        data: result,
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

  // Login user
  login: async (req: Request, res: Response) => {
    try {
      const input = LoginSchema.parse(req.body);
      const result = await authService.login(input);

      res.json({
        success: true,
        data: result,
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

  // Get current user
  me: async (req: any, res: Response) => {
    try {
      const userId = req.userId;
      const user = await authService.getUserById(userId);

      res.json({
        success: true,
        data: user,
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

  // Update user profile
  updateProfile: async (req: any, res: Response) => {
    try {
      const userId = req.userId;
      const { name, avatar } = req.body;

      const user = await authService.updateProfile(userId, {
        name,
        avatar,
      });

      res.json({
        success: true,
        data: user,
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
