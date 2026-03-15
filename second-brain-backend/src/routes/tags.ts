import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { TagService } from '@/services/TagService';
import { DatabaseConnection } from '@/database/DatabaseConnection';
import { asyncHandler, createError } from '@/middleware/errorHandler';
import { authenticateToken } from '@/middleware/auth';

const router = Router();
import { database } from '@/database/DatabaseConnection';
const tagService = new TagService(database);

const tagSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).default('#6B7280'),
  description: Joi.string().max(500).allow('', null),
});

// Get all tags
router.get('/', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const tags = await tagService.getTags(req.user.id);
  res.json({
    success: true,
    data: tags,
  });
}));

// Create a new tag
router.post('/', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = tagSchema.validate(req.body);
  if (error) {
    throw createError(error.details[0]?.message || 'Validation failed', 400);
  }

  const tag = await tagService.createTag(req.user.id, value);
  res.status(201).json({
    success: true,
    data: tag,
    message: 'Tag created successfully',
  });
}));

// Update a tag
router.patch('/:id', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = tagSchema.validate(req.body, { allowUnknown: true });
  if (error) {
    throw createError(error.details[0]?.message || 'Validation failed', 400);
  }

  const tag = await tagService.updateTag(req.user.id, req.params.id as string, value);
  res.json({
    success: true,
    data: tag,
    message: 'Tag updated successfully',
  });
}));

// Delete a tag
router.delete('/:id', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  await tagService.deleteTag(req.user.id, req.params.id as string);
  res.json({
    success: true,
    message: 'Tag deleted successfully',
  });
}));

export default router;
