import { useMutation } from '@tanstack/react-query';
import { simulationApi } from '@/api/simulation';
import type { SimulateRequest } from '@/types';

/**
 * Deliberately does NOT write into the shared query cache for financial
 * health or decision — the simulation result must never leak into the
 * customer's real financial-health display (Section 33).
 */
export function useSimulateMutation(customerId: string) {
  return useMutation({
    mutationFn: (body: SimulateRequest) => simulationApi.run(customerId, body),
  });
}
