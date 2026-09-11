import { Request, Response, NextFunction } from 'express';
import { runAnalysis, getFinancialHealth } from '../services/analysis.service';
import { successResponse } from '../utils/response';

export async function analyze(req: Request, res: Response, next: NextFunction) {
  try {
    const decision = await runAnalysis(req.params.customerId, req.body.analysis_scope);
    successResponse(res, { decision });
  } catch (err) {
    next(err);
  }
}

export async function financialHealth(req: Request, res: Response, next: NextFunction) {
  try {
    const health = await getFinancialHealth(req.params.customerId);
    successResponse(res, health);
  } catch (err) {
    next(err);
  }
}
