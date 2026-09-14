import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '@/api/transactions';

export function useTransactions(customerId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['transactions', customerId, page, limit],
    queryFn: () => transactionsApi.list(customerId, page, limit),
    placeholderData: (prev) => prev,
  });
}
