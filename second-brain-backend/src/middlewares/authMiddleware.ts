import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';

export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    email: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Access token required' 
      });
    }

    const payload = authService.verifyToken(token);
    req.userId = payload.userId;
    req.user = payload;
    
    next();
  } catch (error: any) {
    res.status(401).json({ 
      success: false,
      error: error.message || 'Invalid or expired token' 
    });
  }
};
