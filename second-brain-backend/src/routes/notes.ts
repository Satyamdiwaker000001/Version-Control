import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { NoteService } from '@/services/NoteService';
import { DatabaseConnection } from '@/database/DatabaseConnection';
import { asyncHandler, createError } from '@/middleware/errorHandler';
import { authenticateToken } from '@/middleware/auth';

const router = Router();
import { database } from '@/database/DatabaseConnection';
const noteService = new NoteService(database);

const noteSchema = Joi.object({
  project_id: Joi.string().uuid().allow(null, ''),
  title: Joi.string().min(1).max(500).required(),
  content: Joi.string().allow(''),
  content_type: Joi.string().valid('markdown', 'rich_text', 'code').default('markdown'),
  metadata: Joi.object().allow(null),
  is_public: Joi.boolean().default(false),
  is_archived: Joi.boolean().default(false),
  is_favorite: Joi.boolean().default(false),
  tags: Joi.array().items(Joi.string().uuid()),
});

// Get all notes with filters
router.get('/', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const filters = {
    projectId: req.query.projectId as string,
    isFavorite: req.query.isFavorite === 'true' ? true : (req.query.isFavorite === 'false' ? false : undefined),
    isArchived: req.query.isArchived === 'true' ? true : (req.query.isArchived === 'false' ? false : undefined),
    tagId: req.query.tagId as string,
  };

  const notes = await noteService.getNotes(req.user.id, filters);
  res.json({
    success: true,
    data: {
      notes,
      total: notes.length
    },
  });
}));

// Get a single note
router.get('/:id', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const note = await noteService.getNoteById(req.user.id, req.params.id as string);
  if (!note) {
    throw createError('Note not found', 404);
  }
  res.json({
    success: true,
    data: note,
  });
}));

// Create a new note
router.post('/', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = noteSchema.validate(req.body);
  if (error) {
    throw createError(error.details[0]?.message || 'Validation failed', 400);
  }

  const note = await noteService.createNote(req.user.id, value);
  res.status(201).json({
    success: true,
    data: note,
    message: 'Note created successfully',
  });
}));

// Update a note
router.patch('/:id', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = noteSchema.validate(req.body, { allowUnknown: true });
  if (error) {
    throw createError(error.details[0]?.message || 'Validation failed', 400);
  }

  const note = await noteService.updateNote(req.user.id, req.params.id as string, value);
  res.json({
    success: true,
    data: note,
    message: 'Note updated successfully',
  });
}));

// Delete a note
router.delete('/:id', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  await noteService.deleteNote(req.user.id, req.params.id as string);
  res.json({
    success: true,
    message: 'Note deleted successfully',
  });
}));

// Get note versions
router.get('/:id/versions', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const versions = await noteService.getNoteVersions(req.user.id, req.params.id as string);
  res.json({
    success: true,
    data: versions,
  });
}));

// Restore a version
router.post('/:id/versions/:versionId/restore', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const note = await noteService.restoreVersion(req.user.id, req.params.id as string, req.params.versionId as string);
  res.json({
    success: true,
    data: note,
    message: 'Version restored successfully',
  });
}));

// Link repository
router.post('/:id/repositories', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { repositoryId } = req.body;
  if (!repositoryId) throw createError('Repository ID is required', 400);

  await noteService.linkRepository(req.user.id, req.params.id as string, repositoryId);
  res.json({
    success: true,
    message: 'Repository linked successfully',
  });
}));

// Unlink repository
router.delete('/:id/repositories/:repositoryId', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  await noteService.unlinkRepository(req.user.id, req.params.id as string, req.params.repositoryId as string);
  res.json({
    success: true,
    message: 'Repository unlinked successfully',
  });
}));

export default router;
