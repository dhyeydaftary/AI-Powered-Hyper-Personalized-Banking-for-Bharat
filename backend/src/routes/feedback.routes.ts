import { Router } from 'express';
import { postFeedback } from '../controllers/feedback.controller';
import { validateParams, validateBody } from '../middleware/validation';
import { customerIdParamSchema, feedbackCreateSchema } from '../validators';

const router = Router();

router.post(
  '/:customerId/feedback',
  validateParams(customerIdParamSchema),
  validateBody(feedbackCreateSchema),
  postFeedback
);

export default router;
