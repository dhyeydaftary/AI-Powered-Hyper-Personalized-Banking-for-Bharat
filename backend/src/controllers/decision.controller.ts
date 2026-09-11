import { Request, Response, NextFunction } from 'express';
import { getLatestDecision } from '../services/decision.service';
import { successResponse } from '../utils/response';

export async function getDecision(req: Request, res: Response, next: NextFunction) {
  try {
    const decision = await getLatestDecision(req.params.customerId);
    successResponse(res, decision);
  } catch (err) {
    next(err);
  }
}
