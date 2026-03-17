import { Router, Request, Response } from 'express';
import { asyncHandler } from '@/middleware/errorHandler';
import { createError } from '@/middleware/errorHandler';
import { GitHubService } from '@/services/GitHubService';
import { AuthService } from '@/services/AuthService';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { logger } from '@/utils/logger';
import { DatabaseConnection } from '@/database/DatabaseConnection';
import { RedisConnection } from '@/database/RedisConnection';
import { authenticateToken } from '@/middleware/auth';

const router = Router();

// Initialize services
import { database } from '@/database/DatabaseConnection';
import { redis } from '@/database/RedisConnection';
const authService = new AuthService(database, redis);
const githubService = new GitHubService();

// Test endpoint for GitHub connection
router.get('/test', asyncHandler(async (req: Request, res: Response) => {
  // Add CORS headers specifically for this endpoint
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  res.json({
    success: true,
    message: 'GitHub API is working',
    timestamp: new Date().toISOString(),
    github_config: {
      client_id: process.env.GITHUB_CLIENT_ID ? 'configured' : 'missing',
      redirect_uri: process.env.GITHUB_REDIRECT_URI || 'not set',
    }
  });
}));

// Get GitHub OAuth URL
router.get('/auth/url', asyncHandler(async (req: Request, res: Response) => {
  // Add CORS headers specifically for this endpoint
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  const authUrl = githubService.getAuthUrl();
  
  res.json({
    success: true,
    data: { authUrl },
    message: 'GitHub OAuth URL generated successfully',
  });
}));

// GitHub OAuth callback
router.get('/auth/callback', asyncHandler(async (req: Request, res: Response) => {
  console.log('🔗 GitHub OAuth callback received');
  console.log('Query params:', req.query);
  
  const { code, state } = req.query;
  
  if (!code) {
    console.log('❌ No authorization code received');
    throw createError('Authorization code is required', 400);
  }

  try {
    console.log('🔄 Exchanging code for access token...');
    // Exchange code for access token
    const tokenData = await githubService.exchangeCodeForToken(code as string);
    console.log('✅ Access token received');
    
    console.log('👤 Getting GitHub user information...');
    // Get user information
    const githubUser = await githubService.getUserInfo(tokenData.access_token);
    console.log('✅ GitHub user info received:', githubUser.login);
    
    // Check if there's an existing authenticated user session
    let existingUser = null;
    const authHeader = req.headers.authorization;
    console.log('🔐 Checking for existing session...');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        existingUser = await authService.getCurrentUser(decoded.userId);
        console.log('✅ Found existing user:', existingUser?.email);
      } catch (error) {
        // Invalid token, continue with GitHub flow
        console.log('⚠️ Invalid token in GitHub callback, proceeding with GitHub auth');
      }
    } else {
      console.log('ℹ️ No existing session found');
    }
    
    let user, tokens, isNewUser;
    
    if (existingUser) {
      // Link GitHub to existing authenticated user
      console.log('🔗 Linking GitHub to existing user...');
      console.log('👤 Existing user info:', { id: existingUser.id, name: existingUser.name, email: existingUser.email });
      
      if (existingUser.github_id) {
        // User already has GitHub linked, just update tokens
        user = existingUser;
        tokens = await authService.generateTokens(user);
        await authService.storeSession(user.id, tokens);
        isNewUser = false;
        console.log('✅ GitHub already linked, tokens updated');
      } else {
        // Link GitHub to existing user
        console.log('🔗 Before updateGitHubInfo - User name:', existingUser.name);
        await authService.updateGitHubInfo(existingUser.id, githubUser);
        
        // Verify user name after update
        const updatedUser = await authService.getCurrentUser(existingUser.id);
        console.log('🔗 After updateGitHubInfo - User name:', updatedUser?.name);
        
        user = existingUser;
        tokens = await authService.generateTokens(user);
        await authService.storeSession(user.id, tokens);
        isNewUser = false;
        console.log('✅ GitHub linked to existing user');
      }
    } else {
      // No existing session, use GitHub login flow
      console.log('🆕 Creating new GitHub-linked user...');
      const result = await authService.loginWithGitHub(githubUser);
      user = result.user;
      tokens = result.tokens;
      isNewUser = result.isNewUser;
      console.log('✅ GitHub user created/logged in:', user.email);
    }
    
    console.log('💾 Storing GitHub integration data...');
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

    // Update users table with GitHub information
    await database.query(`
      UPDATE users SET 
        github_id = ?,
        github_username = ?,
        github_access_token = ?,
        avatar_url = COALESCE(?, avatar_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      githubUser.id.toString(),
      githubUser.login,
      tokenData.access_token,
      githubUser.avatar_url,
      user.id
    ]);

    console.log('🔄 Redirecting to frontend...');
    // Redirect to frontend with tokens
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUrl = `${frontendUrl}/auth/success?token=${tokens.accessToken}&refresh=${tokens.refreshToken}&isNewUser=${isNewUser}`;
    
    console.log('🔗 Redirect URL:', redirectUrl);
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('❌ GitHub OAuth callback failed:', error);
    logger.error('GitHub OAuth callback failed:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/error?message=GitHub authentication failed`);
  }
}));

