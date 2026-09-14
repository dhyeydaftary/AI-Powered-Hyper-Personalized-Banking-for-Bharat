import { Router } from 'express';
import { getCustomer } from '../controllers/customer.controller';
import { validateParams } from '../middleware/validation';
import { customerIdParamSchema } from '../validators';

const router = Router();

router.get('/:customerId', validateParams(customerIdParamSchema), getCustomer);

export default router;
