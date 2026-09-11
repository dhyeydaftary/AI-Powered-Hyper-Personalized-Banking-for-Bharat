import { Request, Response, NextFunction } from 'express';
import { getLoansByCustomer } from '../services/loan.service';
import { successResponse } from '../utils/response';

export async function getLoans(req: Request, res: Response, next: NextFunction) {
  try {
    const loans = await getLoansByCustomer(req.params.customerId);
    successResponse(res, loans);
  } catch (err) {
    next(err);
  }
}
