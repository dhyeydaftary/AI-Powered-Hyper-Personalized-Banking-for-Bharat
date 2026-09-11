import { Request, Response, NextFunction } from 'express';
import { runSimulation } from '../services/analysis.service';
import { successResponse } from '../utils/response';

export async function simulate(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await runSimulation(req.params.customerId, req.body.loan);
    successResponse(res, result);
  } catch (err) {
    next(err);
  }
}
