import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
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
import { database } from '@/database/DatabaseConnection';
import { redis } from '@/database/RedisConnection';
const authService = new AuthService(database, redis);
const githubService = new GitHubService();

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
    
    // Store GitHub access token in user_integrations table
    await database.query(`
      INSERT INTO user_integrations (id, user_id, provider, provider_user_id, username, access_token, profile_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        access_token = VALUES(access_token),
        username = VALUES(username),
        profile_url = VALUES(profile_url),
        updated_at = CURRENT_TIMESTAMP
    `, [
      uuidv4(),
      user.id,
      'github',
      githubUser.id.toString(),
      githubUser.login,
      tokenData.access_token,
      githubUser.html_url
    ]);

    // Redirect to frontend with tokens
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
    const redirectUrl = `${frontendUrl}/auth/success?token=${tokens.accessToken}&refresh=${tokens.refreshToken}&isNewUser=${isNewUser}`;
    
    res.redirect(redirectUrl);
  } catch (error) {
    logger.error('GitHub OAuth callback failed:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
    res.redirect(`${frontendUrl}/auth/error?message=GitHub authentication failed`);
  }
}));

// Get GitHub user profile
router.get('/profile', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const result = await database.query(
    'SELECT access_token FROM user_integrations WHERE user_id = ? AND provider = ?',
    [req.user!.id, 'github']
  );
  
  if (result.rows.length === 0) {
    throw createError('GitHub account not connected', 400);
  }

  const profile = await githubService.getUserInfo(result.rows[0].access_token);
  
  res.json({
    success: true,
    data: profile,
    message: 'GitHub profile fetched successfully',
  });
}));

// Get user's GitHub repositories
router.get('/repositories', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const result = await database.query(
    'SELECT access_token FROM user_integrations WHERE user_id = ? AND provider = ?',
    [req.user!.id, 'github']
  );
  
  if (result.rows.length === 0) {
    throw createError('GitHub account not connected', 400);
  }

  const repositories = await githubService.getUserRepositories(result.rows[0].access_token);
  
  res.json({
    success: true,
    data: repositories,
    message: 'GitHub repositories fetched successfully',
  });
}));

// Get repository commits
router.get('/commits/:owner/:repo', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { owner, repo } = req.params;
  const result = await database.query(
    'SELECT access_token FROM user_integrations WHERE user_id = ? AND provider = ?',
    [req.user!.id, 'github']
  );
  
  if (result.rows.length === 0) {
    throw createError('GitHub account not connected', 400);
  }

  if (!owner || !repo) {
    throw createError('Owner and repository name are required', 400);
  }

  const commits = await githubService.getRepositoryCommits(result.rows[0].access_token, owner, repo);
  
  res.json({
    success: true,
    data: commits,
    message: 'GitHub commits fetched successfully',
  });
}));

export default router;
