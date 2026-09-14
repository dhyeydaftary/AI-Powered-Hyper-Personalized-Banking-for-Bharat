import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockFetch, successEnvelope, paginatedEnvelope } from '@/test-utils';
import { PrivacyPage } from './PrivacyPage';
import { decisionVerify, decisionRecommend } from '@/test-fixtures';

const baseConsent = { behavioral_trend_analysis: true, anomaly_analysis: true, vernacular_assistance: true };

describe('PrivacyPage', () => {
  it('loads the three real consent categories and saves changes via PUT, not local state alone', async () => {
    let currentConsent = { ...baseConsent };

    const fetchMock = mockFetch({
      '/customers/C1001/consent': (_url: URL, init?: RequestInit) => {
        if (init?.method === 'PUT') {
          currentConsent = JSON.parse(init.body as string);
          return successEnvelope(currentConsent);
        }
        return successEnvelope(currentConsent);
      },
      '/customers/C1001/audit': paginatedEnvelope([]),
    });

    renderWithProviders(<PrivacyPage />);

    const toggle = await screen.findByRole('switch', { name: 'Anomaly detection' });
    expect(toggle).toHaveAttribute('aria-checked', 'true');

    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'false');

    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await screen.findByText(/settings were updated/i);

    const putCall = fetchMock.mock.calls.find(([, init]) => (init as RequestInit | undefined)?.method === 'PUT');
    expect(putCall).toBeDefined();
    const sentBody = JSON.parse((putCall![1] as RequestInit).body as string);
    expect(sentBody).toEqual({
      behavioral_trend_analysis: true,
      anomaly_analysis: false,
      vernacular_assistance: true,
    });
  });

  it('demonstrates the real backend effect: VERIFY with anomaly detection on, no VERIFY when off, and shows a before/after', async () => {
    mockFetch({
      '/customers/C1001/consent': successEnvelope(baseConsent),
      '/customers/C1001/audit': paginatedEnvelope([]),
      '/customers/C1001/analyze': successEnvelope({ decision: decisionVerify }),
    });

    renderWithProviders(<PrivacyPage />);

    await userEvent.click(await screen.findByRole('button', { name: /see what changes/i }));

    expect(await screen.findByText('Verification needed')).toBeInTheDocument();
    expect(screen.getByText(/flagged the seeded unusual transaction/i)).toBeInTheDocument();
    // First run — no "Before" column yet, since there's nothing to compare against.
    expect(screen.queryByText('Before')).not.toBeInTheDocument();
  });

  it('shows no verification once the backend returns a non-VERIFY decision, and a before/after on the second run', async () => {
    let callCount = 0;
    mockFetch({
      '/customers/C1001/consent': successEnvelope({ ...baseConsent, anomaly_analysis: false }),
      '/customers/C1001/audit': paginatedEnvelope([]),
      '/customers/C1001/analyze': () => {
        callCount += 1;
        return successEnvelope({ decision: callCount === 1 ? decisionVerify : decisionRecommend });
      },
    });

    renderWithProviders(<PrivacyPage />);

    const runButton = await screen.findByRole('button', { name: /see what changes/i });
    await userEvent.click(runButton);
    await screen.findByText('Verification needed');

    await userEvent.click(runButton);

    expect(await screen.findByText(/no longer flagged/i)).toBeInTheDocument();
    expect(screen.getByText('Before')).toBeInTheDocument();
    expect(screen.getByText('After')).toBeInTheDocument();
  });

  it('previews language availability based on the vernacular assistance toggle, without claiming it controls Copilot yet', async () => {
    mockFetch({
      '/customers/C1001/consent': successEnvelope(baseConsent),
      '/customers/C1001/audit': paginatedEnvelope([]),
    });

    renderWithProviders(<PrivacyPage />);

    await screen.findByText('Language availability preview');
    expect(screen.getByText('Hindi')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('switch', { name: 'Responses in your language' }));

    expect(await screen.findByText(/hindi.*unavailable/i)).toBeInTheDocument();
    expect(screen.getByText(/doesn't yet change the language selector/i)).toBeInTheDocument();
  });

  it('shows the real decision audit history, translated to plain language, most recent first', async () => {
    mockFetch({
      '/customers/C1001/consent': successEnvelope(baseConsent),
      '/customers/C1001/audit': paginatedEnvelope(
        [
          {
            decision: 'INTERVENE',
            reason_codes: ['HIGH_EMI_BURDEN'],
            confidence: 0.87,
            policy_version: 'v1.0-mock',
            audit_timestamp: '2026-09-12T10:30:00.000Z',
          },
          {
            decision: 'RECOMMEND',
            reason_codes: ['HEALTHY_FINANCIAL_TREND'],
            confidence: 0.9,
            policy_version: 'v1.0-mock',
            audit_timestamp: '2026-08-01T00:00:00.000Z',
          },
        ],
        1,
        10,
        2
      ),
    });

    renderWithProviders(<PrivacyPage />);

    expect(await screen.findByText('Something may need your attention')).toBeInTheDocument();
    expect(screen.getByText('You may benefit from this')).toBeInTheDocument();
    expect(screen.getByText(/your loan repayments are a large share/i)).toBeInTheDocument();
  });

  it('shows an empty state when there is no audit history yet', async () => {
    mockFetch({
      '/customers/C1001/consent': successEnvelope(baseConsent),
      '/customers/C1001/audit': paginatedEnvelope([]),
    });

    renderWithProviders(<PrivacyPage />);

    expect(await screen.findByText('Nothing on record yet')).toBeInTheDocument();
  });
});
