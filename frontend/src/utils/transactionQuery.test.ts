import { describe, expect, it } from 'vitest';
import { filterTransactions, sortTransactions, describeNoMatches } from './transactionQuery';
import { transactionsC1001 } from '@/test-fixtures';

describe('filterTransactions', () => {
  it('matches merchant or description text, case-insensitively', () => {
    const result = filterTransactions(transactionsC1001, { search: 'synthetic bank', categories: new Set() });
    expect(result.map((t) => t.transaction_id)).toEqual(['TX1002']);
  });

  it('narrows by one or more selected categories, real category values only', () => {
    const result = filterTransactions(transactionsC1001, { search: '', categories: new Set(['EMI', 'SALARY']) });
    expect(result.map((t) => t.category).sort()).toEqual(['EMI', 'SALARY']);
  });

  it('combines search and category filters', () => {
    const result = filterTransactions(transactionsC1001, { search: 'synthetic', categories: new Set(['TRANSFER']) });
    expect(result).toHaveLength(0);
  });

  it('returns everything when no filters are active', () => {
    expect(filterTransactions(transactionsC1001, { search: '', categories: new Set() })).toHaveLength(
      transactionsC1001.length
    );
  });
});

describe('sortTransactions', () => {
  it('sorts by amount ascending and descending', () => {
    const asc = sortTransactions(transactionsC1001, 'amount_asc').map((t) => t.amount);
    expect(asc).toEqual([9000, 75000, 95000]);

    const desc = sortTransactions(transactionsC1001, 'amount_desc').map((t) => t.amount);
    expect(desc).toEqual([95000, 75000, 9000]);
  });

  it('sorts by date, newest and oldest first', () => {
    const newest = sortTransactions(transactionsC1001, 'date_desc').map((t) => t.date);
    expect(newest).toEqual(['2026-08-25', '2026-06-03', '2026-06-01']);

    const oldest = sortTransactions(transactionsC1001, 'date_asc').map((t) => t.date);
    expect(oldest).toEqual(['2026-06-01', '2026-06-03', '2026-08-25']);
  });

  it('never mutates the input array', () => {
    const copy = [...transactionsC1001];
    sortTransactions(transactionsC1001, 'amount_asc');
    expect(transactionsC1001).toEqual(copy);
  });
});

describe('describeNoMatches', () => {
  it('names the search term and the selected categories together', () => {
    expect(describeNoMatches('xyz', new Set(['GROCERIES']))).toBe('No transactions match "xyz" in Groceries.');
  });

  it('lists multiple categories with "or"', () => {
    expect(describeNoMatches('', new Set(['GROCERIES', 'RENT']))).toBe('No transactions in Groceries or Rent.');
  });

  it('falls back to a generic message when nothing specific was searched or filtered', () => {
    expect(describeNoMatches('', new Set())).toBe('No transactions match the current filters.');
  });
});
