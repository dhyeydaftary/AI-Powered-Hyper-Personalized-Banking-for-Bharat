import { Request, Response, NextFunction } from 'express';
import { runAnalysis, getFinancialHealth } from '../services/analysis.service';
import { successResponse } from '../utils/response';

export async function analyze(req: Request, res: Response, next: NextFunction) {
  try {
    const customerId = Array.isArray(req.params.customerId) ? req.params.customerId[0] : req.params.customerId;
    const decision = await runAnalysis(customerId, req.body.analysis_scope);
    successResponse(res, { decision });
  } catch (err) {
    next(err);
  }
}

export async function financialHealth(req: Request, res: Response, next: NextFunction) {
  try {
    const customerId = Array.isArray(req.params.customerId) ? req.params.customerId[0] : req.params.customerId;
    const health = await getFinancialHealth(customerId);
    successResponse(res, health);
  } catch (err) {
    next(err);
  }
}
