import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import workspaceRoutes from './routes/workspaceRoutes';
import githubRoutes from './routes/githubRoutes';
import noteRoutes from './routes/noteRoutes';
import taxonomyRoutes from './routes/taxonomyRoutes';

const app: Express = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Basic Health Check Route
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV || 'development' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/taxonomy', taxonomyRoutes);

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

export default app;
