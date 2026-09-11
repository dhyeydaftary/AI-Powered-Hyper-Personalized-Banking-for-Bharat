import { Request, Response, NextFunction } from 'express';
import * as consentService from '../services/consent.service';
import { successResponse } from '../utils/response';

export async function getConsent(req: Request, res: Response, next: NextFunction) {
  try {
    const consent = await consentService.getConsent(req.params.customerId);
    successResponse(res, consent);
  } catch (err) {
    next(err);
  }
}

export async function updateConsent(req: Request, res: Response, next: NextFunction) {
  try {
    const consent = await consentService.updateConsent(req.params.customerId, req.body);
    successResponse(res, consent);
  } catch (err) {
    next(err);
  }
}
