import { apiClient } from './client';
import type { Customer } from '@/types';

export const customersApi = {
  get: (customerId: string) => apiClient.get<Customer>(`/customers/${customerId}`),
};
