import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders, mockFetch, successEnvelope, paginatedEnvelope } from '@/test-utils';
import { MoneyPage } from './MoneyPage';
import { healthRecommend, healthThinFile, transactionsC1002 } from '@/test-fixtures';
import type { Transaction } from '@/types';

// The shared `transactionsC1001` fixture is deliberately minimal (three
// transactions, built for the VERIFY-decision test elsewhere) and only
// yields a single discretionary category, which would exercise the
// "limited state" path rather than the real multi-category chart this
// page is meant to show for an established customer. This local fixture
// represents a customer with a fuller, multi-month, multi-category
// history so the ">= 2 categories" and ">= 2 months" chart paths are
// actually covered, without changing the shared fixture other pages'
// tests rely on.
const richTransactionsC1001: Transaction[] = [
  { transaction_id: 'RX1', customer_id: 'C1001', date: '2026-06-01', amount: 75000, type: 'CREDIT', category: 'SALARY', description: 'Monthly salary', merchant: 'Synthetic Employer', created_at: '2026-06-01T00:00:00.000Z' },
  { transaction_id: 'RX2', customer_id: 'C1001', date: '2026-06-03', amount: 9000, type: 'DEBIT', category: 'EMI', description: 'Home loan EMI', merchant: 'Synthetic Bank', created_at: '2026-06-03T00:00:00.000Z' },
  { transaction_id: 'RX3', customer_id: 'C1001', date: '2026-06-05', amount: 15000, type: 'DEBIT', category: 'RENT', description: 'Rent', merchant: 'Synthetic Landlord', created_at: '2026-06-05T00:00:00.000Z' },
  { transaction_id: 'RX4', customer_id: 'C1001', date: '2026-06-08', amount: 4200, type: 'DEBIT', category: 'GROCERIES', description: 'Groceries', merchant: 'Synthetic Mart', created_at: '2026-06-08T00:00:00.000Z' },
  { transaction_id: 'RX5', customer_id: 'C1001', date: '2026-07-01', amount: 75000, type: 'CREDIT', category: 'SALARY', description: 'Monthly salary', merchant: 'Synthetic Employer', created_at: '2026-07-01T00:00:00.000Z' },
  { transaction_id: 'RX6', customer_id: 'C1001', date: '2026-07-03', amount: 9000, type: 'DEBIT', category: 'EMI', description: 'Home loan EMI', merchant: 'Synthetic Bank', created_at: '2026-07-03T00:00:00.000Z' },
  { transaction_id: 'RX7', customer_id: 'C1001', date: '2026-07-05', amount: 15000, type: 'DEBIT', category: 'RENT', description: 'Rent', merchant: 'Synthetic Landlord', created_at: '2026-07-05T00:00:00.000Z' },
  { transaction_id: 'RX8', customer_id: 'C1001', date: '2026-07-10', amount: 4200, type: 'DEBIT', category: 'GROCERIES', description: 'Groceries', merchant: 'Synthetic Mart', created_at: '2026-07-10T00:00:00.000Z' },
];

describe('MoneyPage', () => {
  it('shows every financial-health field with a plain-language interpretation for C1001', async () => {
    mockFetch({
      '/customers/C1001/financial-health': successEnvelope(healthRecommend),
      '/customers/C1001/transactions': paginatedEnvelope(richTransactionsC1001),
    });

    renderWithProviders(<MoneyPage />);

    expect(await screen.findByText('High confidence')).toBeInTheDocument();
    expect(screen.getByText(/based on 4 months of financial activity/i)).toBeInTheDocument();

    // Every ratio gets an interpretation sentence, not a bare number.
    expect(screen.getByText("You're saving a healthy share of your income each month.")).toBeInTheDocument();
    expect(screen.getByText('Your loan repayments take up a comfortable share of your income.')).toBeInTheDocument();
    expect(screen.getByText('Your spending stays comfortably within your income.')).toBeInTheDocument();
    expect(screen.getByText('Your income is steady month to month.')).toBeInTheDocument();
    expect(screen.getByText('Your balance has stayed about the same recently.')).toBeInTheDocument();
  });

  it('builds a real category breakdown with a plain-language callout when there is enough variety', async () => {
    mockFetch({
      '/customers/C1001/financial-health': successEnvelope(healthRecommend),
      '/customers/C1001/transactions': paginatedEnvelope(richTransactionsC1001),
    });

    renderWithProviders(<MoneyPage />);

    // Rent (₹30,000 across two months) outspends groceries (₹9,400) — EMI is excluded entirely.
    expect(await screen.findByText('Rent')).toBeInTheDocument();
    expect(screen.getByText(/was your biggest spending category/i)).toBeInTheDocument();
    expect(screen.queryByText(/^EMI$/)).not.toBeInTheDocument();
  });

  it('shows a real trend with a "since" takeaway, not just two endpoint numbers', async () => {
    mockFetch({
      '/customers/C1001/financial-health': successEnvelope(healthRecommend),
      '/customers/C1001/transactions': paginatedEnvelope(richTransactionsC1001),
    });

    renderWithProviders(<MoneyPage />);

    expect(await screen.findByText('Savings rate over time')).toBeInTheDocument();
    expect(screen.getByText('Income vs. expenses')).toBeInTheDocument();
    // Both months are net-positive by the same amount, so the gap is flat.
    expect(screen.getByText('The gap between what comes in and what goes out has stayed about the same.')).toBeInTheDocument();
  });

  it("visibly communicates that C1002's picture is still forming, instead of a confident thin-data read", async () => {
    mockFetch({
      '/customers/C1002/financial-health': successEnvelope(healthThinFile),
      '/customers/C1002/transactions': paginatedEnvelope(transactionsC1002),
    });

    window.localStorage.setItem('bharat-bank.demo-customer-id', 'C1002');
    renderWithProviders(<MoneyPage />);

    expect(await screen.findByText('Low confidence')).toBeInTheDocument();
    expect(screen.getByText(/still learning your financial picture/i)).toBeInTheDocument();
  });

  it('shows an honest limited state for category breakdown instead of forcing a chart out of one category', async () => {
    mockFetch({
      '/customers/C1002/financial-health': successEnvelope(healthThinFile),
      '/customers/C1002/transactions': paginatedEnvelope(transactionsC1002),
    });

    window.localStorage.setItem('bharat-bank.demo-customer-id', 'C1002');
    renderWithProviders(<MoneyPage />);

    expect(await screen.findByText(/not enough variety yet for a meaningful breakdown/i)).toBeInTheDocument();
    expect(screen.getByText('Groceries')).toBeInTheDocument();
  });

  it('shows a single-month fallback instead of a fabricated trend for C1002', async () => {
    mockFetch({
      '/customers/C1002/financial-health': successEnvelope(healthThinFile),
      '/customers/C1002/transactions': paginatedEnvelope(transactionsC1002),
    });

    window.localStorage.setItem('bharat-bank.demo-customer-id', 'C1002');
    renderWithProviders(<MoneyPage />);

    expect(await screen.findByText(/a trend isn't meaningful yet/i)).toBeInTheDocument();
    expect(screen.queryByText('Savings rate over time')).not.toBeInTheDocument();
  });
});
