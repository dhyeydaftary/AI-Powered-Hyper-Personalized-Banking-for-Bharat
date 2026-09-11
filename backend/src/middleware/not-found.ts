import { Request, Response } from 'express';
import { errorResponse } from '../utils/response';

/**
 * 404 handler for unmatched routes.
 */
export function notFoundHandler(_req: Request, res: Response): void {
  errorResponse(res, 404, 'NOT_FOUND', 'The requested resource was not found');
}
