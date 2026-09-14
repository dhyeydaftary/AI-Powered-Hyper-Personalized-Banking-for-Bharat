import { apiClient } from './client';
import type { Loan } from '@/types';

export const loansApi = {
  list: (customerId: string) => apiClient.get<Loan[]>(`/customers/${customerId}/loans`),
};
