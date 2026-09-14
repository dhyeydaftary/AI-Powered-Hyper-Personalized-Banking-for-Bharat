import { Request, Response, NextFunction } from 'express';

/**
 * Placeholder authentication middleware.
 * Creates a clean auth boundary that can be replaced with real
 * authentication (JWT, session, etc.) without restructuring routes.
 *
 * For the hackathon prototype, this passes through all requests
 * but attaches a consistent auth context shape.
 */
export interface AuthContext {
  authenticated: boolean;
  role: 'customer' | 'bank_rm' | 'system';
  customerId?: string;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  // Hackathon prototype: pass through with default context.
  // In production, validate JWT/session token here.
  req.auth = {
    authenticated: true,
    role: 'customer',
  };
  next();
}
