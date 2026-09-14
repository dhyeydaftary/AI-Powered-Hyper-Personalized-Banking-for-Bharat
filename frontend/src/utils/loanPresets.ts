/**
 * Starting points for the What-if simulator's rate/tenure fields. Most
 * customers — especially the Tier 2/3/4 and rural audience this product
 * serves — don't know their likely interest rate offhand, so asking them to
 * type one cold is unrealistic. These are illustrative typical rates, not
 * real product offers or guaranteed pricing; the UI must label them as such.
 *
 * Principal is deliberately not part of this preset system — it's the one
 * number a customer actually knows (how much they want to borrow), so it
 * stays a free, separate input.
 */
export interface LoanPreset {
  id: string;
  label: string;
  rate: number;
  rateLabel: string;
  tenureDefaultMonths: number;
  tenureMaxMonths: number;
  tenureLabel: string;
}

export const LOAN_PRESETS: LoanPreset[] = [
  {
    id: 'personal',
    label: 'Personal loan',
    rate: 14,
    rateLabel: '~14%',
    tenureDefaultMonths: 36,
    tenureMaxMonths: 60,
    tenureLabel: 'up to 5 years',
  },
  {
    id: 'two-wheeler',
    label: 'Two-wheeler loan',
    rate: 11,
    rateLabel: '~11%',
    tenureDefaultMonths: 24,
    tenureMaxMonths: 36,
    tenureLabel: 'up to 3 years',
  },
  {
    id: 'gold',
    label: 'Gold loan',
    rate: 9,
    rateLabel: '~9%',
    tenureDefaultMonths: 18,
    tenureMaxMonths: 36,
    tenureLabel: 'up to 3 years',
  },
  {
    id: 'education',
    label: 'Education loan',
    rate: 10,
    rateLabel: '~10%',
    tenureDefaultMonths: 60,
    tenureMaxMonths: 84,
    tenureLabel: 'up to 7 years',
  },
];
