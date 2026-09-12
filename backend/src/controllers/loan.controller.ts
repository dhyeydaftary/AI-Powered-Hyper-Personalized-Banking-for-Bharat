import { Request, Response, NextFunction } from 'express';
import { getLoansByCustomer } from '../services/loan.service';
import { successResponse } from '../utils/response';

export async function getLoans(req: Request, res: Response, next: NextFunction) {
  try {
    const customerId = Array.isArray(req.params.customerId) ? req.params.customerId[0] : req.params.customerId;
    const loans = await getLoansByCustomer(customerId);
    successResponse(res, loans);
  } catch (err) {
    next(err);
  }
}
