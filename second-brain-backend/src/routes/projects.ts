import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { ProjectService } from '@/services/ProjectService';
import { DatabaseConnection } from '@/database/DatabaseConnection';
import { asyncHandler, createError } from '@/middleware/errorHandler';
import { authenticateToken } from '@/middleware/auth';

const router = Router();
import { database } from '@/database/DatabaseConnection';
const projectService = new ProjectService(database);

const projectSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(1000).allow('', null),
  workspace_id: Joi.string().uuid().allow(null, 'ws1'),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).default('#3B82F6'),
  is_public: Joi.boolean().default(false),
  settings: Joi.object().allow(null),
});

// Get all projects
router.get('/', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const projects = await projectService.getProjects(req.user.id);
  res.json({
    success: true,
    data: projects,
  });
}));

// Get a single project
router.get('/:id', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.getProjectById(req.user.id, req.params.id as string);
  if (!project) {
    throw createError('Project not found', 404);
  }
  res.json({
    success: true,
    data: project,
  });
}));

// Create a new project
router.post('/', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = projectSchema.validate(req.body, { allowUnknown: true });
  if (error) {
    throw createError(error.details[0]?.message || 'Validation failed', 400);
  }

  const project = await projectService.createProject(req.user.id, value);
  res.status(201).json({
    success: true,
    data: project,
    message: 'Project created successfully',
  });
}));

// Update a project
router.patch('/:id', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = projectSchema.validate(req.body, { allowUnknown: true });
  if (error) {
    throw createError(error.details[0]?.message || 'Validation failed', 400);
  }

  const project = await projectService.updateProject(req.user.id, req.params.id as string, value);
  res.json({
    success: true,
    data: project,
    message: 'Project updated successfully',
  });
}));

// Delete a project
router.delete('/:id', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  await projectService.deleteProject(req.user.id, req.params.id as string);
  res.json({
    success: true,
    message: 'Project deleted successfully',
  });
}));

// Add task to project
router.post('/:id/tasks', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.addTask(req.user.id, req.params.id as string, req.body);
  res.json({
    success: true,
    data: project,
    message: 'Task added successfully',
  });
}));

// Update task in project
router.patch('/:id/tasks/:taskId', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.updateTask(req.user.id, req.params.id as string, req.params.taskId as string, req.body);
  res.json({
    success: true,
    data: project,
    message: 'Task updated successfully',
  });
}));

// Add discussion to project
router.post('/:id/discussions', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.addDiscussion(req.user.id, req.params.id as string, req.body);
  res.json({
    success: true,
    data: project,
    message: 'Discussion added successfully',
  });
}));

export default router;
