import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { AnalyticsService } from '@/services/AnalyticsService';
import { DatabaseConnection } from '@/database/DatabaseConnection';
import { asyncHandler, createError } from '@/middleware/errorHandler';
import { authenticateToken } from '@/middleware/auth';

const router = Router();
import { database } from '@/database/DatabaseConnection';
const analyticsService = new AnalyticsService(database);

const eventSchema = Joi.object({
  event_type: Joi.string().required(),
  event_data: Joi.object().allow(null),
});

// Track an event
router.post('/track', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = eventSchema.validate(req.body);
  if (error) {
    throw createError(error.details[0]?.message || 'Validation failed', 400);
  }

  await analyticsService.trackEvent(req.user.id, {
    ...value,
    ip_address: req.ip,
    user_agent: req.get('user-agent'),
  });

  res.json({
    success: true,
    message: 'Event tracked successfully',
  });
}));

// Get dashboard stats
router.get('/dashboard', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const stats = await analyticsService.getDashboardStats(req.user.id);
  res.json({
    success: true,
    data: stats,
  });
}));

export default router;
