import { Request, Response, NextFunction } from 'express';
import { getAuditLogsByCustomer } from '../services/audit.service';
import { paginatedResponse } from '../utils/response';

export async function getAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const { customerId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await getAuditLogsByCustomer(customerId, page, limit);
    paginatedResponse(res, result.entries, result.pagination);
  } catch (err) {
    next(err);
  }
}
