import { paginatedRequest } from './client';
import type { AuditEntry } from '@/types';

export const auditApi = {
  /** The backend supports ?page= and ?limit= only, same as transactions. */
  list: (customerId: string, page = 1, limit = 10) =>
    paginatedRequest<AuditEntry>(`/customers/${customerId}/audit`, { page, limit }),
};
