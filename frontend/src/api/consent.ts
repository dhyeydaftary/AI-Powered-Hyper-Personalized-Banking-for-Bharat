import { apiClient } from './client';
import type { Consent, ConsentUpdateRequest } from '@/types';

export const consentApi = {
  get: (customerId: string) => apiClient.get<Consent>(`/customers/${customerId}/consent`),
  update: (customerId: string, body: ConsentUpdateRequest) =>
    apiClient.put<Consent>(`/customers/${customerId}/consent`, body),
};
