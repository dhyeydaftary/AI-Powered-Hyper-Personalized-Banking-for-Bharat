import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders, mockFetch, successEnvelope, paginatedEnvelope } from '@/test-utils';
import App from './App';
import { customerC1001, transactionsC1001, loanC1001, healthRecommend, decisionRecommend } from '@/test-fixtures';

function mockAllC1001Endpoints() {
  return mockFetch({
    '/customers/C1001': successEnvelope(customerC1001),
    '/customers/C1001/transactions': paginatedEnvelope(transactionsC1001),
    '/customers/C1001/loans': successEnvelope([loanC1001]),
    '/customers/C1001/financial-health': successEnvelope(healthRecommend),
    '/customers/C1001/decision': successEnvelope(decisionRecommend),
    '/customers/C1001/consent': successEnvelope({ behavioral_trend_analysis: true, anomaly_analysis: true, vernacular_assistance: true }),
    '/customers/C1001/audit': paginatedEnvelope([]),
  });
}

describe('App routing and shell', () => {
  it('redirects the root path to /overview', async () => {
    mockAllC1001Endpoints();
    renderWithProviders(<App />, { route: '/' });
    expect(await screen.findByText('You may benefit from this')).toBeInTheDocument();
  });

  it('renders the Loans route inside the shared app shell', async () => {
    mockAllC1001Endpoints();
    renderWithProviders(<App />, { route: '/loans' });
    expect(await screen.findByRole('heading', { name: 'Loans' })).toBeInTheDocument();
    // The shell chrome (demo customer switcher) is present on every route.
    expect(screen.getByLabelText(/demo customer/i)).toBeInTheDocument();
  });

  it('renders the Privacy route with the three real consent categories', async () => {
    mockAllC1001Endpoints();
    renderWithProviders(<App />, { route: '/privacy' });
    expect(await screen.findByText('Spending pattern analysis')).toBeInTheDocument();
    expect(screen.getByText('Anomaly detection')).toBeInTheDocument();
    expect(screen.getByText('Responses in your language')).toBeInTheDocument();
  });

  it('falls back to a not-found page for an unknown route', async () => {
    mockAllC1001Endpoints();
    renderWithProviders(<App />, { route: '/does-not-exist' });
    expect(await screen.findByText(/page not found/i)).toBeInTheDocument();
  });
});
