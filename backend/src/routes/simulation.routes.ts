import { Router } from 'express';
import { simulate } from '../controllers/simulation.controller';
import { validateParams, validateBody } from '../middleware/validation';
import { customerIdParamSchema, simulationRequestSchema } from '../validators';

const router = Router();

router.post(
  '/:customerId/simulate',
  validateParams(customerIdParamSchema),
  validateBody(simulationRequestSchema),
  simulate
);

export default router;
