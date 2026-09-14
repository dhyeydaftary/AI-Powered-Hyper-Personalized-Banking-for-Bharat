import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockFetch, successEnvelope } from '@/test-utils';
import { WhatIfPage } from './WhatIfPage';
import { healthRecommend, decisionRecommend, decisionIntervene } from '@/test-fixtures';

describe('WhatIfPage', () => {
  it('runs a simulation and shows the decision comparison headline without mutating real data', async () => {
    const hypotheticalHealth = { ...healthRecommend, savings_rate: 0.11, emi_to_income_ratio: 0.4 };

    const fetchMock = mockFetch({
      '/customers/C1001/decision': successEnvelope(decisionRecommend),
      '/customers/C1001/simulate': successEnvelope({
        current: healthRecommend,
        hypothetical: hypotheticalHealth,
        decision: decisionIntervene,
      }),
    });

    renderWithProviders(<WhatIfPage />);

    await userEvent.click(screen.getByRole('button', { name: /run simulation/i }));

    expect(await screen.findByText('This is just an exploration — nothing has changed yet.')).toBeInTheDocument();

    expect(screen.getAllByText('Right now').length).toBeGreaterThan(0);
    expect(screen.getAllByText('If you take this loan').length).toBeGreaterThan(0);
    expect(screen.getByText('You may benefit from this')).toBeInTheDocument(); // current (RECOMMEND) headline
    expect(screen.getByText('Something may need your attention')).toBeInTheDocument(); // hypothetical (INTERVENE) headline

    expect(screen.getByText('27%')).toBeInTheDocument(); // current savings rate
    expect(screen.getByText('11%')).toBeInTheDocument(); // hypothetical savings rate

    const simulateCall = fetchMock.mock.calls.find(([url]) => String(url).includes('/simulate'));
    const body = JSON.parse((simulateCall![1] as RequestInit).body as string);
    expect(body.loan).toEqual({ principal: 300000, annual_interest_rate: 12, tenure_months: 36 });
  });

  it('pre-fills rate and tenure from a labeled preset, leaving principal untouched', async () => {
    mockFetch({
      '/customers/C1001/decision': successEnvelope(null),
      '/customers/C1001/simulate': successEnvelope({
        current: healthRecommend,
        hypothetical: healthRecommend,
        decision: decisionRecommend,
      }),
    });

    renderWithProviders(<WhatIfPage />);

    expect(screen.getByText(/typical starting points/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /gold loan/i }));

    expect(screen.getByLabelText(/annual interest rate/i)).toHaveValue(9);
    expect(screen.getByLabelText(/tenure \(months\)/i)).toHaveValue(18);
    expect(screen.getByLabelText(/loan amount/i)).toHaveValue(300000);
  });

  it('offers to try a smaller amount when the hypothetical decision is worse, and re-runs the simulation', async () => {
    const fetchMock = mockFetch({
      '/customers/C1001/decision': successEnvelope(decisionRecommend),
      '/customers/C1001/simulate': successEnvelope({
        current: healthRecommend,
        hypothetical: { ...healthRecommend, emi_to_income_ratio: 0.55 },
        decision: decisionIntervene,
      }),
    });

    renderWithProviders(<WhatIfPage />);

    await userEvent.click(screen.getByRole('button', { name: /run simulation/i }));
    const smallerAmountButton = await screen.findByRole('button', { name: /try a smaller amount/i });

    await userEvent.click(smallerAmountButton);

    const simulateCalls = fetchMock.mock.calls.filter(([url]) => String(url).includes('/simulate'));
    expect(simulateCalls).toHaveLength(2);
    const secondBody = JSON.parse((simulateCalls[1][1] as RequestInit).body as string);
    expect(secondBody.loan.principal).toBeLessThan(300000);
    expect(secondBody.loan.tenure_months).toBe(36);
  });

  it('shows a plain reassurance when the hypothetical decision matches the current one', async () => {
    mockFetch({
      '/customers/C1001/decision': successEnvelope(decisionRecommend),
      '/customers/C1001/simulate': successEnvelope({
        current: healthRecommend,
        hypothetical: healthRecommend,
        decision: decisionRecommend,
      }),
    });

    renderWithProviders(<WhatIfPage />);

    await userEvent.click(screen.getByRole('button', { name: /run simulation/i }));

    expect(
      await screen.findByText("This loan wouldn't change our overall read on your finances.")
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /try a smaller amount/i })).not.toBeInTheDocument();
  });
});
