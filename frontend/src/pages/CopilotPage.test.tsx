import { afterEach, describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockFetch, successEnvelope, paginatedEnvelope } from '@/test-utils';
import { CopilotPage } from './CopilotPage';
import {
  transactionsC1001,
  transactionsC1002,
  loanC1001,
  healthRecommend,
  healthThinFile,
  decisionVerify,
  decisionRecommend,
  decisionIntervene,
} from '@/test-fixtures';

afterEach(() => window.localStorage.clear());

function mockC1001({ decision = decisionRecommend, loans = [loanC1001] } = {}) {
  return mockFetch({
    '/customers/C1001/transactions': paginatedEnvelope(transactionsC1001),
    '/customers/C1001/financial-health': successEnvelope(healthRecommend),
    '/customers/C1001/decision': successEnvelope(decision),
    '/customers/C1001/loans': successEnvelope(loans),
  });
}

describe('CopilotPage', () => {
  it("reuses the real decision card for 'Your situation right now', not a second data source", async () => {
    mockC1001({ decision: decisionRecommend });
    renderWithProviders(<CopilotPage />);

    expect(await screen.findByText('You may benefit from this')).toBeInTheDocument();
  });

  it('leads suggested questions with VERIFY-specific chips when a transaction is flagged, not a generic list', async () => {
    mockC1001({ decision: decisionVerify });
    renderWithProviders(<CopilotPage />);

    expect(await screen.findByRole('button', { name: 'Why was this transaction flagged?' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: "What happens if I don't recognize it?" })).toBeInTheDocument();
    // Evergreen questions still present alongside the state-specific ones.
    expect(screen.getByRole('button', { name: "What's my EMI burden?" })).toBeInTheDocument();
    // A RECOMMEND-only chip should not be offered for a VERIFY customer.
    expect(screen.queryByRole('button', { name: 'Why am I seeing this recommendation?' })).not.toBeInTheDocument();
  });

  it('answers a VERIFY question with the real flagged transaction, grounded and linked to Activity', async () => {
    mockC1001({ decision: decisionVerify });
    renderWithProviders(<CopilotPage />);

    await userEvent.click(await screen.findByRole('button', { name: 'Why was this transaction flagged?' }));

    // decisionVerify's signals.unusual_amount (95000) matches TX1017 exactly —
    // the combined narrative + why-it-matters sentence is unique to the
    // copilot's own answer bubble (the reused DecisionCard above states the
    // same facts, but never as this exact joined sentence).
    expect(
      await screen.findByText(
        'A payment of ₹95,000 to Unknown Merchant on 25 Aug stood out from your usual spending. This is larger than any single transaction in your recent history.'
      )
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /see it in your activity/i })).toHaveAttribute('href', '/transactions');
  });

  it('routes a "should I do this" question to What-if instead of giving advice directly', async () => {
    mockC1001({ decision: decisionRecommend });
    renderWithProviders(<CopilotPage />);

    await userEvent.click(await screen.findByRole('button', { name: 'Is this a good idea for me right now?' }));

    expect(await screen.findByText(/not something i can decide for you/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /model it in what-if/i })).toHaveAttribute('href', '/what-if');
  });

  it('matches a freely typed question to the same grounded answer, without a network call', async () => {
    const fetchMock = mockC1001({ decision: decisionIntervene });
    renderWithProviders(<CopilotPage />);
    await screen.findByText('Something may need your attention');

    const callCountBefore = fetchMock.mock.calls.length;
    await userEvent.type(screen.getByLabelText(/ask a question about your money/i), 'why is my savings rate going down{enter}');

    expect(await screen.findByText(/savings rate has been declining|hasn't shown a clear decline|enough history/i)).toBeInTheDocument();
    expect(fetchMock.mock.calls.length).toBe(callCountBefore);
  });

  it('honestly declines an unanswerable typed question instead of a vague non-answer', async () => {
    mockC1001({ decision: decisionRecommend });
    renderWithProviders(<CopilotPage />);
    await screen.findByText('You may benefit from this');

    await userEvent.type(screen.getByLabelText(/ask a question about your money/i), 'what is the meaning of life{enter}');

    expect(await screen.findByText(/can't answer that one yet/i)).toBeInTheDocument();
  });

  it("hedges its language for C1002's thin history instead of stating numbers with false certainty", async () => {
    window.localStorage.setItem('bharat-bank.demo-customer-id', 'C1002');
    mockFetch({
      '/customers/C1002/transactions': paginatedEnvelope(transactionsC1002),
      '/customers/C1002/financial-health': successEnvelope(healthThinFile),
      '/customers/C1002/decision': successEnvelope(null),
      '/customers/C1002/loans': successEnvelope([]),
    });
    renderWithProviders(<CopilotPage />);

    await userEvent.click(await screen.findByRole('button', { name: "What's my savings rate?" }));

    expect(await screen.findByText(/based on the little history i have so far/i)).toBeInTheDocument();
  });

  it("tells C1002 honestly they have no loan, rather than a broken or empty-looking answer", async () => {
    window.localStorage.setItem('bharat-bank.demo-customer-id', 'C1002');
    mockFetch({
      '/customers/C1002/transactions': paginatedEnvelope(transactionsC1002),
      '/customers/C1002/financial-health': successEnvelope(healthThinFile),
      '/customers/C1002/decision': successEnvelope(null),
      '/customers/C1002/loans': successEnvelope([]),
    });
    renderWithProviders(<CopilotPage />);
    await screen.findByText('Still getting to know you');

    await userEvent.type(screen.getByLabelText(/ask a question about your money/i), "what's my loan status{enter}");

    expect(await screen.findByText("You don't currently have any active loans.")).toBeInTheDocument();
  });

  it('shows a contextual follow-up chip after an answer, not the same static list repeated', async () => {
    mockC1001({ decision: decisionVerify });
    renderWithProviders(<CopilotPage />);

    await userEvent.click(await screen.findByRole('button', { name: 'Why was this transaction flagged?' }));

    expect(await screen.findByText('You might also ask:')).toBeInTheDocument();
  });

  it('sends real feedback events from an answer, grounded in the real decision_id when there is one', async () => {
    const fetchMock = mockC1001({ decision: decisionVerify });
    renderWithProviders(<CopilotPage />);

    await userEvent.click(await screen.findByRole('button', { name: 'Why was this transaction flagged?' }));
    await userEvent.click(await screen.findByRole('button', { name: /yes, this was useful/i }));

    const call = fetchMock.mock.calls.find(([url]) => String(url).includes('/feedback'));
    expect(call).toBeDefined();
    const body = JSON.parse((call![1] as RequestInit).body as string);
    expect(body.event_type).toBe('ENGAGED');
    expect(body.decision_id).toBe(decisionVerify.decision_id);
    expect(body.metadata.source).toBe('copilot');
  });

  it('shows the permanent trust-building disclaimer near the input', async () => {
    mockC1001({ decision: decisionRecommend });
    renderWithProviders(<CopilotPage />);

    expect(await screen.findByText(/can't move money, approve loans, or take actions for you/i)).toBeInTheDocument();
  });
});
