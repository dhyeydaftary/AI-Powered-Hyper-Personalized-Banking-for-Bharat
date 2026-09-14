import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockFetch, successEnvelope } from '@/test-utils';
import { DecisionCard } from './DecisionCard';
import {
  decisionRecommend,
  decisionIntervene,
  decisionVerify,
  decisionNoActionThinFile,
} from '@/test-fixtures';

describe('DecisionCard', () => {
  it.each([
    [decisionRecommend, 'You may benefit from this'],
    [decisionIntervene, 'Something may need your attention'],
    [decisionVerify, 'We noticed something unusual'],
    [decisionNoActionThinFile, 'Still learning your financial picture'],
  ])('renders the correct headline for %s.decision', (decision, expectedHeadline) => {
    mockFetch({});
    renderWithProviders(<DecisionCard customerId="C1001" decision={decision} historyMonths={decision.confidence < 0.5 ? 1 : 4} />);
    expect(screen.getByText(expectedHeadline)).toBeInTheDocument();
  });

  it('never claims confirmed fraud for a VERIFY decision', () => {
    mockFetch({});
    renderWithProviders(<DecisionCard customerId="C1001" decision={decisionVerify} historyMonths={4} />);
    expect(screen.queryByText(/fraud detected/i)).not.toBeInTheDocument();
  });

  it('sends real feedback events when the customer marks an insight helpful', async () => {
    const fetchMock = mockFetch({
      '/feedback': successEnvelope({
        id: 'fb-1',
        customer_id: 'C1001',
        decision_id: decisionRecommend.decision_id,
        event_type: 'ENGAGED',
        metadata: {},
        created_at: '2026-09-01T00:00:00.000Z',
      }),
    });

    renderWithProviders(<DecisionCard customerId="C1001" decision={decisionRecommend} historyMonths={4} />);

    await userEvent.click(screen.getByRole('button', { name: 'Helpful' }));

    expect(fetchMock).toHaveBeenCalled();
    const call = fetchMock.mock.calls.find(([url]) => String(url).includes('/feedback'));
    expect(call).toBeDefined();
    const body = JSON.parse((call![1] as RequestInit).body as string);
    expect(body.event_type).toBe('ENGAGED');
    expect(body.decision_id).toBe(decisionRecommend.decision_id);

    expect((await screen.findAllByText(/feedback was recorded/i)).length).toBeGreaterThan(0);
  });
});
