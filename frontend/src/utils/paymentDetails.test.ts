import { describe, expect, it } from 'vitest';
import {
  getPaymentMethod,
  getUpiVpa,
  getUpiReferenceNumber,
  getBankReferenceNumber,
  getMaskedAccountNumber,
  getTransactionTime,
} from './paymentDetails';
import { transactionsC1001 } from '@/test-fixtures';

const emiTx = transactionsC1001.find((t) => t.category === 'EMI')!;
const salaryTx = transactionsC1001.find((t) => t.category === 'SALARY')!;
const transferTx = transactionsC1001.find((t) => t.category === 'TRANSFER')!; // "Unknown Merchant"

describe('getPaymentMethod', () => {
  it('routes salary and EMI over bank rails, never a personal UPI handle', () => {
    expect(getPaymentMethod(salaryTx)).toBe('BANK_TRANSFER');
    expect(getPaymentMethod(emiTx)).toBe('BANK_TRANSFER');
  });

  it('routes everyday categories like the flagged transfer over UPI', () => {
    expect(getPaymentMethod(transferTx)).toBe('UPI');
  });
});

describe('getUpiVpa', () => {
  it('follows the real name@handle VPA shape', () => {
    const vpa = getUpiVpa(transferTx);
    expect(vpa).toMatch(/^[a-z0-9.]+@[a-z]+$/);
  });

  it('renders an unrecognized merchant as a phone-number-style handle, not a named one', () => {
    const vpa = getUpiVpa(transferTx);
    const [handleUser] = vpa.split('@');
    expect(handleUser).toMatch(/^\d{10}$/);
  });

  it('is deterministic for the same transaction', () => {
    expect(getUpiVpa(transferTx)).toBe(getUpiVpa(transferTx));
  });
});

describe('getUpiReferenceNumber', () => {
  it('is exactly 12 numeric digits, the real RRN length', () => {
    const ref = getUpiReferenceNumber(transferTx);
    expect(ref).toMatch(/^\d{12}$/);
  });

  it('differs between two different transactions', () => {
    expect(getUpiReferenceNumber(transferTx)).not.toBe(getUpiReferenceNumber(emiTx));
  });
});

describe('getBankReferenceNumber', () => {
  it('starts with a 4-letter bank code and embeds the value date', () => {
    const ref = getBankReferenceNumber(salaryTx);
    expect(ref.slice(0, 4)).toMatch(/^[A-Z]{4}$/);
    expect(ref).toContain(salaryTx.date.replace(/-/g, ''));
  });
});

describe('getMaskedAccountNumber', () => {
  it('masks everything but the last 4 digits, the real convention', () => {
    expect(getMaskedAccountNumber(transferTx)).toMatch(/^•{4} \d{4}$/);
  });

  it('is the same for every transaction belonging to the same customer', () => {
    expect(getMaskedAccountNumber(transferTx)).toBe(getMaskedAccountNumber(emiTx));
  });
});

describe('getTransactionTime', () => {
  it('renders a plausible 12-hour clock time', () => {
    expect(getTransactionTime(transferTx)).toMatch(/^([1-9]|1[0-2]):[0-5]\d (AM|PM)$/);
  });

  it('is deterministic for the same transaction', () => {
    expect(getTransactionTime(transferTx)).toBe(getTransactionTime(transferTx));
  });
});
