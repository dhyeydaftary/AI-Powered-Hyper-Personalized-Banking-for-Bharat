import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { decisionsApi } from '@/api/decisions';
import type { AnalyzeRequest } from '@/types';

export function useLatestDecision(customerId: string) {
  return useQuery({
    queryKey: ['decision', customerId],
    queryFn: () => decisionsApi.getLatestDecision(customerId),
  });
}

/**
 * Runs the analysis pipeline (POST /analyze) and updates the cached decision
 * so the UI reflects the fresh result immediately, without a second fetch.
 * Also invalidates financial health, since analysis and health both derive
 * from the same underlying signals.
 */
export function useAnalyzeMutation(customerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scope?: AnalyzeRequest) => decisionsApi.analyze(customerId, scope),
    onSuccess: (data) => {
      queryClient.setQueryData(['decision', customerId], data.decision);
      queryClient.invalidateQueries({ queryKey: ['financial-health', customerId] });
    },
  });
}
