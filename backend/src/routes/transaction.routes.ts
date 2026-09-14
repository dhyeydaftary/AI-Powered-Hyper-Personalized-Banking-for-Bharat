import { Router } from 'express';
import { getTransactions } from '../controllers/transaction.controller';
import { validateParams, validateQuery } from '../middleware/validation';
import { customerIdParamSchema, paginationQuerySchema } from '../validators';

const router = Router();

router.get(
  '/:customerId/transactions',
  validateParams(customerIdParamSchema),
  validateQuery(paginationQuerySchema),
  getTransactions
);

export default router;
