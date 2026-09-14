import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatPercent,
  formatConfidence,
  translateReasonCode,
} from '../utils/formatters';
import { MOCK_CUSTOMERS, MOCK_DECISIONS } from '../api/mockAdapter';

describe('Formatters & Governance Utilities', () => {
  it('should format Indian Rupee currency correctly', () => {
    expect(formatCurrency(75000)).toContain('75,000');
    expect(formatCurrency(250000)).toContain('2,50,000');
    expect(formatCurrency(null)).toBe('₹0');
  });

  it('should format percentage ratios correctly', () => {
    expect(formatPercent(0.35)).toBe('35.0%');
    expect(formatPercent(0.08)).toBe('8.0%');
    expect(formatPercent(null)).toBe('0%');
  });

  it('should evaluate confidence levels accurately', () => {
    const high = formatConfidence(0.92);
    expect(high.level).toBe('high');
    expect(high.percent).toBe('92%');

    const low = formatConfidence(0.45);
    expect(low.level).toBe('low');
    expect(low.label).toContain('Human Review Required');
  });

  it('should translate raw snake_case reason codes to readable English', () => {
    expect(translateReasonCode('HIGH_EMI_BURDEN')).toContain('EMI-to-income ratio');
    expect(translateReasonCode('UNUSUAL_TRANSACTION')).toContain('exceeds historical baseline');
    expect(translateReasonCode('UNKNOWN_CODE')).toBe('UNKNOWN CODE');
  });
});

describe('Mock Data Scenarios Integration', () => {
  it('should contain all 7 synthetic personas (C1001 to C1007)', () => {
    expect(MOCK_CUSTOMERS.length).toBe(7);
    const ids = MOCK_CUSTOMERS.map((c) => c.customer_id);
    expect(ids).toEqual(['C1001', 'C1002', 'C1003', 'C1004', 'C1005', 'C1006', 'C1007']);
  });

  it('C1003 should be RECOMMEND scenario', () => {
    expect(MOCK_DECISIONS['C1003'].decision).toBe('RECOMMEND');
  });

  it('C1004 should be INTERVENE scenario due to high EMI burden', () => {
    expect(MOCK_DECISIONS['C1004'].decision).toBe('INTERVENE');
    expect(MOCK_DECISIONS['C1004'].reason_codes).toContain('HIGH_EMI_BURDEN');
  });

  it('C1005 should be VERIFY scenario for appliance purchase', () => {
    expect(MOCK_DECISIONS['C1005'].decision).toBe('VERIFY');
    expect(MOCK_DECISIONS['C1005'].reason_codes).toContain('UNUSUAL_TRANSACTION');
  });

  it('C1002 should be NO_ACTION cold start scenario', () => {
    expect(MOCK_DECISIONS['C1002'].decision).toBe('NO_ACTION');
    expect(MOCK_DECISIONS['C1002'].reason_codes).toContain('INSUFFICIENT_HISTORY');
  });
});
