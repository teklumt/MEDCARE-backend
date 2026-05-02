import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email?: string;
    role: 'patient' | 'pharmacy' | 'admin' | 'delivery';
  };
  file?: Express.Multer.File;
}

// Admin-Backend token format
interface AdminTokenPayload {
  sub: string;
  role: string;
  mfa: boolean;
  permissions: string[];
  iss?: string;
  aud?: string;
}

// Main backend token format (legacy)
interface MainTokenPayload {
  userId: string;
  email: string;
  role: 'patient' | 'pharmacy';
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'No token provided. Please login.'
      });
      return;
    }

    const token = authHeader.substring(7);

    try {
      // Try to verify with Admin-Backend format first
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string, {
        issuer: process.env.APP_URL || 'http://localhost:5000',
        audience: process.env.APP_URL || 'http://localhost:5000',
      }) as AdminTokenPayload;

      // Convert Admin-Backend format to our format
      req.user = {
        userId: decoded.sub,
        role: decoded.role as any,
      };
    } catch (adminError) {
      // If Admin-Backend format fails, try main backend format (without issuer/audience)
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as MainTokenPayload;
      
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };
    }
    
    next();
  } catch (error) {
    if ((error as Error).name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        error: 'Token expired. Please login again.'
      });
      return;
    }
    
    res.status(401).json({
      success: false,
      error: 'Invalid token. Please login again.'
    });
  }
};

export const authorizeRoles = (...roles: Array<'patient' | 'pharmacy' | 'admin' | 'delivery'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    if (!roles.includes(req.user.role as any)) {
      res.status(403).json({
        success: false,
        error: `Access denied. Required role: ${roles.join(' or ')}`
      });
      return;
    }

    next();
  };
};
