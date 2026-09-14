import { useQuery } from '@tanstack/react-query';
import { customersApi } from '@/api/customers';

export function useCustomer(customerId: string) {
  return useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => customersApi.get(customerId),
  });
}
