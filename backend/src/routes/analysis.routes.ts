import { Router } from 'express';
import { analyze, financialHealth } from '../controllers/analysis.controller';
import { validateParams, validateBody } from '../middleware/validation';
import { customerIdParamSchema, analysisRequestSchema } from '../validators';

const router = Router();

router.post(
  '/:customerId/analyze',
  validateParams(customerIdParamSchema),
  validateBody(analysisRequestSchema),
  analyze
);

router.get(
  '/:customerId/financial-health',
  validateParams(customerIdParamSchema),
  financialHealth
);

export default router;
