import { describe, expect, it } from 'vitest';
import { getReasonCodeCopy } from './reasonCodes';

describe('getReasonCodeCopy', () => {
  it('translates a known backend reason code into a plain-language sentence', () => {
    const copy = getReasonCodeCopy('HIGH_EMI_BURDEN');
    expect(copy.headline).not.toMatch(/HIGH_EMI_BURDEN/);
    expect(copy.headline.length).toBeGreaterThan(0);
  });

  it('never exposes raw technical model output, even for unrecognized codes', () => {
    const copy = getReasonCodeCopy('SOME_NEW_CODE_FROM_BACKEND');
    expect(copy.headline).toBe('Some New Code From Backend');
  });
});
