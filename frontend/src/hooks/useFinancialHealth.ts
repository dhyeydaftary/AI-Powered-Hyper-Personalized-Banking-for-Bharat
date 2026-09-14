import { useQuery } from '@tanstack/react-query';
import { decisionsApi } from '@/api/decisions';

export function useFinancialHealth(customerId: string) {
  return useQuery({
    queryKey: ['financial-health', customerId],
    queryFn: () => decisionsApi.getFinancialHealth(customerId),
  });
}
