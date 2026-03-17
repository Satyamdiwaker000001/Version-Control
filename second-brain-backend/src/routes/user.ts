import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { UserService } from '@/services/UserService';
import { database } from '@/database/DatabaseConnection';
import { asyncHandler, createError } from '@/middleware/errorHandler';
import { authenticateToken } from '@/middleware/auth';

const router = Router();
const userService = new UserService(database);

const preferencesSchema = Joi.object({
  theme: Joi.string().valid('light', 'dark', 'system'),
  language: Joi.string().min(2).max(10),
  timezone: Joi.string().max(50),
  email_notifications: Joi.boolean(),
  push_notifications: Joi.boolean(),
  auto_save_interval: Joi.number().min(1).max(3600),
  tutorial_completed: Joi.boolean(),
  preferences: Joi.object().allow(null),
});

// Get user preferences
router.get('/preferences', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const preferences = await userService.getPreferences(req.user.id);
  res.json({
    success: true,
    data: preferences,
  });
}));

// Update user preferences
router.patch('/preferences', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = preferencesSchema.validate(req.body);
  if (error) {
    throw createError(error.details[0]?.message || 'Validation failed', 400);
  }

  const preferences = await userService.updatePreferences(req.user.id, value);
  res.json({
    success: true,
    data: preferences,
    message: 'Preferences updated successfully',
  });
}));

export default router;
