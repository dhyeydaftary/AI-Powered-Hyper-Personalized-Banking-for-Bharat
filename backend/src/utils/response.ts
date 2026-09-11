import { Response } from 'express';

/**
 * Standard API response helpers following the shared API contract.
 */

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export function successResponse(res: Response, data: unknown, statusCode = 200): void {
  res.status(statusCode).json({
    success: true,
    data,
    error: null,
  });
}

export function errorResponse(
  res: Response,
  statusCode: number,
  code: string,
  message: string
): void {
  res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      code,
      message,
    },
  });
}

export function paginatedResponse(
  res: Response,
  data: unknown,
  pagination: PaginationMeta,
  statusCode = 200
): void {
  res.status(statusCode).json({
    success: true,
    data,
    pagination,
    error: null,
  });
}
