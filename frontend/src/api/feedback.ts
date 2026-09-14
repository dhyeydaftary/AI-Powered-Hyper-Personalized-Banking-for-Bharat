import { apiClient } from './client';
import type { Feedback, FeedbackRequest } from '@/types';

export const feedbackApi = {
  submit: (customerId: string, body: FeedbackRequest) =>
    apiClient.post<Feedback>(`/customers/${customerId}/feedback`, body),
};
