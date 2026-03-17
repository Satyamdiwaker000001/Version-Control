import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { ChatService } from '@/services/ChatService';
import { database } from '@/database/DatabaseConnection';
import { asyncHandler, createError } from '@/middleware/errorHandler';
import { authenticateToken } from '@/middleware/auth';

const router = Router();
const chatService = new ChatService(database);

const channelSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(1000).allow('', null),
  type: Joi.string().valid('text', 'voice', 'announcement').default('text'),
});

// Get all channels for workspace
router.get('/workspace/:workspaceId/channels', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { workspaceId } = req.params;
  if (!workspaceId) throw createError('Workspace ID is required', 400);

  const channels = await chatService.getChannels(workspaceId);
  res.json({
    success: true,
    data: channels,
  });
}));

// Create channel
router.post('/workspace/:workspaceId/channels', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { workspaceId } = req.params;
  if (!workspaceId) throw createError('Workspace ID is required', 400);

  const { error, value } = channelSchema.validate(req.body);
  if (error) throw createError(error.details?.[0]?.message || 'Invalid channel data', 400);

  const channel = await chatService.createChannel(workspaceId, value);
  res.status(201).json({
    success: true,
    data: channel,
  });
}));

// Get messages for channel
router.get('/channels/:channelId/messages', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { channelId } = req.params;
  if (!channelId) throw createError('Channel ID is required', 400);

  const limit = parseInt(req.query.limit as string) || 50;
  const offset = parseInt(req.query.offset as string) || 0;
  
  const messages = await chatService.getMessages(channelId, limit, offset);
  res.json({
    success: true,
    data: messages,
  });
}));

// Send message
router.post('/channels/:channelId/messages', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw createError('Unauthorized', 401);
  const { channelId } = req.params;
  if (!channelId) throw createError('Channel ID is required', 400);

  const { content } = req.body;
  if (!content) throw createError('Content is required', 400);

  const message = await chatService.sendMessage(channelId, userId, content);
  res.status(201).json({
    success: true,
    data: message,
  });
}));

export default router;
