import {
  Landmark,
  CreditCard,
  ShoppingCart,
  Home,
  Zap,
  ShoppingBag,
  Plane,
  HeartPulse,
  ArrowLeftRight,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react';
import type { TransactionCategory } from '@/types';

/**
 * A distinct icon per category, so a transaction's kind can be recognized
 * at a glance in a scan of the list. This is deliberately a single-color
 * (neutral) treatment — only the icon shape varies by category — kept
 * separate from the credit/debit color used for money direction, so the
 * two signals ("what kind of transaction" vs. "money in or out") never
 * get conflated into one color.
 */
const CATEGORY_ICONS: Record<TransactionCategory, LucideIcon> = {
  SALARY: Landmark,
  EMI: CreditCard,
  GROCERIES: ShoppingCart,
  RENT: Home,
  UTILITIES: Zap,
  SHOPPING: ShoppingBag,
  TRAVEL: Plane,
  HEALTH: HeartPulse,
  TRANSFER: ArrowLeftRight,
  OTHER: MoreHorizontal,
};

export function getCategoryIcon(category: TransactionCategory): LucideIcon {
  return CATEGORY_ICONS[category] ?? MoreHorizontal;
}
