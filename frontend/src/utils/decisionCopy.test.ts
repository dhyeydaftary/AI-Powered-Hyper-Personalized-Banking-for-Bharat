import { describe, expect, it } from 'vitest';
import { getDecisionTone } from './decisionCopy';
import {
  decisionRecommend,
  decisionIntervene,
  decisionVerify,
  decisionNoActionThinFile,
  decisionNoActionStable,
} from '@/test-fixtures';

describe('getDecisionTone', () => {
  it('renders a positive, non-pressuring tone for RECOMMEND', () => {
    const tone = getDecisionTone(decisionRecommend);
    expect(tone.tone).toBe('positive');
    expect(tone.headline.toLowerCase()).not.toContain('limited time');
  });

  it('renders a calm attention tone for INTERVENE, never alarmist', () => {
    const tone = getDecisionTone(decisionIntervene);
    expect(tone.tone).toBe('attention');
    expect(tone.headline.toLowerCase()).not.toContain('danger');
  });

  it('renders a critical tone for VERIFY without claiming confirmed fraud', () => {
    const tone = getDecisionTone(decisionVerify);
    expect(tone.tone).toBe('critical');
    expect(tone.headline.toLowerCase()).not.toContain('fraud detected');
  });

  it('distinguishes thin-file NO_ACTION from a stable NO_ACTION', () => {
    const thinFile = getDecisionTone(decisionNoActionThinFile);
    const stable = getDecisionTone(decisionNoActionStable);
    expect(thinFile.headline).not.toBe(stable.headline);
    expect(thinFile.headline.toLowerCase()).toContain('learning');
    expect(stable.headline.toLowerCase()).toContain('stable');
  });
});
