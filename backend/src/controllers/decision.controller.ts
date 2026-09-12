import { Request, Response, NextFunction } from 'express';
import { getLatestDecision } from '../services/decision.service';
import { successResponse } from '../utils/response';

export async function getDecision(req: Request, res: Response, next: NextFunction) {
  try {
    const customerId = Array.isArray(req.params.customerId) ? req.params.customerId[0] : req.params.customerId;
    const decision = await getLatestDecision(customerId);
    successResponse(res, decision);
  } catch (err) {
    next(err);
  }
}
