import { afterEach, describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, mockFetch, successEnvelope, paginatedEnvelope } from '@/test-utils';
import { OverviewPage } from './OverviewPage';
import {
  customerC1001,
  customerC1002,
  transactionsC1001,
  transactionsC1002,
  loanC1001,
  healthRecommend,
  healthThinFile,
  decisionRecommend,
  decisionNoActionThinFile,
} from '@/test-fixtures';

afterEach(() => {
  window.localStorage.clear();
});

describe('OverviewPage', () => {
  it('renders a RECOMMEND insight for C1001, the healthy-trajectory customer', async () => {
    mockFetch({
      '/customers/C1001': successEnvelope(customerC1001),
      '/customers/C1001/transactions': paginatedEnvelope(transactionsC1001),
      '/customers/C1001/loans': successEnvelope([loanC1001]),
      '/customers/C1001/financial-health': successEnvelope(healthRecommend),
      '/customers/C1001/decision': successEnvelope(null),
      '/customers/C1001/analyze': successEnvelope({ decision: decisionRecommend }),
    });

    renderWithProviders(<OverviewPage />);

    expect(await screen.findByText(/Aarav/)).toBeInTheDocument();
    expect(await screen.findByText('You may benefit from this')).toBeInTheDocument();
  });

  it('renders a NO_ACTION / thin-file insight for C1002 without fabricating a chart', async () => {
    window.localStorage.setItem('bharat-bank.demo-customer-id', 'C1002');

    mockFetch({
      '/customers/C1002': successEnvelope(customerC1002),
      '/customers/C1002/transactions': paginatedEnvelope(transactionsC1002),
      '/customers/C1002/loans': successEnvelope([]),
      '/customers/C1002/financial-health': successEnvelope(healthThinFile),
      '/customers/C1002/decision': successEnvelope(null),
      '/customers/C1002/analyze': successEnvelope({ decision: decisionNoActionThinFile }),
    });

    renderWithProviders(<OverviewPage />);

    expect(await screen.findByText(/Meera/)).toBeInTheDocument();
    expect(await screen.findByText('Still learning your financial picture')).toBeInTheDocument();
    // Only one month of C1002 activity exists — no money-movement trend section should render.
    await waitFor(() => expect(screen.queryByText('Money movement')).not.toBeInTheDocument());
    expect(await screen.findByText('No upcoming obligations')).toBeInTheDocument();
  });

  it('shows a human-friendly error state, not a raw error, when the financial snapshot fails to load', async () => {
    mockFetch({
      '/customers/C1001': { status: 500, body: { success: false, data: null, error: { code: 'INTERNAL_SERVER_ERROR', message: 'boom' } } },
      '/customers/C1001/transactions': paginatedEnvelope(transactionsC1001),
      '/customers/C1001/loans': successEnvelope([loanC1001]),
      '/customers/C1001/financial-health': successEnvelope(healthRecommend),
      '/customers/C1001/decision': successEnvelope(decisionRecommend),
    });

    renderWithProviders(<OverviewPage />);

    expect(await screen.findByText(/couldn't load your financial snapshot/i)).toBeInTheDocument();
    expect(screen.queryByText(/AxiosError|TypeError|stack/i)).not.toBeInTheDocument();
  });
});
