import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseConnection } from '@/database/DatabaseConnection';
import { RedisConnection } from '@/database/RedisConnection';
import { logger } from '@/utils/logger';

export interface User {
  id: string;
  email: string;
  name: string;
  password_hash?: string;
  avatar_url?: string;
  github_id?: string;
  github_username?: string;
  email_verified: boolean;
  is_active: boolean;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  email: string;
  name: string;
  password?: string;
  avatar_url?: string;
  github_id?: string;
  github_username?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class AuthService {
  private database: DatabaseConnection;
  private redis: RedisConnection;

  constructor(database: DatabaseConnection, redis: RedisConnection) {
    this.database = database;
    this.redis = redis;
  }

  public async register(userData: CreateUserData): Promise<{ user: User; tokens: AuthTokens; token: string }> {
    try {
      // Check if user already exists
      const existingUser = await this.getUserByEmail(userData.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password if provided
      let passwordHash: string | undefined;
      if (userData.password) {
        passwordHash = await bcrypt.hash(userData.password, 12);
      }

      // Create user
      const userId = uuidv4();
      const sql = `
        INSERT INTO users (id, email, name, password_hash, avatar_url, github_id, github_username)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      await this.database.query(sql, [
        userId,
        userData.email,
        userData.name,
        passwordHash,
        userData.avatar_url || null,
        userData.github_id || null,
        userData.github_username || null
      ]);

      // Get created user
      const user = await this.getUserById(userId);
      if (!user) {
        throw new Error('Failed to create user');
      }

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Store session
      await this.storeSession(user.id, tokens);

      // --- Professional Onboarding (NUX) ---
      // 1. Create Default "Personal Space" Project
      const projectId = uuidv4();
      await this.database.query(`
        INSERT INTO projects (id, user_id, name, description, color, is_public)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        projectId,
        userId,
        'Personal Space',
        'Your private space for notes and ideas.',
        '#8b5cf6', // Violet color
        false
      ]);

      // 2. Create "Welcome to Noetic" Note
      const noteId = uuidv4();
      await this.database.query(`
        INSERT INTO notes (id, user_id, project_id, title, content, content_type)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        noteId,
        userId,
        projectId,
        'Welcome to Noetic! 👋',
        '# Welcome back!\n\nThis is your personal space. You can create notes, organize them with tags, and link them together.\n\n### Getting Started\n- Click the **+ New Note** button to start writing.\n- Use **Markdown** to format your thoughts.\n- Tag your notes to stay organized.\n\nHappy thinking! ✨',
        'markdown'
      ]);

      logger.info(`👤 New user registered and initialized: ${user.email}`);
      
      return { 
        user, 
        tokens,
        token: tokens.accessToken // Add flat token for frontend compatibility
      };
    } catch (error) {
      logger.error('Registration failed:', error);
      throw error;
    }
  }

  public async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens; token: string }> {
    try {
      // Get user by email
      const user = await this.getUserByEmail(credentials.email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if user has password (GitHub users might not)
      if (!user.password_hash) {
        throw new Error('Please use GitHub login for this account');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(credentials.password, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      await this.updateLastLogin(user.id);

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Store session
      await this.storeSession(user.id, tokens);

      logger.info(`🔐 User logged in: ${user.email}`);
      
      return { 
        user, 
        tokens,
        token: tokens.accessToken // Add flat token for frontend compatibility
      };
    } catch (error) {
      logger.error('Login failed:', error);
      throw error;
    }
  }

  public async loginWithGitHub(githubUser: any): Promise<{ user: User; tokens: AuthTokens; token: string; isNewUser: boolean }> {
    try {
      let user = await this.getUserByGitHubId(githubUser.id.toString());
      let isNewUser = false;

      if (!user) {
        // Create new user from GitHub data
        const userData: CreateUserData = {
          email: githubUser.email,
          name: githubUser.name || githubUser.login,
          avatar_url: githubUser.avatar_url,
          github_id: githubUser.id.toString(),
          github_username: githubUser.login,
        };

        const result = await this.register(userData);
        user = result.user;
        isNewUser = true;
      } else {
        // Update GitHub info
        await this.updateGitHubInfo(user.id, githubUser);
        
        // Generate new tokens
        const tokens = await this.generateTokens(user);
        await this.storeSession(user.id, tokens);
        
        return { 
          user, 
          tokens, 
          token: tokens.accessToken, 
          isNewUser: false 
        };
      }

      logger.info(`🐙 GitHub user authenticated: ${githubUser.login}`);
      
      const tokens = await this.generateTokens(user);
      await this.storeSession(user.id, tokens);
      
      return { 
        user, 
        tokens, 
        token: tokens.accessToken, 
        isNewUser 
      };
    } catch (error) {
      logger.error('GitHub login failed:', error);
      throw error;
    }
  }

  public async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as any;
      
      // Check if session exists
      const sessionExists = await this.redis.exists(`session:${decoded.userId}`);
      if (!sessionExists) {
        throw new Error('Invalid refresh token');
      }

      // Get user
      const user = await this.getUserById(decoded.userId);
      if (!user || !user.is_active) {
        throw new Error('User not found or inactive');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);
      
      // Update session
      await this.storeSession(user.id, tokens);

      return tokens;
    } catch (error) {
      logger.error('Token refresh failed:', error);
      throw new Error('Invalid refresh token');
    }
  }

  public async logout(userId: string): Promise<void> {
    try {
      // Remove session from Redis
      await this.redis.del(`session:${userId}`);
      
      logger.info(`🔓 User logged out: ${userId}`);
    } catch (error) {
      logger.error('Logout failed:', error);
      throw error;
    }
  }

  public async getCurrentUser(userId: string): Promise<User | null> {
    return this.getUserById(userId);
  }

  public async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    try {
      const fields = [];
      const values = [];

      if (data.name) {
        fields.push('name = ?');
        values.push(data.name);
      }
      
      if (data.avatar_url) {
        fields.push('avatar_url = ?');
        values.push(data.avatar_url);
      }

      if (fields.length === 0) {
        throw new Error('No valid fields to update');
      }

      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(userId);

      const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
      await this.database.query(sql, [...values, userId]);

      const user = await this.getUserById(userId);
      if (!user) {
        throw new Error('User not found after update');
      }

      logger.info(`📝 User profile updated: ${userId}`);
      return user;
    } catch (error) {
      logger.error('Profile update failed:', error);
      throw error;
    }
  }

  private async getUserById(id: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE id = ? AND is_active = TRUE';
    const result = await this.database.query<User>(sql, [id]);
    return result.rows[0] || null;
  }

  private async getUserByEmail(email: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE email = ? AND is_active = TRUE';
    const result = await this.database.query<User>(sql, [email]);
    return result.rows[0] || null;
  }

  private async getUserByGitHubId(githubId: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE github_id = ? AND is_active = TRUE';
    const result = await this.database.query<User>(sql, [githubId]);
    return result.rows[0] || null;
  }

  private async updateLastLogin(userId: string): Promise<void> {
    const sql = 'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?';
    await this.database.query(sql, [userId]);
  }

  private async updateGitHubInfo(userId: string, githubUser: any): Promise<void> {
    const sql = `
      UPDATE users 
      SET avatar_url = ?, github_username = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    await this.database.query(sql, [githubUser.avatar_url, githubUser.login, userId]);
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload = {
      userId: user.id,
      email: user.email,
      name: user.name,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    } as any);

    const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    } as any);

    const expiresIn = 7 * 24 * 60 * 60; // 7 days in seconds

    return { accessToken, refreshToken, expiresIn };
  }

  private async storeSession(userId: string, tokens: AuthTokens): Promise<void> {
    const sessionData = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      createdAt: new Date().toISOString(),
    };

    await this.redis.set(
      `session:${userId}`,
      JSON.stringify(sessionData),
      30 * 24 * 60 * 60 // 30 days in seconds
    );
  }

  public async verifyToken(token: string): Promise<any> {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}
