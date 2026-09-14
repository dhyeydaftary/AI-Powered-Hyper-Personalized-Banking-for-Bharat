import { Request, Response, NextFunction } from 'express';
import { runSimulation } from '../services/analysis.service';
import { successResponse } from '../utils/response';

export async function simulate(req: Request, res: Response, next: NextFunction) {
  try {
    const customerId = Array.isArray(req.params.customerId) ? req.params.customerId[0] : req.params.customerId;
    const result = await runSimulation(customerId, req.body.loan);
    successResponse(res, result);
  } catch (err) {
    next(err);
  }
}
