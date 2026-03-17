import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/services/AuthService';
import { DatabaseConnection } from '@/database/DatabaseConnection';
import { RedisConnection } from '@/database/RedisConnection';
import { asyncHandler, createError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

// Initialize services
import { database } from '@/database/DatabaseConnection';
import { redis } from '@/database/RedisConnection';
const authService = new AuthService(database, redis);

// Extend Request interface to include user
declare global {
// eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticateToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    throw createError('Access token required', 401);
  }

  try {
    const decoded = await authService.verifyToken(token);
    const user = await authService.getCurrentUser(decoded.userId);
    
    if (!user) {
      logger.warn(`Auth failure: User not found for ID ${decoded.userId}`);
      throw createError('User not found', 401);
    }

    req.user = user;
    next();
  } catch (error: any) {
    logger.error('Auth failure:', { 
      message: error.message, 
      stack: error.stack,
      token: token.substring(0, 10) + '...'
    });
    throw createError(error.message || 'Invalid or expired token', 401);
  }
});

export const requireAuth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }
  next();
});
