import { useMutation } from '@tanstack/react-query';
import { feedbackApi } from '@/api/feedback';
import type { FeedbackRequest } from '@/types';

export function useFeedbackMutation(customerId: string) {
  return useMutation({
    mutationFn: (body: FeedbackRequest) => feedbackApi.submit(customerId, body),
  });
}
