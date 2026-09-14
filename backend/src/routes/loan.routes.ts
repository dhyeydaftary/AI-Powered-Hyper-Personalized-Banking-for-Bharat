import { Router } from 'express';
import { getLoans } from '../controllers/loan.controller';
import { validateParams } from '../middleware/validation';
import { customerIdParamSchema } from '../validators';

const router = Router();

router.get(
  '/:customerId/loans',
  validateParams(customerIdParamSchema),
  getLoans
);

export default router;
