import { Router } from 'express';
import { getAuditLogs } from '../controllers/audit.controller';
import { validateParams, validateQuery } from '../middleware/validation';
import { customerIdParamSchema, paginationQuerySchema } from '../validators';

const router = Router();

router.get(
  '/:customerId/audit',
  validateParams(customerIdParamSchema),
  validateQuery(paginationQuerySchema),
  getAuditLogs
);

export default router;
