import { useQuery } from '@tanstack/react-query';
import { loansApi } from '@/api/loans';

export function useLoans(customerId: string) {
  return useQuery({
    queryKey: ['loans', customerId],
    queryFn: () => loansApi.list(customerId),
  });
}
