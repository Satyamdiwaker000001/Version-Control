import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { GitHubService } from '@/services/GitHubService';
import { AuthService } from '@/services/AuthService';
import { DatabaseConnection } from '@/database/DatabaseConnection';
import { RedisConnection } from '@/database/RedisConnection';
import { asyncHandler, createError } from '@/middleware/errorHandler';
import { authenticateToken } from '@/middleware/auth';
import { logger } from '@/utils/logger';

const router = Router();

// Initialize services
const database = new DatabaseConnection();
const redis = new RedisConnection();
const authService = new AuthService(database, redis);
const githubService = new GitHubService();

// Validation schemas
const connectRepoSchema = Joi.object({
  repositoryId: Joi.number().required(),
  name: Joi.string().required(),
  fullName: Joi.string().required(),
  description: Joi.string().allow(''),
  language: Joi.string().allow(''),
  stargazersCount: Joi.number().default(0),
  forksCount: Joi.number().default(0),
  openIssuesCount: Joi.number().default(0),
  cloneUrl: Joi.string().required(),
  htmlUrl: Joi.string().required(),
  isPrivate: Joi.boolean().default(false),
});

// Get GitHub OAuth URL
router.get('/auth/url', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const authUrl = githubService.getAuthUrl();
  
  res.json({
    success: true,
    data: { authUrl },
    message: 'GitHub OAuth URL generated successfully',
  });
}));

// GitHub OAuth callback
router.get('/auth/callback', asyncHandler(async (req: Request, res: Response) => {
  const { code, state } = req.query;
  
  if (!code) {
    throw createError('Authorization code is required', 400);
  }

  try {
    // Exchange code for access token
    const tokenData = await githubService.exchangeCodeForToken(code as string);
    
    // Get user information
    const githubUser = await githubService.getUserInfo(tokenData.access_token);
    
    // Authenticate or register user
    const { user, tokens, isNewUser } = await authService.loginWithGitHub(githubUser);
    
    // Store GitHub access token
    await database.query(
      'UPDATE users SET github_access_token = ? WHERE id = ?',
      [tokenData.access_token, user.id]
    );

    // Redirect to frontend with tokens
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUrl = `${frontendUrl}/auth/success?token=${tokens.accessToken}&refresh=${tokens.refreshToken}&isNewUser=${isNewUser}`;
    
    res.redirect(redirectUrl);
  } catch (error) {
    logger.error('GitHub OAuth callback failed:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/error?message=GitHub authentication failed`);
  }
}));

// Get user's GitHub repositories
router.get('/repositories', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  // Get user's GitHub access token
  const userResult = await database.query(
    'SELECT github_access_token FROM users WHERE id = ?',
    [req.user.id]
  );
  
  if (!userResult.rows[0]?.github_access_token) {
    throw createError('GitHub account not connected', 400);
  }

  const repositories = await githubService.getUserRepositories(userResult.rows[0].github_access_token);
  
  res.json({
    success: true,
    data: { repositories },
    message: 'GitHub repositories fetched successfully',
  });
}));

export default router;
