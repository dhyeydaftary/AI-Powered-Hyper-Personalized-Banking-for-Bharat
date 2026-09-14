import { paginatedRequest } from './client';
import type { Transaction, Pagination } from '@/types';

export const transactionsApi = {
  /**
   * The backend supports ?page= and ?limit= only — no search, filter, or
   * sort query params. Any search/filter/sort UI must operate client-side
   * over the page already fetched.
   */
  list: (customerId: string, page = 1, limit = 20) =>
    paginatedRequest<Transaction>(`/customers/${customerId}/transactions`, { page, limit }),
};

export type { Pagination };
