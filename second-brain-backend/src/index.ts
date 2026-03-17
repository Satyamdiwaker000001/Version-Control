import dotenv from 'dotenv';
// Load environment variables immediately
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';

// Import configurations and utilities
import { logger } from '@/utils/logger';
import { errorHandler } from '@/middleware/errorHandler';
import { notFoundHandler } from '@/middleware/notFoundHandler';
import { database, DatabaseConnection } from '@/database/DatabaseConnection';
import { redis, RedisConnection } from '@/database/RedisConnection';

// Import routes
import authRoutes from '@/routes/auth';
import userRoutes from '@/routes/user';
import githubRoutes from '@/routes/github';
import notesRoutes from '@/routes/notes';
import projectsRoutes from '@/routes/projects';
import tagsRoutes from '@/routes/tags';
import analyticsRoutes from '@/routes/analytics';
import workspaceRoutes from '@/routes/workspaces';
import chatRoutes from '@/routes/chats';

// Load environment variables
dotenv.config();

class Application {
  public app: express.Application;
  public server: any;
  private database: DatabaseConnection;
  private redis: RedisConnection;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.database = database;
    this.redis = redis;
    
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175',
    ].filter(Boolean) as string[];

    this.app.use(cors({
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      preflightContinue: false,
      optionsSuccessStatus: 204,
    }));

    // Compression middleware
    this.app.use(compression());

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging middleware
    this.app.use(morgan('combined', {
      stream: {
        write: (message: string) => logger.info(message.trim())
      }
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
      message: {
        error: 'Too many requests from this IP, please try again later.',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api/', limiter);

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
      });
    });
  }

  private initializeRoutes(): void {
    const apiRouter = express.Router();

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/github', githubRoutes);
    this.app.use('/api/user', userRoutes);
    this.app.use('/api/notes', notesRoutes);
    this.app.use('/api/projects', projectsRoutes);
    this.app.use('/api/tags', tagsRoutes);
    this.app.use('/api/analytics', analyticsRoutes);
    this.app.use('/api/workspaces', workspaceRoutes);
    this.app.use('/api/chats', chatRoutes);

    // Mount API router
    this.app.use('/api', apiRouter);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        message: 'Second Brain API',
        version: '1.0.0',
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Initialize database connections
      await this.database.connect();
      await this.redis.connect();

      // Start server
      const port = process.env.PORT || 3001;
      
      this.server.on('error', (error: any) => {
        if (error.code === 'EADDRINUSE') {
          logger.error(`❌ Port ${port} is already in use. The predev script should have cleared it. Please try restarting the terminal.`);
        } else {
          logger.error('❌ Server error:', error);
        }
        process.exit(1);
      });

      this.server.listen(port, () => {
        logger.info(`🚀 Server running on port ${port} in ${process.env.NODE_ENV} mode`);
      });

      // Graceful shutdown signals
      const signals = ['SIGTERM', 'SIGINT', 'SIGBREAK', 'SIGHUP'];
      signals.forEach(signal => {
        process.on(signal, () => this.gracefulShutdown(signal));
      });

    } catch (error) {
      logger.error('Failed to start application:', error);
      process.exit(1);
    }
  }

  private async gracefulShutdown(signal: string): Promise<void> {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);
    
    // Set a timeout for forced shutdown
    const forceShutdownTimeout = setTimeout(() => {
      logger.warn('Forced shutdown due to timeout');
      process.exit(1);
    }, 10000);

    this.server.close(async () => {
      logger.info('HTTP server closed');
      
      try {
        clearTimeout(forceShutdownTimeout);
        await this.database.disconnect();
        await this.redis.disconnect();
        logger.info('Database connections closed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
      }
    });
  }
}

// Create and start application
const application = new Application();
application.start().catch((error) => {
  logger.error('Application startup failed:', error);
  process.exit(1);
});

export default application;
