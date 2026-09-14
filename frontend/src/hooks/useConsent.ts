import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { consentApi } from '@/api/consent';
import type { ConsentUpdateRequest } from '@/types';

export function useConsent(customerId: string) {
  return useQuery({
    queryKey: ['consent', customerId],
    queryFn: () => consentApi.get(customerId),
  });
}

export function useUpdateConsent(customerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ConsentUpdateRequest) => consentApi.update(customerId, body),
    onSuccess: (data) => {
      queryClient.setQueryData(['consent', customerId], data);
      // Also refresh the customer profile, which embeds a consent summary.
      queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
    },
  });
}
