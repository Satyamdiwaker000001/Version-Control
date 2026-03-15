import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { AuthService } from '@/services/AuthService';
import { DatabaseConnection } from '@/database/DatabaseConnection';
import { RedisConnection } from '@/database/RedisConnection';
import { asyncHandler, createError } from '@/middleware/errorHandler';
import { authenticateToken } from '@/middleware/auth';
import { logger } from '@/utils/logger';

const router = Router();

// Initialize services
import { database } from '@/database/DatabaseConnection';
import { redis } from '@/database/RedisConnection';
const authService = new AuthService(database, redis);

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().min(1).max(255).required(),
  password: Joi.string().min(8).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

// Register endpoint
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    throw createError(error.details[0]?.message || 'Validation failed', 400);
  }

  const { user, tokens } = await authService.register(value);

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        email_verified: user.email_verified,
        created_at: user.created_at,
      },
      tokens,
    },
    message: 'User registered successfully',
  });
}));

// Login endpoint
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    throw createError(error.details[0]?.message || 'Validation failed', 400);
  }

  const { user, tokens } = await authService.login(value);

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        email_verified: user.email_verified,
        last_login_at: user.last_login_at,
      },
      tokens,
    },
    message: 'Login successful',
  });
}));

// Refresh token endpoint
router.post('/refresh', asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = refreshTokenSchema.validate(req.body);
  if (error) {
    throw createError(error.details[0]?.message || 'Validation failed', 400);
  }

  const tokens = await authService.refreshToken(value.refreshToken);

  res.json({
    success: true,
    data: { tokens },
    message: 'Token refreshed successfully',
  });
}));

// Get current user endpoint
router.get('/me', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getCurrentUser(req.user.id);
  
  if (!user) {
    throw createError('User not found', 404);
  }

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        github_username: user.github_username,
        email_verified: user.email_verified,
        last_login_at: user.last_login_at,
        created_at: user.created_at,
      },
    },
  });
}));

// Update profile endpoint
router.patch('/me', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const updateSchema = Joi.object({
    name: Joi.string().min(1).max(255),
    avatar_url: Joi.string().uri().allow(''),
  });

  const { error, value } = updateSchema.validate(req.body);
  if (error) {
    throw createError(error.details[0]?.message || 'Validation failed', 400);
  }

  const user = await authService.updateProfile(req.user.id, value);

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        github_username: user.github_username,
        email_verified: user.email_verified,
        updated_at: user.updated_at,
      },
    },
    message: 'Profile updated successfully',
  });
}));

// Logout endpoint
router.post('/logout', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  await authService.logout(req.user.id);

  res.json({
    success: true,
    message: 'Logout successful',
  });
}));

export default router;