// Check GitHub connection status
router.get('/status', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  console.log('🔍 Checking GitHub connection status for user:', req.user!.id);
  
  // Check if user has GitHub integration in users table
  const userResult = await database.query(
    'SELECT github_id, github_username FROM users WHERE id = ?',
    [req.user!.id]
  );
  
  if (userResult.rows.length === 0) {
    console.log('❌ User not found');
    return res.json({
      success: false,
      data: { connected: false },
      message: 'User not found'
    });
  }
  
  const user = userResult.rows[0];
  const isConnected = !!(user.github_id && user.github_username);
  
  console.log('✅ GitHub connection status:', isConnected);
  console.log('👤 GitHub info:', { github_id: user.github_id, github_username: user.github_username });
  
  return res.json({
    success: true,
    data: { 
      connected: isConnected,
      github_id: user.github_id,
      github_username: user.github_username
    },
    message: isConnected ? 'GitHub account connected' : 'GitHub account not connected'
  });
}));

// Get GitHub user profile
router.get('/profile', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  console.log('👤 Fetching GitHub profile for user:', req.user!.id);
  
  const result = await database.query(
    'SELECT access_token FROM user_integrations WHERE user_id = ? AND provider = ?',
    [req.user!.id, 'github']
  );
  
  if (result.rows.length === 0) {
    console.log('❌ GitHub integration not found in user_integrations');
    throw createError('GitHub account not connected', 400);
  }

  console.log('✅ Found GitHub access token, fetching profile...');
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

// Sync repository to database
router.post('/sync/:owner/:repo', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
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

  // Get repository details from GitHub
  const repoDetails = await githubService.getRepositoryDetails(result.rows[0].access_token, owner, repo);
  
  // Store in database
  await database.query(`
    INSERT INTO github_repositories (
      id, user_id, github_repo_id, name, full_name, description, language,
      stargazers_count, forks_count, open_issues_count, clone_url, html_url,
      is_private, is_synced, sync_status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON DUPLICATE KEY UPDATE
      description = VALUES(description),
      language = VALUES(language),
      stargazers_count = VALUES(stargazers_count),
      forks_count = VALUES(forks_count),
      open_issues_count = VALUES(open_issues_count),
      is_synced = VALUES(is_synced),
      sync_status = VALUES(sync_status),
      updated_at = CURRENT_TIMESTAMP
  `, [
    uuidv4(),
    req.user!.id,
    repoDetails.id,
    repoDetails.name,
    repoDetails.full_name,
    repoDetails.description,
    repoDetails.language,
    repoDetails.stargazers_count,
    repoDetails.forks_count,
    repoDetails.open_issues_count,
    repoDetails.clone_url,
    repoDetails.html_url,
    repoDetails.private,
    true,
    'completed'
  ]);

  res.json({
    success: true,
    data: repoDetails,
    message: 'Repository synced successfully',
  });
}));

// Get synced repositories
router.get('/synced', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const result = await database.query(`
    SELECT * FROM github_repositories 
    WHERE user_id = ? 
    ORDER BY updated_at DESC
  `, [req.user!.id]);
  
  res.json({
    success: true,
    data: result.rows,
    message: 'Synced repositories fetched successfully',
  });
}));

export default router;
