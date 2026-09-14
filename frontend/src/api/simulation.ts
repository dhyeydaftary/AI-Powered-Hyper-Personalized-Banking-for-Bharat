import { apiClient } from './client';
import type { SimulateRequest, SimulationResult } from '@/types';

export const simulationApi = {
  run: (customerId: string, body: SimulateRequest) =>
    apiClient.post<SimulationResult>(`/customers/${customerId}/simulate`, body),
};
