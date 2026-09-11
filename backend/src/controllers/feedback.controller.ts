import { Request, Response, NextFunction } from 'express';
import { createFeedback } from '../services/feedback.service';
import { successResponse } from '../utils/response';

export async function postFeedback(req: Request, res: Response, next: NextFunction) {
  try {
    const feedback = await createFeedback({
      customer_id: req.params.customerId,
      decision_id: req.body.decision_id,
      event_type: req.body.event_type,
      metadata: req.body.metadata || {},
    });
    successResponse(res, feedback, 201);
  } catch (err) {
    next(err);
  }
}
