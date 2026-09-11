import { Router } from 'express';
import { getConsent, updateConsent } from '../controllers/consent.controller';
import { validateParams, validateBody } from '../middleware/validation';
import { customerIdParamSchema, consentUpdateSchema } from '../validators';

const router = Router();

router.get(
  '/:customerId/consent',
  validateParams(customerIdParamSchema),
  getConsent
);

router.put(
  '/:customerId/consent',
  validateParams(customerIdParamSchema),
  validateBody(consentUpdateSchema),
  updateConsent
);

export default router;
