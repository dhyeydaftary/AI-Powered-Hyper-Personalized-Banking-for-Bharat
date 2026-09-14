import { Router } from 'express';
import { getDecision } from '../controllers/decision.controller';
import { validateParams } from '../middleware/validation';
import { customerIdParamSchema } from '../validators';

const router = Router();

router.get(
  '/:customerId/decision',
  validateParams(customerIdParamSchema),
  getDecision
);

export default router;
