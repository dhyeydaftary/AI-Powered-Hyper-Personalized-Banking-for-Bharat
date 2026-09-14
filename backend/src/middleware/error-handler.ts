import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { errorResponse } from '../utils/response';

/**
 * Centralized error handler.
 * - Maps AppError subclasses to structured API responses.
 * - Logs server-side details without exposing internals to clients.
 * - Never returns stack traces to clients.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log server-side details (no sensitive financial data in error messages)
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[ERROR] ${err.constructor.name}: ${err.message}`);
    if (!(err instanceof AppError) || !err.isOperational) {
      console.error(err.stack);
    }
  }

  if (err instanceof AppError) {
    errorResponse(res, err.statusCode, err.code, err.message);
    return;
  }

  // Unexpected errors — never expose stack traces
  errorResponse(res, 500, 'INTERNAL_SERVER_ERROR', 'An unexpected error occurred');
}
