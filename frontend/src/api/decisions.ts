import { apiClient } from './client';
import type { AnalyzeRequest, AnalyzeResponseData, Decision, FinancialHealth } from '@/types';

export const decisionsApi = {
  getFinancialHealth: (customerId: string) =>
    apiClient.get<FinancialHealth>(`/customers/${customerId}/financial-health`),

  getLatestDecision: (customerId: string) =>
    apiClient.get<Decision | null>(`/customers/${customerId}/decision`),

  analyze: (customerId: string, body: AnalyzeRequest = {}) =>
    apiClient.post<AnalyzeResponseData>(`/customers/${customerId}/analyze`, body),
};
