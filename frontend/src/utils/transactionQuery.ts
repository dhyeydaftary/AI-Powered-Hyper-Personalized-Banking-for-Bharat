import type { Transaction, TransactionCategory } from '@/types';
import { formatCategory } from './format';

/**
 * The backend only supports `?page=&limit=` on `GET /transactions` — no
 * search, filter, or sort query parameters. Everything in this file
 * operates client-side over transactions already fetched (accumulated
 * across "Load more" pages), never sent to the backend as a query param.
 */

export type SortOption = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'date_desc', label: 'Newest first' },
  { value: 'date_asc', label: 'Oldest first' },
  { value: 'amount_desc', label: 'Amount: high to low' },
  { value: 'amount_asc', label: 'Amount: low to high' },
];

export interface TransactionQueryFilters {
  search: string;
  categories: Set<TransactionCategory>;
}

export function filterTransactions(transactions: Transaction[], { search, categories }: TransactionQueryFilters): Transaction[] {
  const term = search.trim().toLowerCase();
  return transactions.filter((tx) => {
    const matchesSearch = !term || tx.merchant.toLowerCase().includes(term) || tx.description.toLowerCase().includes(term);
    const matchesCategory = categories.size === 0 || categories.has(tx.category);
    return matchesSearch && matchesCategory;
  });
}

export function sortTransactions(transactions: Transaction[], sort: SortOption): Transaction[] {
  const sorted = [...transactions];
  switch (sort) {
    case 'date_asc':
      return sorted.sort((a, b) => a.date.localeCompare(b.date) || a.created_at.localeCompare(b.created_at));
    case 'amount_asc':
      return sorted.sort((a, b) => a.amount - b.amount);
    case 'amount_desc':
      return sorted.sort((a, b) => b.amount - a.amount);
    case 'date_desc':
    default:
      return sorted.sort((a, b) => b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at));
  }
}

function joinLabels(labels: string[]): string {
  if (labels.length === 1) return labels[0];
  return `${labels.slice(0, -1).join(', ')} or ${labels[labels.length - 1]}`;
}

/** A specific "nothing matched" sentence naming exactly what was searched
 * for and/or filtered to, instead of a generic "No results" — so the
 * customer knows whether to change their search term, their category
 * selection, or both. */
export function describeNoMatches(search: string, categories: Set<TransactionCategory>): string {
  const term = search.trim();
  const categoryLabels = Array.from(categories).map((c) => formatCategory(c));

  if (term && categoryLabels.length > 0) return `No transactions match "${term}" in ${joinLabels(categoryLabels)}.`;
  if (term) return `No transactions match "${term}".`;
  if (categoryLabels.length > 0) return `No transactions in ${joinLabels(categoryLabels)}.`;
  return 'No transactions match the current filters.';
}
