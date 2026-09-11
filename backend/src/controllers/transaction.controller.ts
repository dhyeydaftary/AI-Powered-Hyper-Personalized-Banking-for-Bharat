import { Request, Response, NextFunction } from 'express';
import { getTransactionsByCustomer } from '../services/transaction.service';
import { paginatedResponse } from '../utils/response';

export async function getTransactions(req: Request, res: Response, next: NextFunction) {
  try {
    const { customerId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await getTransactionsByCustomer(customerId, page, limit);
    paginatedResponse(res, result.transactions, result.pagination);
  } catch (err) {
    next(err);
  }
}
