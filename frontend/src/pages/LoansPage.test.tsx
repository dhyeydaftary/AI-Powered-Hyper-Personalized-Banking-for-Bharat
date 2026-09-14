import { afterEach, describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders, mockFetch, successEnvelope } from '@/test-utils';
import { LoansPage } from './LoansPage';
import { loanC1001 } from '@/test-fixtures';

afterEach(() => window.localStorage.clear());

describe('LoansPage', () => {
  it("renders C1001's real loan with computed repayment progress", async () => {
    mockFetch({ '/customers/C1001/loans': successEnvelope([loanC1001]) });

    renderWithProviders(<LoansPage />);

    expect(await screen.findByText('₹1,80,000')).toBeInTheDocument(); // outstanding
    // repaid = (250000 - 180000) / 250000 = 28%
    expect(await screen.findByText('28%')).toBeInTheDocument();
    expect(screen.getByText('Personal Loan')).toBeInTheDocument();
  });

  it('shows the real total remaining to pay and how much of it is interest, not fetched values', async () => {
    mockFetch({ '/customers/C1001/loans': successEnvelope([loanC1001]) });

    renderWithProviders(<LoansPage />);

    // total = 9000 * 24 = 216000; interest = 216000 - 180000 = 36000
    expect(await screen.findByText('₹2,16,000')).toBeInTheDocument();
    expect(screen.getByText(/₹36,000 of that is interest/i)).toBeInTheDocument();
  });

  it('shows the four real loan fields, with no invented type or due-date field', async () => {
    mockFetch({ '/customers/C1001/loans': successEnvelope([loanC1001]) });

    renderWithProviders(<LoansPage />);

    expect(await screen.findByText('₹2,50,000')).toBeInTheDocument(); // original principal
    expect(screen.getByText('₹9,000')).toBeInTheDocument(); // monthly EMI
    expect(screen.getByText('11.5% p.a.')).toBeInTheDocument();
    expect(screen.getByText('24 months')).toBeInTheDocument();
    expect(screen.queryByText(/due/i)).not.toBeInTheDocument();
  });

  it('labels the payoff chart as a projection, not backend data', async () => {
    mockFetch({ '/customers/C1001/loans': successEnvelope([loanC1001]) });

    renderWithProviders(<LoansPage />);

    expect(await screen.findByText('Payoff projection')).toBeInTheDocument();
    expect(screen.getByText(/not a schedule your bank sent us/i)).toBeInTheDocument();
  });

  it('shows a real, deliberate empty state for C1002 rather than a broken loans page, with no promotional offer', async () => {
    window.localStorage.setItem('bharat-bank.demo-customer-id', 'C1002');
    mockFetch({ '/customers/C1002/loans': successEnvelope([]) });

    renderWithProviders(<LoansPage />);

    expect(await screen.findByText("You don't currently have any active loans.")).toBeInTheDocument();
    expect(screen.queryByText(/eligible|offer|apply now|pre-approved/i)).not.toBeInTheDocument();
  });
});
