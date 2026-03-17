import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import { WorkspaceService } from '@/services/WorkspaceService';
import { database } from '@/database/DatabaseConnection';
import { asyncHandler, createError } from '@/middleware/errorHandler';
import { authenticateToken } from '@/middleware/auth';

const router = Router();
const workspaceService = new WorkspaceService(database);

const workspaceSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(1000).allow('', null),
  type: Joi.string().valid('solo', 'team').default('solo'),
  avatar_url: Joi.string().max(500).allow('', null),
  slug: Joi.string().max(255).allow('', null),
});

// Get all workspaces for user
router.get('/', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw createError('Unauthorized', 401);
  const workspaces = await workspaceService.getWorkspaces(userId);
  res.json({
    success: true,
    data: workspaces,
  });
}));

// Create workspace
router.post('/', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = workspaceSchema.validate(req.body);
  if (error) throw createError(error.details?.[0]?.message || 'Invalid workspace data', 400);

  const workspace = await workspaceService.createWorkspace(req.user!.id, value);
  res.status(201).json({
    success: true,
    data: workspace,
  });
}));

// Get specific workspace
router.get('/:id', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const workspaceId = req.params.id;
  if (!userId) throw createError('Unauthorized', 401);
  if (!workspaceId) throw createError('Workspace ID is required', 400);
  
  const workspace = await workspaceService.getWorkspaceById(userId, workspaceId);
  if (!workspace) throw createError('Workspace not found', 404);
  
  res.json({
    success: true,
    data: workspace,
  });
}));

// Update workspace
router.patch('/:id', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const workspaceId = req.params.id;
  if (!userId) throw createError('Unauthorized', 401);
  if (!workspaceId) throw createError('Workspace ID is required', 400);

  const { error, value } = workspaceSchema.validate(req.body, { allowUnknown: true });
  if (error) throw createError(error.details?.[0]?.message || 'Invalid workspace data', 400);

  const workspace = await workspaceService.updateWorkspace(userId, workspaceId, value);
  res.json({
    success: true,
    data: workspace,
  });
}));

// Get members
router.get('/:id/members', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const workspaceId = req.params.id;
  if (!workspaceId) throw createError('Workspace ID is required', 400);

  const members = await workspaceService.getMembers(workspaceId);
  res.json({
    success: true,
    data: members,
  });
}));

// Add member
router.post('/:id/members', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const workspaceId = req.params.id;
  if (!workspaceId) throw createError('Workspace ID is required', 400);

  const { email, role } = req.body;
  if (!email) throw createError('Email is required', 400);

  await workspaceService.addMember(workspaceId, email, role);
  res.json({
    success: true,
    message: 'Member added successfully',
  });
}));

// Remove member
router.delete('/:id/members/:userId', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw createError('Unauthorized', 401);
  const { id: workspaceId, userId: targetUserId } = req.params;
  if (!workspaceId || !targetUserId) throw createError('Workspace ID and User ID are required', 400);

  await workspaceService.removeMember(workspaceId, targetUserId);
  res.json({
    success: true,
    message: 'Member removed successfully',
  });
}));

export default router;
