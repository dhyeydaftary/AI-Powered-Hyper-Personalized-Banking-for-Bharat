import { useQuery } from '@tanstack/react-query';
import { auditApi } from '@/api/audit';

export function useAudit(customerId: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: ['audit', customerId, page, limit],
    queryFn: () => auditApi.list(customerId, page, limit),
    placeholderData: (prev) => prev,
  });
}
