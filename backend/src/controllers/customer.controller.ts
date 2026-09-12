import { Request, Response, NextFunction } from 'express';
import { getCustomerById } from '../services/customer.service';
import { successResponse } from '../utils/response';

export async function getCustomer(req: Request, res: Response, next: NextFunction) {
  try {
    const customerId = Array.isArray(req.params.customerId) ? req.params.customerId[0] : req.params.customerId;
    const customer = await getCustomerById(customerId);
    successResponse(res, customer);
  } catch (err) {
    next(err);
  }
}
