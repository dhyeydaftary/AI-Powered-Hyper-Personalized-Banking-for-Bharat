import { Request, Response, NextFunction } from 'express';
import * as consentService from '../services/consent.service';
import { successResponse } from '../utils/response';

export async function getConsent(req: Request, res: Response, next: NextFunction) {
  try {
    const customerId = Array.isArray(req.params.customerId) ? req.params.customerId[0] : req.params.customerId;
    const consent = await consentService.getConsent(customerId);
    successResponse(res, consent);
  } catch (err) {
    next(err);
  }
}

export async function updateConsent(req: Request, res: Response, next: NextFunction) {
  try {
    const customerId = Array.isArray(req.params.customerId) ? req.params.customerId[0] : req.params.customerId;
    const consent = await consentService.updateConsent(customerId, req.body);
    successResponse(res, consent);
  } catch (err) {
    next(err);
  }
}
